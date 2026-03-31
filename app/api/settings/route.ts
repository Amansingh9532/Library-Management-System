import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT * FROM settings');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { setting_key, setting_value } = body;

    const [result] = await pool.execute(
      'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
      [setting_value, setting_key]
    );

    if ((result as any).affectedRows === 0) {
      await pool.execute(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)',
        [setting_key, setting_value]
      );
    }

    return NextResponse.json({ message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
