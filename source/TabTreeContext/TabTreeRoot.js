import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { createTabTreeRootConnector } from './context'

const createTabTreeRoot = ({ TabChildGroup, TabComponent, Indicator, classNameTabTreeRoot = '', classNameTabChildGroupRoot = '' }) => {
  class TabTreeRootComponent extends PureComponent {
    static propTypes = {
      tabTreeData: PropTypes.object,
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

    checkExpand (rootId, linkMap, childLinkIdListMap) {
      let canExpand = false
      let isAllRootCollapsed = true
      childLinkIdListMap[ rootId ].forEach((id) => {
        const { isExpand, isLock } = linkMap[ id ]
        canExpand = canExpand || Boolean(childLinkIdListMap[ id ]) // has child tab
        isAllRootCollapsed = isAllRootCollapsed && (isLock || !isExpand || !childLinkIdListMap[ id ]) // locked or no child, or not expanded
      }) // only when all rootTab is closed
      return { canExpand, isAllRootCollapsed }
    }

    render () {
      const { tabTreeData: { rootId, linkMap, childLinkIdListMap }, selectTabId, hoverTabId, hoverPosition, indicatorData, tabOperation, className } = this.props
      const data = { rootId, linkMap, childLinkIdListMap, selectTabId, hoverTabId, ...tabOperation }
      return <div ref={this.setElementRef} className={`${classNameTabTreeRoot} ${className || ''}`}>
        <TabChildGroupRoot {...data} />
        <Indicator {...indicatorData} />
        {hoverTabId && hoverPosition && <TabComponent id={hoverTabId} level={-1} data={{ ...data, hoverPosition }} isHoverPreview />}
      </div>
    }
  }

  class TabChildGroupRoot extends PureComponent {
    static propTypes = {
      rootId: PropTypes.string,
      childLinkIdListMap: PropTypes.object,
      ...TabChildGroup.propTypes
    }

    render () {
      const { rootId, childLinkIdListMap } = this.props
      if (!childLinkIdListMap[ rootId ]) return null
      return <TabChildGroup {...{ id: rootId, data: this.props, level: -1, isHoverSource: false, className: classNameTabChildGroupRoot }} />
    }
  }

  const TabTreeRoot = createTabTreeRootConnector(TabTreeRootComponent)

  return { TabTreeRoot }
}

const IndicatorPropTypes = {
  type: PropTypes.string,
  style: PropTypes.object
}

export {
  createTabTreeRoot,
  IndicatorPropTypes
}
