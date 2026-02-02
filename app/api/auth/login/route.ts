import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: Request) {
  const client = await pool.connect();
  try {
    const { email, password } = await req.json();

    // 1. Find Supplier by Email
    const result = await client.query('SELECT * FROM suppliers WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = result.rows[0];

    // 2. Check Password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 3. Return User Info (Used by frontend to store in localStorage)
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        companyName: user.company_name, 
        email: user.email 
      } 
    });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  } finally {
    client.release();
  }
}