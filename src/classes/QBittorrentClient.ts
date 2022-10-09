import {
  QBittorrentTorrentContentPriority,
  QBittorrentTorrentContents,
  QBittorrentTorrentProperties,
  QBittorrentTorrentsAddOptions,
  QBittorrentTorrentTrackers,
  TorrentInfo,
} from '../types/QBittorrentTorrentsMethods'
import axios, { AxiosResponse } from 'axios'
import QBittorrentClientError, { ErrorType } from '../utils/QBittorrentClientError'
import { QBittorrentAppPreferences } from '../types/QBittorrentAppMethods'
import { QBittorrentSyncTorrentPeers, QBittorrentTorrentPeers } from '../types/QBittorrentSyncMethods'
import { QBittorrentTransferInfo } from '../types/QBittorrentTransferMethods'
import FormData from 'form-data'

export interface QBittorrentClientOptions {
  baseUrl: string
}

export default class QBittorrentClient {
  httpClient = axios.create()
  sessionCookie?: string

  constructor(readonly options: QBittorrentClientOptions) {
    this.httpClient.defaults.baseURL = this.baseUrl
  }

  protected get baseUrl(): string {
    return this.options.baseUrl + '/api/v2'
  }

  async authenticate(username?: string, password?: string): Promise<void> {
    return this.login(username, password)
      .then(sessionCookie => {
        if (!sessionCookie) {
          throw new Error('No session cookie')
        }
        this.sessionCookie = sessionCookie
        this.httpClient.defaults.headers.common['Cookie'] = sessionCookie
      })
  }

  async login(username?: string, password?: string): Promise<string | undefined> {
    return this.httpClient('auth/login', {
      method: 'GET',
      params: { username, password },
      withCredentials: true,
    })
      .then(async response => {
          if (response.status === 403) {
            throw new QBittorrentClientError('Too many failed attempts, your IP is banned', {
              type: ErrorType.IP_BANNED,
            })
          }
          if (response.data === 'Fails.') {
            throw new QBittorrentClientError('Invalid credentials', {
              type: ErrorType.INVALID_CREDENTIALS,
            })
          }

          const cookies = response.headers['set-cookie']
          if (Array.isArray(cookies)) {
            return cookies
              .find((cookie) => cookie.startsWith('SID='))
              ?.split(';')[0]
          }

          return undefined
        },
        error => {
          if (error.response.status === 403) {
            throw new QBittorrentClientError('Too many failed attempts, your IP is banned', {
              type: ErrorType.IP_BANNED,
            })
          }
          throw error
        },
      )
  }

  async logout(): Promise<void> {
    await this.httpClient('/auth/logout', {
      method: 'GET',
      withCredentials: true,
    })
  }

  async version(): Promise<string> {
    return this.httpClient.get('app/version')
      .then(response => response.data)
  }

  async getAppPreferences(): Promise<QBittorrentAppPreferences> {
    return this.httpClient
      .get<QBittorrentAppPreferences>(`app/preferences`)
      .then((res) => res.data)
  }

  async setAppPreferences(preferences: Partial<QBittorrentAppPreferences>): Promise<void> {
    await this.httpClient
      .post(`app/setPreferences`, `json=${ JSON.stringify(preferences) }`)
  }

  async getTorrentInfos(): Promise<Array<TorrentInfo>> {
    return this.httpClient.get<any, AxiosResponse<Array<TorrentInfo>>>('torrents/info')
      .then((res) => res.data)
  }


  async getTorrentContents(hash: string): Promise<QBittorrentTorrentContents> {
    return this.httpClient
      .get<QBittorrentTorrentContents>(`torrents/files`, {
        params: {
          hash: hash.toLowerCase(),
        },

      })
      .then((res) => res.data)
  }

  async getTorrentProperties(hash: string): Promise<QBittorrentTorrentProperties> {
    return this.httpClient
      .get<QBittorrentTorrentProperties>(`torrents/properties`, {
        params: {
          hash: hash.toLowerCase(),
        },

      })
      .then((res) => res.data)
  }

  async getTorrentTrackers(hash: string): Promise<QBittorrentTorrentTrackers> {
    return this.httpClient
      .get<QBittorrentTorrentTrackers>(`torrents/trackers`, {
        params: {
          hash: hash.toLowerCase(),
        },

      })
      .then((res) => res.data)
  }

  async getTransferInfo(): Promise<QBittorrentTransferInfo> {
    return this.httpClient
      .get<QBittorrentTransferInfo>(`transfer/info`, {})
      .then((res) => res.data)
  }

