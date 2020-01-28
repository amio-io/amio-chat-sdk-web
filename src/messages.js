import connection from './connection/connection'
import {
  SOCKET_MESSAGE_CLIENT,
  SOCKET_LIST_MESSAGES
} from './constants'

class Messages {

  send(content, metadata = null) {
    return new Promise((resolve, reject) => {
      if(typeof content !== 'object' || content === null) {
        reject('Content is not an object (did you want to use messages.sendText() instead?).')
        return
      }

      if(metadata && typeof metadata !== 'object') {
        reject('Metadata must be an object.')
        return
      }

      const data = {
        content: content
      }

      if(metadata) {
        data.metadata = metadata
      }

      connection.emit(SOCKET_MESSAGE_CLIENT, data)
        .then(resolve)
        .catch(reject)
    })
  }

  sendText(text, metadata = null) {
    const content = {
      type: 'text',
      payload: text
    }

    return this.send(content, metadata)
  }

  sendImage(url, metadata = null) {
    const content = {
      type: 'image',
      payload: {
        url: url
      }
    }

    return this.send(content, metadata)
  }

  sendQuickReply(text, quickReplyPayload, metadata = null) {
    const content = {
      type: 'text',
      payload: text,
      quick_reply: {
        payload: quickReplyPayload
      }
    }

    return this.send(content, metadata)
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
