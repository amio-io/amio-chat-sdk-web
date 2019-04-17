import connection from './connection/connection'
import {
  SOCKET_MESSAGE_CLIENT,
  SOCKET_LIST_MESSAGES
} from './constants'

class Messages {

  send(content) {
    return new Promise((resolve, reject) => {
      if(typeof content !== 'object' || content === null) {
        reject('Content is not an object (did you want to use messages.sendText() instead?).')
        return
      }

      const data = {
        content: content
      }

      connection.emit(SOCKET_MESSAGE_CLIENT, data)
        .then(resolve)
        .catch(reject)
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
    const params = {
      pagination: {
        max: max,
        cursor_next: nextCursor
      }
    }

    return connection.emit(SOCKET_LIST_MESSAGES, params)
  }

}

export default new Messages()
