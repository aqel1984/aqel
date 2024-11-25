import mysql from 'serverless-mysql'

const db = mysql({
  config: {
    host: process.env['DB_HOST'],
    user: process.env['DB_USER'],
    password: process.env['DB_PASSWORD'],
    database: process.env['DB_NAME'],
    ssl: {
      rejectUnauthorized: false
    }
  }
})

export async function query<T>(sql: string, values: unknown[] = []): Promise<T> {
  try {
    const results = await db.query<T>(sql, values)
    await db.end()
    return results
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}