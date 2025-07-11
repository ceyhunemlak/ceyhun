import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, title } = data;

    // Validate required fields
    if (!id || !title) {
      console.error('Missing required fields:', { id, title });
      return NextResponse.json(
        { error: 'ID ve başlık alanları zorunludur' },
        { status: 400 }
      );
    }

    console.log('Updating listing title:', { id, title });

    // Update the title in the listings table
    const { error } = await supabase
      .from('listings')
      .update({ title })
      .eq('id', id);

    if (error) {
      console.error('Error updating listing title:', error);
      return NextResponse.json(
        { error: 'Başlık güncellenirken bir hata oluştu', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      id,
      title
    });
  } catch (error) {
    console.error('Error in title update route:', error);
    return NextResponse.json(
      { error: 'Başlık güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 