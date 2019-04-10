import io from 'socket.io-client'
import {
  AMIO_CHAT_SERVER_URL,
  STORAGE_SESSION_NAME,
  SOCKET_CONNECTION_ACCEPTED,
  SOCKET_CONNECTION_REJECTED,
  SOCKET_IO_DISCONNECT,
  SOCKET_IO_ERROR,
  SOCKET_MESSAGE_SERVER,
  SOCKET_NOTIFICATION_SERVER,
  SOCKET_MESSAGE_ECHO,
  ERROR_CODE_CHANNEL_ID_CHANGED,
  ERROR_MESSAGE_NOT_CONNECTED
} from './constants'

class Connection {

  constructor() {
    this.storage = window.localStorage
    if(!this.storage) {
      // for tests
      this.storage = {}
      this.storage.getItem = () => {}
      this.storage.setItem = () => {}
    }
    this.sessionId = null

    this.messageReceivedHandler = () => {}
    this.messageEchoHandler = () => {}
    this.notificationReceivedHandler = () => {}
    this.connectionStateChangedHandler = () => {}
  }

  connect(config) {
    return new Promise((resolve, reject) => {
      if(!config || !config.channelId) {
        reject('Could not connect: config.channelId is missing.')
        return
      }

      // for dev purposes: set config._amioChatServerUrl to use a different server
      const serverUrl = config._amioChatServerUrl || AMIO_CHAT_SERVER_URL
      const sessionName = STORAGE_SESSION_NAME

      const opts = {
        secure: true,
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

      this.socket.on(SOCKET_CONNECTION_ACCEPTED, data => {
        const sessionId = data.session_id

        this.sessionId = sessionId
        this.storage.setItem(sessionName, data.session_id)
        this.connectionStateChangedHandler(true)
        resolve()
      })

      this.socket.on(SOCKET_CONNECTION_REJECTED, data => {
        if(data.error_code === ERROR_CODE_CHANNEL_ID_CHANGED) {
          console.warn('Session invalidated by the server. New session will be created automatically.')
          this.storage.removeItem(sessionName)
          this.socket.off()
          this.connect(config)
            .then(resolve)
            .catch(reject)
          return
        }
        reject(`Connection rejected from server. Error: ${JSON.stringify(data)}`)
      })

      this.socket.on(SOCKET_IO_DISCONNECT, () => {
        this.connectionStateChangedHandler(false)
      })

      this.socket.on(SOCKET_IO_ERROR, (err) => {
        console.error('Received error from server:', err)
      })

      this.socket.on(SOCKET_MESSAGE_SERVER, data => {
        this.messageReceivedHandler(data)
      })

      this.socket.on(SOCKET_MESSAGE_ECHO, data => {
        this.messageEchoHandler(data)
      })

      this.socket.on(SOCKET_NOTIFICATION_SERVER, data => {
        this.notificationReceivedHandler(data)
      })
    })
  }

  isConnected() {
    return !!this.socket
  }

  emit(event, data) {
    return new Promise((resolve, reject) => {
      if(!this.isConnected()) {
        reject(ERROR_MESSAGE_NOT_CONNECTED)
        return
      }

      this.socket.emit(event, data, (response) => {
        if(response.error_code) {
          reject(response)
          return
        }
        resolve(response)
      })
    })
  }

  setMessageReceivedHandler(callback) {
    this.messageReceivedHandler = callback
  }

  setMessageEchoHandler(callback) {
    this.messageEchoHandler = callback
  }

  setNotificationReceivedHandler(callback) {
    this.notificationReceivedHandler = callback
  }

  setConnectionStateChangedHandler(callback) {
    this.connectionStateChangedHandler = callback
  }
}

export default new Connection()
