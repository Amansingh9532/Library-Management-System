import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await pool.execute('DELETE FROM students WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const full_name = formData.get('full_name') as string;
    const seat_number = formData.get('seat_number') as string;
    const father_name = formData.get('father_name') as string;
    const gender = formData.get('gender') as string;
    const address = formData.get('address') as string;
    const course = formData.get('course') as string;
    const mobile_number = formData.get('mobile_number') as string;
    const date_of_joining = formData.get('date_of_joining') as string;
    const id_card = formData.get('id_card') as File | null;

    let id_card_path: string | null = null;

    if (id_card && id_card.size > 0) {
      const bytes = await id_card.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString('base64');
      const contentType = id_card.type || 'image/png';
      id_card_path = `data:${contentType};base64,${base64Image}`;
    }

    if (id_card_path) {
      await pool.execute(
        `UPDATE students SET full_name = ?, seat_number = ?, father_name = ?, gender = ?, address = ?, course = ?, mobile_number = ?, date_of_joining = ?, id_card_path = ? WHERE id = ?`,
        [full_name, seat_number, father_name, gender, address, course, mobile_number, date_of_joining, id_card_path, id]
      );
    } else {
      await pool.execute(
        `UPDATE students SET full_name = ?, seat_number = ?, father_name = ?, gender = ?, address = ?, course = ?, mobile_number = ?, date_of_joining = ? WHERE id = ?`,
        [full_name, seat_number, father_name, gender, address, course, mobile_number, date_of_joining, id]
      );
    }

    return NextResponse.json({ message: 'Student updated successfully' });
  } catch (error: any) {
    console.error('Error updating student:', error);
    if (error.code === '23505' && error.constraint === 'students_mobile_number_key') {
      return NextResponse.json({ error: 'A student with this mobile number already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}
