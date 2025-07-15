import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import neighborhoodsByDistrict from '@/lib/neighborhoods';

// Define types for the neighborhood data structure
interface Neighborhood {
  value: string;
  label: string;
}

interface DistrictData {
  mahalle: Neighborhood[];
  koy: Neighborhood[];
}

type NeighborhoodsByDistrict = {
  [district: string]: DistrictData;
};

export async function GET() {
  try {
    // Fetch all addresses
    const { data, error } = await supabase
      .from('addresses')
      .select('province, district, neighborhood')
      .order('province');
      
    if (error) {
      console.error('Error fetching addresses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch locations', details: error },
        { status: 500 }
      );
    }

    // Structure the data as nested objects
    const locations: { 
      [province: string]: { 
        [district: string]: string[] 
      }
    } = {};

    // First add the static Tokat data
    locations['tokat'] = {};
    Object.keys(neighborhoodsByDistrict as NeighborhoodsByDistrict).forEach(district => {
      const districtData = (neighborhoodsByDistrict as NeighborhoodsByDistrict)[district];
      const allNeighborhoods = [
        ...districtData.mahalle.map((n: Neighborhood) => n.value),
        ...districtData.koy.map((n: Neighborhood) => n.value)
      ];
      locations['tokat'][district] = allNeighborhoods;
    });

    // Then add the dynamic data from other provinces
    data.forEach(address => {
      const province = address.province.toLowerCase();
      const district = address.district.toLowerCase();
      const neighborhood = address.neighborhood;
      
      // Skip Tokat as it's handled separately with static data
      if (province === 'tokat') return;

      if (!locations[province]) {
        locations[province] = {};
      }
      
      if (!locations[province][district]) {
        locations[province][district] = [];
      }
      
      // Add neighborhood if it doesn't exist yet
      if (neighborhood && !locations[province][district].includes(neighborhood)) {
        locations[province][district].push(neighborhood);
      }
    });
    
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error in all locations route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations', details: error },
      { status: 500 }
    );
  }
} 