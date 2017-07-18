import React from 'react'
import PropTypes from 'prop-types'

const MaterialIcon = ({ name, className, onClick }) => <i
  className={`material-icons ${className || ''}`}
  onClick={onClick || null}
>
  {name || 'help'}
</i>

MaterialIcon.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func
}

export {
  MaterialIcon
}
