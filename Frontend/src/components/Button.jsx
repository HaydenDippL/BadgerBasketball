import "../styles/Button.css"

function Button(props) {
    return <div className={`color-btn ${props.active ? 'color-btn-pressed' : ''}`}
        style={{'--color': props.color}}
        onClick={props.onClick}>
        {props.children}
    </div>
}

export default Button