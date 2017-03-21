import { Operation, ObjectAs, ArrayOf } from 'state-scheme'

const PROVIDER_NAME = 'TabTreeProvider'
const ProviderScheme = ObjectAs(
  PROVIDER_NAME,
  {
    componentTabTree: null,
    componentTabList: ArrayOf('componentTabList', {}),
    previewTabTree: null,
    hoverTabId: null,
    hoverPosition: null
  }
)
const ActionCreatorMap = {
  Set: (key, value) => ({ name: PROVIDER_NAME, type: 'set', payload: { key, value } }),
  ComponentTabTreeSet: (value) => ({ name: PROVIDER_NAME, type: 'set', payload: { key: 'componentTabTree', value } }),
  ComponentTabListAdd: (value) => ({ name: 'componentTabList', type: 'matchPush', payload: { value } }),
  ComponentTabListDelete: (value) => ({ name: 'componentTabList', type: 'matchDelete', payload: { value } })
}

function reducerSelectCancel (state) {
  return {
    ...state,
    previewTabTree: null,
    hoverTabId: null,
    hoverPosition: null
  }
}

function reducePreviewTabList (state, eventControlState) { // TODO: can optimize
  const { componentTabTree, componentTabList, hoverTabId } = state
  const { pointerCenter } = eventControlState
  let previewTabTree = state.previewTabTree || componentTabTree.props.tabTree
  const { linkMap, childListMap } = previewTabTree
  let hoverPosition = null
  let minDistance = Infinity
  let insertParentTabId = null
  let insertIndex = null
  componentTabList.forEach((component) => {
    const { id } = component.props
    const tabRef = component.getWrappedRef()
    if (linkMap[ id ].isLock || !tabRef) return
    const { top, left, width, height } = tabRef.divElement.getBoundingClientRect()
    if (hoverTabId === id) hoverPosition = pointerCenter
    const distance = pointerCenter.y - (top + height * 0.5)
    if (Math.abs(distance) <= minDistance) {
      minDistance = Math.abs(distance)
      if (pointerCenter.y > top + height) { // below, insert to same level, after
        let leftHeight = pointerCenter.y - (top + height)
        insertParentTabId = linkMap[ id ].parent
        insertIndex = childListMap[ insertParentTabId ].indexOf(id) + 1
        if (leftHeight > height) { // exceeding height, insert to last root
          while (linkMap[ insertParentTabId ]) {
            const lastId = insertParentTabId
            insertParentTabId = linkMap[ lastId ].parent
            insertIndex = childListMap[ insertParentTabId ].indexOf(lastId) + 1
          }
        }
      } else if (pointerCenter.x <= left + width * 0.5 || !linkMap[ id ].isExpand) { // left  or not expand, insert to same level, before
        insertParentTabId = linkMap[ id ].parent
        insertIndex = childListMap[ insertParentTabId ].indexOf(id)
      } else { // right, insert as child
        insertParentTabId = id
        insertIndex = 0
      }
    }
  })
  // if (insertParentTabId) console.log({ minDistance, insertParentTabId, insertIndex }, debug, previewTabTree)
  if (insertParentTabId !== hoverTabId) previewTabTree = reduceTreeLinkMove(previewTabTree, { key: hoverTabId, parent: insertParentTabId, index: insertIndex })
  return { ...state, previewTabTree, hoverPosition }
}

function reduceTreeLinkSet (state, { index, key, parent, isExpand = true, isLock = false }) { // for building the tree
  const linkMap = { ...state.linkMap, [key]: { key, parent, isExpand, isLock } }
  const childList = [ ...state.childListMap[ parent ] ]
  childList[ index ] = key
  const childListMap = { ...state.childListMap, [parent]: childList }
  return { ...state, linkMap, childListMap }
}

function reduceTreeLinkInsert (state, { index, key, parent, isExpand = true, isLock = false }) { // for building the tree
  const linkMap = { ...state.linkMap, [key]: { key, parent, isExpand, isLock } }
  const childList = Operation.arrayInsert(state.childListMap[ parent ] || [], index, key)
  const childListMap = { ...state.childListMap, [parent]: childList }
  return { ...state, linkMap, childListMap }
}

function reduceTreeLinkPush (state, { key, parent, isExpand = true, isLock = false }) {
  const linkMap = { ...state.linkMap, [key]: { key, parent, isExpand, isLock } }
  const childList = [ ...state.childListMap[ parent ] || [], key ]
  const childListMap = { ...state.childListMap, [parent]: childList }
  return { ...state, linkMap, childListMap }
}

function reduceTreeLinkDelete (state, { key }) {
  const childList = state.childListMap[ key ]
  if (childList) state = childList.reduce((state, key) => reduceTreeLinkDelete(state, { key }), state) // remove child // TODO: speed up ?
  const { parent } = state.linkMap[ key ]
  const linkMap = { ...state.linkMap }
  delete linkMap[ key ]
  const childListMap = { ...state.childListMap }
  childListMap[ parent ] = Operation.arrayMatchDelete(childListMap[ parent ], key)
  if (childListMap[ parent ].length === 0) delete childListMap[ parent ]
  return { ...state, linkMap, childListMap }
}

function reduceTreeLinkMove (state, { index, key, parent }) {
  const link = state.linkMap[ key ]
  const childListMap = { ...state.childListMap }
  if (link.parent === parent && index > childListMap[ parent ].indexOf(key)) index-- // same array fix
  // unlink from original parent
  childListMap[ link.parent ] = Operation.arrayMatchDelete(childListMap[ link.parent ], key)
  if (childListMap[ link.parent ].length === 0) delete childListMap[ link.parent ]
  // set to new parent
  childListMap[ parent ] = Operation.arrayInsert(childListMap[ parent ] || [], index, key)
  // change link data
  const linkMap = { ...state.linkMap, [key]: { ...link, key, parent } }
  return { ...state, linkMap, childListMap }
}

export {
  ProviderScheme,
  ActionCreatorMap,
  reducerSelectCancel,
  reducePreviewTabList,
  reduceTreeLinkSet,
  reduceTreeLinkPush,
  reduceTreeLinkDelete,
  reduceTreeLinkMove
}
