import { useState, useEffect } from 'react'
import { Row, Col, Button } from 'react-bootstrap'

import DateForm from './components/DateForm'
import Legend from './components/Legend'
import Schedule from './components/Schedule'

import './App.css'

function App() {

    // Gets the US Chicago Central time
    function get_central_time() {
        const current_date = new Date()
        return new Date(current_date.toLocaleString('en-US', {
            timeZone: 'America/Chicago'
        }))
    }

    // The date state variable represents the date of the schedules
    // according to the US Chicago Central time
    const [date, setDate] = useState(get_central_time())

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
    
    return <div className='container'>
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
            <DateForm date={date} setDate={setDate}/>
        </div>
        <Row>
            {
                ['Bakke', 'Nick'].map((gym, i) => {
                    return <Col
                    md={12}
                    lg={6}
                    key={gym}
                    >
                        <Schedule show_modal={show_modal} gym={gym} preferences={preferences} date={date}/>
                    </Col>
                })
            }
        </Row>
    </div>
}

export default App