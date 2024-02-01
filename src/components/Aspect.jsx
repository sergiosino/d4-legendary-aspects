import PropTypes from 'prop-types';

function Aspect({ id, desc, name, isInPorperty, onAddClick, onRemoveClick }) {

    return (
        <div style={{ border: `2px solid ${isInPorperty ? 'limegreen' : 'black'}`, overflow: 'hidden', padding: 20 }}>
            <p>{name}</p>
            <p>{desc}</p>
            {isInPorperty ? (
                <button onClick={() => onRemoveClick(id)}>Quitar</button>
            ) : (
                <button onClick={() => onAddClick(id)}>Añadir</button>
            )}
        </div>
    )
}

Aspect.propTypes = {
    id: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    isInPorperty: PropTypes.bool.isRequired,
    onAddClick: PropTypes.func.isRequired,
    onRemoveClick: PropTypes.func.isRequired
}

export default Aspect