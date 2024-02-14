import {createConnection} from "mysql"
import dotenv from "dotenv"
import * as fs from "fs"
import * as util from "util"
import { rejects } from "assert"

dotenv.config()

const conn = createConnection({
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

async function drop_table(conn, table) {
    return new Promise((resolve, reject) => {
        conn.query(`DROP TABLE ${table}`, [], (err) => {
            if (err) reject(err)
            else resolve()
        })
    })
}

try {
    await drop_table(conn, 'queries')
    await drop_table(conn, 'sessions')
} finally {
    conn.end()
}