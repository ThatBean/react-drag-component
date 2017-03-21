import Hammer from 'hammerjs'

const EVENT_GESTURE_TYPE = {
  TAP: 'TAP',
  DOUBLE_TAP: 'DOUBLE_TAP',
  PAN_START: 'PAN_START',
  PAN_MOVE: 'PAN_MOVE',
  PAN_END: 'PAN_END',
  PAN_CANCEL: 'PAN_CANCEL'
}

const initialState = {
  keyAlt: false,
  keyShift: false,
  keyControl: false,
  pointerCenter: null,
  pointerDelta: null,
  pointerOrigin: null,
  elementOrigin: null,
  elementCenter: null
}

const getEventControlState = (state, { srcEvent, center, deltaX, deltaY, target }) => {
  const pointerDelta = { x: deltaX, y: deltaY }
  const pointerOrigin = state.pointerOrigin || { x: center.x - deltaX, y: center.y - deltaY }
  const elementOrigin = state.elementOrigin || document.elementFromPoint(pointerOrigin.x, pointerOrigin.y)
  return {
    keyAlt: srcEvent.altKey || false,
    keyShift: srcEvent.shiftKey || false,
    keyControl: srcEvent.ctrlKey || srcEvent.metaKey || false,
    pointerCenter: center,
    pointerDelta,
    pointerOrigin,
    elementOrigin,
    elementCenter: target
  }
}

function setHammerManage (manager) {
  manager.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL }))
  manager.add(new Hammer.Tap())
}

function setHammerManageDoubleTap (manager) {
  manager.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL }))
  manager.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }))
  manager.add(new Hammer.Tap())
  manager.get('doubletap').recognizeWith('tap')
  manager.get('tap').requireFailure('doubletap')
}

function createEventControl (element, { onTap, onDoubleTap, onPanStart, onPanMove, onPanEnd, onPanCancel }) {
  const manager = new Hammer.Manager(element)
  if (onDoubleTap) setHammerManageDoubleTap(manager)
  else setHammerManage(manager)

  // const manager = new Hammer.Manager(element, onDoubleTap ? HAMMER_CONFIG_DOUBLE_TAP : HAMMER_CONFIG)
  let eventControlState = initialState

  const doCallback = (callback, event) => {
    // console.log(event && event.type, event && event.additionalEvent)
    eventControlState = event
      ? getEventControlState(eventControlState, event)
      : initialState
    callback && callback(eventControlState, event)
  }

  onTap && manager.on('tap', (event) => {
    if (eventControlState !== initialState) {
      console.warn('[EventControl] got tap with non-initialState')
      eventControlState = initialState
    }
    doCallback(onTap, event)
    eventControlState = initialState
  })
  onDoubleTap && manager.on('doubletap', (event) => {
    if (eventControlState !== initialState) {
      console.warn('[EventControl] got tap with non-initialState')
      eventControlState = initialState
    }
    doCallback(onDoubleTap, event)
    eventControlState = initialState
  })
  onPanStart && manager.on('panstart', (event) => {
    if (eventControlState !== initialState) {
      console.warn('[EventControl] got panstart with non-initialState')
      eventControlState = initialState
    }
    doCallback(onPanStart, event)
  })
  onPanMove && manager.on('panmove', (event) => {
    if (eventControlState === initialState) {
      console.warn('[EventControl] got missed panstart')
      return doCallback(onPanStart, event) // TODO: Hammerjs: one 'panstart' will be missing, after manager.stop(true)
    }
    doCallback(onPanMove, event)
  })
  onPanEnd && manager.on('panend', (event) => {
    if (eventControlState === initialState) return
    doCallback(onPanEnd, event)
    eventControlState = initialState
  })
  onPanCancel && manager.on('pancancel', (event) => {
    if (eventControlState === initialState) return
    doCallback(onPanCancel)
    eventControlState = initialState
  })

  return {
    stop: () => {
      manager.stop(true)
      onPanCancel && doCallback(onPanCancel)
    },
    clear: () => {
      manager.destroy()
      onPanCancel && doCallback(onPanCancel)
    }
  }
}

export {
  EVENT_GESTURE_TYPE,
  createEventControl
}
