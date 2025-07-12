import { supabase } from '@/lib/supabase';
import { createSlug } from '@/lib/utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const slug = params.id;
    let listing;
    
    // Check if the ID is a UUID or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    if (isUUID) {
      // If it's a UUID, fetch directly by ID
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          images(*),
          addresses(*)
        `)
        .eq('id', slug)
        .eq('is_active', true)
        .single();
      
      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Listing not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      listing = data;
    } else {
      // If it's a slug, fetch all listings and find by slug
      const { data: listings, error: fetchError } = await supabase
        .from('listings')
        .select(`
          *,
          images(*),
          addresses(*)
        `)
        .eq('is_active', true);
      
      if (fetchError || !listings) {
        return new Response(JSON.stringify({ error: 'Failed to fetch listings' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Find the listing with a matching slug
      listing = listings.find(item => {
        if (!item.title) return false;
        const itemSlug = createSlug(item.title);
        return itemSlug === slug;
      });
      
      if (!listing) {
        return new Response(JSON.stringify({ error: 'Listing not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Get the first image URL or use default
    const imageUrl = listing.images && listing.images.length > 0 
      ? listing.images.find((img: any) => img.is_cover)?.url || listing.images[0].url
      : 'https://www.ceyhundan.com/images/ce.png';
    
    // Format listing status
    const listingStatus = listing.listing_status === 'satilik' ? 'Satılık' : 'Kiralık';
    
    // Format property type
    const propertyTypeMap: Record<string, string> = {
      'konut': 'Konut',
      'ticari': 'Ticari',
      'arsa': 'Arsa',
      'vasita': 'Vasıta'
    };
    const propertyType = propertyTypeMap[listing.property_type] || listing.property_type;
    
    // Get location
    let location = '';
    if (listing.addresses && listing.addresses.length > 0) {
      const address = listing.addresses[0];
      const province = address.province.charAt(0).toUpperCase() + address.province.slice(1);
      const district = address.district.charAt(0).toUpperCase() + address.district.slice(1);
      const neighborhood = address.neighborhood 
        ? '/' + (address.neighborhood.charAt(0).toUpperCase() + address.neighborhood.slice(1)) 
        : '';
      location = `${province}/${district}${neighborhood}`;
    } else if (listing.location) {
      location = listing.location.split('/').map(
        (part: string) => part.charAt(0).toUpperCase() + part.slice(1)
      ).join('/');
    }
    
    // Create description from listing details
    const price = new Intl.NumberFormat('tr-TR').format(listing.price || 0) + ' ₺';
    let description = `${listingStatus} ${propertyType}`;
    
    if (location) {
      description += ` - ${location}`;
    }
    
    if (listing.description) {
      // Add a portion of the description, limited to ~160 characters
      const shortDesc = listing.description.substring(0, 100).trim();
      description += ` - ${shortDesc}${listing.description.length > 100 ? '...' : ''}`;
    }
    
    // Add price to description
    description += ` - ${price}`;
    
    // Create metadata
    const metadata = {
      title: `${listing.title} | Ceyhun Gayrimenkul`,
      description,
      openGraph: {
        title: listing.title,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: listing.title,
          }
        ],
        locale: 'tr_TR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: listing.title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `https://www.ceyhundan.com/ilan/${slug}`,
      },
      other: {
        'og:price:amount': String(listing.price),
        'og:price:currency': 'TRY',
        'og:availability': listing.is_active ? 'instock' : 'oos',
      }
    };
    
    // Generate HTML to test the Open Graph tags
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${metadata.title}</title>
      <meta name="description" content="${metadata.description}">
      <meta property="og:title" content="${metadata.openGraph.title}">
      <meta property="og:description" content="${metadata.openGraph.description}">
      <meta property="og:image" content="${metadata.openGraph.images[0].url}">
      <meta property="og:image:width" content="${metadata.openGraph.images[0].width}">
      <meta property="og:image:height" content="${metadata.openGraph.images[0].height}">
      <meta property="og:image:alt" content="${metadata.openGraph.images[0].alt}">
      <meta property="og:locale" content="${metadata.openGraph.locale}">
      <meta property="og:type" content="${metadata.openGraph.type}">
      <meta property="og:url" content="${metadata.alternates.canonical}">
      <meta property="og:price:amount" content="${metadata.other['og:price:amount']}">
      <meta property="og:price:currency" content="${metadata.other['og:price:currency']}">
      <meta property="og:availability" content="${metadata.other['og:availability']}">
      <meta name="twitter:card" content="${metadata.twitter.card}">
      <meta name="twitter:title" content="${metadata.twitter.title}">
      <meta name="twitter:description" content="${metadata.twitter.description}">
      <meta name="twitter:image" content="${metadata.twitter.images[0]}">
      <link rel="canonical" href="${metadata.alternates.canonical}">
      <style>
        body { font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem; max-width: 800px; margin: 0 auto; }
        h1 { color: #334155; }
        .card { border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1.5rem; }
        .image-container { position: relative; height: 300px; margin-bottom: 1rem; border-radius: 0.375rem; overflow: hidden; }
        img { object-fit: cover; width: 100%; height: 100%; }
        .label { font-weight: 600; color: #64748b; }
        .value { margin-top: 0.25rem; }
        .tag { display: inline-block; background-color: #f59e0b; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; margin-right: 0.5rem; }
        .price { font-size: 1.5rem; font-weight: 700; color: #f59e0b; margin-top: 1rem; }
      </style>
    </head>
    <body>
      <h1>Open Graph Test for Listing</h1>
      
      <div class="card">
        <h2>Listing Preview</h2>
        <div class="image-container">
          <img src="${imageUrl}" alt="${listing.title}" />
        </div>
        
        <div>
          <span class="tag">${listingStatus}</span>
          <span class="tag" style="background-color: #334155;">${propertyType}</span>
        </div>
        
        <h3>${listing.title}</h3>
        
        ${location ? `<p><strong>Konum:</strong> ${location}</p>` : ''}
        
        <p class="price">${price}</p>
        
        ${listing.description ? `<div><strong>Açıklama:</strong><p>${listing.description}</p></div>` : ''}
      </div>
      
      <div class="card">
        <h2>Open Graph Tags</h2>
        <div>
          <p class="label">og:title</p>
          <p class="value">${metadata.openGraph.title}</p>
        </div>
        <div>
          <p class="label">og:description</p>
          <p class="value">${metadata.openGraph.description}</p>
        </div>
        <div>
          <p class="label">og:image</p>
          <p class="value">${metadata.openGraph.images[0].url}</p>
        </div>
        <div>
          <p class="label">og:url</p>
          <p class="value">${metadata.alternates.canonical}</p>
        </div>
        <div>
          <p class="label">og:type</p>
          <p class="value">${metadata.openGraph.type}</p>
        </div>
        <div>
          <p class="label">og:price:amount</p>
          <p class="value">${metadata.other['og:price:amount']}</p>
        </div>
        <div>
          <p class="label">og:price:currency</p>
          <p class="value">${metadata.other['og:price:currency']}</p>
        </div>
      </div>
      
      <div class="card">
        <h2>Twitter Card Tags</h2>
        <div>
          <p class="label">twitter:card</p>
          <p class="value">${metadata.twitter.card}</p>
        </div>
        <div>
          <p class="label">twitter:title</p>
          <p class="value">${metadata.twitter.title}</p>
        </div>
        <div>
          <p class="label">twitter:description</p>
          <p class="value">${metadata.twitter.description}</p>
        </div>
        <div>
          <p class="label">twitter:image</p>
          <p class="value">${metadata.twitter.images[0]}</p>
        </div>
      </div>
    </body>
    </html>
    `;
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    console.error('Error generating test page:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate test page' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 