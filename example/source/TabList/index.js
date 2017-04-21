import React from 'react'
import PropTypes from 'prop-types'

import { TabListContext } from '../../../source'
import { TabListRoot } from './TabListRoot'

function TabList (props) {
  return <TabListContext.Provider store={props.tabListContextStore}>
    <TabListRoot {...props} />
  </TabListContext.Provider>
}

TabList.propTypes = {
  tabListContextStore: PropTypes.object, // NOTE: this is not a Redux store
  tabList: PropTypes.array,
  selectTabId: PropTypes.string,
  contentList: PropTypes.array,

  doSetTabList: PropTypes.func,
  doAddTab: PropTypes.func,
  doSelectTab: PropTypes.func,
  doDeleteTab: PropTypes.func,
  setTabContent: PropTypes.func,
  getTabContent: PropTypes.func
}

export {
  TabList
}
