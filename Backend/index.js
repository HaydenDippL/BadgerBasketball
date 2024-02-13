// Step 1. Import the 'mysql' and 'dotenv' packages.
import { createPool } from "mysql"
import dotenv from "dotenv"
import * as fs from "fs"
import * as util from "util"

// Step 2. Load environment variables from .env file to process.env.
dotenv.config()

// Step 3. Create a connection to the TiDB cluster.
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

async function logging(date_queried, gym, gym_facility, session_id, IP, date_of_query, device, browser) {
    return new Promise(async (resolve, reject) => {
        try {
            await insert_queries_sql(date_queried, gym, gym_facility, session_id)
            await insert_sessions_sql(session_id, IP, date_of_query, device, browser)
            await update_sessions_sql(session_id)
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

async function insert_queries_sql(date_queried, gym, gym_facility, session_id) {
    const insertQueriesSQL = `INSERT INTO queries (date_queried, gym, gym_facility, session_id) VALUES (?, ?, ?, ?);`
    return new Promise((resolve, reject) => {
        pool.query(insertQueriesSQL, [date_queried, gym, gym_facility, session_id], (err) => {
            if (err) reject(err)
            else resolve()
        })
    })
}

async function insert_sessions_sql(session_id, IP, date_of_query, device, browser) {
    const insertSessionsSQL = `INSERT OR IGNORE INTO sessions (session_id, IP, num_queries, date_of_queries, device, browser) VALUES (?, ?, 0, ?, ?, ?);`
    return new Promise((resolve, reject) => {
        pool.query(insertSessionsSQL, [session_id, IP, date_of_query, device, browser], (err) => {
            if (err) reject(err)
            else resolve()
        })
    })
}

async function update_sessions_sql(session_id) {
    const updateSessionsSQL = `UPDATE sessions SET num_queries = num_queries + 1 WHERE session_id = ?;`
    return new Promise((resolve, reject) => {
        pool.query(updateSessionsSQL, [session_id], (err) => {
            if (err) reject(err)
            else resolve()
        })
    })
}