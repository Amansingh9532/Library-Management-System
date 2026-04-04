import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * POST /api/fees/generate
 * 
 * Checks all students who have paid their last membership fee and 
 * whose next payment cycle is due. Automatically creates a new
 * 'Pending' membership fee for them.
 */
export async function POST() {
  try {
    // 1. Get fee_cycle and membership_fee from settings
    const [settings] = await pool.execute('SELECT * FROM settings');
    const settingsArray = settings as any[];

    const feeCycleSetting = settingsArray.find((s: any) => s.setting_key === 'fee_cycle');
    const membershipFeeSetting = settingsArray.find((s: any) => s.setting_key === 'membership_fee');

    const feeCycle = feeCycleSetting?.setting_value || 'monthly';
    const membershipFee = membershipFeeSetting?.setting_value || '500.00';

    // 2. Calculate the interval in days based on fee cycle
    let intervalMonths: number;
    switch (feeCycle) {
      case 'quarterly':
        intervalMonths = 3;
        break;
      case 'half_yearly':
        intervalMonths = 6;
        break;
      case 'yearly':
        intervalMonths = 12;
        break;
      case 'monthly':
      default:
        intervalMonths = 1;
        break;
    }

    // 3. Find all students
    const [students] = await pool.execute('SELECT id, full_name FROM students ORDER BY full_name ASC');
    const studentsArray = students as any[];

    let generatedCount = 0;

    for (const student of studentsArray) {
      // 4. Find the most recent Membership fee for this student (paid or pending)
      const [lastFees] = await pool.execute(
        `SELECT id, status, created_at, paid_at 
         FROM fees 
         WHERE student_id = ? AND fee_type = 'Membership' 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [student.id]
      );
      const lastFeesArray = lastFees as any[];

      if (lastFeesArray.length === 0) {
        // No membership fee at all — create one as pending
        await pool.execute(
          `INSERT INTO fees (student_id, amount, fee_type, description, status) 
           VALUES (?, ?, 'Membership', ?, 'Pending') RETURNING id`,
          [student.id, membershipFee, `Membership fee (${feeCycle})`]
        );
        generatedCount++;
        continue;
      }

      const lastFee = lastFeesArray[0];

      // If the last membership fee is still pending, skip — they haven't paid yet
      if (lastFee.status === 'Pending') {
        continue;
      }

      // 5. Check if the cycle period has elapsed since the last fee was created
      const lastFeeDate = new Date(lastFee.created_at);
      const nextDueDate = new Date(lastFeeDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + intervalMonths);

      const now = new Date();

      if (now >= nextDueDate) {
        // Cycle has elapsed — generate a new pending fee
        await pool.execute(
          `INSERT INTO fees (student_id, amount, fee_type, description, status) 
           VALUES (?, ?, 'Membership', ?, 'Pending') RETURNING id`,
          [student.id, membershipFee, `Membership fee (${feeCycle}) - Due since ${nextDueDate.toLocaleDateString('en-IN')}`]
        );
        generatedCount++;
      }
    }

    return NextResponse.json({ 
      message: `Fee generation complete. ${generatedCount} new pending fees created.`,
      generated: generatedCount,
      cycle: feeCycle
    });
  } catch (error) {
    console.error('Error generating fees:', error);
    return NextResponse.json({ error: 'Failed to generate fees' }, { status: 500 });
  }
}