  // async syncMainData(): Promise<QBittorrentMainData> {
  //   const headers = await this.getRequestHeaders()
  //
  //   if (this.isMainDataPending == false) {
  //     this.isMainDataPending = true
  //     this.syncRids.mainData = this.syncRids.mainData.then((rid) =>
  //       this.client
  //         .get<QBittorrentSyncMainData>(`sync/maindata`, {
  //           params: {
  //             rid,
  //           },
  //           headers,
  //         })
  //         .then(({ data }) => {
  //           const {
  //             rid: newRid = 0,
  //             full_update = false,
  //             categories = {},
  //             categories_removed = [],
  //             server_state = EMPTY_SERVER_STATE,
  //             tags = [],
  //             tags_removed = [],
  //             torrents = {},
  //             torrents_removed = [],
  //             trackers = {},
  //             trackers_removed = [],
  //           } = data
  //
  //           if (full_update) {
  //             this.syncStates.mainData = {
  //               categories,
  //               server_state,
  //               tags,
  //               torrents,
  //               trackers,
  //             }
  //           } else {
  //             // categories
  //             Object.keys(categories).forEach((category) => {
  //               this.syncStates.mainData.categories[category] = {
  //                 ...this.syncStates.mainData.categories[category],
  //                 ...categories[category],
  //               }
  //             })
  //
  //             categories_removed.forEach((category) => {
  //               delete this.syncStates.mainData.categories[category]
  //             })
  //
  //             // tags
  //             this.syncStates.mainData.tags.push(...tags)
  //             this.syncStates.mainData.tags = this.syncStates.mainData.tags.filter(
  //               (tag) => !tags_removed.includes(tag),
  //             )
  //
  //             // torrents
  //             Object.keys(torrents).forEach((torrent) => {
  //               this.syncStates.mainData.torrents[torrent] = {
  //                 ...this.syncStates.mainData.torrents[torrent],
  //                 ...torrents[torrent],
  //               }
  //             })
  //
  //             torrents_removed.forEach((torrent) => {
  //               delete this.syncStates.mainData.torrents[torrent]
  //             })
  //
  //             // trackers
  //             Object.keys(trackers).forEach((tracker) => {
  //               this.syncStates.mainData.trackers[tracker] = {
  //                 ...this.syncStates.mainData.trackers[tracker],
  //                 ...trackers[tracker],
  //               }
  //             })
  //
  //             trackers_removed.forEach((tracker) => {
  //               delete this.syncStates.mainData.trackers[tracker]
  //             })
  //           }
  //
  //           return newRid
  //         })
  //         .finally(() => {
  //           this.isMainDataPending = false
  //         }),
  //     )
  //   }
  //
  //   try {
  //     await this.syncRids.mainData
  //   } catch (e) {
  //     this.syncRids.mainData = Promise.resolve(0)
  //     throw e
  //   }
  //
  //   return this.syncStates.mainData
  // }

  async syncTorrentPeers(hash: string): Promise<QBittorrentTorrentPeers> {
    return this.httpClient
      .get<QBittorrentSyncTorrentPeers>(`sync/torrentPeers`, {
        params: {
          hash: hash.toLowerCase(),
          rid: 0,
        },

      })
      .then(({ data }) => data.peers)
  }

  async torrentsPause(hashes: Array<string>): Promise<void> {
    return this.httpClient
      .get(`torrents/pause`, {
        params: {
          hashes: hashes.join('|').toLowerCase(),
        },

      })
      .then(() => {
        // returns nothing
      })
  }

  async torrentsResume(hashes: Array<string>): Promise<void> {
    return this.httpClient
      .get(`torrents/resume`, {
        params: {
          hashes: hashes.join('|').toLowerCase(),
        },

      })
      .then(() => {
        // returns nothing
      })
  }

  async torrentsDelete(hashes: Array<string>, deleteFiles: boolean): Promise<void> {
    return this.httpClient
      .get(`torrents/delete`, {
        params: {
          hashes: hashes.join('|').toLowerCase(),
          deleteFiles: deleteFiles ? 'true' : 'false',
        },

      })
      .then(() => {
        // returns nothing
      })
  }

  async torrentsRecheck(hashes: Array<string>): Promise<void> {
    return this.httpClient
      .get(`torrents/recheck`, {
        params: {
          hashes: hashes.join('|').toLowerCase(),
        },

      })
      .then(() => {
        // returns nothing
      })
  }

  async torrentsSetLocation(hashes: Array<string>, location: string): Promise<void> {
    return this.httpClient
      .get(`torrents/setLocation`, {
        params: {
          hashes: hashes.join('|').toLowerCase(),
          location,
        },

      })
      .then(() => {
        // returns nothing
      })
  }

  async torrentsSetTopPrio(hashes: Array<string>): Promise<void> {
    return this.httpClient
      .get(`torrents/topPrio`, {
        params: {
          hashes: hashes.join('|').toLowerCase(),
        },

      })
      .then(() => {
        // returns nothing
      })
  }

