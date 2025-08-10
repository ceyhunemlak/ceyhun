import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type AnyRecord = Record<string, any>;

function toNumber(value: any): number | null {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(num) ? num : null;
}

function formatLocation(address: any | undefined): string {
  if (!address) return '';
  const province = address.province || '';
  const district = address.district || '';
  const neighborhood = address.neighborhood || '';
  const parts = [province, district, neighborhood].filter(Boolean);
  return parts.join('/');
}

function computeSimilarityScore(base: AnyRecord, cand: AnyRecord): number {
  let score = 0;

  // Price similarity (0..1)
  const basePrice = toNumber(base.price);
  const candPrice = toNumber(cand.price);
  if (basePrice && candPrice && basePrice > 0 && candPrice > 0) {
    const relDiff = Math.abs(basePrice - candPrice) / Math.max(basePrice, candPrice);
    const priceScore = Math.max(0, 1 - relDiff); // closer -> higher
    score += priceScore * 0.45;
  }

  // Location boost
  const baseAddr = base.addresses?.[0];
  const candAddr = cand.addresses?.[0];
  if (baseAddr && candAddr) {
    if (baseAddr.province && candAddr.province && baseAddr.province === candAddr.province) score += 0.15;
    if (baseAddr.district && candAddr.district && baseAddr.district === candAddr.district) score += 0.20;
  }

  // Subcategory match boost
  const baseSub = (base.konut_details?.[0]?.konut_type)
    || (base.ticari_details?.[0]?.ticari_type)
    || (base.arsa_details?.[0]?.arsa_type)
    || (base.vasita_details?.[0]?.vasita_type);
  const candSub = (cand.konut_details?.[0]?.konut_type)
    || (cand.ticari_details?.[0]?.ticari_type)
    || (cand.arsa_details?.[0]?.arsa_type)
    || (cand.vasita_details?.[0]?.vasita_type);
  if (baseSub && candSub && baseSub === candSub) score += 0.10;

  // Room count match boost (konut/ticari)
  const baseRooms = base.konut_details?.[0]?.room_count ?? base.ticari_details?.[0]?.room_count;
  const candRooms = cand.konut_details?.[0]?.room_count ?? cand.ticari_details?.[0]?.room_count;
  if (baseRooms && candRooms && String(baseRooms) === String(candRooms)) score += 0.07;

  // Newer listings slight boost
  const candTime = new Date(cand.created_at || 0).getTime();
  if (Number.isFinite(candTime) && candTime > 0) {
    // Normalize by 365 days – newer gets up to +0.03
    const daysAgo = (Date.now() - candTime) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - Math.min(daysAgo / 365, 1));
    score += recencyScore * 0.03;
  }

  // Featured small boost
  if (cand.is_featured) score += 0.02;

  return score;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (!id && !slug) {
      return NextResponse.json({ error: 'Listing id or slug is required' }, { status: 400 });
    }

    // 1) Fetch base listing with details
    let baseQuery = supabase
      .from('listings')
      .select(`
        *,
        images(url, is_cover),
        konut_details(*),
        ticari_details(*),
        arsa_details(*),
        vasita_details(*),
        addresses(*)
      `)
      .limit(1);

    if (id) {
      baseQuery = baseQuery.eq('id', id);
    } else if (slug) {
      const titleFromSlug = slug.replace(/-/g, ' ');
      baseQuery = baseQuery.ilike('title', `%${titleFromSlug}%`);
    }

    const { data: baseList, error: baseErr } = await baseQuery;
    if (baseErr || !baseList || baseList.length === 0) {
      return NextResponse.json({ error: 'Base listing not found', details: baseErr }, { status: 404 });
    }
    const base = baseList[0] as AnyRecord;

    // 2) Build candidate query – same property type, active, exclude base id, coarse price window
    const basePrice = toNumber(base.price) ?? 0;
    const minPrice = basePrice > 0 ? Math.floor(basePrice * 0.7) : undefined;
    const maxPrice = basePrice > 0 ? Math.ceil(basePrice * 1.3) : undefined;

    let candQuery = supabase
      .from('listings')
      .select(`
        *,
        images(url, is_cover),
        konut_details(*),
        ticari_details(*),
        arsa_details(*),
        vasita_details(*),
        addresses(*)
      `)
      .eq('is_active', true)
      .eq('property_type', base.property_type)
      .neq('id', base.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (minPrice !== undefined) candQuery = candQuery.gte('price', minPrice);
    if (maxPrice !== undefined) candQuery = candQuery.lte('price', maxPrice);

    const { data: candidates, error: candErr } = await candQuery;
    if (candErr) {
      return NextResponse.json({ error: 'Failed to fetch candidates', details: candErr }, { status: 500 });
    }

    const withScores = (candidates || []).map((c) => ({ cand: c, score: computeSimilarityScore(base, c) }));

    // Prefer same district/province explicitly when scores tie
    const baseDistrict = base.addresses?.[0]?.district;
    const baseProvince = base.addresses?.[0]?.province;

    withScores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aAddr = a.cand.addresses?.[0] || {};
      const bAddr = b.cand.addresses?.[0] || {};
      const aLocal = (aAddr.district && aAddr.district === baseDistrict) ? 2 : (aAddr.province && aAddr.province === baseProvince) ? 1 : 0;
      const bLocal = (bAddr.district && bAddr.district === baseDistrict) ? 2 : (bAddr.province && bAddr.province === baseProvince) ? 1 : 0;
      if (bLocal !== aLocal) return bLocal - aLocal;
      return 0;
    });

    const top = withScores.slice(0, 12).map(({ cand }) => {
      const cover = cand.images?.find((img: any) => img?.is_cover) || cand.images?.[0];

      // Extract display details by type
      let rooms: string | undefined;
      let area: number | undefined;
      let model: string | undefined;
      let year: number | undefined;
      let subcategory: string | undefined;

      if (cand.property_type === 'konut' && cand.konut_details?.[0]) {
        rooms = cand.konut_details[0].room_count;
        area = toNumber(cand.konut_details[0].gross_sqm) || toNumber(cand.konut_details[0].net_sqm) || undefined;
        subcategory = cand.konut_details[0].konut_type;
      } else if (cand.property_type === 'ticari' && cand.ticari_details?.[0]) {
        rooms = (cand.ticari_details[0].room_count != null) ? String(cand.ticari_details[0].room_count) : undefined;
        area = toNumber(cand.ticari_details[0].gross_sqm) || toNumber(cand.ticari_details[0].net_sqm) || undefined;
        subcategory = cand.ticari_details[0].ticari_type;
      } else if (cand.property_type === 'arsa' && cand.arsa_details?.[0]) {
        area = toNumber(cand.arsa_details[0].sqm) || undefined;
        subcategory = cand.arsa_details[0].arsa_type;
      } else if (cand.property_type === 'vasita' && cand.vasita_details?.[0]) {
        model = cand.vasita_details[0].model;
        year = toNumber(cand.vasita_details[0].year) || undefined;
        subcategory = cand.vasita_details[0].brand || cand.vasita_details[0].vasita_type;
      }

      return {
        id: cand.id,
        title: cand.title,
        price: toNumber(cand.price) ?? 0,
        property_type: cand.property_type,
        listing_status: cand.listing_status,
        is_featured: !!cand.is_featured,
        thumbnail_url: cover?.url || null,
        created_at: cand.created_at,
        location: formatLocation(cand.addresses?.[0]),
        rooms,
        area,
        model,
        year,
        subcategory,
      };
    });

    return NextResponse.json({
      base: { id: base.id },
      results: top,
      count: top.length,
    });
  } catch (error) {
    console.error('Error in related listings route:', error);
    return NextResponse.json({ error: 'Failed to fetch related listings', details: String(error) }, { status: 500 });
  }
}


