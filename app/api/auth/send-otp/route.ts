import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { transporter } from '@/lib/mail';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: Request) {
  const { email } = await req.json();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Store/Update OTP for this email
    await pool.query(
      `INSERT INTO otp_verification (email, otp) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET otp = $2`,
      [email, otp]
    );

    await transporter.sendMail({
      from: `"Rezillion" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html: `<h1>${otp}</h1><p>Enter this code to verify your account.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}