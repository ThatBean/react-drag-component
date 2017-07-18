import React from 'react'
import ReactDOM from 'react-dom'
import { Operation } from 'state-scheme'

import { TabTree } from './TabTree'
import { TabList } from './TabList'
import {
  TabTreeContext,
  TabListContext,

  reduceListLinkPush,
  reduceListLinkDelete,

  reduceTreeLinkPush,
  reduceTreeLinkDelete
} from 'source'

import './index.pcss'

const createStateStore = (initialState = null) => {
  let state = initialState
  return {
    getState: () => state,
    setState: (nextState) => (state = Operation.objectMerge(state, nextState))
  }
}

const warpSetStateAndRender = ({ getState, setState, renderExample }) => (nextState) => {
  const prevState = getState()
  const state = setState(nextState)
  if (prevState === state) return
  renderExample(state)
  state.onChange && state.onChange(state)
}

const tabTreeInitialState = {
  tabTreeData: { // linkTreeData
    linkMap: {
      'TAB_ID_LOCK': { id: 'TAB_ID_LOCK', parentId: '@@ROOT', isExpand: true, isLock: true },
      'TAB_ID_0': { id: 'TAB_ID_0', parentId: '@@ROOT', isExpand: true, isLock: false },
      'TAB_ID_1': { id: 'TAB_ID_1', parentId: 'TAB_ID_0', isExpand: true, isLock: false },
      'TAB_ID_2': { id: 'TAB_ID_2', parentId: 'TAB_ID_0', isExpand: true, isLock: false },
      'TAB_ID_3': { id: 'TAB_ID_3', parentId: 'TAB_ID_2', isExpand: true, isLock: false },
      'TAB_ID_4': { id: 'TAB_ID_4', parentId: '@@ROOT', isExpand: true, isLock: false }
    },
    childLinkIdListMap: {
      '@@ROOT': [ 'TAB_ID_LOCK', 'TAB_ID_0', 'TAB_ID_4' ],
      'TAB_ID_0': [ 'TAB_ID_1', 'TAB_ID_2' ],
      'TAB_ID_2': [ 'TAB_ID_3' ]
    },
    rootId: '@@ROOT'
  },
  contentList: [
    { id: 'TAB_ID_LOCK', name: 'TAB_LOCK' },
    { id: 'TAB_ID_0', name: 'TAB_0' },
    { id: 'TAB_ID_1', name: 'TAB_1' },
    { id: 'TAB_ID_2', name: 'TAB_2' },
    { id: 'TAB_ID_3', name: 'TAB_3' },
    { id: 'TAB_ID_4', name: 'TAB_4' }
  ],
  selectTabId: 'TAB_ID_LOCK'
}

let incrementIndex = 1000
const getNewTabContent = () => {
  incrementIndex++
  return { id: `TAB_ID_${incrementIndex}`, name: `TAB_${incrementIndex}` }
}

function initTabTree (rootElement) {
  const { getState, setState } = createStateStore(tabTreeInitialState)
  const tabTreeContextStore = TabTreeContext.createTabTreeContextStore()
  const renderExample = (state) => ReactDOM.render(<TabTree {...{ tabTreeContextStore, tabOperation, ...state }} />, rootElement)
  const setStateAndRender = warpSetStateAndRender({ getState, setState, renderExample })

  const getTabContent = (tab) => getState().contentList.find((v) => v.id === tab.id)
  const setTabContent = (tab) => setStateAndRender({ contentList: getState().contentList.map((v) => v.id === tab.id ? tab : v) })
  const doSetTabTreeData = (tabTreeData) => setStateAndRender({ tabTreeData })
  const doSetTab = (tab) => {
    const { tabTreeData } = getState()
    const prevTab = tabTreeData.linkMap[ tab.id ]
    prevTab && doSetTabTreeData({ ...tabTreeData, linkMap: { ...tabTreeData.linkMap, [tab.id]: { ...prevTab, ...tab } } })
  }
  const doSelectTab = (tab) => setStateAndRender({ selectTabId: tab.id })
  const doAddTab = (parentTab) => {
    const state = getState()
    const tabContent = getNewTabContent()
    const tabTreeData = reduceTreeLinkPush(state.tabTreeData, { id: tabContent.id, parentId: parentTab.id })
    const contentList = [ ...state.contentList, tabContent ]
    const selectTabId = tabContent.id
    setStateAndRender({ tabTreeData, contentList, selectTabId })
  }
  const doDuplicateTab = (tab) => {
    const state = getState()
    const parentTabId = Object.keys(state.tabTreeData.childLinkIdListMap).find((tabId) => state.tabTreeData.childLinkIdListMap[ tabId ].includes(tab.id))
    const tabContent = { ...getNewTabContent(), name: `${getTabContent(tab).name}_Copy` }
    const tabTreeData = reduceTreeLinkPush(state.tabTreeData, { id: tabContent.id, parentId: parentTabId })
    const contentList = [ ...state.contentList, tabContent ]
    const selectTabId = tabContent.id
    setStateAndRender({ tabTreeData, contentList, selectTabId })
  }
  const doDeleteTab = (tab) => {
    const state = getState()
    const tabTreeData = reduceTreeLinkDelete(state.tabTreeData, { id: tab.id })
    const contentList = state.contentList.filter((v) => v.id !== tab.id)
    const selectTabId = state.selectTabId === tab.id ? contentList[ 0 ].id : state.selectTabId
    setStateAndRender({ tabTreeData, contentList, selectTabId })
  }

  const tabOperation = {
    getTabContent,
    setTabContent,
    doSetTabTreeData,
    doSetTab,
    doSelectTab,
    doAddTab,
    doDuplicateTab,
    doDeleteTab
  }

  return {
    getState,
    setState,
    renderExample,
    setStateAndRender
  }
}

