import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { TabTreeContext } from 'source'
import { TextEditable, MaterialIcon } from 'example/common'

import LocalClassName from './index.pcss'
const CSS_TAB = LocalClassName[ 'tab' ]
const CSS_TAB_TREE_ROOT = LocalClassName[ 'tab-tree-root' ]
const CSS_INDICATOR = LocalClassName[ 'indicator' ]
const CSS_TREE_LINK = LocalClassName[ 'tree-link' ]
const CSS_TREE_LINK_GROUP = LocalClassName[ 'tree-link-group' ]

const { createTab, TabContentPropTypes, createTabTreeRoot, IndicatorPropTypes, Provider } = TabTreeContext

class TabContent extends PureComponent {
  static propTypes = TabContentPropTypes

  render () {
    const { id, level, hasChildTab, isExpand, isLock, isSelect, isHoverSource, isHoverPreview, isEditing, tabOperation } = this.props
    const canDuplicate = !isHoverSource && !isHoverPreview
    const canEdit = canDuplicate && !isLock
    const doToggleExpand = !isEditing && hasChildTab && !isLock ? tabOperation.doToggleExpand : null
    return <div
      ref={tabOperation.setElementRef}
      className={`${CSS_TAB} ${isSelect ? 'select' : ''} ${isLock ? 'lock' : ''} ${isHoverSource ? 'hover-source' : ''} ${isHoverPreview ? 'hover-preview' : ''}`}
      onClick={!isSelect ? tabOperation.doSelectTab : doToggleExpand}
    >
      <MaterialIcon name={hasChildTab ? (isExpand ? 'keyboard_arrow_down' : 'keyboard_arrow_right') : 'label_outline'} className={hasChildTab ? 'icon' : 'icon leaf'} onClick={doToggleExpand} />
      <MaterialIcon name={isLock ? 'lock' : 'lock_outline'} className="icon" onClick={tabOperation.doToggleLock} />
      <span>{isHoverSource ? '[HOV]' : ''}{isSelect ? '[SEL]' : ''}{isLock ? '[LOCK]' : ''}</span>
      <TextEditable
        className="tab-name"
        value={tabOperation.getTabContent().name}
        onChange={tabOperation.doSetTabName}
        onEditStateChange={tabOperation.onEditStateChange}
        isDisabled={!canEdit || !isSelect}
        placeholder="Set Tab Name"
      />
      {!isEditing && <div className="edit-button-group">
        {canEdit && <MaterialIcon name="add_circle" className="edit-button" onClick={tabOperation.doAddTab} />}
        {canDuplicate && <MaterialIcon name="content_copy" className="edit-button" onClick={tabOperation.doDuplicateTab} />}
        {canEdit && <MaterialIcon name="remove_circle" className="edit-button" onClick={tabOperation.doDeleteTab} />}
      </div>}
    </div>
  }
}

const Indicator = ({ type, style }) => <div className={`${CSS_INDICATOR} ${type}`} style={style} />
Indicator.propTypes = IndicatorPropTypes

const { TabComponent, TabChildGroup } = createTab({ TabContent, classNameTab: CSS_TREE_LINK, classNameTabHoverPreview: '', classNameTabChildGroup: CSS_TREE_LINK_GROUP })
const { TabTreeRoot } = createTabTreeRoot({ TabChildGroup, TabComponent, Indicator, classNameTabTreeRoot: CSS_TAB_TREE_ROOT, classNameTabChildGroupRoot: '' })

const TabTree = (props) => <Provider store={props.tabTreeContextStore}>
  <TabTreeRoot {...props} />
</Provider>

TabTree.propTypes = {
  tabTreeContextStore: PropTypes.object, // NOTE: this is not a Redux store
  ...TabTreeRoot.propTypes
}

export {
  TabTree
}
