import mysql from 'serverless-mysql';
import { config } from './config';

const db = mysql({
  config: {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    ssl: {
      rejectUnauthorized: false
    }
  }
});

export async function query<T>(sql: string, values: unknown[] = []): Promise<T> {
  try {
    const results = await db.query<T>(sql, values);
    await db.end();
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database query failed');
  }
}

export async function transaction<T>(
  queries: Array<{ sql: string; values?: unknown[] }>
): Promise<T[]> {
  try {
    const results: T[] = [];
    
    await db.transaction()
      .query(async (tx: typeof db) => {
        for (const query of queries) {
          const result = await tx.query<T>(query.sql, query.values || []);
          results.push(result);
        }
      })
      .rollback((e: Error) => {
        console.error('Database transaction error:', e);
        throw new Error('Database transaction failed');
      })
      .commit();

    await db.end();
    return results;
  } catch (error) {
    console.error('Database transaction error:', error);
    throw new Error('Database transaction failed');
  }
}

export default db;