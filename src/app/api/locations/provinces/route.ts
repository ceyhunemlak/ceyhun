import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all unique provinces from addresses table
    const { data, error } = await supabase
      .from('addresses')
      .select('province')
      .order('province');
      
    if (error) {
      console.error('Error fetching provinces:', error);
      return NextResponse.json(
        { error: 'Failed to fetch provinces', details: error },
        { status: 500 }
      );
    }

    // Extract unique provinces
    const uniqueProvinces = [...new Set(data.map(item => item.province))];
    
    return NextResponse.json(uniqueProvinces);
  } catch (error) {
    console.error('Error in provinces route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provinces', details: error },
      { status: 500 }
    );
  }
} 