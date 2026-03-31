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
    const body = await request.json();
    const { full_name, seat_number, father_name, gender, address, course, mobile_number, date_of_joining } = body;

    await pool.execute(
      `UPDATE students SET full_name = ?, seat_number = ?, father_name = ?, gender = ?, address = ?, course = ?, mobile_number = ?, date_of_joining = ? WHERE id = ?`,
      [full_name, seat_number, father_name, gender, address, course, mobile_number, date_of_joining, id]
    );

    return NextResponse.json({ message: 'Student updated successfully' });
  } catch (error: any) {
    console.error('Error updating student:', error);
    if (error.code === '23505' && error.constraint === 'students_mobile_number_key') {
      return NextResponse.json({ error: 'A student with this mobile number already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}
