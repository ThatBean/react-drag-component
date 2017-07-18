const muteEvent = (callback) => (event) => {
  event && event.preventDefault()
  event && event.stopPropagation()
  return callback(event)
}

const getHoverStyle = ({ x, y }, divElement) => {
  const boundingRect = divElement && divElement.getBoundingClientRect()
  let transform = boundingRect
    ? `translate(${Math.round(x - boundingRect.width * 0.3)}px, ${Math.round(y - boundingRect.height * 0.5)}px)`
    : `translate(calc(${Math.round(x)}px - 30%), calc(${Math.round(y)}px - 50%))`
  return { position: 'fixed', top: 0, left: 0, transform }
}

export {
  muteEvent,
  getHoverStyle
}
