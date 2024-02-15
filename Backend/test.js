import { logging, query, get_sessions, get_queries } from "./logging.js"
import { DateTime } from 'luxon'

// const now = DateTime.now().setZone('America/Chicago')
// const datetime = now.toISODate() + ' ' + now.toISOTime().substring(0, 8)
// console.log(datetime)
// await logging('2024-02-13', 'Bakke', 'Courts', '39e8f789320', 'MyIP', datetime, 'Linux', 'Firefox')
// console.log(await get_queries())
// console.log(await get_sessions())

// await query('DELETE FROM queries;', [])
// await query('DELETE FROM sessions;', [])
// console.log(await get_queries())
// console.log(await get_sessions())

const get_future_views_sql = `SELECT
        DATEDIFF(queries.date_queried, sessions.date_of_queries) AS days_difference,
        COUNT(*) AS count
    FROM queries
    JOIN sessions ON queries.session_id = sessions.session_id
    GROUP BY days_difference
    ORDER BY days_difference;
`
console.log(JSON.parse(JSON.stringify(await query(get_future_views_sql, []))))