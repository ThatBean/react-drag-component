import React, { Component, PropTypes } from 'react'
import { TabListContext } from '../../../source'
import { TextEditable, MaterialIcon, muteEvent, getHoverStyle } from '../common'

import LocalClassName from './tab.pcss'
const CSS_TAB = LocalClassName[ 'tab' ]

class TabComponent extends Component {
  static propTypes = {
    id: PropTypes.string,
    tab: PropTypes.object,
    data: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.doGetTabName = () => this.props.data.getTabContent(this.props).name
    this.doSetTabName = (name) => this.props.data.setTabContent({ ...this.props.data.getTabContent(this.props), name })
    this.doAddTab = muteEvent(() => this.props.data.doAddTab(this.props))
    this.doSelectTab = muteEvent(() => this.props.data.doSelectTab(this.props))
    this.doDeleteTab = muteEvent(() => this.props.data.doDeleteTab(this.props))

    this.setElementRef = (ref) => (this.divElement = ref)
    this.divElement = null
  }

  render () {
    const { id, tab, data } = this.props
    const { selectTabId, hoverTab, hoverPosition } = data
    const isSelect = id === selectTabId
    const isHoverPreview = Boolean(hoverPosition)
    const isHoverSource = tab === hoverTab && !isHoverPreview
    const canEdit = !isHoverSource && !isHoverPreview && !tab.isLock
    // console.log('[RENDER] TabComponent ###################################')
    const props = {
      ref: this.setElementRef,
      onClick: !isSelect ? this.doSelectTab : null,
      className: [ CSS_TAB, isSelect ? 'select' : '', isHoverSource ? 'hover-source' : '', isHoverPreview ? 'hover-preview' : '' ].join(' '),
      style: hoverPosition ? getHoverStyle(hoverPosition, this.divElement) : null
    }
    return <div {...props}>
      <span>{isHoverSource ? '[HOV]' : ''}{isSelect ? '[SEL]' : ''}{tab.isLock ? '[LOCK]' : ''}</span>
      <TextEditable className="tab-name" placeholder="Set Tab Name" isDisabled={!canEdit || !isSelect} setValue={this.doSetTabName} getValue={this.doGetTabName} />
      {canEdit && <MaterialIcon name="remove_circle" className="edit-button" onClick={this.doDeleteTab} />}
    </div>
  }
}

const Tab = TabListContext.createTabConnector(TabComponent)

export {
  Tab,
  TabComponent
}
