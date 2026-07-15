export enum ErrorType {
  FORBIDDEN = 'FORBIDDEN',
  IP_BANNED = 'IP_BANNED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  OPERATION_FAILED = 'OPERATION_FAILED',
}

export interface ErrorContext extends Pick<Error, 'cause'> {
  type?: ErrorType
}

export default class QBittorrentClientError extends Error {
  readonly name = 'QBittorrentClientError'
  readonly type?: ErrorType

  constructor(message?: string, context?: ErrorContext) {
    super(message ?? 'qBittorrent client error', { cause: context?.cause })
    this.type = context?.type
  }
}