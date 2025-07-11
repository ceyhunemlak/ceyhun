import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, price } = data;

    // Validate required fields
    if (!id || !price) {
      console.error('Missing required fields:', { id, price });
      return NextResponse.json(
        { error: 'ID ve fiyat alanları zorunludur' },
        { status: 400 }
      );
    }

    // Validate price is a number and greater than zero
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Geçerli bir fiyat girilmelidir' },
        { status: 400 }
      );
    }

    console.log('Updating listing price:', { id, price });

    // Update the price in the listings table
    const { error } = await supabase
      .from('listings')
      .update({ price })
      .eq('id', id);

    if (error) {
      console.error('Error updating listing price:', error);
      return NextResponse.json(
        { error: 'Fiyat güncellenirken bir hata oluştu', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      id,
      price
    });
  } catch (error) {
    console.error('Error in price update route:', error);
    return NextResponse.json(
      { error: 'Fiyat güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 