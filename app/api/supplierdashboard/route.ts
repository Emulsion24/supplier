import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- GET: Fetch Data ---
export async function GET(req: Request) {
  const client = await pool.connect();
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get('supplierId');

    // SECURITY FIX: 
    // If there is no supplierId, return an error immediately.
    // Do not allow the query to run without a WHERE clause.
    if (!supplierId) {
      return NextResponse.json(
        { error: 'Supplier ID is required to fetch products.' }, 
        { status: 400 } // Bad Request
      );
    }

    // 1. Fetch Products (Strictly Filtered by Supplier ID)
    // We hardcode the WHERE clause so it is impossible to remove it accidentally.
    const productQuery = `
      SELECT id, name, supplier_id, attributes 
      FROM products 
      WHERE supplier_id = $1 
      ORDER BY id ASC
    `;
    
    const productsRes = await client.query(productQuery, [supplierId]);

    // 2. Fetch Settings (Assuming these are global, keeping logic same)
    const settingsRes = await client.query(`SELECT setting_key, setting_value FROM dashboard_settings`);
    
    const rowsSetting = settingsRes.rows.find(r => r.setting_key === 'rows');
    const locSetting = settingsRes.rows.find(r => r.setting_key === 'locations');

    // 3. Format Data
    const products = productsRes.rows.map(row => ({
      id: row.id,
      name: row.name,
      supplierId: row.supplier_id,
      ...row.attributes
    }));

    return NextResponse.json({
      products,
      rows: rowsSetting ? rowsSetting.setting_value : [],
      locations: locSetting ? locSetting.setting_value : ['Kolkata']
    });

  } catch (error) {
    console.error('Dashboard GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  } finally {
    client.release();
  }
}
// --- POST: Handle Create/Update/Delete ---
export async function POST(req: Request) {
  const client = await pool.connect();
  try {
    const body = await req.json();
    const { action, data } = body;

    // --- CREATE PRODUCT ---
    if (action === 'create_product') {
      const { name, supplierId, id, ...attributes } = data;

      if (!supplierId) {
        return NextResponse.json({ error: 'Supplier ID required' }, { status: 400 });
      }

      const result = await client.query(
        `INSERT INTO products (supplier_id, name, attributes) 
         VALUES ($1, $2, $3) 
         RETURNING id`,
        [supplierId, name, JSON.stringify(attributes)]
      );
      
      return NextResponse.json({ success: true, newId: result.rows[0].id });
    }

    // --- UPDATE PRODUCT ---
    if (action === 'update_product') {
      const { id, name, supplierId, ...attributes } = data;
      
      await client.query(
        `UPDATE products 
         SET name = $1, attributes = $2 
         WHERE id = $3`,
        [name, JSON.stringify(attributes), id]
      );
      return NextResponse.json({ success: true });
    }

    // --- DELETE PRODUCT ---
    if (action === 'delete_product') {
      await client.query(`DELETE FROM products WHERE id = $1`, [data.id]);
      return NextResponse.json({ success: true });
    }

    // --- UPDATE SETTINGS ---
    if (action === 'update_settings') {
      const { key, value } = data;
      
      // Upsert into 'setting_value'
      await client.query(
        `INSERT INTO dashboard_settings (setting_key, setting_value)
         VALUES ($1, $2)
         ON CONFLICT (setting_key) 
         DO UPDATE SET setting_value = $2`,
        [key, JSON.stringify(value)]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });

  } catch (error) {
    console.error('Dashboard POST Error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  } finally {
    client.release();
  }
}