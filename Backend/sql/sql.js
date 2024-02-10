import sqlite3 from 'sqlite3'

// Gets from the sqlite DB the entry matching date, gym, and gym_facility
// will return null if the entry does not exist as a Promise
export async function db_get(date, gym, gym_facility) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./schedules.db', sqlite3.OPEN_READONLY, (err) => {
            if (err) reject(err)
        })

        let sql = `SELECT json_schedule FROM schedules WHERE date_queried = ? and gym = ? and gym_facility = ?`
        db.all(sql, [date, gym, gym_facility], (err, rows) => {
            if (err) reject(err)
            else if (rows && rows.length > 0) resolve(rows[0].json_schedule)
            else resolve(null)
        })

        db.close((err) => {
            if (err) reject(err)
        })
    })
}

// Inserts to the sqlite DB the entry containing date, gym, gym_facility, and json_schedule
export function db_put(date, gym, gym_facility, json_schedule) {
    const db = new sqlite3.Database('./schedules.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) return console.error(err.messge)
    })

    let sql = `INSERT INTO schedules (date_queried, gym, gym_facility, json_schedule) VALUES ( ?, ?, ?, ? )`
    db.all(sql, [date, gym, gym_facility, json_schedule], (err, row) => {
        if (err) return console.error(err.message)
    })

    db.close((err) => {
        if (err) return console.error(err.message)
    })
}

// Returns the contents of the entire table as a Promise
export function db_all() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./schedules.db', sqlite3.OPEN_READONLY, (err) => {
            if (err) reject(err)
        })

        let sql = `SELECT * FROM schedules`
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
export function db_wipe() {
    const db = new sqlite3.Database('./schedules.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) reject(err)
    })

    let sql = `DELETE FROM schedules`
    db.all(sql, (err, rows) => {
        if (err) reject(err)
    })

    db.close((err) => {
        if (err) reject(err)
    })
}