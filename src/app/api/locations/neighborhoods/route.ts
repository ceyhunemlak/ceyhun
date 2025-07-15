import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province');
    const district = searchParams.get('district');

    if (!province || !district) {
      return NextResponse.json(
        { error: 'Both province and district parameters are required' },
        { status: 400 }
      );
    }

    // Fetch all neighborhoods for the specified province and district
    const { data, error } = await supabase
      .from('addresses')
      .select('neighborhood')
      .eq('province', province)
      .eq('district', district)
      .order('neighborhood');
      
    if (error) {
      console.error(`Error fetching neighborhoods for ${province}/${district}:`, error);
      return NextResponse.json(
        { error: 'Failed to fetch neighborhoods', details: error },
        { status: 500 }
      );
    }

    // Extract unique neighborhoods
    const uniqueNeighborhoods = [...new Set(data.map(item => item.neighborhood))];
    
    return NextResponse.json(uniqueNeighborhoods);
  } catch (error) {
    console.error('Error in neighborhoods route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch neighborhoods', details: error },
      { status: 500 }
    );
  }
} 