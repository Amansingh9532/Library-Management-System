import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await pool.execute(
      "UPDATE fees SET status = 'Paid', paid_at = NOW() WHERE id = ?",
      [id]
    );
    return NextResponse.json({ message: 'Fee paid successfully' });
  } catch (error) {
    console.error('Error paying fee:', error);
    return NextResponse.json({ error: 'Failed to pay fee' }, { status: 500 });
  }
}
