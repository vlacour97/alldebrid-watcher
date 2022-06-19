# Alldebrid watcher
An automatic downloader running for [AllDebrid](https://alldebrid.fr/).

## Getting Started

### The concept

Put torrent file in folder. The file was download with alldebrid automatically.

### Launching script with npm

``` bash
git clone https://github.com/vlacour97/alldebrid-watcher.git
npm install 
ALLDEBRID_TOKEN=allbredid-token npm run start
```
Torrent folder was /torrents and Downloadfolder was /downloads.  
For changing this write this command instead of npm run start 
``` bash
ALLDEBRID_TOKEN=allbredid-token  TORRENT_FOLDER=path/to/torrents DOWNLOAD_FOLDER=path/to/downloads npm run start
```

### Launching script with yarn

``` bash
git clone https://github.com/vlacour97/alldebrid-watcher.git
yarn install 
ALLDEBRID_TOKEN=allbredid-token yarn start
```
Torrent folder was /torrents and Downloadfolder was /downloads.  
For changing this write this command instead of yarn start
``` bash
ALLDEBRID_TOKEN=allbredid-token  TORRENT_FOLDER=path/to/torrents DOWNLOAD_FOLDER=path/to/downloads yarn start
```

### Launching script with docker
``` bash
docker run -v path/tot/torrent:/torrents -v path/to/download:/downloads -e ALLDEBRID_TOKEN=allbredid-token vlacour97/alldebrid-watcher
```

## Env variables configuration

| Environnement variable | Default value | Description                                                                                                                     |
|------------------------|---------------|---------------------------------------------------------------------------------------------------------------------------------|
| ALLDEBRID_TOKEN        | -             | Your [AllDebrid](https://alldebrid.fr/) token. This var is needed for running this script                                                                |
| TORRENT_FOLDER         | /torrents     | The folder path to torrents files                                                                                               |
| DOWNLOAD_FOLDER        | /downloads    | The folder path to downloads                                                                                                    |
| MAX_PARALLELS_DOWNLOADS| 5             | The maximum number of files downloaded in parallel (the value 1 corresponds to a synchronous download)                          |
| AUTHORIZED_EXTENSIONS  | null          | The file extension authorized to download separate by comma (eg: avi,mkv)                                                       |
| PUSHOVER_USER_TOKEN    | null          | [Pushover](https://pushover.net/) User Token. Set PUSHOVER_USER_TOKEN and PUSHOVER_APP_TOKEN to use pushover app to be notified when download was finish |
| PUSHOVER_APP_TOKEN     | null          | [Pushover](https://pushover.net/) App Token. Set PUSHOVER_USER_TOKEN and PUSHOVER_APP_TOKEN to use pushover app to be notified when download was finish  |
| DEBUG_MODE             | false         | Enable debug mode if value is true.                                                                                             |