const tabListInitialState = {
  tabListData: { // linkListData
    linkMap: {
      'TAB_ID_LOCK': { id: 'TAB_ID_LOCK', isLock: true },
      'TAB_ID_0': { id: 'TAB_ID_0', isLock: false },
      'TAB_ID_1': { id: 'TAB_ID_1', isLock: false },
      'TAB_ID_2': { id: 'TAB_ID_2', isLock: false }
    },
    linkIdList: [
      'TAB_ID_LOCK',
      'TAB_ID_0',
      'TAB_ID_1',
      'TAB_ID_2'
    ]
  },
  contentList: [
    { id: 'TAB_ID_LOCK', name: 'TAB_LOCK' },
    { id: 'TAB_ID_0', name: 'TAB_0' },
    { id: 'TAB_ID_1', name: 'TAB_1' },
    { id: 'TAB_ID_2', name: 'TAB_2' }
  ],
  selectTabId: 'TAB_ID_LOCK'
}

function initTabList (rootElement) {
  const { getState, setState } = createStateStore(tabListInitialState)
  const tabListContextStore = TabListContext.createTabListContextStore()
  const renderExample = (state) => ReactDOM.render(<TabList {...{ tabListContextStore, tabOperation, ...state }} />, rootElement)
  const setStateAndRender = warpSetStateAndRender({ getState, setState, renderExample })

  const getTabContent = (tab) => getState().contentList.find((v) => v.id === tab.id)
  const setTabContent = (tab) => setStateAndRender({ contentList: getState().contentList.map((v) => v.id === tab.id ? tab : v) })
  const doSetTabListData = (tabListData) => setStateAndRender({ tabListData })
  const doSetTab = (tab) => {
    const { tabListData } = getState()
    const prevTab = tabListData.linkMap[ tab.id ]
    prevTab && doSetTabListData({ ...tabListData, linkMap: { ...tabListData.linkMap, [tab.id]: { ...prevTab, ...tab } } })
  }
  const doSelectTab = (tab) => setStateAndRender({ selectTabId: tab.id })
  const doAddTab = () => {
    const state = getState()
    const tabContent = getNewTabContent()
    const tabListData = reduceListLinkPush(state.tabListData, { id: tabContent.id })
    const contentList = [ ...state.contentList, tabContent ]
    const selectTabId = tabContent.id
    setStateAndRender({ tabListData, contentList, selectTabId })
  }
  const doDuplicateTab = (tab) => {
    const state = getState()
    const tabContent = { ...getNewTabContent(), name: `${getTabContent(tab).name}_Copy` }
    const tabListData = reduceListLinkPush(state.tabListData, { id: tabContent.id })
    const contentList = [ ...state.contentList, tabContent ]
    const selectTabId = tabContent.id
    setStateAndRender({ tabListData, contentList, selectTabId })
  }
  const doDeleteTab = (tab) => {
    const state = getState()
    const tabListData = reduceListLinkDelete(state.tabListData, { id: tab.id })
    const contentList = state.contentList.filter((v) => v.id !== tab.id)
    const selectTabId = state.selectTabId === tab.id ? contentList[ 0 ].id : state.selectTabId
    setStateAndRender({ tabListData, contentList, selectTabId })
  }

  const tabOperation = {
    setTabContent,
    getTabContent,
    doSetTabListData,
    doSetTab,
    doSelectTab,
    doAddTab,
    doDuplicateTab,
    doDeleteTab
  }

  return {
    getState,
    setState,
    renderExample,
    setStateAndRender
  }
}

const init = (tabTreeRootElement, tabHubRootElement) => ({
  tabTreeStore: initTabTree(tabTreeRootElement),
  tabListStore: initTabList(tabHubRootElement)
})

export {
  init
}
