import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { TabListContext } from 'source'
import { TextEditable, MaterialIcon } from 'example/common'

import LocalClassName from './index.pcss'
const CSS_TAB = LocalClassName[ 'tab' ]
const CSS_TAB_LIST_ROOT = LocalClassName[ 'tab-list-root' ]
const CSS_INDICATOR = LocalClassName[ 'indicator' ]

const { createTab, TabContentPropTypes, createTabListRoot, IndicatorPropTypes, Provider } = TabListContext

class TabContent extends PureComponent {
  static propTypes = TabContentPropTypes

  render () {
    const { id, isLock, isSelect, isHoverSource, isHoverPreview, isEditing, tabOperation, style } = this.props
    const canDuplicate = !isHoverSource && !isHoverPreview
    const canEdit = canDuplicate && !isLock
    return <div
      ref={tabOperation.setElementRef}
      className={`${CSS_TAB} ${isSelect ? 'select' : ''} ${isLock ? 'lock' : ''} ${isHoverSource ? 'hover-source' : ''} ${isHoverPreview ? 'hover-preview' : ''}`}
      style={style}
      onClick={!isSelect ? tabOperation.doSelectTab : null}
    >
      <MaterialIcon name={isLock ? 'lock' : 'lock_outline'} className="edit-button" onClick={tabOperation.doToggleLock} />
      <span>{isHoverSource ? '[HOV]' : ''}{isSelect ? '[SEL]' : ''}{isLock ? '[LOCK]' : ''}</span>
      <TextEditable
        className="tab-name"
        value={tabOperation.getTabContent().name}
        onChange={tabOperation.doSetTabName}
        onEditStateChange={tabOperation.onEditStateChange}
        placeholder="Set Tab Name"
        isDisabled={!canEdit || !isSelect}
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

const { Tab, TabComponent } = createTab({ TabContent })
const { TabListRoot } = createTabListRoot({ Tab, TabComponent, Indicator, classNameTabListRoot: CSS_TAB_LIST_ROOT })

const TabList = (props) => <Provider store={props.tabListContextStore}>
  <TabListRoot {...props} />
</Provider>

TabList.propTypes = {
  tabListContextStore: PropTypes.object, // NOTE: this is not a Redux store
  ...TabListRoot.propTypes
}

export {
  TabList
}
