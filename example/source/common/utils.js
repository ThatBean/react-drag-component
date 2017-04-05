function muteEvent (callback) {
  return (event) => {
    event && event.preventDefault()
    event && event.stopPropagation()
    return callback(event)
  }
}

function getHoverStyle (position, divElement) {
  const boundingRect = divElement && divElement.getBoundingClientRect()
  let transform = boundingRect
    ? `translate3d(${Math.round(position.x - boundingRect.width * 0.3)}px, ${Math.round(position.y - boundingRect.height * 0.5)}px, 0px)`
    : `translate3d(calc(${Math.round(position.x)}px - 30%), calc(${Math.round(position.y)}px - 50%), 0px)`
  return { zIndex: 1, position: 'fixed', top: 0, left: 0, transform }
}

export {
  muteEvent,
  getHoverStyle
}
