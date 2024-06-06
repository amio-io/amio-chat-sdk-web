module.exports = {
  AMIO_CHAT_SERVER_URL: 'https://chat.amio.io',

  STORAGE_SESSION_NAME: 'amio_chat_session',
  STORAGE_EXTERNAL_ID: 'amio_chat_external_id',

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
  SOCKET_POSTBACK: 'postback',
  SOCKET_FILE_UPLOAD: 'file_upload',
  SOCKET_VOICE_UPLOAD: 'voice',
  SOCKET_VOICE_RT_START: 'voice_rt_start',
  SOCKET_VOICE_RT_DATA: 'voice_rt_data',
  SOCKET_VOICE_RT_END: 'voice_rt_end',
  SOCKET_VOICE_RT_RESULT: 'voice_rt_result',

  ERROR_CODE_CHANNEL_ID_CHANGED: 1,

  ERROR_MESSAGE_NOT_CONNECTED: 'Not connected, call connect() first.'
}
