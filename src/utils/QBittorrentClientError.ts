export enum ErrorType {
  IP_BANNED = 'IP_BANNED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  OPERATION_FAILED = 'OPERATION_FAILED',
}

export interface ErrorContext {
  type?: ErrorType
}

export default class QBittorrentClientError extends Error {
  readonly name = 'QBittorrentClientError'
  readonly type?: ErrorType

  constructor(message?: string, context?: ErrorContext) {
    super(message ?? 'qBittorrent client error')
    this.type = context?.type
  }
}