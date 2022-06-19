const LinkList = require('./LinkList.js')

class LinkQueue {
  constructor (outputSize) {
    this.outputSize = outputSize
    this.elements = new LinkList()
    this.isProgressElements = new LinkList()
  }

  push (links) {
    links.forEach(this.elements.add.bind(this.elements))
  }

  pull () {
    const response = new LinkList()
    for (let i = 0; i < this.outputSize - this.isProgressElements.length; i++) {
      const link = this.elements.get(i)

      if (link !== null) {
        this.isProgressElements.add(link)
        response.add(link)
      }
    }

    return response
  }

  remove (link) {
    this.elements.removeByLink(link)
    this.isProgressElements.removeByLink(link)
  }
}

module.exports = LinkQueue
