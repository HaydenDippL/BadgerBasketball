import { React, useState, useEffect } from 'react'

import { colors, random_colors } from '../helper/colors'

import '../styles/Schedule.css'

const MINUTE_INTERVALS = 5

const INTERVALS_PER_HOUR = 60 / MINUTE_INTERVALS
const TOTAL_INTERVALS = (24 - 6) * (INTERVALS_PER_HOUR)

// iOS has some issues with it's browsers, where they do not
// support ::before and ::after elements when used in tables
// on any element but <td>: <table>, <thead>, <tbody>, and <tr>.
// Conditional rendering is used for apple devices, despite the
// lag incurred.
const APPLE = /iPhone|iPad/i.test(navigator.userAgent)

function Schedule(props) {
    // The schedule state variable is a 2d array that is 216 rows by 8 columns.
    // This represents all the five minute intervals in a 6-midnight day for 8 courts
    // Each cell in the schedule array is a string of the sport. The indexing formulas are
    // index = 12 * (hour - 6) + minute // 5
    // index 0 represents 6:00 AM - 6:05 AM
    const [schedule, set_schedule] = useState(empty_schedule())

    const [skeleton, set_skeleton] = useState(true)

    // On load and date change fetch the schedule data from backend:
    // https://www.uwopenrecrosterbackend.xyz/data
    useEffect(() => {
        // Will not display data if another fetch has occured
        // This means that users who spam the next button will only have the current schedule displayed.
        // There was an issue where before if you double clicked you would have to load the first schedule and display it before viewing the second schedule.
        const abortController = new AbortController()
        const signal = abortController.signal

        // Initiate the skeleton load animation
        set_skeleton(true)

        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application.json'
            },
            body: JSON.stringify({
                date: props.date.toISODate(),
                gym: props.gym,
                session_id: props.user_data.session_id,
                device: props.user_data.device,
                browser: props.user_data.browser
            }),
            signal: signal
        }

        const params = new URLSearchParams()
        params.append('date', props.date.toISODate())
        params.append('gym', props.gym)
        params.append('gym_facility', 'Courts')
        params.append('session_id', props.user_data.session_id)
        params.append('device', props.user_data.device)
        params.append('browser', props.user_data.browser)

        async function fetchWithRetry(url, options, retries=5) {
            try {
                const response = await fetch(url, options);
                if (response.ok) {
                    return await response.json();
                } else if (response.status === 404 && retries > 0) {
                    console.warn(`Received 404 error. Retrying... (${5 - retries} retries left)`);
                    return fetchWithRetry(url, options, retries - 1);
                } else {
                    throw new Error(`Request failed with status: ${response.status}`);
                }
            } catch (error) {
                if (retries > 0) {
                    console.warn(`Fetch failed. Retrying... (${5 - retries} retries left)`);
                    return fetchWithRetry(url, options, retries - 1);
                } else {
                    console.error("Request failed after multiple retries:", error);
                    throw error; // If all retries fail, throw the error
                }
            }
        };

        // LOCAL TESTING
        // const URL = "https://uwopenrecroster/.netlify/functions/schedule?";
        // PRODUCTION CODE
        const URL = "./.netlify/functions/schedule?";

        fetchWithRetry(URL + params, { signal })
            .then(data => {
                // if this is the current schedule, display it
                if (!signal.aborted) {
                    set_schedule(parse_schedule(data))
                    set_skeleton(false)
                }
            })
            .catch(error => {
                if (!signal.aborted) {
                    console.error("Failed to fetch schedule:", error);
                    set_skeleton(true); // Stop skeleton loading if there was an error
                }
            });

        return function cleanup() {
            abortController.abort()
        }
    }, [props.date])


    // The function will find the start and end times of events based on the
    // schedule and send a browser alert detailing which gym, which court, the
    // activity, and the times that activity goes to
    function handleClick(court, i) {
        const sport = schedule[i][court]

        let start = i
        while (start >= 0 && schedule[start][court] == sport) {
            --start
        } ++start // add back to start otherwise time would be 5 minutes late

        let end = i
        while (end < TOTAL_INTERVALS && schedule[end][court] == sport) {
            ++end
        }

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
            <tbody className={!APPLE && skeleton ? 'skeleton' : null}>
                {
                    schedule.map((row, i) => {
                        let time = index_to_time(i)
                        let is_hour_mark = i % (2 * INTERVALS_PER_HOUR) === 0 && i !== 0
                        return <tr key={i} id={`${props.gym}-${time}`} className={!APPLE && is_hour_mark ? 'hour' : null}>
                            {
                                row.map((sport, j) => {
                                    let classes = `${APPLE && is_hour_mark ? 'hour ' : ''}` +
                                        `${is_hour_mark && j === 0 ? 'time ' : ''}` +
                                        `${APPLE && skeleton ? 'skeleton' : ''}`
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
                                        className={classes}
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