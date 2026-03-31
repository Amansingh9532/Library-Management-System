import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgres://username:password@localhost:5432/library_management',
  ssl: { rejectUnauthorized: false }
});

export default {
  // raw query for direct usage
  query: (text: string, params?: any[]) => pool.query(text, params),
  
  // execute shim for mysql array destructuring standard compatibility
  execute: async (text: string, params: any[] = []) => {
    let index = 1;
    // Replace MySQL '?' placeholders with Postgres '$1, $2...'
    const formattedQuery = text.replace(/\?/g, () => `$${index++}`);
    
    try {
      const result = await pool.query(formattedQuery, params);
      
      const executionMeta = {
        affectedRows: result.rowCount || 0,
        insertId: (result.rows[0] as any)?.id || 0
      };
      
      // If it is a SELECT query, return [rows, fields]
      if (result.command === 'SELECT') {
        return [result.rows, result.fields];
      }
      
      // Otherwise return [meta, fields]
      return [executionMeta, result.fields];
    } catch (error) {
      // Log for production troubleshooting
      console.error("Postgres Execution Error!", error);
      console.error("SQL:", formattedQuery);
      console.error("Values:", JSON.stringify(params));
      throw error;
    }
  },
};
