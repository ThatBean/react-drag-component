import React, { PropTypes } from 'react'

import { TabTreeContext } from '../../../source'
import { TabTreeRoot } from './TabTreeRoot'

function TabTree (props) {
  console.log('[RENDER] TabTree ###################################')
  return <TabTreeContext.Provider store={props.tabTreeContextStore}>
    <TabTreeRoot {...props} />
  </TabTreeContext.Provider>
}

TabTree.propTypes = {
  tabTreeContextStore: PropTypes.object, // NOTE: this is not a Redux store
  tabTree: PropTypes.object,
  selectTabId: PropTypes.string,
  contentList: PropTypes.array,

  doSetTabTree: PropTypes.func,
  doAddTab: PropTypes.func,
  doSelectTab: PropTypes.func,
  doDeleteTab: PropTypes.func,
  setTabContent: PropTypes.func,
  getTabContent: PropTypes.func
}

export {
  TabTree
}