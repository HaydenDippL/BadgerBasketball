import express from 'express'
import { DateTime } from 'luxon'

import { CORS_POLICY, LIMITER } from './api-middleware.js'
import { get_schedule, put_schedule, schedules_forget, get_schedule_query_date, put_schedule_query_date } from './schedule-memo.js'
import { logging, query } from './logging.js'

const app = express()
const port = 3999

app.set('trust proxy', true)

app.use(CORS_POLICY)
app.use(LIMITER)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

app.get('/data', async (req, res) => {
    const date = req.query.date
    const gym = req.query.gym
    const gym_facility = req.query.gym_facility
    const session_id = req.query.session_id
    const device = req.query.device
    const browser = req.query.browser
    const IP = req.ip

    const [year, month, day] = date.split('-').map(Number)
    
    if (!valid_input(year, month, day, gym)) {
        res.status(400).send('Ensure that the date query is a valid date of the form \'yyyy-mm-dd\' where \'2025-01-01\' represents January 1rst, 2025.\nEnsure the year in the date query is not less than 2024.\nEnsure that the gym query is either \'Bakke\' or \'Nick\'.')
    }
    
    const query = DateTime.fromISO(date).setZone('America/Chicago')
    const now = DateTime.now().setZone('America/Chicago')
    const today_string = now.toISODate() + ' ' + now.toISOTime().substring(0, 8)
    const today = now.startOf('day')
    const next_week = today.plus({weeks: 2})

    const within_week = query >= today && query < next_week
    let schedule = null

    if (today.toISODate() !== get_schedule_query_date()) {
        put_schedule_query_date(today.toISODate())
        await schedules_forget('schedules')
    } if (within_week) {
        const schedule_json = await get_schedule(date, gym, gym_facility)
        schedule = schedule_json ? JSON.parse(schedule_json) : null
    } if (!schedule) {
        schedule = await call_recwell(gym, year, month, day)
        if (within_week) {
            put_schedule(date, gym, gym_facility, JSON.stringify(schedule))
        }
    }

    logging(query.toISODate(), gym, gym_facility, session_id, IP, now.toISODate(), now.toISOTime().substring(0, 8), device, browser)

    res.status(200).send(schedule)
})

app.get('/analytics', async (req, res) => {
    const get_total_users = req.get_total_users || false
    const get_total_visits = req.get_total_visits || false
    const get_total_queries = req.get_total_queries || false
    const get_users_over_time = req.get_users_over_time || false
    const get_days_activity_count = req.get_days_activity_count || false
    const get_days_viewed_count = req.get_days_viewed_count || false
    const get_future_views = req.get_future_views || false
    const get_device_counts = req.get_device_counts || false
    const get_browser_counts = req.get_browser_counts || false

    
    // lifetime users
    if (get_total_users) {
        const get_total_users_sql = `SELECT COUNT(DISTINCT IP) as total_users FROM sessions;`
        analytics.total_users = (await query(get_total_users_sql, []))[0].total_users
    }

    // lifetime site visits
    if (get_total_visits) {
        const get_total_visits_sql = `SELECT COUNT(*) as total_visits FROM sessions;`
        analytics.total_visits = (await query(get_total_visits_sql, []))[0].total_visits
    }

    // lifetime queries
    if (get_total_queries) {
        const get_total_queries_sql = `SELECT SUM(num_queries) as total_queries FROM sessions;`
        analytics.total_queries = (await query(get_total_queries_sql, []))[0].total_queries
    }

    // total users over time
    if (get_users_over_time) {
        // const get_users_over_time_sql = `SELECT date_of_queries, SUM(num_queries) OVER (ORDER BY date_of_queries) AS users_over_time FROM sessions;`
        const get_users_over_time_sql = `SELECT date_of_queries, COUNT(DISTINCT IP) AS num_users FROM sessions GROUP BY date_of_queries ORDER BY date_of_queries;`
        analytics.users_over_time = JSON.parse(JSON.stringify(await query(get_users_over_time_sql, [])))
    }

    // Get bar chart data for when we get queries each day of week
    if (get_days_activity_count) {
        const get_days_activity_count_sql = `SELECT DAYNAME(date_of_queries) AS day, SUM(num_queries) AS queries_on_day FROM sessions GROUP BY day`
        analytics.get_days_activity_count = JSON.parse(JSON.stringify(await query(get_days_activity_count_sql, [])))
    }

    if (get_days_viewed_count) {
        const get_days_viewed_count_sql = `SELECT DAYNAME(date_queried) AS day, COUNT(*) AS queries_for_day FROM queries GROUP BY day`
        analytics.get_days_viewed_count = JSON.parse(JSON.stringify(await query(get_days_viewed_count_sql, [])))
    }

    // Get bar chart data for how far in the future each user queries
    if (get_future_views) {
        const get_future_views_sql = `
            SELECT
                DATEDIFF(queries.date_queried, sessions.date_of_queries) AS days_difference,
                COUNT(*) AS count
            FROM queries
            JOIN sessions ON queries.session_id = sessions.session_id
            GROUP BY days_difference
            ORDER BY days_difference;
        `
        analytics.future_views = JSON.parse(JSON.stringify(await query(get_future_views_sql, [])))
    }

    // Donut Diagram for devices
    if (get_device_counts) {
        const get_device_sql = `SELECT device, SUM(num_queries) AS total_device_queries FROM sessions GROUP BY device;`
        analytics.device_counts = JSON.parse(JSON.stringify(await query(get_device_sql, [])))
    }

    // Donut Diagram for browsers
    if (get_browser_counts) {
        const get_browser_sql = `SELECT browser, SUM(num_queries) AS total_browser_queries FROM sessions GROUP BY browser;`
        analytics.browser_counts = JSON.parse(JSON.stringify(await query(get_browser_sql, [])))
    }

    res.status(200).send(analytics)
})

