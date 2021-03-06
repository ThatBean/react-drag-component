import { createContextStore, createContextProvider, createContextConnector, KeySwitch } from 'react-context-store'
import { EVENT_GESTURE_TYPE, createPointerEventControl, reduceListLinkMove } from 'source/__lib__'
import { ProviderScheme, ActionCreatorMap, reducerSelectCancel, reducePreviewTabList } from './contextState'

const EVENT_INTENT_TYPE = {
  PREVIEW: 'PREVIEW',
  APPLY: 'APPLY'
}

const STORE_NAME = '@@TAB_LIST_STORE'

const CASE_TYPE = {
  PREVIEW_START: 'PREVIEW_START',
  PREVIEW_UPDATE: 'PREVIEW_UPDATE',
  PREVIEW_APPLY: 'PREVIEW_APPLY',
  PREVIEW_CANCEL: 'PREVIEW_CANCEL'
}

const NULL = '#'
const HAS_HOVER_TAB = 'HAS_HOVER_TAB'
const ANY_HOVER_TAB = [ HAS_HOVER_TAB, NULL ]

const CASE_SWITCH = new KeySwitch()
CASE_SWITCH.SET([ STORE_NAME, EVENT_GESTURE_TYPE.PAN_START, NULL ], CASE_TYPE.PREVIEW_START)
CASE_SWITCH.SET([ STORE_NAME, EVENT_GESTURE_TYPE.PAN_MOVE, HAS_HOVER_TAB ], CASE_TYPE.PREVIEW_UPDATE)
CASE_SWITCH.SET([ STORE_NAME, EVENT_GESTURE_TYPE.PAN_END, HAS_HOVER_TAB ], CASE_TYPE.PREVIEW_APPLY)
CASE_SWITCH.SET([ STORE_NAME, EVENT_GESTURE_TYPE.PAN_CANCEL, ANY_HOVER_TAB ], CASE_TYPE.PREVIEW_CANCEL)

const actionProcessorMap = {
  [CASE_TYPE.PREVIEW_CANCEL]: (action, state, emitIntent) => {
    state = reducerSelectCancel(state)
    emitIntent(EVENT_INTENT_TYPE.PREVIEW, state)
    return state
  },
  [CASE_TYPE.PREVIEW_START]: (action, state, emitIntent) => {
    const { eventControlState } = action.eventState
    const componentTab = state.componentTabList.find((component) => component.getWrappedRef().divElement.contains(eventControlState.elementOrigin))
    if (!componentTab) return state
    const { linkMap } = componentTab.props.data
    if (linkMap[ componentTab.props.id ].isLock || componentTab.getWrappedRef().state.isEditing) return state
    state = { ...state, hoverTabId: componentTab.props.id }
    state = reducePreviewTabList(state, eventControlState)
    emitIntent(EVENT_INTENT_TYPE.PREVIEW, state)
    return state
  },
  [CASE_TYPE.PREVIEW_UPDATE]: (action, state, emitIntent) => {
    const { eventControlState } = action.eventState
    state = reducePreviewTabList(state, eventControlState)
    emitIntent(EVENT_INTENT_TYPE.PREVIEW, state)
    return state
  },
  [CASE_TYPE.PREVIEW_APPLY]: (action, state, emitIntent) => {
    const { eventControlState } = action.eventState
    state = reducePreviewTabList(state, eventControlState)
    emitIntent(EVENT_INTENT_TYPE.APPLY, state)
    state = reducerSelectCancel(state)
    return state
  }
}

function createTabListContextStore () {
  return createContextStore(
    ProviderScheme,
    (state, prevState, action, emit) => {
      if (!action.eventSource) return state
      const eventCaseType = CASE_SWITCH.GET(
        action.eventSource,
        action.eventType || NULL,
        state.hoverTabId ? HAS_HOVER_TAB : NULL
      )
      const actionProcessor = actionProcessorMap[ eventCaseType ]
      if (!actionProcessor) return state
      const emitIntent = (eventIntentType, storeState) => emit(eventIntentType, { ...action.eventState, eventIntentType, storeState })
      return actionProcessor(action, state, emitIntent)
    }
  )
}

const Provider = createContextProvider(STORE_NAME)

const createTabListRootConnector = (WrappedComponent) => createContextConnector(STORE_NAME, WrappedComponent, {
  emitCallbackMap: {
    [EVENT_INTENT_TYPE.PREVIEW]: (state, { storeState }, component) => {
      const { componentTabList, insertData, hoverTabId, hoverPosition } = storeState
      let indicatorData = null
      if (insertData) {
        const { insertIndex } = insertData
        const { linkIdList } = component.props.tabListData
        const indicatorPinWidthFix = linkIdList[ insertIndex ]
          ? 0 // has tab
          : 1 // last tab, not created
        const insertTabId = linkIdList[ insertIndex - indicatorPinWidthFix ]
        const indicatorTabComponent = componentTabList.find((component) => component.props.id === insertTabId)
        const boundingRect = indicatorTabComponent.getWrappedRef().getContentRect()
        const refElement = component.getWrappedRef().divElement
        const refBoundingRect = refElement.getBoundingClientRect()
        indicatorData = {
          type: 'pin',
          style: {
            left: `${boundingRect.left - refBoundingRect.left + refElement.scrollLeft + boundingRect.width * indicatorPinWidthFix}px`,
            top: `${boundingRect.top - refBoundingRect.top + refElement.scrollTop}px`,
            height: `${boundingRect.height}px`
          }
        }
      }
      return { ...state, indicatorData, hoverTabId, hoverPosition }
    },
    [EVENT_INTENT_TYPE.APPLY]: (state, { storeState }, component) => {
      const { hoverTabId, insertData } = storeState
      const tabListData = insertData && reduceListLinkMove(component.props.tabListData, { id: hoverTabId, index: insertData.insertIndex })
      tabListData && component.props.tabOperation.doSetTabListData(tabListData)
      return { ...state, indicatorData: null, hoverTabId: null, hoverPosition: null }
    }
  },
  onMount: (component) => {
    const { dispatch } = component.store

    const dispatchEvent = (eventType) => (eventControlState, event) => {
      // event && event.preventDefault()
      dispatch({ eventSource: STORE_NAME, eventType, eventState: { eventControlState } })
    }

    component.eventControl = createPointerEventControl( // event from layer and widgets
      component.getWrappedRef().divElement,
      {
        onPanStart: dispatchEvent(EVENT_GESTURE_TYPE.PAN_START),
        onPanMove: dispatchEvent(EVENT_GESTURE_TYPE.PAN_MOVE),
        onPanEnd: dispatchEvent(EVENT_GESTURE_TYPE.PAN_END),
        onPanCancel: dispatchEvent(EVENT_GESTURE_TYPE.PAN_CANCEL)
      }
    )
    component.store.dispatch(ActionCreatorMap.ComponentTabListRootSet(component))
  },
  onUnmount: (component) => {
    component.store.dispatch(ActionCreatorMap.ComponentTabListRootSet(null))
    component.eventControl && component.eventControl.clear()
  }
})

const createTabConnector = (WrappedComponent) => createContextConnector(STORE_NAME, WrappedComponent, {
  onMount: (component) => {
    component.store.dispatch(ActionCreatorMap.ComponentTabListAdd(component))
  },
  onUnmount: (component) => {
    component.store.dispatch(ActionCreatorMap.ComponentTabListDelete(component))
  }
})

export {
  createTabListContextStore,
  Provider,
  createTabListRootConnector,
  createTabConnector
}
