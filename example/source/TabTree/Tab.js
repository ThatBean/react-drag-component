import React, { Component, PropTypes } from 'react'

import { TabTreeContext } from '../../../source'
import { TextEditable, MaterialIcon, muteEvent, getHoverStyle } from '../common'

import LocalClassName from './tab.pcss'
const CSS_TAB = LocalClassName[ 'tab' ]
const CSS_TREE_LINK = LocalClassName[ 'tree-link' ]
const CSS_TREE_LINK_GROUP = LocalClassName[ 'tree-link-group' ]

class TabComponent extends Component {
  static propTypes = {
    id: PropTypes.string,
    level: PropTypes.number,
    data: PropTypes.object,
    isHoverSource: PropTypes.bool,
    isHoverPreview: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this.doGetTabName = () => this.props.data.getTabContent(this.props).name
    this.doSetTabName = (name) => this.props.data.setTabContent({ ...this.props.data.getTabContent(this.props), name })
    this.doAddTab = muteEvent(() => this.props.data.doAddTab(this.props))
    this.doSelectTab = muteEvent(() => this.props.data.doSelectTab(this.props))
    this.doDeleteTab = muteEvent(() => this.props.data.doDeleteTab(this.props))
    this.doToggleExpand = muteEvent(() => {
      const { linkMap, doExpand } = this.props.data
      const { isExpand } = linkMap[ this.props.id ]
      doExpand(this.props, !isExpand)
    })

    this.setElementRef = (ref) => (this.divElement = ref)
    this.divElement = null
    this.setFullElementRef = (ref) => (this.divFullElement = ref)
    this.divFullElement = null
  }

  renderSubLevel () {
    const { id, level, data, isHoverSource } = this.props
    const { childListMap, hoverTabId } = data
    const isExpand = true
    const isRoot = level === 0
    return <div className={[ CSS_TREE_LINK_GROUP, isRoot ? 'root' : '', isExpand ? '' : 'hide' ].join(' ')}>
      {childListMap[ id ].map((id) => <Tab key={id} id={id} level={level + 1} data={data} isHoverSource={isHoverSource || id === hoverTabId} />) }
    </div>
  }

  render () {
    const { id, level, data, isHoverSource, isHoverPreview } = this.props
    const { linkMap, childListMap, selectTabId, hoverPosition } = data
    const { isExpand, isLock } = linkMap[ id ]
    const isRoot = level === 0
    const isSelect = id === selectTabId
    const hasChildTab = !isHoverPreview && Boolean(childListMap[ id ])
    const canEdit = !isHoverSource && !isHoverPreview && !isLock
    return <div
      ref={this.setFullElementRef}
      className={isHoverPreview ? 'hover-preview' : !isRoot ? CSS_TREE_LINK : 'root'}
      style={isHoverPreview ? getHoverStyle(hoverPosition, this.divElement) : null}
    >
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
