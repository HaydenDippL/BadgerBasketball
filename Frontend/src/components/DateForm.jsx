import { Button } from 'react-bootstrap'

import { num_to_day, pretty_date } from '../helper/time'

import '../styles/DateForm.css'

function DateForm(props) {

    function yesterday() {
        let yest = new Date(props.date)
        yest.setDate(yest.getDate() - 1)
        props.setDate(yest)
    }

    function tomorrow() {
        let tomor = new Date(props.date)
        tomor.setDate(tomor.getDate() + 1)
        props.setDate(tomor)
    }

    return <div className='fixed-hbox'>
        <Button className='button'
            onClick={yesterday}
            style={{width: 120}}>{num_to_day[(props.date.getDay() + 6) % 7]}</Button>
        <div className='text-container'>{pretty_date(props.date)}</div>
        <Button className='button' onClick={tomorrow} style={{width: 120}}>{num_to_day[(props.date.getDay() + 1) % 7]}</Button>
    </div>
}

export default DateForm