import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { createTabListRootConnector } from './context'

const createTabListRoot = ({ Tab, TabComponent, Indicator, classNameTabListRoot = '' }) => {
  class TabListRootComponent extends PureComponent {
    static propTypes = {
      tabListData: PropTypes.object,
      selectTabId: PropTypes.string,
      tabOperation: PropTypes.object,
      className: PropTypes.string,
      // from contextState
      hoverTabId: PropTypes.string,
      hoverPosition: PropTypes.object,
      indicatorData: PropTypes.object
    }

    constructor (props) {
      super(props)

      this.setElementRef = (ref) => (this.divElement = ref)
      this.divElement = null
    }

    render () {
      const { tabListData: { linkIdList, linkMap }, selectTabId, hoverTabId, hoverPosition, indicatorData, tabOperation, className } = this.props
      const data = { linkIdList, linkMap, selectTabId, hoverTabId, ...tabOperation }
      return <div ref={this.setElementRef} className={`${classNameTabListRoot} ${className || ''}`}>
        {linkIdList.map((id) => <Tab {...{ key: id, id, data }} />)}
        {indicatorData && <Indicator {...indicatorData} />}
        {hoverTabId && hoverPosition && <TabComponent id={hoverTabId} data={{ ...data, hoverPosition }} isHoverPreview />}
      </div>
    }
  }

  const TabListRoot = createTabListRootConnector(TabListRootComponent)

  return { TabListRoot }
}

const IndicatorPropTypes = {
  type: PropTypes.string,
  style: PropTypes.object
}

export {
  createTabListRoot,
  IndicatorPropTypes
}
