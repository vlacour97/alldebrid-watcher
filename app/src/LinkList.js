class LinkList {
  /**
     * @param links String[]
     */
  constructor (links) {
    this.elements = links ?? []
  }

  get length () {
    return this.elements.length
  }

  add (link) {
    this.elements.push(link)
  }

  get (index) {
    return this.elements[index] ?? null
  }

  forEach (callable) {
    this.elements.forEach(callable)
  }

  removeByLink (link) {
    this.elements = this.elements.filter((value) => { return link !== value })
  }
}

module.exports = LinkList
