import React, { Component, PropTypes } from 'react'
import { TabListContext } from '../../../source'
import { TextEditable, MaterialIcon, muteEvent } from '../common'

import LocalClassName from './tab.pcss'
const CSS_TAB = LocalClassName[ 'tab' ]

function getHoverStyle (position, divElement) {
  const boundingRect = divElement && divElement.getBoundingClientRect()
  let transform = boundingRect
    ? `translate3d(${Math.round(position.x - boundingRect.width * 0.3)}px, ${Math.round(position.y - boundingRect.height * 0.5)}px, 0px)`
    : `translate3d(calc(${Math.round(position.x)}px - 30%), calc(${Math.round(position.y)}px - 50%), 0px)`
  return { zIndex: 1, position: 'fixed', top: 0, left: 0, transform }
}

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
    this.doAddTab = (event) => {
      muteEvent(event)
      this.props.data.doAddTab(this.props)
    }
    this.doSelectTab = (event) => {
      muteEvent(event)
      this.props.data.doSelectTab(this.props)
    }
    this.doDeleteTab = (event) => {
      muteEvent(event)
      this.props.data.doDeleteTab(this.props)
    }

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
