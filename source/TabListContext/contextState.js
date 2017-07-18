import { ObjectAs, ArrayOf } from 'state-scheme'

const PROVIDER_NAME = 'TabHubProvider'
const ProviderScheme = ObjectAs(PROVIDER_NAME, {
  componentTabListRoot: null,
  componentTabList: ArrayOf('componentTabList', {}),
  hoverTabId: null,
  hoverPosition: null,
  insertData: null
})
const ActionCreatorMap = {
  Set: (key, value) => ({ name: PROVIDER_NAME, type: 'set', payload: { key, value } }),
  ComponentTabListRootSet: (value) => ({ name: PROVIDER_NAME, type: 'set', payload: { key: 'componentTabListRoot', value } }),
  ComponentTabListAdd: (value) => ({ name: 'componentTabList', type: 'matchPush', payload: { value } }),
  ComponentTabListDelete: (value) => ({ name: 'componentTabList', type: 'matchDelete', payload: { value } })
}

const reducerSelectCancel = (state) => ({
  ...state,
  hoverTabId: null,
  hoverPosition: null,
  insertData: null
})

const reducePreviewTabList = (state, eventControlState) => { // TODO: can optimize
  const { componentTabListRoot, componentTabList, hoverTabId } = state
  const { pointerCenter } = eventControlState
  const { linkMap, linkIdList } = componentTabListRoot.props.tabListData
  let hoverPosition = null
  let minDistance = Infinity
  let insertIndex = null
  componentTabList.forEach((component) => {
    const { id } = component.props
    const tabRef = component.getWrappedRef()
    if (linkMap[ id ].isLock || !tabRef) return
    const { left, width } = tabRef.getContentRect()
    if (hoverTabId === id) hoverPosition = pointerCenter
    const tabCenter = left + width * 0.5
    const distance = Math.abs(pointerCenter.x - tabCenter)
    if (distance <= minDistance) {
      minDistance = distance
      insertIndex = pointerCenter.x < tabCenter
        ? linkIdList.indexOf(id) // left
        : linkIdList.indexOf(id) + 1 // right
    }
  })

  const isValidInsert = (
    ~insertIndex &&
    linkIdList[ insertIndex ] !== hoverTabId &&
    linkIdList[ insertIndex - 1 ] !== hoverTabId
  )
  const insertData = isValidInsert ? { insertIndex } : null
  return { ...state, insertData, hoverPosition }
}

export {
  ProviderScheme,
  ActionCreatorMap,
  reducerSelectCancel,
  reducePreviewTabList
}
