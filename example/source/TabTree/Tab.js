import React, { Component, PropTypes } from 'react'

import { TabTreeContext } from '../../../source'
import { TextEditable, MaterialIcon, muteEvent } from '../common'

import './tree-link.pcss'
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
    level: PropTypes.number,
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
    this.doToggleExpand = (event) => {
      muteEvent(event)
      const { linkMap, doExpand } = this.props.data
      const { isExpand } = linkMap[ this.props.id ]
      doExpand(this.props, !isExpand)
    }

    this.setElementRef = (ref) => (this.divElement = ref)
    this.divElement = null
  }

  renderSubLevel () {
    const { id, level, data } = this.props
    const { childListMap } = data
    const isExpand = true
    const isRoot = level === 0
    return <div className={[ 'tree-link-group', isRoot ? 'root' : '', isExpand ? '' : 'hide' ].join(' ')}>
      {childListMap[ id ].map((id) => <Tab key={id} id={id} level={level + 1} data={data} />) }
    </div>
  }

  render () {
    const { id, level, data } = this.props
    const { linkMap, childListMap, selectTabId, hoverTabId, hoverPosition } = data
    const { isExpand, isLock } = linkMap[ id ]
    const isRoot = level === 0
    const isSelect = id === selectTabId
    const isHoverPreview = Boolean(hoverPosition)
    const isHoverSource = id === hoverTabId && !isHoverPreview
    const hasChildTab = !isHoverSource && !isHoverPreview && Boolean(childListMap[ id ])
    const canEdit = !isHoverSource && !isHoverPreview && !isLock
    const props = {
      className: isHoverPreview ? 'hover-preview' : !isRoot ? 'tree-link' : '',
      style: isHoverPreview ? getHoverStyle(hoverPosition, this.divElement) : null
    }
    return <div {...props}>
      <div
        ref={this.setElementRef}
        className={[ CSS_TAB, isRoot ? 'root' : 'sub', isSelect ? 'select' : '', isHoverSource ? 'hover-source' : '', isHoverPreview ? 'hover-preview' : '' ].join(' ')}
        onClick={!isSelect ? this.doSelectTab : ((hasChildTab && !isLock) ? this.doToggleExpand : null)}
      >
        <MaterialIcon name={hasChildTab ? (isExpand ? 'keyboard_arrow_down' : 'keyboard_arrow_right') : 'label_outline'} className={hasChildTab ? 'icon' : 'icon leaf'} onClick={hasChildTab && !isLock ? this.doToggleExpand : null} />
        <span>{isHoverSource ? '[HOV]' : ''}{isSelect ? '[SEL]' : ''}{isLock ? '[LOCK]' : ''}</span>
        <TextEditable className="tab-name" placeholder="Set Tab Name" isDisabled={!canEdit || !isSelect} setValue={this.doSetTabName} getValue={this.doGetTabName} />
        {canEdit && <MaterialIcon name="add_circle" className="edit-button" onClick={this.doAddTab} />}
        {canEdit && <MaterialIcon name="remove_circle" className="edit-button" onClick={this.doDeleteTab} />}
      </div>
      {hasChildTab && isExpand && this.renderSubLevel()}
    </div>
  }
}

const Tab = TabTreeContext.createTabConnector(TabComponent)

export {
  Tab,
  TabComponent
}
