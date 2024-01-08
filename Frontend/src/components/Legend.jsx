import { useEffect } from 'react'

import Button from './Button.jsx'
import { colors } from '../helper/colors'

import '../styles/Legend.css'

function Legend(props) {

    function handleClick(preference, style) {
        props.setPreferences(p => {
            return {
                ...p,
                [preference]: !p[preference]
            }
        })
    }

    return <div className='vbox'>
        {
            Object.entries(props.preferences).map(([preference, active]) => {
                const color = colors[preference]
                return <Button key={preference}
                    active={active}
                    color={colors[preference]}
                    onClick={() => {handleClick(preference)}}>
                    {preference}
                </Button>
            })
        }
    </div>
}

export default Legend