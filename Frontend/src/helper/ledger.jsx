function blah(start, end, sport) {
    return {start: start, end: end, sport: sport}
}

function transpose(M) {
    let trans = []
    for (let i = 0; i < 72; ++i) {
        trans[i] = []
        for (let j = 0; j < 8; ++j) {
            trans[i][j] = M[j][i]
        }
    }
    return trans
}

export function get_ledger() {
    const ledger = [
        [],
        [blah("6:00", "12:00", "Open Rec Basketball"), blah("12:00", "24:00", "Open Rec Volleyball")], 
        [blah("6:00", "14:00", "Open Rec Basketball"), blah("14:00", "24:00", "Open Rec Badminton / Pickleball")],
        [blah("6:00", "12:00", "Open Rec Futsal"), blah("12:00", "16:00", "IM Futsal"), blah("16:00", "24:00", "Open Rec Basketball")],
        [blah("6:00", "12:00", "Open Rec Futsal"), blah("12:00", "16:00", "IM Futsal"), blah("16:00", "24:00", "Open Rec Basketball")],
        [blah("6:00", "14:00", "Open Rec Volleyball"), blah("14:00", "18:00", "Open Rec Basketball"), blah("18:00", "24:00", "Open Rec Volleyball")],
        [blah("6:00", "14:00", "Open Rec Volleyball"), blah("14:00", "18:00", "Open Rec Basketball"), blah("18:00", "24:00", "Open Rec Volleyball")],
        [blah("6:00", "14:00", "Open Rec Basketball"), blah("14:00", "24:00", "Open Rec Badminton / Pickleball")],
        [blah("6:00", "12:00", "Open Rec Basketball"), blah("12:00", "24:00", "Open Rec Volleyball")] 
    ]
    
    let alt_ledger = []
    
    for (let i = 1; i < 9; ++i) {
        const court = ledger[i].reduce((acc, curr) => {
            const [start_hour, start_minute] = curr.start.split(':').map(Number)
            const [end_hour, end_minute] = curr.end.split(':').map(Number)
            const hours = end_hour - start_hour + (end_minute - start_minute)
            return acc.concat(new Array(hours * 4).fill(curr.sport))
        }, new Array(0))
        alt_ledger[i - 1] = court
    }
    
    alt_ledger = transpose(alt_ledger)
    return alt_ledger
}