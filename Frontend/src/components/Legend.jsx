import PreferenceButton from './PreferenceButton.jsx'
import { colors } from '../helper/colors'

import '../styles/Legend.css'

function Legend(props) {

    // Sets or unsets the pressed preference
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
                return <PreferenceButton key={preference}
                    active={active}
                    color={colors[preference]}
                    onClick={() => {handleClick(preference)}}>
                    {preference}
                </PreferenceButton>
            })
        }
    </div>
}

export default Legend