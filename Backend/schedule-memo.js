import sqlite3 from 'sqlite3'
import fs from 'fs'

const db_path = './schedules.db'
const date_path = 'date.txt'

// Gets from the sqlite DB the entry matching date, gym, and gym_facility
// will return null if the entry does not exist as a Promise
export async function get_schedule(date, gym, gym_facility) {
    console.log(`db_get(date=${date} gym=${gym}, gym_facility=${gym_facility})`)
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(db_path, sqlite3.OPEN_READONLY, (err) => {
            if (err) reject(err)
        })

        let sql = `SELECT json_schedule FROM schedules WHERE date_queried = ? and gym = ? and gym_facility = ?`
        db.all(sql, [date, gym, gym_facility], (err, rows) => {
            if (err) reject(err)
            else if (rows && rows.length > 0) {
                resolve(rows[0].json_schedule)
            } else {
                resolve(null)
            }
        })

        db.close((err) => {
            if (err) reject(err)
        })
    })
}

// Inserts to the sqlite DB the entry containing date, gym, gym_facility, and json_schedule
export async function put_schedule(date, gym, gym_facility, json_schedule) {
    console.log(`db_put(date=${date}, gym=${gym}, gym_facility=${gym_facility}, json_schedule=...)`)
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
            if (err) return console.error(err.messge)
        })

        let sql = `INSERT INTO schedules (date_queried, gym, gym_facility, json_schedule) VALUES ( ?, ?, ?, ? )`
        db.all(sql, [date, gym, gym_facility, json_schedule], (err, row) => {
            if (err) return console.error(err.message)
            resolve()
        })
    
        db.close((err) => {
            if (err) return console.error(err.message)
        })
    })    
}

// Returns the contents of the entire table as a Promise
export async function db_all(table) {
    console.log(`db_all()`)
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(db_path, sqlite3.OPEN_READONLY, (err) => {
            if (err) reject(err)
        })

        let sql = `SELECT * FROM ${table}`
        db.all(sql, (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
        })

        db.close((err) => {
            if (err) reject(err)
        })
    })
}

// Wipe all entries in the table, just keeping the column types intact
export async function schedules_forget(table) {
    console.log(`db_wipe()`)
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
            if (err) reject(err)
        })

        let sql = `DELETE FROM ${table}`
        db.all(sql, (err, rows) => {
            if (err) reject(err)
        })

        db.close((err) => {
            if (err) reject(err)
            else resolve()
        })
    })
}

export function get_schedule_query_date() {
    console.log(`get_schedule_query_date()`)
    try {
        const date = fs.readFileSync(date_path, 'utf8')
        return date
    } catch (error) {
        return console.error(error.message)
    }
}

export async function put_schedule_query_date(date) {
    console.log(`put_schedule_query_date(date=${date})`)
    fs.writeFile(date_path, date, (err) => {
        if (err) console.error(err.message)
    })
}