// filters the schedules to only get court events on the given date
function filter_schedule(data, year, month, day) {
    const events = JSON.parse(data['d'])['DailyBookingResults']
    const date = String(year) + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0')

    const schedule = events
        .filter(event => event['Room'].substring(0, 5).toLowerCase() === 'court' && event['EventStart'].split('T')[0] === date)
        .map(event => {
            return {
                'EventName': decodeEntities(event['EventName'].trim()),
                'Location': decodeEntities(event['Room'].trim()),
                'EventStart': decodeEntities(event['EventStart'].trim()),
                'EventEnd': decodeEntities(event['EventEnd'].trim())
            }
        })

    return schedule
}

// checks to see if the call is valid
function valid_input(year, month, day, gym) {
    try {
        const d = new Date(year, month - 1, day)
        if (!d || (d.getMonth() + 1 !== month) || (d.getDate() !== day) || (d.getFullYear() !== year)) {
            return false
        } if (gym !== 'Bakke' && gym !== 'Nick') {
            return false
        } if (year < 2024) {
            return false
        } return true
    } catch (error) {
        return false
    }
}

// https://stackoverflow.com/questions/44195322/a-plain-javascript-way-to-decode-html-entities-works-on-both-browsers-and-node
// Sometimes characters from the recwell api come out as weird encodings, this decodes them
function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt|&#39;);/g
    var translate = {
        "nbsp": " ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">",
        "&#39;" : "\'"
    }
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity]
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 10)
        return String.fromCharCode(num)
    })
}

// class the recwell API for the gym and date
async function call_recwell(gym, year, month, day) {
    console.log(`call_recwell(gym=${gym}, date=${year})`)

    let BuildingId
    let Title
    if (gym === 'Bakke') {
        BuildingId = 55
        Title = 'BAKKE RECREATION '
    } else {
        BuildingId = 40
        Title = 'Nicholas Recreation Center'
    }

    return fetch("http://recwell.ems.wisc.edu/VirtualEMS/ServerApi.aspx/CustomBrowseEvents", {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest"
        },
        "method": "POST",
        "body": JSON.stringify({
            date: String(year) + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0') + ' 00:00:00',
            data: {
                BuildingId: BuildingId,
                GroupTypeId: -1,
                GroupId: -1,
                EventTypeId: -1,
                RoomId: -1,
                StatusId: -1,
                ZeroDisplayOnWeb: 1,
                HeaderUrl: '',
                Title: Title,
                Format: 0,
                Rollup: 0,
                PageSize: 250,
                DropEventsInPast: true
            }
        })
    })
        .then(resp => resp.json())
        .then(data => {
            const schedule = filter_schedule(data, year, month, day)
            return schedule
        })
}