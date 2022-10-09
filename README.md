# qBittorrent API client

This library provides a fully typed API client for qBittorrent.

:warning: This library is still in development and may be unstable. Breaking changes may occur at any time.

## Pre-requisites

Web-UI must be enabled in qBittorrent to be able to use the api with this library.

## Example

```js
const qBittorrentClient = new QBittorrentClient({ baseUrl: 'http://localhost:8080' });

// This will save the session cookie in the client
await qBittorrentClient.authenticate('user', 'password')

// Get all torrents
const [firstTorrent] = await qBittorrentClient.getTorrentInfos()

// Get torrent properties
const { seeds, peers } = await qBittorrentClient.getTorrentProperties(firstTorrent.hash)

console.log(`Torrent "${ firstTorrent.name }" has ${ seeds } seeds and ${ peers } peers`)
// Torrent "Ubuntu 20.04.1 LTS" has 1 seeds and 0 peers
```
