import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT bi.*, s.full_name as student_name, b.title as book_title, b.issue_fee
      FROM book_issues bi
      JOIN students s ON bi.student_id = s.id
      JOIN books b ON bi.book_id = b.id
      ORDER BY LENGTH(s.seat_number) ASC, s.seat_number ASC, bi.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching book issues:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, book_id, issue_date, due_date, issue_fee } = body;

    const [bookResult] = await pool.execute('SELECT issue_fee FROM books WHERE id = ?', [book_id]);
    const book = (bookResult as any[])[0];
    const fee_charged = issue_fee !== undefined ? parseFloat(issue_fee) : (book ? book.issue_fee : 0);

    const [result] = await pool.execute(
      'INSERT INTO book_issues (student_id, book_id, issue_date, due_date, fee_charged) VALUES (?, ?, ?, ?, ?) RETURNING id',
      [student_id, book_id, issue_date, due_date, fee_charged]
    );

    await pool.execute(
      'INSERT INTO fees (student_id, amount, fee_type, description, status) VALUES (?, ?, ?, ?, ?)',
      [student_id, fee_charged, 'Book Issue', `Book issue fee for book ID ${book_id}`, 'Pending']
    );

    return NextResponse.json({ 
      message: 'Book issued successfully', 
      id: (result as any).insertId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error issuing book:', error);
    return NextResponse.json({ error: 'Failed to issue book' }, { status: 500 });
  }
}
