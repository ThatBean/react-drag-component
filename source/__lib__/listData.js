import { Operation } from 'state-scheme'

function reduceListLinkPush (state, { id, isLock = false }) {
  const linkMap = { ...state.linkMap, [id]: { id, isLock } }
  const linkIdList = [ ...state.linkIdList, id ]
  return { ...state, linkMap, linkIdList }
}

function reduceListLinkDelete (state, { id }) {
  const linkMap = { ...state.linkMap }
  delete linkMap[ id ]
  const linkIdList = Operation.arrayMatchDelete(state.linkIdList, id)
  return { ...state, linkMap, linkIdList }
}

function reduceListLinkMove (state, { index, id }) {
  let linkIdList = [ ...state.linkIdList ]
  if (index > linkIdList.indexOf(id)) index-- // delete index change fix
  linkIdList = Operation.arrayMatchDelete(linkIdList, id) // unlink
  linkIdList = Operation.arrayInsert(linkIdList, index, id) // set to new index
  return { ...state, linkIdList }
}

export {
  reduceListLinkPush,
  reduceListLinkDelete,
  reduceListLinkMove
}
