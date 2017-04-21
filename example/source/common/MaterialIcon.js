import React from 'react'
import PropTypes from 'prop-types'

function MaterialIcon ({name, className, ...other}) {
  return <i className={`material-icons ${className || ''}`} {...other}>{name || 'help'}</i>
}

MaterialIcon.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string
}

export {
  MaterialIcon
}
