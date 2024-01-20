import { React, useState, useEffect } from 'react'

import { colors, random_colors } from '../helper/colors'

import '../styles/Schedule.css'

const MINUTE_INTERVALS = 5

const INTERVALS_PER_HOUR = 60 / MINUTE_INTERVALS
const TOTAL_INTERVALS = (24 - 6) * (INTERVALS_PER_HOUR)

function Schedule(props) {
    const [schedule, set_schedule] = useState(skeleton_schedule())

    useEffect(() => {
        const updatePositions = () => {
            ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM", "10:00 PM"].forEach(time => {
                const table = document.getElementById(`${props.gym}-thead-8`).getBoundingClientRect()
                const cell_rect = document.getElementById(`${props.gym}-${time}c`).getBoundingClientRect()

                const p = document.getElementById(`${props.gym}-${time}p`)
                p.style.position = 'absolute'
                p.style.top = (cell_rect.top - 10) + 'px'
                p.style.left = cell_rect.left + 'px'

                const d = document.getElementById(`${props.gym}-${time}d`)
                d.style.position = 'absolute'
                d.style.left = cell_rect.right + 'px'
                d.style.width = (table.right - cell_rect.right) + 'px'
                d.style.top = cell_rect.top + 'px'
            })
        }
        
        updatePositions()
        window.addEventListener('resize', updatePositions)
        return () => {
            window.removeEventListener('resize', updatePositions)
        }
    }, [])

    useEffect(() => {
        const abortController = new AbortController()
        const signal = abortController.signal
    
        const year = props.date.getFullYear()
        const month = props.date.getMonth() + 1
        const day = props.date.getDate()
        set_schedule(skeleton_schedule())
        console.log(`Fetching for ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
        fetch(`https://www.uwopenrecrosterbackend.xyz/data?date=${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}&gym=${props.gym}`, { signal })
            .then(res => res.json())
            .then(data => {
                if (!signal.aborted) {
                    set_schedule(parse_schedule(data))
                }
            })
    
        return function cleanup() {
            abortController.abort()
        }
    }, [props.date])

    function handleClick(court, i) {
        const sport = schedule[i][court]
        let start = i
        while (start >= 0 && schedule[start][court] == sport) {
            --start
        } ++start
        let end = i
        while (end < TOTAL_INTERVALS && schedule[end][court] == sport) {
            ++end
        }
        alert(`${index_to_time(start)} - ${index_to_time(end)}: ${sport} on court ${court + 1} in the ${props.gym}`)
    }

    const focus_mode = Object.entries(props.preferences).some(([preference, active]) => active)
    let c = 0
    let extra_colors = {}

    return <div id={`${props.gym}-schedule`} className='border'>
        <h2>{`${props.gym} Courts`}</h2>
        <table>
            <thead>
                <tr>
                    {
                        ['', 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                            return <td id={props.gym + '-thead-' + i} key={'court' + i}>{i}</td>
                        })
                    }
                </tr>
            </thead>
            <tbody>
                {
                    schedule.map((row, i) => {
                        let time = index_to_time(i)
                        return <tr key={i}>
                            <td className='newcell' id={`${props.gym}-${time}c`} style={{minWidth: '70px'}}></td>
                            {
                                row.map((sport, j) => {
                                    const skeleton = sport === 'SKELETON'
                                    let color = '#788087'
                                    if (colors[sport]) {
                                        color = colors[sport];
                                    } else if (extra_colors[sport]) {
                                        color = extra_colors[sport];
                                    } else if (c < random_colors.length) {
                                        color = random_colors[c++];
                                        extra_colors[sport] = color;
                                    }
                                    return <td key={String(j) + ',' + String(i)}
                                        className={`newcell ${skeleton ? 'skeleton' : ''}`}
                                        onClick={skeleton ? null : () => handleClick(j, i)}
                                        style={{
                                            backgroundColor: color,
                                            filter: !focus_mode || props.preferences[sport] ? '' : 'grayscale(100%)',
                                        }}
                                    />
                                })
                            }
                        </tr>
                    })
                }
            </tbody>
        </table>
        {
            ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM", "10:00 PM"].map(time => {
                return <p key={time + 'p'} id={`${props.gym}-${time}p`}>{time}</p>
            })
        }
        {
            ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM", "10:00 PM"].map(time => {
                return <div className={'new_div'} key={time + 'd'} id={`${props.gym}-${time}d`}></div>
            })
        }
    </div>
}

function time_to_index(hour, minute) {
    hour = Number(hour)
    minute = Number(minute)
    return hour === 0 ? TOTAL_INTERVALS : (hour - 6) * INTERVALS_PER_HOUR + Math.floor(minute / MINUTE_INTERVALS)
}

function index_to_time(i) {
    const hour = Math.floor(i / INTERVALS_PER_HOUR) + 6
    const minute = (i % INTERVALS_PER_HOUR) * MINUTE_INTERVALS
    const time = `${hour <= 12 ? hour : hour - 12}:${String(minute).padStart(2, '0')} ${hour < 12 || hour >= 24 ? 'AM' : 'PM'}`
    return time
}

function skeleton_schedule() {
    let s = new Array(TOTAL_INTERVALS)
    for (let i = 0; i < TOTAL_INTERVALS; ++i) {
        s[i] = new Array(8).fill('SKELETON')
    } return s
}

function parse_schedule(events) {
    let schedule = new Array(TOTAL_INTERVALS)
    for (let i = 0; i < TOTAL_INTERVALS; ++i) {
        schedule[i] = new Array(8).fill('No Event Scheduled')
    }

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