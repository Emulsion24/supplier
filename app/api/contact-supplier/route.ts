import { NextResponse } from 'next/server';
import { transporter } from '@/lib/mail';
import { Pool } from 'pg';

// Database Connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });


export async function POST(req: Request) {
  try {
    const { userEmail, product } = await req.json();

    if (!userEmail || !product || !product.supplierId) {
      return NextResponse.json({ success: false, error: 'Missing product or supplier details' }, { status: 400 });
    }

    // 1. Look up the Supplier's Email from the Database
    // We use the supplierId attached to the product to find the real destination email
    const client = await pool.connect();
    let supplierEmail = process.env.EMAIL_USER; // Default fallback (Admin email)
    
    try {
      const res = await client.query('SELECT email FROM suppliers WHERE id = $1', [product.supplierId]);
      if (res.rows.length > 0) {
        supplierEmail = res.rows[0].email;
      }
    } finally {
      client.release();
    }

    // 2. Send the Email
    await transporter.sendMail({
      from: `"Rezillion Market" <${process.env.EMAIL_USER}>`, 
      to: supplierEmail, // <--- Sends to the specific supplier found in DB
      replyTo: userEmail, // Supplier can click "Reply" to write back to the buyer
      subject: `New Lead: ${product.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #ea580c;">New Purchase Inquiry</h2>
          <p>You have a new lead for your product.</p>
          
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Product:</strong> ${product.name}</p>
            <p><strong>Specs:</strong> ${product.power}Wp, ${product.technology}</p>
            <p><strong>Listed Price:</strong> ₹${product.priceEx}/Wp</p>
          </div>

          <h3>Buyer Contact:</h3>
          <p><strong>Email:</strong> <a href="mailto:${userEmail}">${userEmail}</a></p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">
            This lead was generated via the Rezillion Supply Chain Platform.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}