import { Operation, ObjectAs, ArrayOf } from 'state-scheme'

const PROVIDER_NAME = 'TabHubProvider'
const ProviderScheme = ObjectAs(
  PROVIDER_NAME,
  {
    componentTabListRoot: null,
    componentTabList: ArrayOf('componentTabList', {}),
    previewTabList: null,
    hoverTab: null,
    hoverPosition: null
  }
)
const ActionCreatorMap = {
  Set: (key, value) => ({ name: PROVIDER_NAME, type: 'set', payload: { key, value } }),
  ComponentTabListRootSet: (value) => ({ name: PROVIDER_NAME, type: 'set', payload: { key: 'componentTabListRoot', value } }),
  ComponentTabListAdd: (value) => ({ name: 'componentTabList', type: 'matchPush', payload: { value } }),
  ComponentTabListDelete: (value) => ({ name: 'componentTabList', type: 'matchDelete', payload: { value } })
}

function reducerSelectCancel (state) {
  return {
    ...state,
    previewTabList: null,
    hoverTab: null,
    hoverPosition: null
  }
}

function reducePreviewTabList (state, eventControlState) { // TODO: can optimize
  const { componentTabListRoot, componentTabList, hoverTab } = state
  const { pointerCenter } = eventControlState
  let previewTabList = state.previewTabList || componentTabListRoot.props.tabList
  let hoverPosition = null
  let minDistance = Infinity
  let insertTabId = null
  let insertIndex = null
  componentTabList.forEach((component) => {
    const { id, tab } = component.props
    const tabRef = component.getWrappedRef()
    if (tab.isLock || !tabRef) return
    const { left, width } = tabRef.divElement.getBoundingClientRect()
    if (hoverTab.id === id) hoverPosition = pointerCenter
    const distance = pointerCenter.x - (left + width * 0.5)
    if (Math.abs(distance) <= minDistance) {
      minDistance = Math.abs(distance)
      insertTabId = tab.id
      if (pointerCenter.x < left + width * 0.5) { // left
        insertIndex = previewTabList.findIndex((v) => v.id === id)
      } else { // after
        insertIndex = previewTabList.findIndex((v) => v.id === id) + 1
      }
    }
  })
  if (insertTabId !== hoverTab.id) {
    const hoverTabIndex = previewTabList.findIndex((v) => v.id === hoverTab.id)
    if (insertIndex >= hoverTabIndex) insertIndex--
    previewTabList = Operation.arrayDelete(previewTabList, hoverTabIndex)
    previewTabList = Operation.arrayInsert(previewTabList, insertIndex, hoverTab)
  }
  return { ...state, previewTabList, hoverPosition }
}

export {
  ProviderScheme,
  ActionCreatorMap,
  reducerSelectCancel,
  reducePreviewTabList
}
