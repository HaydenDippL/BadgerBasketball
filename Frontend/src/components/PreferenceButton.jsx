import "../styles/PreferenceButton.css"

function PreferenceButton(props) {

    return <div className={`color-btn ${props.active ? 'color-btn-pressed' : ''}`}
        style={{'--color': props.color}} // set the css variable --color, in src/styles/PreferenceButton.css
        onClick={props.onClick}>
        {props.children}
    </div>
}

export default PreferenceButton