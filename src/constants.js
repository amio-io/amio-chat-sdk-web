module.exports = {
  AMIO_WEBCHAT_SERVER_URL: 'https://webchat.amio.io',

  DEFAULT_LOCAL_STORAGE_SESSION_NAME: 'amio_webchat_session',

  SOCKET_IO_DISCONNECT: 'disconnect',
  SOCKET_IO_ERROR: 'error',

  SOCKET_MESSAGE_CLIENT: 'message_client',
  SOCKET_MESSAGE_SERVER: 'message_server',
  SOCKET_MESSAGE_ECHO: 'message_client_echo',
  SOCKET_NOTIFICATION_CLIENT: 'notification_client',
  SOCKET_NOTIFICATION_SERVER: 'notification_server',
  SOCKET_CONNECTION_ACCEPTED: 'connection_accepted',
  SOCKET_CONNECTION_REJECTED: 'connection_rejected',
  SOCKET_MESSAGES_READ: 'messages_read',
  SOCKET_MESSAGE_DELIVERED: 'message_delivered',
  SOCKET_LIST_MESSAGES: 'list_messages',

  ERROR_CODE_CHANNEL_ID_CHANGED: 1,

  ERROR_MESSAGE_NOT_CONNECTED: 'Not connected, call connect() first.'
}
