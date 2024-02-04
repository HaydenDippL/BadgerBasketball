import { React, useState, useEffect } from 'react'

import { colors, random_colors } from '../helper/colors'

import '../styles/Schedule.css'

const MINUTE_INTERVALS = 5

const INTERVALS_PER_HOUR = 60 / MINUTE_INTERVALS
const TOTAL_INTERVALS = (24 - 6) * (INTERVALS_PER_HOUR)

function Schedule(props) {
    // The schedule state variable is a 2d array that is 216 rows by 8 columns.
    // This represents all the five minute intervals in a 6-midnight day for 8 courts
    // Each cell in the schedule array is a string of the sport. The indexing formulas are
    // index = 12 * (hour - 6) + minute // 5
    // index 0 represents 6:00 AM - 6:05 AM
    const [schedule, set_schedule] = useState(empty_schedule())

    // The skeleton state variable indicates whether the schedule should be
    // in a skeleton loading state or not.
    const [skeleton, set_skeleton] = useState(true)

    // On load and date change fetch the schedule data from backend:
    // https://www.uwopenrecrosterbackend.xyz/data
    useEffect(() => {
        // Will not display data if another fetch has occured
        // This means that users who spam the next button will only have the current schedule displayed.
        // There was an issue where before if you double clicked you would have to load the first schedule and display it before viewing the second schedule.
        const abortController = new AbortController()
        const signal = abortController.signal
    
        const year = props.date.getFullYear()
        const month = props.date.getMonth() + 1 // month is 0-indexed, add one to make 1-indexed
        const day = props.date.getDate()

        // Initiate the skeleton load animation
        set_skeleton(true)

        // console.log(`Fetching https://www.uwopenrecrosterbackend.xyz/data?date=${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}&gym=${props.gym}`)
        fetch(`https://www.uwopenrecrosterbackend.xyz/data?date=${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}&gym=${props.gym}`, { signal })
        // fetch(`http://localhost:3999/data?date=${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}&gym=${props.gym}`, { signal }) // used for local testing
            .then(res => res.json())
            .then(data => {
                // if this is the current schedule, display it
                if (!signal.aborted) {
                    set_schedule(parse_schedule(data))
                    set_skeleton(false)
                }
            })

        return function cleanup() {
            abortController.abort()
        }
    }, [props.date])


    // The function will find the start and end times of events based on the
    // schedule and send a browser alert detailing which gym, which court, the
    // activity, and the times that activity goes to
    function handleClick(court, i) {
        const sport = schedule[i][court]

        // Backtrack as far up the schedule as possible that has the same sport
        let start = i
        while (start >= 0 && schedule[start][court] == sport) {
            --start
        } ++start // add back to start otherwise time would be 5 minutes late

        // Iterate as far down the schedule as possible that has the same sport
        let end = i
        while (end < TOTAL_INTERVALS && schedule[end][court] == sport) {
            ++end
        }

        // alert(`${index_to_time(start)} - ${index_to_time(end)}: ${sport} on court ${court + 1} in the ${props.gym}`)

        props.show_modal(props.gym, court + 1, index_to_time(start), index_to_time(end), sport)
    }

    // Checks if the user has selected a preference button and is used to gray out non-selected sports
    const focus_mode = Object.entries(props.preferences).some(([preference, active]) => active)

    // Used for non-explicitly listed sport-color combinations in src/helper/colors
    // dynamically allocates colors for specific sport and remembers which colors are
    // assinged to each sport
    let c = 0
    let extra_colors = {}

    return <div id={`${props.gym}-schedule`} className='border'>
        <h2>{`${props.gym} Courts`}</h2>
        <table>
            <thead>
                <tr>
                    {
                        [1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                            return <td id={props.gym + '-thead-' + i} key={'court' + i}>{i}</td>
                        })
                    }
                </tr>
            </thead>
            <tbody className={skeleton ? 'skeleton' : null}>
                {
                    schedule.map((row, i) => {
                        let time = index_to_time(i)
                        let is_hour_mark = i % (2 * INTERVALS_PER_HOUR) === 0 && i !== 0
                        return <tr key={i} id={`${props.gym}-${time}`} className={is_hour_mark ? 'hour' : null}>
                            {
                                row.map((sport, j) => {
                                    let color
                                    if (colors[sport]) {
                                        color = colors[sport]
                                    } else if (extra_colors[sport]) {
                                        color = extra_colors[sport]
                                    } else {
                                        color = random_colors[c]
                                        extra_colors[sport] = color
                                        c = (c + 1) % random_colors.length
                                    }
                                    return <td key={String(j) + ',' + String(i)}
                                        className={`${is_hour_mark ? 'hour' : null} ${is_hour_mark && j === 0 ? 'time' : null}`}
                                        onClick={skeleton ? null : () => handleClick(j, i)}
                                        style={{
                                            backgroundColor: color,
                                            filter: !focus_mode || props.preferences[sport] ? '' : 'grayscale(100%)',
                                        }}
                                        time={`${index_to_time(i)}`}
                                    />
                                })
                            }
                        </tr>
                    })
                }
            </tbody>
        </table>
    </div>
}

// Takes a time and transforms it to an index in the schedule
// index = 12 * (hour - 6) + minute // 5
function time_to_index(hour, minute) {
    hour = Number(hour)
    minute = Number(minute)
    return hour === 0 ? TOTAL_INTERVALS : (hour - 6) * INTERVALS_PER_HOUR + Math.floor(minute / MINUTE_INTERVALS)
}

// Takes an index in the schedule and transforms it to the time
// index = 12 * (hour - 6) + minute // 5
function index_to_time(i) {
    const hour = Math.floor(i / INTERVALS_PER_HOUR) + 6
    const minute = (i % INTERVALS_PER_HOUR) * MINUTE_INTERVALS
    const time = `${hour <= 12 ? hour : hour - 12}:${String(minute).padStart(2, '0')} ${hour < 12 || hour >= 24 ? 'AM' : 'PM'}`
    return time
}

// Generates a 216 by 8 2d array schedule with all the
// cell contents being the string "No Event Scheduled"
function empty_schedule() {
    let s = new Array(TOTAL_INTERVALS)
    for (let i = 0; i < TOTAL_INTERVALS; ++i) {
        s[i] = new Array(8).fill('No Event Scheduled')
    } return s
}

// The schedule from the backend is sent in a condensed format. This
// function transforms the condensed schedule into the 2d array needed
// for the schedule state variable.
function parse_schedule(events) {
    let schedule = empty_schedule()

    events.forEach(event => {
        const sport = event['EventName']
        const [start_hour, start_minute] = event['EventStart'].split('T')[1].split(':')
        const [end_hour, end_minute] = event['EventEnd'].split('T')[1].split(':')
        const court_split = event['Location'].split(' ')
        const [start_court, last_court] = [court_split[1], (court_split.length >= 4) ? court_split[3] : court_split[1]]
        const [start_index, end_index] = [time_to_index(start_hour, start_minute), time_to_index(end_hour, end_minute)]
        for (let court = start_court - 1; court <= last_court - 1; ++court) {
            for (let row = start_index; row < end_index; ++row) {
                schedule[row][court] = sport
            }
        }
    })

    return schedule
}

export default Schedule