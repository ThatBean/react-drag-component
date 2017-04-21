import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { TabListContext } from '../../../source'
import { Tab, TabComponent } from './Tab'

import LocalClassName from './tab-list-root.pcss'
const CSS_TAB_LIST_ROOT = LocalClassName[ 'tab-list-root' ]

class TabListRootComponent extends PureComponent {
  static propTypes = {
    tabList: PropTypes.array,
    selectTabId: PropTypes.string,
    contentList: PropTypes.array,
    // dispatch-like
    doSetTabList: PropTypes.func,
    doAddTab: PropTypes.func,
    doSelectTab: PropTypes.func,
    doDeleteTab: PropTypes.func,
    setTabContent: PropTypes.func,
    getTabContent: PropTypes.func,
    // from contextState
    previewTabList: PropTypes.array,
    hoverTab: PropTypes.object,
    hoverPosition: PropTypes.object
  }

  constructor (props) {
    super(props)

    const { doSetTabList, doAddTab, doSelectTab, doDeleteTab, setTabContent, getTabContent } = this.props

    this.tabOperation = {
      doSetTabList,
      doAddTab,
      doSelectTab,
      doDeleteTab,
      setTabContent,
      getTabContent
    }

    this.setElementRef = (ref) => (this.divElement = ref)
    this.divElement = null
  }

  render () {
    const { tabList, selectTabId, contentList, previewTabList, hoverTab, hoverPosition } = this.props
    const renderTabList = previewTabList || tabList

    const data = {
      ...this.tabOperation,
      contentList,
      selectTabId,
      hoverTab
    }

    console.log('[RENDER] TabListRootComponent ###################################')

    return <div ref={this.setElementRef} className={CSS_TAB_LIST_ROOT}>
      {renderTabList.map((tab) => <Tab key={tab.id} id={tab.id} tab={tab} data={data} />)}
      <button onClick={this.tabOperation.doAddTab}>AddNew</button>
      {hoverTab && hoverPosition && <TabComponent key="@@HOVER" id={hoverTab.id} tab={hoverTab} data={{ ...data, hoverPosition }} />}
    </div>
  }
}

const TabListRoot = TabListContext.createTabListRootConnector(TabListRootComponent)

export {
  TabListRoot
}
