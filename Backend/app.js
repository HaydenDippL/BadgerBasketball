import express from 'express'
import rateLimit from 'express-rate-limit'

const app = express()
const port = 3999
const ATTRIBUTES = ['EventName', 'Location', 'EventStart', 'EventEnd']

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin)
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,PUT,OPTIONS')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Expose-Headers', 'Set-Cookie')
    next()
})

const limiter = rateLimit({
    windowMs: 1000,
    max: 50
})

app.use(limiter)

app.get('/data', (req, res) => {
    const date = req.query.date
    const gym = req.query.gym
    const [year, month, day] = date.split('-').map(Number)

    if (!valid_input(year, month, day, gym)) {
        res.status(400).send('Ensure that the date query is a valid date of the form \'yyyy-mm-dd\' where \'2025-01-01\' represents January 1rst, 2025.\nEnsure the year in the date query is not less than 2024.\nEnsure that the gym query is either \'Bakke\' or \'Nick\'.')
    }

    let BuildingId
    let Title
    if (gym === 'Bakke') {
        BuildingId = 55
        Title = 'BAKKE RECREATION '
    } else {
        BuildingId = 40
        Title = 'Nicholas Recreation Center'
    }
    fetch("http://recwell.ems.wisc.edu/VirtualEMS/ServerApi.aspx/CustomBrowseEvents", {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrer": "http://recwell.ems.wisc.edu/VirtualEMS/CustomBrowseEvents.aspx?data=5S9MEop6DRspUq%2fIVLtxhxYITA4KMOOY1YjgQEZBG%2fCfWmXqsD1ca%2fHqkBJXm4f29jpR3NVpF6Y9ne7PLgU%2b9lE6BC4UWLrlTeMgPgpmbOIcICicxxyMG9qQJvAG8252%2bSa8bnJzCFFzJLq0pKSQQJzbNPfWHWQXPJvPRRVJ9%2fGa%2fORlY42JrCw0eD66hT2PDwuECCF1Nt8%3d",
        "referrerPolicy": "strict-origin-when-cross-origin",
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
        }),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    })
        .then(resp => resp.json())
        .then(data => {
            const schedule = filter_schedule(data, year, month, day)
            res.status(200).send(schedule)
        })
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

function filter_schedule(data, year, month, day) {
    const events = JSON.parse(data['d'])['DailyBookingResults']
    const date = String(year) + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0')

    const schedule = events
        .filter(event => event['Location'].substring(0, 5).toLowerCase() === 'court' && event['EventStart'].split('T')[0] === date)
        .map(event => {
            return ATTRIBUTES.reduce((obj, attribute) => {
                return {...obj, [attribute]: event[attribute]}
            }, {})
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