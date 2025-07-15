import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province');

    if (!province) {
      return NextResponse.json(
        { error: 'Province parameter is required' },
        { status: 400 }
      );
    }

    // Fetch all districts for the specified province
    const { data, error } = await supabase
      .from('addresses')
      .select('district')
      .eq('province', province)
      .order('district');
      
    if (error) {
      console.error(`Error fetching districts for province ${province}:`, error);
      return NextResponse.json(
        { error: 'Failed to fetch districts', details: error },
        { status: 500 }
      );
    }

    // Extract unique districts
    const uniqueDistricts = [...new Set(data.map(item => item.district))];
    
    return NextResponse.json(uniqueDistricts);
  } catch (error) {
    console.error('Error in districts route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch districts', details: error },
      { status: 500 }
    );
  }
} 