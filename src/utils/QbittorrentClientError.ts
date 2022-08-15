export enum ErrorType {
  IP_BANNED = 'IP_BANNED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
}

export interface Context {
  type?: ErrorType
}

export default class QbittorrentClientError extends Error {
  readonly name = 'QbittorrentClientError'
  readonly type?: ErrorType

  constructor(message?: string, context?: Context) {
    super(message ?? 'qBittorrent client error')
    this.type = context?.type
  }
}