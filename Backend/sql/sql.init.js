import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('./schedules.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err)
})

db.run(`CREATE TABLE schedules(id INTEGER PRIMARY KEY, date_queried DATE, gym VARCHAR(10), gym_facility VARCHAR(20), json_schedule TEXT)`)

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Database connection closed.')
});