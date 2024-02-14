import { createPool } from "mysql"
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
})

export async function logging(date_queried, gym, gym_facility, session_id, IP, date_of_query, device, browser) {
    return new Promise(async (resolve, reject) => {
        try {
            await insert_sessions(session_id, IP, date_of_query, device, browser)
            await insert_queries(date_queried, gym, gym_facility, session_id)
            await update_sessions(session_id)
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

async function insert_queries(date_queried, gym, gym_facility, session_id) {
    const insert_queries_sql = `INSERT INTO queries (date_queried, gym, gym_facility, session_id) VALUES (?, ?, ?, ?);`
    return new Promise((resolve, reject) => {
        pool.query(insert_queries_sql, [date_queried, gym, gym_facility, session_id], (err) => {
            if (err) reject(err)
            else resolve()
        })
    })
}

async function insert_sessions(session_id, IP, date_of_query, device, browser) {
    const insert_sessions_sql = `INSERT OR IGNORE INTO sessions (session_id, IP, num_queries, date_of_queries, device, browser) VALUES (?, ?, 0, ?, ?, ?);`
    return new Promise((resolve, reject) => {
        pool.query(insert_sessions_sql, [session_id, IP, date_of_query, device, browser], (err) => {
            if (err) reject(err)
            else resolve()
        })
    })
}

async function update_sessions(session_id) {
    const update_sessions_sql = `UPDATE sessions SET num_queries = num_queries + 1 WHERE session_id = ?;`
    return new Promise((resolve, reject) => {
        pool.query(update_sessions_sql, [session_id], (err) => {
            if (err) reject(err)
            else resolve()
        })
    })
}

async function get_queries() {
    const get_queries_sql = `SELECT * FROM queries`
    return new Promise((resolve, reject) => {
        pool.query(get_queries_sql, [], (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
        })
    })
}

async function get_sessions() {
    const get_sessions_sql = `SELECT * FROM sessions`
    return new Promise((resolve, reject) => {
        pool.query(get_sessions_sql, [], (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
        })
    })
}