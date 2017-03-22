import React, { PropTypes } from 'react'

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
