export const num_to_day = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
]

export const num_to_month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]

export function pretty_date(date) {
    let suffix = 'th'
    if (date.getDate() % 10 == 1 && date.getDate() != 11) suffix = 'rst'
    else if (date.getDate() % 10 == 2 && date.getDate() != 12) suffix = 'nd'
    else if (date.getDate() % 10 == 3 && date.getDate() != 13) suffix = 'rd'
    
    return `${num_to_day[date.getDay()]}, ${num_to_month[date.getMonth()]} ${date.getDate()}${suffix} ${date.getFullYear()}`
}