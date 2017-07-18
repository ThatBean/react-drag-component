import { ObjectAs, ArrayOf } from 'state-scheme'

const PROVIDER_NAME = 'TabTreeProvider'
const ProviderScheme = ObjectAs(PROVIDER_NAME, {
  componentTabTreeRoot: null,
  componentTabList: ArrayOf('componentTabList', {}),
  hoverTabId: null,
  hoverPosition: null,
  insertData: null
})
const ActionCreatorMap = {
  Set: (key, value) => ({ name: PROVIDER_NAME, type: 'set', payload: { key, value } }),
  ComponentTabTreeRootSet: (value) => ({ name: PROVIDER_NAME, type: 'set', payload: { key: 'componentTabTreeRoot', value } }),
  ComponentTabListAdd: (value) => ({ name: 'componentTabList', type: 'matchPush', payload: { value } }),
  ComponentTabListDelete: (value) => ({ name: 'componentTabList', type: 'matchDelete', payload: { value } })
}

const reducerSelectCancel = (state) => ({
  ...state,
  hoverTabId: null,
  hoverPosition: null,
  insertData: null
})

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
  const { linkMap, childLinkIdListMap } = componentTabTreeRoot.props.tabTreeData
  let hoverPosition = null
  let minDistance = Infinity
  let insertParentTabId = null
  let insertIndex = null
  // let debug = {}
  componentTabList.forEach((component) => {
    const { id } = component.props
    const tabRef = component.getWrappedRef()
    if (linkMap[ id ].isLock || !tabRef) return
    const { top, height } = tabRef.getContentRect()
    if (hoverTabId === id) hoverPosition = pointerCenter
    const insertPadding = getInsertPadding(height)
    const distance = pointerCenter.y - (top + height * 0.5 + insertPadding)
    if (Math.abs(distance) <= minDistance) {
      minDistance = Math.abs(distance)
      // debug.id = component.props.id
      if (pointerCenter.y <= top + insertPadding) {
        // debug.reason = 'above, insert same level, before (final fallback for first item)'
        insertParentTabId = linkMap[ id ].parentId
        insertIndex = childLinkIdListMap[ insertParentTabId ].indexOf(id)
      } else if (pointerCenter.y <= top + height - insertPadding) {
        // debug.reason = 'include, insert as first child'
        insertParentTabId = id
        insertIndex = 0
      } else { // below, check
        if (childLinkIdListMap[ id ] && linkMap[ id ].isExpand) {
          // debug.reason = 'has child, as child'
          insertParentTabId = id
          insertIndex = 0
        } else {
          // debug.reason = 'right, basic fallback, insert to same level, after'
          insertParentTabId = linkMap[ id ].parentId
          insertIndex = childLinkIdListMap[ insertParentTabId ].indexOf(id) + 1
          let checkTabId = id
          // console.warn('start', checkTabId)
          while (linkMap[ checkTabId ] && linkMap[ checkTabId ].parentId) {
            const lastTabId = checkTabId
            checkTabId = linkMap[ checkTabId ].parentId
            // debug.reason = 'left, loop check && insert to upper level as last child'
            insertParentTabId = checkTabId
            insertIndex = childLinkIdListMap[ checkTabId ].indexOf(lastTabId) + 1
            // console.warn(insertParentTabId, insertIndex, childLinkIdListMap[ checkTabId ], lastTabId)
            if (childLinkIdListMap[ checkTabId ][ childLinkIdListMap[ checkTabId ].length - 1 ] !== lastTabId) break // not the last child
            const parentComponent = componentTabList.find((component) => component.props.id === checkTabId)
            const parentRef = parentComponent && parentComponent.getWrappedRef()
            if (parentRef && pointerCenter.x > parentRef.getContentRect().left) break // right side, insert to this level
          }
        }
      }
    }
  })

  let isValidInsert = (~insertIndex && insertParentTabId !== hoverTabId &&
    (!childLinkIdListMap[ insertParentTabId ] || (
      childLinkIdListMap[ insertParentTabId ][ insertIndex ] !== hoverTabId &&
      childLinkIdListMap[ insertParentTabId ][ insertIndex - 1 ] !== hoverTabId
    ))
  )
  let verifyTabId = insertParentTabId
  while (isValidInsert && verifyTabId) {
    if (verifyTabId === hoverTabId) isValidInsert = false
    verifyTabId = linkMap[ verifyTabId ] && linkMap[ verifyTabId ].parentId
  }
  const insertData = isValidInsert ? { insertParentTabId, insertIndex } : null
  // console.warn(minDistance, debug, isValidInsert, insertParentTabId, insertIndex, childLinkIdListMap[ insertParentTabId ])
  return { ...state, insertData, hoverPosition }
}

export {
  ProviderScheme,
  ActionCreatorMap,
  reducerSelectCancel,
  reducePreviewTabList
}