  async torrentsSetBottomPrio(hashes: Array<string>): Promise<void> {
    return this.httpClient
      .get(`torrents/bottomPrio`, {
        params: {
          hashes: hashes.join('|').toLowerCase(),
        },

      })
      .then(() => {
        // returns nothing
      })
  }

  async torrentsAddFiles(files: Array<Buffer>, options: QBittorrentTorrentsAddOptions): Promise<void> {
    const form = new FormData()

    files.forEach((file, index) => {
      form.append('torrents', file, {
        filename: `${ index }.torrent`,
        contentType: 'application/x-bittorrent',
      })
    })

    Object.keys(options).forEach((key) => {
      const property = key as keyof typeof options
      form.append(property, `${ options[property] }`)
    })

    const headers = form.getHeaders({
      Cookie: this.sessionCookie,
      'Content-Length': form.getLengthSync(),
    })

    return this.httpClient
      .post(`torrents/add`, form, {
        headers,
      })
      .then(response => {
        // Check if operation fail.
        // No more detail can be given in response due to the non verbosity of qBittorrent api error.
        if (response.data === 'Fails.') {
          throw new QBittorrentClientError('Can not add torrent file', {
            type: ErrorType.OPERATION_FAILED,
          })
        }
      })
  }

  async torrentsAddURLs(urls: Array<string>, options: QBittorrentTorrentsAddOptions): Promise<void> {
    const form = new FormData()

    form.append('urls', urls.join('\n'))

    Object.keys(options).forEach((key) => {
      const property = key as keyof typeof options
      form.append(property, `${ options[property] }`)
    })

    const headers = form.getHeaders({
      Cookie: this.sessionCookie,
      'Content-Length': form.getLengthSync(),
    })

    return this.httpClient
      .post(`torrents/add`, form, {
        headers,
      })
      .then(() => {
        // returns nothing
      })
  }

  async torrentsAddTags(hashes: Array<string>, tags: Array<string>): Promise<void> {
    return this.httpClient
      .get(`torrents/addTags`, {
        params: {
          hashes: hashes.join('|').toLowerCase(),
          tags: tags.join(','),
        },

      })
      .then(() => {
        // returns nothing
      })
  }

  async torrentsRemoveTags(hashes: Array<string>, tags?: Array<string>): Promise<void> {
    return this.httpClient
      .get(`torrents/removeTags`, {
        params: {
          hashes: hashes.join('|').toLowerCase(),
          tags: tags?.join(','),
        },

      })
      .then(() => {
        // returns nothing
      })
  }

  async torrentsAddTrackers(hash: string, urls: Array<string>): Promise<void> {
    if (urls.length > 0) {
      return this.httpClient
        .get(`torrents/addTrackers`, {
          params: {
            hash: hash.toLowerCase(),
            urls: urls.join('\n'),
          },

        })
        .then(() => {
          // returns nothing
        })
    }
  }

  async torrentsReannounce(hashes: Array<string>): Promise<void> {
    if (hashes.length > 0) {
      return this.httpClient
        .get(`torrents/reannounce`, {
          params: {
            hashes: hashes.join('|').toLowerCase(),
          },

        })
        .then(() => {
          // returns nothing
        })
    }
  }

  async torrentsRemoveTrackers(hash: string, urls: Array<string>): Promise<void> {
    if (urls.length > 0) {
      return this.httpClient
        .get(`torrents/removeTrackers`, {
          params: {
            hash: hash.toLowerCase(),
            urls: urls.join('|'),
          },

        })
        .then(() => {
          // returns nothing
        })
    }
  }

  async torrentsSetSuperSeeding(hashes: Array<string>, value: boolean): Promise<void> {
    if (hashes.length > 0) {
      return this.httpClient
        .get(`torrents/setSuperSeeding`, {
          params: {
            hashes: hashes.join('|').toLowerCase(),
            value: value ? 'true' : 'false',
          },

        })
        .then(() => {
          // returns nothing
        })
    }
  }

  async torrentsToggleSequentialDownload(hashes: Array<string>): Promise<void> {
    if (hashes.length > 0) {
      return this.httpClient
        .get(`torrents/toggleSequentialDownload`, {
          params: {
            hashes: hashes.join('|').toLowerCase(),
          },
        })
        .then(() => {
          // returns nothing
        })
    }
  }

  async torrentsFilePrio(hash: string, ids: Array<number>, priority: QBittorrentTorrentContentPriority) {
    return this.httpClient
      .get(`torrents/filePrio`, {
        params: {
          hash: hash.toLowerCase(),
          id: ids.join('|'),
          priority,
        },
      })
      .then(() => {
        // returns nothing
      })
  }
}