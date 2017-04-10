import { Operation, ObjectAs, ArrayOf } from 'state-scheme'

const PROVIDER_NAME = 'TabTreeProvider'
const ProviderScheme = ObjectAs(
  PROVIDER_NAME,
  {
    componentTabTreeRoot: null,
    componentTabList: ArrayOf('componentTabList', {}),
    hoverTabId: null,
    hoverPosition: null,
    insertData: null
  }
)
const ActionCreatorMap = {
  Set: (key, value) => ({ name: PROVIDER_NAME, type: 'set', payload: { key, value } }),
  ComponentTabTreeRootSet: (value) => ({ name: PROVIDER_NAME, type: 'set', payload: { key: 'componentTabTreeRoot', value } }),
  ComponentTabListAdd: (value) => ({ name: 'componentTabList', type: 'matchPush', payload: { value } }),
  ComponentTabListDelete: (value) => ({ name: 'componentTabList', type: 'matchDelete', payload: { value } })
}

function reducerSelectCancel (state) {
  return {
    ...state,
    hoverTabId: null,
    hoverPosition: null,
    insertData: null
  }
}

// Padding sample
//
// +-------------+
// | ----------- |
// | | padding | |
// | +---------+ |   ---+
// |             |      |
// |    item0    |      |
// |             |      |
// | ----------- |      |
// | | padding | |      +-- hover bound for item0
// | +---------+ |      |
// +-------------+      |
// | ----------- |      |
// | | padding | |      |
// | +---------+ |   ---+
// |             |
// |    item1    |
// |             |
// | ----------- |
// | | padding | |
// | +---------+ |
// +--------------

const MAX_INSERT_PADDING = 40 // should be px
const MIN_INSERT_PADDING = 10 // should be px
const getInsertPadding = (height) => Math.max(Math.min(height * 0.125, MAX_INSERT_PADDING), MIN_INSERT_PADDING)

function reducePreviewTabList (state, eventControlState) { // TODO: can optimize
  const { componentTabTreeRoot, componentTabList, hoverTabId } = state
  const { pointerCenter } = eventControlState
  const { linkMap, childListMap } = componentTabTreeRoot.props.tabTree
  let hoverPosition = null
  let minDistance = Infinity
  let insertParentTabId = null
  let insertIndex = null
  // let debug = {}
  componentTabList.forEach((component) => {
    const { id } = component.props
    const tabRef = component.getWrappedRef()
    if (linkMap[ id ].isLock || !tabRef) return
    const { top, height } = tabRef.divElement.getBoundingClientRect()
    if (hoverTabId === id) hoverPosition = pointerCenter
    const insertPadding = getInsertPadding(height)
    const distance = pointerCenter.y - (top + height * 0.5 + insertPadding)
    if (Math.abs(distance) <= minDistance) {
      minDistance = Math.abs(distance)
      // debug.id = component.props.id
      if (pointerCenter.y <= top + insertPadding) {
        // debug.reason = 'above, insert same level, before (final fallback for first item)'
        insertParentTabId = linkMap[ id ].parent
        insertIndex = childListMap[ insertParentTabId ].indexOf(id)
      } else if (pointerCenter.y <= top + height - insertPadding) {
        // debug.reason = 'include, insert as first child'
        insertParentTabId = id
        insertIndex = 0
      } else { // below, check
        if (childListMap[ id ] && linkMap[ id ].isExpand) {
          // debug.reason = 'has child, as child'
          insertParentTabId = id
          insertIndex = 0
        } else {
          // debug.reason = 'right, basic fallback, insert to same level, after'
          insertParentTabId = linkMap[ id ].parent
          insertIndex = childListMap[ insertParentTabId ].indexOf(id) + 1
          let checkTabId = id
          // console.log('start', checkTabId)
          while (linkMap[ checkTabId ] && linkMap[ checkTabId ].parent) {
            const lastTabId = checkTabId
            checkTabId = linkMap[ checkTabId ].parent
            // debug.reason = 'left, loop check && insert to upper level as last child'
            insertParentTabId = checkTabId
            insertIndex = childListMap[ checkTabId ].indexOf(lastTabId) + 1
            // console.log(insertParentTabId, insertIndex, childListMap[ checkTabId ], lastTabId)
            if (childListMap[ checkTabId ][ childListMap[ checkTabId ].length - 1 ] !== lastTabId) break // not the last child
            const parentComponent = componentTabList.find((component) => component.props.id === checkTabId)
            const parentRef = parentComponent && parentComponent.getWrappedRef()
            if (parentRef && pointerCenter.x > parentRef.divElement.getBoundingClientRect().left) break // right side, insert to this level
          }
        }
      }
    }
  })

  let isValidInsert = ~insertIndex && insertParentTabId !== hoverTabId && (
      !childListMap[ insertParentTabId ] || (
        childListMap[ insertParentTabId ][ insertIndex ] !== hoverTabId &&
        childListMap[ insertParentTabId ][ insertIndex - 1 ] !== hoverTabId
      )
    )
  let verifyTabId = insertParentTabId
  while (isValidInsert && verifyTabId) {
    if (verifyTabId === hoverTabId) isValidInsert = false
    verifyTabId = linkMap[ verifyTabId ] && linkMap[ verifyTabId ].parent
  }
  const insertData = isValidInsert ? { insertParentTabId, insertIndex } : null
  // console.log(minDistance, debug, isValidInsert, insertParentTabId, insertIndex, childListMap[ insertParentTabId ])
  return { ...state, insertData, hoverPosition }
}

function reduceTreeLinkSet (state, { index, key, parent, isExpand = true, isLock = false }) { // for building the tree
  const linkMap = { ...state.linkMap, [key]: { key, parent, isExpand, isLock } }
  const childList = [ ...state.childListMap[ parent ] ]
  childList[ index ] = key
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
  // expand new parent
  if (parent !== state.root) linkMap[ parent ] = Operation.objectMerge(state.linkMap[ parent ], { isExpand: true })
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
