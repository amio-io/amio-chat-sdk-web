import connection from './connection'
import {
  SOCKET_NOTIFICATION_CLIENT,
  SOCKET_MESSAGES_READ
} from './constants'

class Notifications {

  send(payload) {
    const data = {
      type: 'custom',
      payload: payload
    }

    return connection.emit(SOCKET_NOTIFICATION_CLIENT, data)
  }

  sendMessagesRead() {
    return connection.emit(SOCKET_MESSAGES_READ, {})
  }

}

export default new Notifications()
