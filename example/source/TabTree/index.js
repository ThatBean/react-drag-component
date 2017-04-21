import React from 'react'
import PropTypes from 'prop-types'

import { TabTreeContext } from '../../../source'
import { TabTreeRoot } from './TabTreeRoot'

function TabTree (props) {
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
