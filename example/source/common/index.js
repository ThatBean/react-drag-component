import { TextEditable } from './TextEditable'
import { MaterialIcon } from './MaterialIcon'

function muteEvent (event) {
  event && event.preventDefault()
  event && event.stopPropagation()
  return event
}

export {
  TextEditable,
  MaterialIcon,
  muteEvent
}
