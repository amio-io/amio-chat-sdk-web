import connection from './connection'
import {
  ERROR_MESSAGE_NOT_CONNECTED,
  SOCKET_NOTIFICATION_CLIENT,
  SOCKET_MESSAGES_READ
} from './constants'

class Notifications {

  send(payload) {
    return new Promise((resolve, reject) => {
      if(!connection.getSocket()) {
        reject(ERROR_MESSAGE_NOT_CONNECTED)
        return
      }

      const data = {
        type: 'custom',
        payload: payload
      }

      connection.getSocket().emit(SOCKET_NOTIFICATION_CLIENT, data, (response) => {
        processResponse(response, resolve, reject)
      })
    })
  }

  sendMessagesRead() {
    return new Promise((resolve, reject) => {
      if(!connection.getSocket()) {
        reject(ERROR_MESSAGE_NOT_CONNECTED)
        return
      }

      connection.getSocket().emit(SOCKET_MESSAGES_READ, {}, (response) => {
        processResponse(response, resolve, reject)
      })
    })
  }

}

function processResponse(response, resolve, reject) {
  if(response.error_code) {
    reject(response)
    return
  }
  resolve(response)
}

export default new Notifications()
