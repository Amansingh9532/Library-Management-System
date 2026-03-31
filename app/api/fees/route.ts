import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const student_id = searchParams.get('student_id');

    let query = `
      SELECT f.*, s.full_name as student_name, s.seat_number as student_seat_number
      FROM fees f
      JOIN students s ON f.student_id = s.id
    `;
    const params: any[] = [];

    if (student_id) {
      query += ' WHERE f.student_id = ?';
      params.push(student_id);
    }

    query += ' ORDER BY f.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching fees:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, amount, fee_type, description } = body;

    const [result] = await pool.execute(
      'INSERT INTO fees (student_id, amount, fee_type, description, status) VALUES (?, ?, ?, ?, ?) RETURNING id',
      [student_id, amount, fee_type, description, 'Pending']
    );

    return NextResponse.json({ 
      message: 'Fee record created successfully', 
      id: (result as any).insertId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating fee record:', error);
    return NextResponse.json({ error: 'Failed to create fee record' }, { status: 500 });
  }
}
