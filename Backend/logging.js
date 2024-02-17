import { createPool, format } from "mysql"
import dotenv from "dotenv"
import * as fs from "fs"

dotenv.config()

const pool = createPool({
    host: process.env.TIDB_HOST || '127.0.0.1',
    port: process.env.TIDB_PORT || 4000,
    user: process.env.TIDB_USER || 'root',
    password: process.env.TIDB_PASSWORD || '',
    database: process.env.TIDB_DATABASE || 'test',
    ssl: process.env.TIDB_ENABLE_SSL === 'true' ? {
        minVersion: 'TLSv1.2',
        ca: process.env.TIDB_CA_PATH ? fs.readFileSync(process.env.TIDB_CA_PATH) : undefined
    } : null,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 20
})

// async function that allows you call vall the logging DB
export async function query(query, values) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err)
                return
            }

            const sql = format(query, values)
            connection.query(sql, (err, data) => {
                connection.destroy()
                return err ? reject(err) : resolve(data)
            })
        })
    })
}

// logs user data and visits
export async function logging(date_queried, gym, gym_facility, session_id, IP, date_of_query, time_of_query, device, browser) {
    const session_exists_sql = 'SELECT COUNT(*) AS count FROM sessions WHERE session_id = ?'
    const session_exists = (await query(session_exists_sql, [session_id]))[0].count > 0
    console.log("Session exists:",session_exists)
    
    if (session_exists) {
        const update_sessions_sql = 'UPDATE sessions SET num_queries = num_queries + 1 WHERE session_id = ?'
        await query(update_sessions_sql, [session_id])
    } else {
        const insert_sessions_sql = 'INSERT INTO sessions (session_id, IP, num_queries, date_of_queries, time_of_queries, device, browser) VALUES (?, ?, 1, ?, ?, ?, ?)'
        await query(insert_sessions_sql, [session_id, IP, date_of_query, time_of_query, device, browser])
    }

    const insert_queries_sql = 'INSERT INTO queries (date_queried, gym, gym_facility, session_id) VALUES (?, ?, ?, ?);'
    await query(insert_queries_sql, [date_queried, gym, gym_facility, session_id])
}

// displays the whoel query table
export async function get_queries() {
    const get_queries_sql = `SELECT * FROM queries`
    return await query(get_queries_sql, [])
}

// displays the whole sessions table
export async function get_sessions() {
    const get_sessions_sql = `SELECT * FROM sessions`
    return await query(get_sessions_sql, [])
}