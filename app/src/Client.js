const axios = require('axios')
const FormData = require('form-data')
const urlencode = require('urlencode')
const fs = require('fs')
const request = require('request')
const progress = require('request-progress')
const EventEmitter = require('events')
const LinkQueue = require('./LinkQueue.js')

class Client {
    static ALL_DEBRID_HOST = 'https://api.alldebrid.com/v4'
    static UPLOAD_MAGNET_URI = '/magnet/upload/file'
    static MAGNET_STATUS_URI = '/magnet/status'
    static LINK_UNLOCK_URI = '/link/unlock'
    static DEFAULT_MAX_PARALLELS_DOWNLOADS = 5

    constructor (
      apiKey,
      downloadPath,
      maxParallelsDownloads = Client.DEFAULT_MAX_PARALLELS_DOWNLOADS,
      authorizedExtensions = null
    ) {
      this.apiKey = apiKey
      this.downloadPath = downloadPath
      this.authorizedExtensions = authorizedExtensions
      this.eventEmitter = new EventEmitter()
      this.magnetPoolList = []
      this.magnetPoolInterval = setInterval(this.verifyPoolStatus.bind(this), 1000)
      this.downloadInterval = setInterval(this.downloadLinks.bind(this), 1000)
      this.linkQueue = new LinkQueue(maxParallelsDownloads)
    }

    /**
     * @returns {EventEmitter}
     */
    getEventEmitter () {
      return this.eventEmitter
    }

    getUrl (uri, params = {}) {
      const defaultParams = { agent: 'watcher-app', apikey: this.apiKey }
      return Client.ALL_DEBRID_HOST + uri + this.getUrlParams({ ...defaultParams, ...params })
    }

    getUrlParams (params) {
      return '?' + Object
        .keys(params)
        .map(key => `${key}=${urlencode(params[key])}`)
        .join('&')
    }

    putTorrent (filename) {
      fs.readFile(filename, (err, imageData) => {
        if (err) {
          this.eventEmitter.emit('torrent_error', err)
          return
        }
        const form = new FormData()
        form.append('files[]', imageData, {
          filepath: filename,
          contentType: 'application/x-bittorrent'
        })
        axios.post(this.getUrl(Client.UPLOAD_MAGNET_URI), form, {
          headers: form.getHeaders()
        })
          .then(response => {
            this.magnetPoolList.push(response.data.data.files[0].id)
          })
      })
    }

    verifyPoolStatus () {
      if (this.magnetPoolList.length === 0) {
        return
      }
      this.magnetPoolList.forEach(this.verifyStatus.bind(this))
    }

    verifyStatus (magnetId) {
      axios.get(this.getUrl(Client.MAGNET_STATUS_URI, { id: magnetId }))
        .then(response => {
          const responseBody = response.data
          const magnets = responseBody.data.magnets
          if (magnets.statusCode === 4) {
            this.magnetPoolList = this.magnetPoolList.filter(value => { return value !== magnetId })
            const links = this.findGoodLinks(magnets.links)
            this.linkQueue.push(links)
          }
        })
        .catch((error) => {
          this.magnetPoolList = this.magnetPoolList.filter(value => { return value !== magnetId })
          this.eventEmitter.emit('status_error', error)
        })
    }

    findGoodLinks (links) {
      if (this.authorizedExtensions === null) {
        return links.map(data => data.link)
      } else {
        return links.filter(data => {
          return data.filename.match(new RegExp('\\.(' + this.authorizedExtensions.join('|') + ')$'))
        }).map(data => data.link)
      }
    }

    async downloadLinks () {
      this.linkQueue.pull().forEach(this.downloadLink.bind(this))
    }

    async downloadLink (link) {
      axios.get(this.getUrl(Client.LINK_UNLOCK_URI, { link: link }))
        .then(response => {
          const responseBody = response.data
          this.downloadFile(responseBody.data.link, responseBody.data.filename, link)
        })
    }

    downloadFile (link, filename, originalLink) {
      const data = {}
      this.eventEmitter.emit('download', filename, link, data)
      this.linkQueue.remove(originalLink)
      progress(request(link))
        .on('progress', progress => {
          this.eventEmitter.emit('downloading', progress, filename, link, data)
        })
        .on('end', () => {
          this.eventEmitter.emit('downloaded', filename, link, data)
        })
        .on('error', () => {
          this.eventEmitter.emit('download_error', filename, link, data)
        })
        .pipe(fs.createWriteStream(this.downloadPath + '/' + filename))
    }
}

module.exports = Client
