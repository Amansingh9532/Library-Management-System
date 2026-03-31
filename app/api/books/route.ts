import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT * FROM books ORDER BY title');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, author, isbn, category, quantity, issue_fee } = body;

    const [result] = await pool.execute(
      'INSERT INTO books (title, author, isbn, category, quantity, issue_fee) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
      [title, author, isbn, category, quantity, issue_fee]
    );

    return NextResponse.json({ 
      message: 'Book added successfully', 
      id: (result as any).insertId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding book:', error);
    return NextResponse.json({ error: 'Failed to add book' }, { status: 500 });
  }
}
