import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Define an interface for the raw database row to satisfy TypeScript
interface ProductRow {
  id: number;
  name: string;
  supplier_name: string | null;
  supplier_id: number;
  attributes: Record<string, unknown> | null; // JSONB columns are usually objects
}

export async function GET(req: Request) {
  const client = await pool.connect();
  try {
    // Note: searchParams is defined but not used in your snippet. 
    // Keeping it to avoid "unused variable" linter errors if you plan to use it later.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { searchParams } = new URL(req.url);
    
    // --- FIX 1: Use LEFT JOIN ---
    // 'LEFT JOIN' ensures the product appears even if the supplier is deleted
    // or if the supplier_id doesn't perfectly match the suppliers table.
    const query = `
      SELECT 
        p.id, 
        p.name, 
        s.company_name as supplier_name,
        p.supplier_id,
        p.attributes 
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.id DESC
    `;
    
    // Pass the generic type <ProductRow> to query
    const result = await client.query<ProductRow>(query);

    // --- DATA TRANSFORMATION ---
    const products = result.rows.map((row) => {
      // Ensure attributes is an object
      const attributes = (row.attributes as Record<string, unknown>) || {};
      
      return {
        id: row.id,
        name: row.name,
        // CRITICAL: Map 'supplier_name' (from DB) to 'supplier' (for Frontend)
        supplier: row.supplier_name || 'Unknown Supplier', 
        supplierId: row.supplier_id,
        
        // Spread the attributes
        ...attributes, 
        
        // Ensure price is a number (0 if missing), safe casting
        priceEx: Number(attributes.priceEx) || 0, 
      };
    });

    // Logging the count is usually cleaner than the whole object
    console.log(`[Marketplace API] Fetched ${products.length} Products`);

    return NextResponse.json({ success: true, data: products });

  } catch (error: unknown) { // Type error as unknown
    // Safe error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Marketplace API Error]', errorMessage);
    
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  } finally {
    client.release();
  }
}