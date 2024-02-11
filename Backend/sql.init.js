import sqlite3 from 'sqlite3'
import fs from 'fs'

const db = new sqlite3.Database('./db.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err)
})

const sql = fs.readFileSync('./init.sql', 'utf8')

db.exec(sql, (err) => {
    if (err) console.error(err.message)
    else console.log("SQL database succesfully initialized.")
})

db.close()