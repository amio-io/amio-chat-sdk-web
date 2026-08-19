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
  SOCKET_NOTIFICATION_SERVER,
  SOCKET_VOICE_RT_RESULT
} from '../constants'

class Connection {

  constructor(ioClient = io) {
    this.ioClient = ioClient
    this.online = false
    this.socket = null
    this.config = null
    this.sessionManager = null
    this.chatConfig = {}
    this.connectingPromise = null

    this.messageReceivedHandler = () => {
    }
    this.messageEchoHandler = () => {
    }
    this.notificationReceivedHandler = () => {
    }
    this.connectionStateChangedHandler = () => {
    }
    this.dictationResultReceived = () => {
    }
  }

  disconnect() {
    this.connectingPromise = null
    this._closeSocket()
  }

  _closeSocket() {
    if(this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  connect(config) {
    const err = validateConfig(config)
    if(err) {
      return Promise.reject(err)
    }
    this.config = config

    // for dev purposes: set config._amioChatServerUrl to use a different server
    const storageType = this.config.storageType || 'local'
    this.sessionManager = new SessionManager(storageType)

    return this.ensureConnection()
  }

  emit(event, data) {
    return new Promise((resolve, reject) => {
      this.ensureConnection().then(() => {
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
    })
  }

  getSessionId() {
    if(!this.sessionManager) {
      return null
    }
    return this.sessionManager.getSessionId()
  }

  ensureConnection() {
    if(this.socket && this.socket.connected) {
      return Promise.resolve(this._connectionResult())
    }
    if(this.connectingPromise) {
      return this.connectingPromise
    }

    this.connectingPromise = new Promise((resolve, reject) => {
      const opts = {
        secure: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 99999,
        query: {
          v: 1,
          channel_id: this.config.channelId
        }
      }

      const serverUrl = this.config._amioChatServerUrl || AMIO_CHAT_SERVER_URL
      const sessionId = this.sessionManager.getSessionId()
      if(this.config.externalContactId) {
        opts.query.external_contact_id = this.config.externalContactId
        this.sessionManager.setExternalId(this.config.externalContactId)
      } else if(sessionId) {
        if(this.sessionManager.getExternalId()) {
          this.sessionManager.clear()
        } else {
          opts.query.session_id = sessionId
        }
      }

      this._closeSocket()
      this.socket = this.ioClient(serverUrl, opts)
      this._registerSocketHandlers(resolve, reject)
    })

    return this.connectingPromise
  }

  _connectionResult() {
    return {
      chatConfig: this.chatConfig || {}
    }
  }

  _finishConnection(resolve, result) {
    this.connectingPromise = null
    resolve(result)
  }

  _failConnection(reject, error) {
    this.connectingPromise = null
    reject(error)
  }

  _registerSocketHandlers(resolve, reject) {
    this.socket.on(SOCKET_CONNECTION_ACCEPTED, data => {
      this.sessionManager.setSessionId(data.session_id)
      this.chatConfig = (data && data.chat_config) || {}

      this.online = true
      this.connectionStateChangedHandler(this.online)

      this._finishConnection(resolve, this._connectionResult())
    })

    this.socket.on(SOCKET_CONNECTION_REJECTED, error => {
      if(error.error_code === ERROR_CODE_CHANNEL_ID_CHANGED) {
        console.warn('Session invalidated by the server. New session will be created automatically.')
        this.sessionManager.clear()
        this.socket.off()
        this._closeSocket()
        this.connectingPromise = null
        this.connect(this.config)
          .then(resolve)
          .catch(reject)
        return
      }
      this._failConnection(reject, `Connection rejected from server. Error: ${JSON.stringify(error)}`)
    })

    this.socket.on('reconnect_attempt', () => {
      // if we didn't set the sessionId here, we could end up with a new one after reconnect
      const sessionId = this.sessionManager.getSessionId()
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

    this.socket.on(SOCKET_VOICE_RT_RESULT, data => {
      this.dictationResultReceived(data)
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

  setDictationResultReceivedHandler(callback) {
    this.dictationResultReceived = callback
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

export { Connection }
export default new Connection()
