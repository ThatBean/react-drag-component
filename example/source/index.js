import React from 'react'
import ReactDOM from 'react-dom'

import { TabTree } from './TabTree'
import { TabList } from './TabList'
import { TabTreeContext, TabListContext } from '../../source'

import './index.pcss'

function initTabTree (rootElement) {
  const tabTreeContextStore = TabTreeContext.createTabTreeContextStore()

  function renderExample (state) {
    ReactDOM.render(<div><TabTree tabTreeContextStore={tabTreeContextStore} {...state} {...TabOperation} /></div>, rootElement)
  }

  let state = {
    tabTree: {
      linkMap: {
        'TAB_ID_LOCK': { key: 'TAB_ID_LOCK', parent: '@@ROOT', isExpand: true, isLock: true },
        'TAB_ID_0': { key: 'TAB_ID_0', parent: '@@ROOT', isExpand: true, isLock: false },
        'TAB_ID_1': { key: 'TAB_ID_1', parent: 'TAB_ID_0', isExpand: true, isLock: false },
        'TAB_ID_2': { key: 'TAB_ID_2', parent: 'TAB_ID_0', isExpand: true, isLock: false },
        'TAB_ID_3': { key: 'TAB_ID_3', parent: 'TAB_ID_2', isExpand: true, isLock: false },
        'TAB_ID_4': { key: 'TAB_ID_4', parent: '@@ROOT', isExpand: true, isLock: false }
      },
      childListMap: {
        '@@ROOT': [ 'TAB_ID_LOCK', 'TAB_ID_0', 'TAB_ID_4' ],
        'TAB_ID_0': [ 'TAB_ID_1', 'TAB_ID_2' ],
        'TAB_ID_2': [ 'TAB_ID_3' ]
      },
      root: '@@ROOT'
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

  const TabOperation = {
    doSetTabTree: (tabTree) => {
      state = { ...state, tabTree }
      return renderExample(state)
    },
    doAddTab: (parentTab) => {
      incrementIndex++
      const tabContent = { id: `TAB_ID_${incrementIndex}`, name: `TAB_${incrementIndex}` }
      const tabTree = TabTreeContext.reduceTreeLinkPush(state.tabTree, { key: tabContent.id, parent: parentTab.id })
      const contentList = [ ...state.contentList, tabContent ]
      const selectTabId = tabContent.id
      state = { ...state, tabTree, contentList, selectTabId }
      return renderExample(state)
    },
    doSelectTab: (tab) => {
      const selectTabId = tab.id
      state = { ...state, selectTabId }
      return renderExample(state)
    },
    doDeleteTab: (tab) => {
      const tabTree = TabTreeContext.reduceTreeLinkDelete(state.tabTree, { key: tab.id })
      const contentList = state.contentList.filter((v) => v.id !== tab.id)
      const selectTabId = state.selectTabId === tab.id ? contentList[ 0 ].id : state.selectTabId
      state = { ...state, tabTree, contentList, selectTabId }
      return renderExample(state)
    },
    setTabContent: (tab) => {
      const contentList = state.contentList.map((v) => v.id === tab.id ? tab : v)
      state = { ...state, contentList }
      return renderExample(state)
    },
    getTabContent: (tab) => {
      return state.contentList.find((v) => v.id === tab.id)
    }
  }

  return {
    renderExample,
    getState: () => state
  }
}

function initTabList (rootElement) {
  const tabListContextStore = TabListContext.createTabListContextStore()

  function renderExample (state) {
    ReactDOM.render(<div><TabList tabListContextStore={tabListContextStore} {...state} {...TabOperation} /></div>, rootElement)
  }

  let state = {
    tabList: [
      { id: 'TAB_ID_LOCK', isLock: true },
      { id: 'TAB_ID_0', isLock: false },
      { id: 'TAB_ID_1', isLock: false },
      { id: 'TAB_ID_2', isLock: false },
      { id: 'TAB_ID_3', isLock: false },
      { id: 'TAB_ID_4', isLock: false }
    ],
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

  const TabOperation = {
    doSetTabList: (tabList) => {
      state = { ...state, tabList }
      return renderExample(state)
    },
    doAddTab: () => {
      incrementIndex++
      const tabContent = { id: `TAB_ID_${incrementIndex}`, name: `TAB_${incrementIndex}` }
      const tabList = [ ...state.tabList, { id: tabContent.id, isLock: false } ]
      const contentList = [ ...state.contentList, tabContent ]
      const selectTabId = tabContent.id
      state = { ...state, tabList, contentList, selectTabId }
      return renderExample(state)
    },
    doSelectTab: (tab) => {
      const selectTabId = tab.id
      state = { ...state, selectTabId }
      return renderExample(state)
    },
    doDeleteTab: (tab) => {
      const tabList = state.tabList.filter((v) => v.id !== tab.id)
      const contentList = state.contentList.filter((v) => v.id !== tab.id)
      const selectTabId = state.selectTabId === tab.id ? contentList[ 0 ].id : state.selectTabId
      state = { ...state, tabList, contentList, selectTabId }
      return renderExample(state)
    },
    setTabContent: (tab) => {
      const contentList = state.contentList.map((v) => v.id === tab.id ? tab : v)
      state = { ...state, contentList }
      return renderExample(state)
    },
    getTabContent: (tab) => {
      return state.contentList.find((v) => v.id === tab.id)
    }
  }

  return {
    renderExample,
    getState: () => state
  }
}

function init (tabTreeRootElement, tabHubRootElement) {
  const tabTree = initTabTree(tabTreeRootElement)
  const tabList = initTabList(tabHubRootElement)
  return { tabTree, tabList }
}

export {
  init
}
