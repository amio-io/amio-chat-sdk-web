import io from 'socket.io-client'

const AMIO_WEBCHAT_SERVER_URL = 'webchat.amio.io'

const DEFAULT_LOCAL_STORAGE_SESSION_NAME = 'amio_webchat_session'

const SOCKET_MESSAGE_CLIENT = 'message_client'
const SOCKET_MESSAGE_SERVER = 'message_server'
const SOCKET_MESSAGE_ECHO = 'message_client_echo'
const SOCKET_CONNECTION_ACCEPTED = 'connection_accepted'
const SOCKET_CONNECTION_REJECTED = 'connection_rejected'
const SOCKET_MESSAGES_READ = 'messages_read'
const SOCKET_MESSAGE_DELIVERED = 'message_delivered'
const SOCKET_LIST_MESSAGES = 'list_messages'

const ERROR_CODE_CHANNEL_ID_CHANGED = 1

const ERROR_MESSAGE_NOT_CONNECTED = 'Not connected, call connect() first.'

class AmioWebchatClient {

  constructor() {
    this.storage = window.localStorage
    if(!this.storage) {
      // for tests
      this.storage = {}
      this.storage.getItem = () => {}
      this.storage.setItem = () => {}
    }
    this.sessionId = null
    this.messageReceivedHandler = () => {
      console.error('MessageReceivedHandler is not set, use onMessageReceived() to set it.')
    }
    this.messageEchoHandler = () => {
      console.error('MessageEchoHandler is not set, use onMessageEcho() to set it.')
    }
    this.listMessagesResponseHandler = () => {}
  }

  connect(config) {
    return new Promise((resolve, reject) => {
      if(!config || !config.channelId) {
        reject('Could not connect: config.channelId is invalid.')
        return
      }

      // for dev purposes: set config._amioWebchatServerUrl to use a different server
      const serverUrl = config._amioWebchatServerUrl || AMIO_WEBCHAT_SERVER_URL
      const sessionName = config.localStorageSessionName || DEFAULT_LOCAL_STORAGE_SESSION_NAME

      const opts = {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 99999,
        query: {
          v: 1,
          channel_id: config.channelId
        }
      }

      this.sessionId = this.storage.getItem(sessionName)
      if(this.sessionId) {
        opts.query.session_id = this.sessionId
      }
      this.socket = io(serverUrl, opts)

      this.socket.on(SOCKET_MESSAGE_SERVER, data => {
        this.socket.emit(SOCKET_MESSAGE_DELIVERED, {
          message_id: data.id
        }, () => {})
        this.messageReceivedHandler(data)
      })

      this.socket.on(SOCKET_MESSAGE_ECHO, data => {
        this.messageEchoHandler(data)
      })

      this.socket.on(SOCKET_CONNECTION_ACCEPTED, data => {
        const sessionId = data.session_id

        this.sessionId = sessionId
        this.storage.setItem(sessionName, data.session_id)
        resolve()
      })

      this.socket.on(SOCKET_CONNECTION_REJECTED, data => {
        if(data.error_code === ERROR_CODE_CHANNEL_ID_CHANGED) {
          console.warn('Session invalidated by the server. New session will be created automatically.')
          this.storage.removeItem(sessionName)
          this.connect(config)
            .then(resolve)
            .catch(reject)
          return
        }
        reject('Connection rejected from server. Error:', data)
      })
    })
  }

  sendMessage(content) {
    return new Promise((resolve, reject) => {
      if(!this.socket) {
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

      this.socket.emit(SOCKET_MESSAGE_CLIENT, data, (response) => {
        processResponse(response, resolve, reject)
      })
    })
  }

  sendTextMessage(text) {
    const content = {
      type: 'text',
      payload: text
    }

    return this.sendMessage(content)
  }

  markMessagesAsRead() {
    return new Promise((resolve, reject) => {
      if(!this.socket) {
        reject(ERROR_MESSAGE_NOT_CONNECTED)
        return
      }

      this.socket.emit(SOCKET_MESSAGES_READ, {}, (response) => {
        processResponse(response, resolve, reject)
      })
    })
  }

  listMessages(max, cursor) {
    return new Promise((resolve, reject) => {
      if(!this.socket) {
        reject(ERROR_MESSAGE_NOT_CONNECTED)
        return
      }

      const params = {
        max,
        cursor
      }

      this.socket.emit(SOCKET_LIST_MESSAGES, params, (response) => {
        processResponse(response, resolve, reject)
      })
    })
  }

  onMessageReceived(func) {
    this.messageReceivedHandler = func
  }

  onMessageEcho(func) {
    this.messageEchoHandler = func
  }

}

function processResponse(response, resolve, reject) {
  if(response.error_code) {
    reject(response)
    return
  }
  resolve(response)
}

export default new AmioWebchatClient()
