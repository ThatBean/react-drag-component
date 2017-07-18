import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { muteEvent, getHoverStyle } from 'source/__lib__'
import { createTabConnector } from './context'

const createTab = ({ TabContent }) => {
  class TabComponent extends PureComponent {
    static propTypes = {
      id: PropTypes.string,
      data: PropTypes.object,
      // from contextStore
      isHoverPreview: PropTypes.bool
    }

    constructor (props) {
      super(props)

      this.tabOperation = this.getTabOperation()

      this.tabOperation.setElementRef = (ref) => (this.divElement = ref)
      this.divElement = null
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
      return { getTabContent, doSetTabName, doAddTab, doDuplicateTab, doSelectTab, doDeleteTab, doToggleLock }
    }

    getContentRect () { return this.divElement.getBoundingClientRect() }

    render () {
      const { id, data, isHoverPreview } = this.props
      const { isEditing } = this.state
      const { linkMap, selectTabId, hoverTabId, hoverPosition } = data
      const { isLock } = linkMap[ id ]
      const isSelect = id === selectTabId
      const isHoverSource = id === hoverTabId
      const style = isHoverPreview ? getHoverStyle(hoverPosition, this.divElement) : null
      return <TabContent {...{ id, isLock, isSelect, isHoverSource, isHoverPreview, isEditing, tabOperation: this.tabOperation, style }} />
    }
  }

  const Tab = createTabConnector(TabComponent)

  return { Tab, TabComponent }
}

const TabContentPropTypes = {
  id: PropTypes.string,
  isSelect: PropTypes.bool,
  isLock: PropTypes.bool,
  isEditing: PropTypes.bool,
  isHoverSource: PropTypes.bool,
  isHoverPreview: PropTypes.bool,
  tabOperation: PropTypes.object,
  style: PropTypes.object
}

export {
  createTab,
  TabContentPropTypes
}
