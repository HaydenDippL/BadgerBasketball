// Inspect the colors at https://coolors.co/c19337

export const colors = {
    'No Event Scheduled': '#85827f', // gray
    'Open Rec Basketball': '#fc8617', // bright orange
    'Open Rec Volleyball': '#fae7d4', // tan
    'Open Rec Badminton / Pickleball': '#46D9E7', // bright blue
    'Open Rec Futsal': '#1ab837', // bright green
    'Army ROTC': '#C2BE6C', // army yellow
    'Navy ROTC': '#3F3F5E', // navy blue
    'Air Force ROTC': '#C19337' // gold yellow
}

export const random_colors = [
    '#235E5F', // dark blue
    '#662661', // dark purple
    '#903131', // dark red
    '#2F4B06', // dark green
    '#1F5D68', // dark blue
    '#490026', // tyrian purple
    '#553333', // dark red
    '#421909', // brown
    '#306856', // dark green
]

// converts a hex string to a grayscale hex string
export function grayscale(color) {
    const red = parseInt(color.substring(1, 3), 16)
    const blue = parseInt(color.substring(3, 5), 16)
    const green = parseInt(color.substring(5, 7), 16)
    const gray = Math.floor(0.299 * red + 0.114 * blue + 0.587 * green).toString(16)
    return '#' + gray + gray + gray
}