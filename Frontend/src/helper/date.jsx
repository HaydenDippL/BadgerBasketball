export const num_to_day = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
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

// returns the date in the form -- Monday, January 22nd 2024
export function pretty_date(date) {
    let suffix = 'th'
    if (date.day % 10 == 1 && date.day != 11) suffix = 'rst'
    else if (date.day % 10 == 2 && date.day != 12) suffix = 'nd'
    else if (date.day % 10 == 3 && date.day != 13) suffix = 'rd'
    
    return `${num_to_day[date.weekday - 1]}, ${num_to_month[date.month - 1]} ${date.day}${suffix} ${date.year}`
}