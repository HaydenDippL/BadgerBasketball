// function parse_schedule(data, year, month, day) {
//     const events = JSON.parse(data['d'])['DailyBookingResults']

//     let schedule = new Array(72)
//     for (let i = 0; i < 72; ++i) {
//         schedule[i] = new Array(8).fill('No Event Scheduled')
//     }

//     function time_to_index(hour, minute) {
//         hour = Number(hour)
//         minute = Number(minute)
//         return (hour - 6) * 4 + Math.floor(minute / 15)
//     }

//     const date = String(year) + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0')

//     events.forEach(event => {
//         if (event['Location'].substring(0, 5).toLowerCase() != 'court' && event['EventStart'].split('T')[0] != date) return;
//         const sport = event['EventName']
//         const [start_hour, start_minute] = event['EventStart'].split('T')[1].split(':')
//         const [end_hour, end_minute] = event['EventEnd'].split('T')[1].split(':')
//         const court_split = event['Location'].split(' ')
//         const [start_court, last_court] = [court_split[1], (court_split.length >= 4) ? court_split[3] : court_split[1]]
//         const [start_index, end_index] = [time_to_index(start_hour, start_minute), time_to_index(end_hour, end_minute)]
//         for (let court = start_court - 1; court <= last_court - 1; ++court) {
//             for (let row = start_index; row < end_index; ++row) {
//                 schedule[row][court] = sport
//             }
//         }
//     })

//     return schedule
// }

// const date = new Date()
// const year = date.getFullYear()
// const month = date.getMonth() + 1
// const day = date.getDate()
// const BuildingId = 55
// const Title = 'BAKKE RECREATION '
// console.log(String(year) + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0') + ' 00:00:00')

// fetch("http://recwell.ems.wisc.edu/VirtualEMS/ServerApi.aspx/CustomBrowseEvents", {
//     "headers": {
//         "accept": "application/json, text/javascript, */*; q=0.01",
//         "accept-language": "en-US,en;q=0.9",
//         "content-type": "application/json; charset=UTF-8",
//         "x-requested-with": "XMLHttpRequest"
//     },
//     "referrer": "http://recwell.ems.wisc.edu/VirtualEMS/CustomBrowseEvents.aspx?data=5S9MEop6DRspUq%2fIVLtxhxYITA4KMOOY1YjgQEZBG%2fCfWmXqsD1ca%2fHqkBJXm4f29jpR3NVpF6Y9ne7PLgU%2b9lE6BC4UWLrlTeMgPgpmbOIcICicxxyMG9qQJvAG8252%2bSa8bnJzCFFzJLq0pKSQQJzbNPfWHWQXPJvPRRVJ9%2fGa%2fORlY42JrCw0eD66hT2PDwuECCF1Nt8%3d",
//     "referrerPolicy": "strict-origin-when-cross-origin",
//     "body": JSON.stringify({
//         date: String(year) + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0') + ' 00:00:00',
//         data: {
//             BuildingId: BuildingId,
//             GroupTypeId: -1,
//             GroupId: -1,
//             EventTypeId: -1,
//             RoomId: -1,
//             StatusId: -1,
//             ZeroDisplayOnWeb: 1,
//             HeaderUrl: '',
//             Title: Title,
//             Format: 0,
//             Rollup: 0,
//             PageSize: 250,
//             DropEventsInPast: true
//         }
//     }),
//     "method": "POST",
//     "mode": "cors",
//     "credentials": "include"
// })
// .then(res => res.json())
// .then(data => {
//     const schedule = parse_schedule(data, 2024, 1, 4)
//     console.log(schedule)
//     console.log(String(year) + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0') + ' 00:00:00')
// })

function valid_input(date, gym) {
    try {
        const [year, month, day] = date.split('-').map(Number)
        console.log(year, month, day)
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

const date = '2024-13-01'
const gym = 'Bakke'
if (!valid_input(date, gym)) {
    console.log('Ensure that the date query is a valid date of the form \'yyyy-mm-dd\' where \'2025-01-01\' represents January 1rst, 2025.\nEnsure the year in the date query is not less than 2024.\nEnsure that the gym query is either \'Bakke\' or \'Nick\'.')
} else {
    console.log('Valid Input')
}