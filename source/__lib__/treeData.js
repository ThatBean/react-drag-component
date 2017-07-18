import { Operation } from 'state-scheme'

class TreeLinkBuilder {
  constructor (rootId) {
    this.rootId = rootId
    this.linkMap = {}
    this.childLinkIdListMap = {}
  }

  add (parentId, id, index, data) {
    const linkData = { parentId, id, ...data }

    if (this.linkMap[ id ]) return console.warn('[TreeLinkBuilder] duplicate id', this.linkMap[ id ], linkData, index)
    this.linkMap[ id ] = linkData

    if (!this.childLinkIdListMap[ parentId ]) this.childLinkIdListMap[ parentId ] = []
    if (this.childLinkIdListMap[ parentId ][ index ]) return console.warn('[TreeLinkBuilder] duplicate index', this.childLinkIdListMap[ parentId ][ index ], linkData, index)
    this.childLinkIdListMap[ parentId ][ index ] = id
  }

  build () {
    const { rootId, linkMap, childLinkIdListMap } = this
    this.rootId = this.linkMap = this.childLinkIdListMap = null

    // all id valid
    const linkMapIdList = Object.keys(linkMap)
    const childLinkIdListMapIdList = Object.keys(childLinkIdListMap)

    const validIdSet = new Set(linkMapIdList)
    validIdSet.add(rootId)

    linkMapIdList.forEach((id) => {
      if (!validIdSet.has(linkMap[ id ].parentId)) console.warn('[TreeLinkBuilder][build] error linkMap parentId id', linkMap[ id ])
    })

    childLinkIdListMapIdList.forEach((id) => {
      if (!validIdSet.has(id)) {
        return console.warn('[TreeLinkBuilder][build] error childLinkIdListMap id', id, childLinkIdListMap[ id ])
      }
      const childList = []
      childLinkIdListMap[ id ].forEach((childKey) => {
        if (!validIdSet.has(childKey)) console.warn('[TreeLinkBuilder][build] error childKey in childLinkIdListMap', childKey, id, childLinkIdListMap[ id ])
        if (!linkMap[ childKey ] || linkMap[ childKey ].parentId !== id) console.warn('[TreeLinkBuilder][build] error linkMap child for childLinkIdListMap', childKey, id, linkMap[ childKey ], childLinkIdListMap[ id ])
        childList.push(childKey)
      })
      childLinkIdListMap[ id ] = childList
    })

    return { rootId, linkMap, childLinkIdListMap }
  }
}

function depthFirstSearch ({ linkMap, childLinkIdListMap, rootId }, callback) {
  let keyLevelStack = (childLinkIdListMap[ rootId ] || []).map((id) => [ id, 0 ]).reverse()
  let keyLevel
  while ((keyLevel = keyLevelStack.pop())) {
    const [ id, level ] = keyLevel
    const linkData = linkMap[ id ]
    if (callback(linkData, id, level)) return { linkData, id, level }
    if (childLinkIdListMap[ id ]) keyLevelStack = [ ...keyLevelStack, ...childLinkIdListMap[ id ].map((id) => [ id, level + 1 ]).reverse() ]
  }
}

function breadthFirstSearch ({ linkMap, childLinkIdListMap, rootId }, callback) {
  let keyLevelQueue = (childLinkIdListMap[ rootId ] || []).map((id) => [ id, 0 ])
  let keyLevel
  while ((keyLevel = keyLevelQueue.shift())) {
    const [ id, level ] = keyLevel
    const linkData = linkMap[ id ]
    if (callback(linkData, id, level)) return { linkData, id, level }
    if (childLinkIdListMap[ id ]) keyLevelQueue = [ ...keyLevelQueue, ...childLinkIdListMap[ id ].map((id) => [ id, level + 1 ]) ]
  }
}

function getTreeChildCount ({ childLinkIdListMap }, { id }) {
  let childCount = 0
  const keyStack = [ id ]
  while (keyStack.length) {
    const childList = childLinkIdListMap[ keyStack.pop() ]
    if (childList === undefined || childList.length === 0) continue
    childCount += childList.length
    keyStack.push(...childList)
  }
  return childCount
}

function reduceTreeLinkPush (state, { id, parentId, isExpand = true, isLock = false }) {
  const linkMap = { ...state.linkMap, [id]: { id, parentId, isExpand, isLock } }
  const childList = [ ...state.childLinkIdListMap[ parentId ] || [], id ]
  const childLinkIdListMap = { ...state.childLinkIdListMap, [parentId]: childList }
  return { ...state, linkMap, childLinkIdListMap }
}

function reduceTreeLinkDelete (state, { id }) {
  const childList = state.childLinkIdListMap[ id ]
  if (childList) state = childList.reduce((state, id) => reduceTreeLinkDelete(state, { id }), state) // remove child // TODO: speed up ?
  const { parentId } = state.linkMap[ id ]
  const linkMap = { ...state.linkMap }
  delete linkMap[ id ]
  const childLinkIdListMap = { ...state.childLinkIdListMap }
  childLinkIdListMap[ parentId ] = Operation.arrayMatchDelete(childLinkIdListMap[ parentId ], id)
  if (childLinkIdListMap[ parentId ].length === 0) delete childLinkIdListMap[ parentId ]
  return { ...state, linkMap, childLinkIdListMap }
}

function reduceTreeLinkMove (state, { index, id, parentId }) {
  const link = state.linkMap[ id ]
  const childLinkIdListMap = { ...state.childLinkIdListMap }
  if (link.parentId === parentId && index > childLinkIdListMap[ parentId ].indexOf(id)) index-- // same array fix
  // unlink from original parentId
  childLinkIdListMap[ link.parentId ] = Operation.arrayMatchDelete(childLinkIdListMap[ link.parentId ], id)
  if (childLinkIdListMap[ link.parentId ].length === 0) delete childLinkIdListMap[ link.parentId ]
  // set to new parentId
  childLinkIdListMap[ parentId ] = Operation.arrayInsert(childLinkIdListMap[ parentId ] || [], index, id)
  // change link data
  const linkMap = { ...state.linkMap, [id]: { ...link, id, parentId } }
  // expand new parentId
  if (parentId !== state.rootId) linkMap[ parentId ] = Operation.objectMerge(state.linkMap[ parentId ], { isExpand: true })
  return { ...state, linkMap, childLinkIdListMap }
}

export {
  TreeLinkBuilder,

  depthFirstSearch,
  breadthFirstSearch,

  getTreeChildCount,

  reduceTreeLinkPush,
  reduceTreeLinkDelete,
  reduceTreeLinkMove
}
