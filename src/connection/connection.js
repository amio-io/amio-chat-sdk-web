import io from 'socket.io-client'
import SessionManager from './session-manager'
import {
  AMIO_CHAT_SERVER_URL,
  ERROR_CODE_CHANNEL_ID_CHANGED,
  ERROR_MESSAGE_NOT_CONNECTED,
  SOCKET_CONNECTION_ACCEPTED,
  SOCKET_CONNECTION_REJECTED,
  SOCKET_IO_DISCONNECT,
  SOCKET_IO_ERROR,
  SOCKET_MESSAGE_ECHO,
  SOCKET_MESSAGE_SERVER,
  SOCKET_NOTIFICATION_SERVER
} from '../constants'

class Connection {

  constructor() {
    this.online = false

    this.messageReceivedHandler = () => {
    }
    this.messageEchoHandler = () => {
    }
    this.notificationReceivedHandler = () => {
    }
    this.connectionStateChangedHandler = () => {
    }
  }

  disconnect() {
    if(this.socket) {
      this.socket.disconnect()
    }
  }

  connect(config) {
    return new Promise((resolve, reject) => {
      const err = validateConfig(config)
      if(err) {
        reject(err)
        return
      }

      // for dev purposes: set config._amioChatServerUrl to use a different server
      const serverUrl = config._amioChatServerUrl || AMIO_CHAT_SERVER_URL
      const storageType = config.storageType || 'local'
      this.sessionManager = new SessionManager(storageType)

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

      const sessionId = this.sessionManager.getId()
      if(sessionId) {
        opts.query.session_id = sessionId
      }

      this.disconnect()
      this.socket = io(serverUrl, opts)

      this.socket.on(SOCKET_CONNECTION_ACCEPTED, data => {
        this.sessionManager.setId(data.session_id)

        this.online = true
        this.connectionStateChangedHandler(this.online)

        resolve()
      })

      this.socket.on(SOCKET_CONNECTION_REJECTED, error => {
        if(error.error_code === ERROR_CODE_CHANNEL_ID_CHANGED) {
          console.warn('Session invalidated by the server. New session will be created automatically.')
          this.sessionManager.clear()
          this.socket.off()
          this.connect(config)
            .then(resolve)
            .catch(reject)
          return
        }
        reject(`Connection rejected from server. Error: ${JSON.stringify(error)}`)
      })

      this.socket.on('reconnect_attempt', () => {
        // if we didn't set the sessionId here, we could end up with a new one after reconnect
        const sessionId = this.sessionManager.getId()
        if(sessionId) {
          this.socket.io.opts.query.session_id = sessionId
        }
      })

      this.socket.on(SOCKET_IO_DISCONNECT, () => {
        this.online = false
        this.connectionStateChangedHandler(this.online)
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

  emit(event, data) {
    return new Promise((resolve, reject) => {
      if(!this.socket) {
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

function isString(value) {
  return Object.prototype.toString.call(value) === '[object String]'
}

function validateConfig(config) {
  if(!config || !config.channelId) {
    return 'Could not connect: config.channelId is missing.'
  }

  if(!isString(config.channelId)) {
    return `Could not connect: config.channelId must be a string. The provided value is: ${JSON.stringify(config.channelId)}`
  }

  return null
}

export default new Connection()
