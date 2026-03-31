import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT * FROM students ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const full_name = formData.get('full_name') as string;
    const date_of_birth = formData.get('date_of_birth') as string;
    const father_name = formData.get('father_name') as string;
    const gender = formData.get('gender') as string;
    const address = formData.get('address') as string;
    const course = formData.get('course') as string;
    const mobile_number = formData.get('mobile_number') as string;
    const date_of_joining = formData.get('date_of_joining') as string;
    const id_card = formData.get('id_card') as File;

    let id_card_path = null;
    if (id_card && id_card.size > 0) {
      const bytes = await id_card.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'id_cards');
      await mkdir(uploadDir, { recursive: true });
      
      const fileName = `${Date.now()}_${id_card.name}`;
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      id_card_path = `/uploads/id_cards/${fileName}`;
    }

    const [result] = await pool.execute(
      `INSERT INTO students (full_name, date_of_birth, father_name, gender, address, course, mobile_number, date_of_joining, id_card_path) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [full_name, date_of_birth, father_name, gender, address, course, mobile_number, date_of_joining, id_card_path]
    );

    const studentId = (result as any).insertId;

    // Fetch membership fee from settings
    const [settingsResult] = await pool.execute("SELECT setting_value FROM settings WHERE setting_key = 'membership_fee'");
    const membershipFee = (settingsResult as any[])[0]?.setting_value || '500.00';

    // Add membership fee record
    await pool.execute(
      'INSERT INTO fees (student_id, amount, fee_type, description, status) VALUES (?, ?, ?, ?, ?) RETURNING id',
      [studentId, membershipFee, 'Membership', 'Initial membership fee', 'Pending']
    );

    return NextResponse.json({ 
      message: 'Student registered successfully and membership fee added', 
      id: studentId 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error registering student:', error);
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json({ 
        error: 'Database connection failed. Please ensure MariaDB/MySQL is running and the database is configured.' 
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to register student' }, { status: 500 });
  }
}
