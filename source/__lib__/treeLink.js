const linkSortFunction = (a, b) => (a.index - b.index)

export class TreeLink {
  constructor (rootKey) {
    this.rootKey = rootKey
    this.linkMap = new Map()
    this.subLinkListMap = new Map()
  }

  add (parentKey, key, index, data) {
    if (this.linkMap.get(key)) return console.warn('[TreeLinkBuilder] duplicate key', parentKey, key, data)
    const linkData = { parentKey, key, index, ...data }
    this.linkMap.set(key, linkData)
    if (!this.subLinkListMap.get(parentKey)) this.subLinkListMap.set(parentKey, [ linkData ])
    else this.subLinkListMap.get(parentKey).push(linkData)
  }

  build () {
    this.subLinkListMap.forEach((subLinkList, key) => {
      subLinkList.sort(linkSortFunction)
      const linkData = this.linkMap.get(key)
      if (linkData) linkData.subLinkList = subLinkList
      if (!linkData && key !== this.rootKey) console.warn('[TreeLinkBuilder] orphan subLinkList', key)
    })
    this.depthFirstSearch((linkData) => {
      const parent = this.linkMap.get(linkData.parentKey)
      linkData.level = parent ? parent.level + 1 : 0
    })
  }

  getRootLinkList () {
    return this.subLinkListMap.get(this.rootKey) || []
  }

  depthFirstSearch (callback) {
    let stack = [ ...this.getRootLinkList() ].reverse()
    let linkData
    while ((linkData = stack.pop())) {
      if (callback(linkData)) return linkData
      const linkList = this.subLinkListMap.get(linkData.key)
      if (linkList) stack = stack.concat([ ...linkList ].reverse())
    }
  }

  breadthFirstSearch (callback) {
    let queue = [ ...this.getRootLinkList() ]
    let linkData
    while ((linkData = queue.shift())) {
      if (callback(linkData)) return linkData
      const linkList = this.subLinkListMap.get(linkData.key)
      if (linkList) queue = queue.concat(linkList)
    }
  }
}
