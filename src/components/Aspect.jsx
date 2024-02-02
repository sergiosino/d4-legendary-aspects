import PropTypes from 'prop-types';

function Aspect({ id, desc, name/*, aspectClass*/, isInPorperty, isNecessary, onAddClick, onRemoveClick, onNecessaryClick }) {
    const handleButtonClick = isInPorperty ? onRemoveClick : onAddClick
    const textButton = isInPorperty ? 'Remove' : 'Add'
    const textCheck = isNecessary ? '💛' : '🤍'

    return (
        <div style={{ border: `2px solid ${isInPorperty ? 'limegreen' : 'black'}`, overflow: 'hidden', padding: 20 }}>
            <p>{name}</p>
            <p>{desc}</p>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <button onClick={() => handleButtonClick(id)}>{textButton}</button>
                <label>
                    <input
                        style={{ display: 'none' }}
                        type="checkbox" checked={isNecessary}
                        onChange={(event) => onNecessaryClick(event, id)}
                    />
                    {textCheck}
                </label>
            </div>
        </div>
    )
}

Aspect.propTypes = {
    id: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    // aspectClass: PropTypes.string.isRequired,
    isInPorperty: PropTypes.bool.isRequired,
    isNecessary: PropTypes.bool.isRequired,
    onAddClick: PropTypes.func.isRequired,
    onRemoveClick: PropTypes.func.isRequired,
    onNecessaryClick: PropTypes.func.isRequired
}

export default Aspect