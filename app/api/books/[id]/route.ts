import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const params = await context.params;
    const bookId = params.id;
    const body = await request.json();
    const { title, author, isbn, category, quantity, issue_fee } = body;

    const [result] = await pool.execute(
      'UPDATE books SET title = ?, author = ?, isbn = ?, category = ?, quantity = ?, issue_fee = ? WHERE id = ?',
      [title, author, isbn, category, quantity, issue_fee, bookId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Book updated successfully' });
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const params = await context.params;
    const bookId = params.id;

    const [result] = await pool.execute('DELETE FROM books WHERE id = ?', [bookId]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
