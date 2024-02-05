import { Button } from 'react-bootstrap'

import { num_to_day, pretty_date } from '../helper/date'

import '../styles/DateForm.css'

function DateForm(props) {

    // This function sets the date to yesterday
    function yesterday() {
        let yest = new Date(props.date)
        yest.setDate(yest.getDate() - 1)
        props.setDate(yest)
    }

    // This function sets the date to tomorrow
    function tomorrow() {
        let tomor = new Date(props.date)
        tomor.setDate(tomor.getDate() + 1)
        props.setDate(tomor)
    }

    return <div className={`fixed-hbox ${props.is_mobile ? 'bottom' : ''}`}>
        <Button className='button'
            onClick={yesterday}
            style={{width: 120}}
        >{num_to_day[(props.date.getDay() + 6) % 7]}</Button>
        <div className={props.is_mobile ? 'mobile-text-container' : 'text-container'}>{pretty_date(props.date)}</div>
        <Button className='button'
            onClick={tomorrow}
            style={{width: 120, padding: "6px 6px"}}
        >{num_to_day[(props.date.getDay() + 1) % 7]}</Button>
    </div>
}

export default DateForm