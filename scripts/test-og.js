// Simple script to test OpenGraph meta tags
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

async function testOpenGraphTags(url) {
  console.log(`Testing OpenGraph tags for: ${url}`);
  
  try {
    // Fetch the page
    const response = await fetch(url);
    const html = await response.text();
    
    // Parse the HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Get all meta tags
    const metaTags = document.querySelectorAll('meta');
    
    // Extract OpenGraph tags
    const ogTags = {};
    metaTags.forEach(tag => {
      const property = tag.getAttribute('property');
      if (property && property.startsWith('og:')) {
        ogTags[property] = tag.getAttribute('content');
      }
    });
    
    // Display the results
    console.log('\nOpenGraph Tags Found:');
    console.log(JSON.stringify(ogTags, null, 2));
    
    // Check for essential OpenGraph tags
    const essentialTags = ['og:title', 'og:description', 'og:image', 'og:url'];
    const missingTags = essentialTags.filter(tag => !ogTags[tag]);
    
    if (missingTags.length > 0) {
      console.log('\n⚠️  Missing essential OpenGraph tags:', missingTags.join(', '));
    } else {
      console.log('\n✅ All essential OpenGraph tags are present!');
    }
    
    // Check Twitter Card tags
    const twitterTags = {};
    metaTags.forEach(tag => {
      const name = tag.getAttribute('name');
      if (name && name.startsWith('twitter:')) {
        twitterTags[name] = tag.getAttribute('content');
      }
    });
    
    console.log('\nTwitter Card Tags Found:');
    console.log(JSON.stringify(twitterTags, null, 2));
    
    // Check for essential Twitter Card tags
    const essentialTwitterTags = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
    const missingTwitterTags = essentialTwitterTags.filter(tag => !twitterTags[tag]);
    
    if (missingTwitterTags.length > 0) {
      console.log('\n⚠️  Missing essential Twitter Card tags:', missingTwitterTags.join(', '));
    } else {
      console.log('\n✅ All essential Twitter Card tags are present!');
    }
    
  } catch (error) {
    console.error('\n❌ Error testing OpenGraph tags:', error);
  }
}

// Replace with your own URL to test
const urlToTest = process.argv[2] || 'https://your-site.com/ilan/your-listing-slug';

testOpenGraphTags(urlToTest);

// Usage: node test-og.js https://your-site.com/ilan/your-listing-slug 