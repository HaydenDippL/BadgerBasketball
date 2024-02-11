import express from 'express'
import { DateTime } from 'luxon'

import { CORS_POLICY, LIMITER } from './api-middleware.js'
import { db_get, db_put, db_wipe, get_schedule_query_date, logging, put_schedule_query_date } from './sql.js'

const app = express()
const port = 3999

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
    const today_string = now.toISODate() + 'T' + now.toISOTime()
    const today = now.startOf('day')
    const next_week = today.plus({weeks: 2})


    const within_week = query >= today && query < next_week
    let schedule = null

    if (today.toISODate() !== get_schedule_query_date()) {
        put_schedule_query_date(today.toISODate())
        await db_wipe('schedules')
    } if (within_week) {
        const schedule_json = await db_get(date, gym, gym_facility)
        schedule = schedule_json ? JSON.parse(schedule_json) : null
    } if (!schedule) {
        schedule = await call_recwell(gym, year, month, day)
        if (within_week) {
            db_put(date, gym, gym_facility, JSON.stringify(schedule))
        }
    }

    logging(query.toISODate(), gym, gym_facility, session_id, IP, today_string, device, browser)

    res.status(200).send(schedule)
})

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