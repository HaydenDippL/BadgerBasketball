import { useState, useRef, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native'
import { colors, random_colors, grayscale } from '../helper/colors'

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

    const skeleton_color = useRef(new Animated.Value(0)).current

    function start_skeleton_animation() {
        Animated.loop(
            Animated.sequence([
                Animated.timing(skeleton_color, {
                    toValue: 1,
                    duration: 750,
                    useNativeDriver: false
                }),
                Animated.timing(skeleton_color, {
                    toValue: 0,
                    duration: 750,
                    useNativeDriver: false
                })
            ])
        ).start()
    }

    function stop_skeleton_animation() {
        skeleton_color.stopAnimation()
        skeleton_color.setValue(0)
    }

    useEffect(() => {
        if (skeleton) {
            start_skeleton_animation()
        } else {
            stop_skeleton_animation()
        }
    }, [skeleton])

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

        alert(`${index_to_time(start)} - ${index_to_time(end)}: ${sport} on court ${court + 1} in the ${props.gym}`)
    }

    // Checks if the user has selected a preference button and is used to gray out non-selected sports
    const focus_mode = Object.entries(props.preferences).some(([preference, active]) => active)

    // Used for non-explicitly listed sport-color combinations in src/helper/colors
    // dynamically allocates colors for specific sport and remembers which colors are
    // assinged to each sport
    let c = 0
    let extra_colors = {}

    return <View style={styles.container}>
        <Text style={styles.title}>{`${props.gym} Courts`}</Text>
        <View style={styles.hbox}>
            <View style={styles.timeCell}/>
            <View style={styles.vbox}>
                <View style={styles.hbox}>
                    {
                        [1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                            return <View key={i} style={styles.headerCell}>
                                <Text style={{fontSize: 20}}>{i}</Text>
                            </View>
                        })
                    }
                </View>
                {skeleton ?
                    <Animated.View style={[styles.skeletonView, {
                        backgroundColor: skeleton_color.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['#edeeee', '#c4c4c4'],
                        })
                    }]}/>
                    :
                    schedule.map((row, i) => {
                        let time = index_to_time(i)
                        let is_hour_mark = i % (2 * INTERVALS_PER_HOUR) === 0 && i !== 0
                        return <View key={i} style={styles.hbox}>
                            { is_hour_mark ?
                                <Text style={styles.time}>{time}</Text> : null
                            }
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
                                    return <Pressable key={`${j},${i}}`} onPress={() => handleClick(j, i)}>
                                        <View style={
                                            [styles.cell, {
                                                backgroundColor: !focus_mode || props.preferences[sport] ? color : grayscale(color),
                                                borderTopWidth: is_hour_mark ? 2 : null,
                                            }]
                                        }/>
                                    </Pressable>
                                })
                            }
                        </View>
                    })
                }
            </View>
        </View>
    </View>
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

const styles = StyleSheet.create({

    container: {
        alignContent: 'center',
        alignItems: 'center',
        borderColor: 'rgb(222, 226, 230)',
        borderWidth: 1,
        margin: 10,
        borderRadius: 15,
        padding: 8,
    },

    title: {
        fontSize: 34,
        marginVertical: 10
    },

    // Table

    hbox: {
        flexDirection: 'row'
    },

    vbox: {
        flexDirection: 'column'
    },
    
    cell: {
        margin: 0,
        padding: 0,
        width: 38,
        height: 3,
        maxHeight: 3,
        borderColor: 'rgba(0, 0, 0, 0.15)',
        borderWidth: 0
    },

    headerCell: {
        margin: 0,
        padding: 0,
        width: 38,
        alignItems: 'center',
    },

    timeCell : {
        width: 64
    },

    // Skeleton

    skeletonView: {
        height: 648,
        width: 304,
    },

    // Time Text

    time: {
        zIndex: 2,
        position: 'absolute',
        transform: [
            {translateX: -65},
            {translateY: -7}
        ]
    }
})