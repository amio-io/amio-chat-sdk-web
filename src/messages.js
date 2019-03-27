import connection from './connection'
import {
  SOCKET_MESSAGE_CLIENT,
  ERROR_MESSAGE_NOT_CONNECTED,
  SOCKET_LIST_MESSAGES
} from './constants'

class Messages {

  send(content) {
    return new Promise((resolve, reject) => {
      if(!connection.isConnected()) {
        reject(ERROR_MESSAGE_NOT_CONNECTED)
        return
      }

      if(typeof content !== 'object' || content === null) {
        reject('Content is not an object (did you want to use sendTextMessage() instead?).')
        return
      }

      const data = {
        content: content
      }

      connection.emit(SOCKET_MESSAGE_CLIENT, data, (response) => {
        processResponse(response, resolve, reject)
      })
    })
  }

  sendText(text) {
    const content = {
      type: 'text',
      payload: text
    }

    return this.send(content)
  }

  sendImage(url) {
    const content = {
      type: 'image',
      payload: {
        url: url
      }
    }

    return this.send(content)
  }

  list(nextCursor, max = 10) {
    return new Promise((resolve, reject) => {
      if(!connection.isConnected()) {
        reject(ERROR_MESSAGE_NOT_CONNECTED)
        return
      }

      const params = {
        pagination: {
          max: max,
          cursor_next: nextCursor
        }
      }

      connection.emit(SOCKET_LIST_MESSAGES, params, (response) => {
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

export default new Messages()
