const watch = require('node-watch')
const Client = require('./src/Client.js')
const terminal = require('terminal-kit').terminal

const allDebridToken = undefined !== process.env.ALLDEBRID_TOKEN ? process.env.ALLDEBRID_TOKEN : null
const torrentPath = undefined !== process.env.TORRENT_FOLDER ? process.env.TORRENT_FOLDER : '/torrents'
const downloadPath = undefined !== process.env.DOWNLOAD_FOLDER ? process.env.DOWNLOAD_FOLDER : '/downloads'
const authorizedExtension = undefined !== process.env.AUTHORIZED_EXTENSIONS ? process.env.AUTHORIZED_EXTENSIONS.split(',') : null
const pushOverUserToken = process.env.PUSHOVER_USER_TOKEN ? process.env.PUSHOVER_USER_TOKEN : null
const pushOverAppToken = process.env.PUSHOVER_APP_TOKEN ? process.env.PUSHOVER_APP_TOKEN : null
const debugMode = (process.env.DEBUG_MODE === 'true')
const maxParallelsDownload = process.env.MAX_PARALLELS_DOWNLOADS ?? Client.DEFAULT_MAX_PARALLELS_DOWNLOADS

if (allDebridToken == null) {
  throw new Error('ALLDEBRID_TOKEN env variable is needed')
}

const client = new Client(allDebridToken, downloadPath, maxParallelsDownload, authorizedExtension)

watch(torrentPath, { recursive: true }, function (evt, name) {
  if (evt === 'update' && name.match(/.torrent$/)) {
    client.putTorrent(name)
  }
})

if (pushOverUserToken && pushOverAppToken) {
  const Push = require('pushover-notifications')
  const pusher = new Push({
    user: pushOverUserToken,
    token: pushOverAppToken
  })
  client.getEventEmitter().on('downloaded', (filename) => {
    pusher.send({
      title: 'File downloaded !',
      message: `The file "${filename}" has been downloaded on your server`
    })
  })
  client.getEventEmitter().on('download', (filename) => {
    pusher.send({
      title: 'Download started !',
      message: `The file "${filename}" is being downloaded on your server`
    })
  })
}

if (debugMode) {
  client.getEventEmitter()
    .on('download', (filename, link, data) => {
      data.progressBar = terminal.progressBar({
        width: 80,
        title: 'Download progress',
        eta: true,
        percent: true
      })
    })
    .on('downloading', (progress, filename, link, data) => {
      data.progressBar.update(progress.percent)
    })
    .on('downloaded', (filename, link, data) => {
      delete data.progressBar
    })
    .on('download_error', (filename, link, data) => {
      delete data.progressBar
    })
}

client.getEventEmitter()
  .on('downloaded', (filename) => {
    terminal.green(`The file "${filename}" was downloaded`)
  })
  .on('download_error', (filename) => {
    terminal.red(`Error on download of "${filename}"`)
  })
  .on('status_error', () => {
    terminal.red('Error on verify status')
  })
