import { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'

import { uuid4 } from 'uuid4'
import { DateTime } from 'luxon'

import DateForm from './components/DateForm'
import Legend from './components/Legend'
import Schedule from './components/Schedule'

import './App.css'

const MOBILE_WIDTH = 1000

function App() {

    // The date state variable represents the date of the schedules
    // according to the US Chicago Central time
    const [date, setDate] = useState(DateTime.local().setZone('America/Chicago'))

    const [user_data, set_user_data] = useState({
        session_id: uuid4(),
        device: platform.os.family,
        browser: platform.name,
    })

    // The preferences state variable represents the different buttons
    // the user can press to focus on just that sport, or many sport
    const [preferences, setPreferences] = useState({
        'Open Rec Basketball': false,
        'Open Rec Volleyball': false,
        'Open Rec Badminton / Pickleball': false,
        'Open Rec Futsal': false
    })

    const [modal, setModal] = useState({
        active: false,
        gym: null,
        court: null,
        start: null,
        end: null,
        sport: null
    })

    // tracks the window width for conditional rendering of date form
    const [window_width, set_window_width] = useState(window.innerWidth)

    function show_modal(gym, court, start, end, sport) {
        setModal({
            gym: gym,
            court: court,
            start: start,
            end: end,
            sport: sport
        })

        const modal = document.querySelector('dialog')
        modal.showModal()
    }

    function hide_modal() {
        const modal = document.querySelector('dialog')
        modal.close()
    }

    let is_mobile = window_width <= MOBILE_WIDTH
    
    return  <>
        <div className='container'>
            <dialog>
                <h1>{modal.sport}</h1>
                <h2>{`${modal.gym}: Court ${modal.court}`}</h2>
                <h3>{`${modal.start} - ${modal.end}`}</h3>
                <Button className='modal-button' onClick={hide_modal} variant='danger'>Close</Button>
            </dialog>
            <h1>Welcome to UW Open Rec Roster</h1>
            <p>View the court schedules of the Nick and Bakke. Adjust the date to view the schedule of different days. Select activities you and your friends enjoy to focus only on those activities in the schedule. Click on an activity in the schedule to get more information about that activity.</p>
            <div className='hbox' id='controls'>
                <Legend preferences={preferences} setPreferences={setPreferences}/>
                {!is_mobile && <DateForm date={date} setDate={setDate} is_mobile={is_mobile}/>}
            </div>
            <div className={`${is_mobile ? 'vbox' : 'hbox'}`} style={{marginBottom: is_mobile ? '117px' : null}}>
                <Schedule show_modal={show_modal} gym={'Bakke'} preferences={preferences} date={date} user_data={user_data}/>
                <Schedule show_modal={show_modal} gym={'Nick'} preferences={preferences} date={date} user_data={user_data}/>
            </div>
        </div>
        {is_mobile && <DateForm date={date} setDate={setDate} is_mobile={is_mobile}/>}
    </>
}

export default App