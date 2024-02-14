import {createConnection} from "mysql"
import dotenv from "dotenv"
import * as fs from "fs"
import * as util from "util"

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

async function generate_tables(conn) {
    try {
        const content = fs.readFileSync('sql/init.logging.sql', 'utf8')
        const sqls = content.split(';')
        const query = util.promisify(conn.query).bind(conn)
    
        for (const sql of sqls) {
            console.log(sql)
            if (sql.trim() === '') {
                continue;
            }
            await query(sql);
        }
        console.log("Successfuly created tables")
    } catch (error) {
        console.error("Error creating tables:", error)
    } finally {
        conn.end()
    }
}

async function query(sql, values) {
    const connection = await pool.getConnection();
    try {
        const [rows, fields] = await connection.execute(sql, values);
        return rows;
    } finally {
        connection.release();
    }
}
// Check CHATGPT Connection TIMEOUT

generate_tables(conn)