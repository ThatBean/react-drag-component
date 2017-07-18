import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { muteEvent, getHoverStyle } from 'source/__lib__'
import { createTabConnector } from './context'

const createTab = ({ TabContent, classNameTab = '', classNameTabHoverPreview = '', classNameTabChildGroup = '' }) => {
  class TabComponent extends PureComponent {
    static propTypes = {
      id: PropTypes.string,
      level: PropTypes.number,
      data: PropTypes.object,
      // from contextStore
      isHoverSource: PropTypes.bool,
      isHoverPreview: PropTypes.bool
    }

    constructor (props) {
      super(props)

      this.tabOperation = this.getTabOperation()

      this.tabOperation.setElementRef = (ref) => (this.divElement = ref)
      this.divElement = null
      this.tabOperation.setFullElementRef = (ref) => (this.divFullElement = ref)
      this.divFullElement = null
      this.tabOperation.onEditStateChange = ({ isEditing }) => this.setState({ isEditing })
      this.state = { isEditing: false }
    }

    getTabOperation () {
      const getTabContent = () => this.props.data.getTabContent(this.props)
      const doSetTabName = (name) => this.props.data.setTabContent({ ...getTabContent(), name })
      const doAddTab = muteEvent(() => this.props.data.doAddTab(this.props))
      const doDuplicateTab = muteEvent(() => this.props.data.doDuplicateTab(this.props))
      const doSelectTab = muteEvent(() => this.props.data.doSelectTab(this.props))
      const doDeleteTab = muteEvent(() => this.props.data.doDeleteTab(this.props))
      const doToggleLock = muteEvent(() => {
        const { id, data: { linkMap, doSetTab } } = this.props
        const { isLock } = linkMap[ id ]
        doSetTab({ id, isLock: !isLock })
      })
      const doToggleExpand = muteEvent(() => {
        const { id, data: { linkMap, doSetTab } } = this.props
        const { isExpand } = linkMap[ id ]
        doSetTab({ id, isExpand: !isExpand })
      })
      return { getTabContent, doSetTabName, doAddTab, doDuplicateTab, doSelectTab, doDeleteTab, doToggleLock, doToggleExpand }
    }

    getContainerRect () { return this.divFullElement.getBoundingClientRect() }

    getContentRect () { return this.divElement.getBoundingClientRect() }

    render () {
      const { id, level, data, isHoverSource, isHoverPreview } = this.props
      const { isEditing } = this.state
      const { linkMap, childLinkIdListMap, selectTabId, hoverPosition } = data
      const hasChildTab = !isHoverPreview && Boolean(childLinkIdListMap[ id ])
      const isSelect = id === selectTabId
      const { isExpand, isLock } = linkMap[ id ]
      return <div
        ref={this.tabOperation.setFullElementRef}
        className={isHoverPreview ? classNameTabHoverPreview : classNameTab}
        style={isHoverPreview ? getHoverStyle(hoverPosition, this.divElement) : null}
      >
        <TabContent {...{ id, level, hasChildTab, isExpand, isLock, isSelect, isHoverSource, isHoverPreview, isEditing, tabOperation: this.tabOperation }} />
        {hasChildTab && <TabChildGroup {...{ id, data, level, isHoverSource: isHoverSource, className: isExpand ? '' : 'hide' }} />}
      </div>
    }
  }

  class TabChildGroup extends PureComponent {
    static propTypes = {
      id: PropTypes.string,
      level: PropTypes.number,
      data: PropTypes.object,
      isHoverSource: PropTypes.bool,
      className: PropTypes.string
    }

    render () {
      const { id: parentId, level: parentLevel, data, isHoverSource, className } = this.props
      const level = parentLevel + 1
      return <div className={`${classNameTabChildGroup} ${className || ''}`}>
        {data.childLinkIdListMap[ parentId ].map((id) => <Tab {...{ key: id, id, level, data, isHoverSource: isHoverSource || id === data.hoverTabId }} />)}
      </div>
    }
  }

  const Tab = createTabConnector(TabComponent)

  return { Tab, TabComponent, TabChildGroup }
}

const TabContentPropTypes = {
  id: PropTypes.string,
  level: PropTypes.number,
  hasChildTab: PropTypes.bool,
  isSelect: PropTypes.bool,
  isExpand: PropTypes.bool,
  isLock: PropTypes.bool,
  isEditing: PropTypes.bool,
  isHoverSource: PropTypes.bool,
  isHoverPreview: PropTypes.bool,
  tabOperation: PropTypes.object
}

export {
  createTab,
  TabContentPropTypes
}
