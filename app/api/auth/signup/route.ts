import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: Request) {
  const client = await pool.connect();
  try {
    const { companyName, email, password, otp } = await req.json(); // Added otp here

    if (!companyName || !email || !password || !otp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // --- NEW OTP CHECK ---
    const otpCheck = await client.query(
      'SELECT * FROM otp_verification WHERE email = $1 AND otp = $2', 
      [email, otp]
    );
    if (otpCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }
    // ---------------------

    const check = await client.query('SELECT id FROM suppliers WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await client.query(
      `INSERT INTO suppliers (company_name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, company_name, email`,
      [companyName, email, hashedPassword]
    );

    // Delete OTP after successful signup
    await client.query('DELETE FROM otp_verification WHERE email = $1', [email]);

    const user = result.rows[0];
    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, companyName: user.company_name, email: user.email } 
    });

  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}