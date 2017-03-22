import React, { Component, PropTypes } from 'react'

import { TabTreeContext } from '../../../source'
import { Tab, TabComponent } from './Tab'

import LocalClassName from './tab-tree-root.pcss'
const CSS_TAB_TREE_ROOT = LocalClassName['tab-tree-root']

class TabTreeRootComponent extends Component {
  static propTypes = {
    tabTree: PropTypes.object,
    selectTabId: PropTypes.string,
    contentList: PropTypes.array,
    // dispatch-like
    doSetTabTree: PropTypes.func,
    doAddTab: PropTypes.func,
    doSelectTab: PropTypes.func,
    doDeleteTab: PropTypes.func,
    setTabContent: PropTypes.func,
    getTabContent: PropTypes.func,
    // from contextState
    previewTabTree: PropTypes.object,
    hoverTabId: PropTypes.string,
    hoverPosition: PropTypes.object
  }

  constructor (props) {
    super(props)

    const {doSetTabTree, doAddTab, doSelectTab, doDeleteTab, setTabContent, getTabContent} = this.props

    this.tabOperation = {
      doSetTabTree,
      doAddTab,
      doSelectTab,
      doDeleteTab,
      setTabContent,
      getTabContent,
      doExpand: (tab, isExpand) => {
        const {linkMap} = this.props.tabTree
        const link = linkMap[tab.id]
        if (!link || link.isLock || link.isExpand === isExpand) return
        const nextLinkMap = {...linkMap, [tab.id]: {...link, isExpand}}
        doSetTabTree({...this.props.tabTree, linkMap: nextLinkMap})
      },
      doRecursiveExpand: (isExpand) => {
        const {linkMap} = this.props.tabTree
        const nextLinkMap = {}
        Object.keys(linkMap).forEach((key) => {
          const link = linkMap[key]
          nextLinkMap[key] = {...link, isExpand: (link.isLock ? link.isExpand : isExpand)}
        })
        doSetTabTree({...this.props.tabTree, linkMap: nextLinkMap})
      }
    }

    this.setElementRef = (ref) => (this.divElement = ref)
    this.divElement = null
  }

  render () {
    const {contentList, tabTree, selectTabId, previewTabTree, hoverTabId, hoverPosition} = this.props
    const {root, linkMap, childListMap} = previewTabTree || tabTree

    let showExpand = false
    let isAllRootCollapsed = true
    childListMap[root].forEach((key) => {
      const {isExpand, isLock} = linkMap[key]
      showExpand = showExpand || Boolean(childListMap[key]) // has child tab
      isAllRootCollapsed = isAllRootCollapsed && (isLock || !isExpand || !childListMap[key]) // locked or no child, or not expanded
    }) // only when all root is closed

    const data = {
      ...this.tabOperation,
      contentList,
      root,
      linkMap,
      childListMap,
      hoverTabId,
      selectTabId
    }

    // console.log('[RENDER] TabTreeComponent ###################################', canExpand)
    return <div ref={this.setElementRef} className={`${CSS_TAB_TREE_ROOT} RIGHT-PANEL flex-container-column FILL`}>
      <div className="bar">
        {showExpand && <button onClick={() => this.tabOperation.doRecursiveExpand(isAllRootCollapsed)}>{isAllRootCollapsed ? 'ExpandAll' : 'CollapseAll' }</button>}
        <button onClick={() => this.tabOperation.doAddTab({id: linkMap[selectTabId].parent})}>AddNew</button>
      </div>
      {childListMap[root].map((id) => <Tab key={id} id={id} level={0} data={data} />)}
      {hoverTabId && hoverPosition && <TabComponent key="@@HOVER" id={hoverTabId} level={-1} data={{...data, hoverPosition}} />}
    </div>
  }
}

const TabTreeRoot = TabTreeContext.createTabTreeRootConnector(TabTreeRootComponent)

export {
  TabTreeRoot
}
