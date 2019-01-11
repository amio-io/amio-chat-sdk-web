import io from 'socket.io-client'

const AMIO_WEBCHAT_SERVER_URL = 'webchat.amio.io'

const DEFAULT_LOCAL_STORAGE_SESSION_NAME = 'amio_webchat_session'

const SOCKET_MESSAGE_CLIENT = 'message_client'
const SOCKET_MESSAGE_SERVER = 'message_server'
const SOCKET_SESSION_CREATED = 'session_created'
const SOCKET_CONNECTION_REJECTED = 'connection_rejected'

const ERROR_CHANNEL_ID_CHANGED = 1

class AmioWebchatClient {

  constructor() {
    this.storage = window.localStorage
    if (!this.storage) {
      // for tests
      this.storage = {}
      this.storage.getItem = () => {}
      this.storage.setItem = () => {}
    }
    this.sessionId = null
    this.messageReceivedHandler = () => {
      console.error('MessageReceivedHandler is not set, use onMessageReceived() to set it.')
    }
  }

  connect(config) {
    if (!config || !config.channelId) {
      console.error('Could not connect: config.channelId is invalid.')
      return
    }
    const sessionName = config.localStorageSessionName || DEFAULT_LOCAL_STORAGE_SESSION_NAME

    const opts = {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 99999,
      query: {
        v: 1,
        channelId: config.channelId
      }
    }

    this.sessionId = this.storage.getItem(sessionName)
    if (this.sessionId) {
      opts.query.sessionId = this.sessionId
    }
    this.socket = io(AMIO_WEBCHAT_SERVER_URL, opts)

    this.socket.on(SOCKET_MESSAGE_SERVER, (data, ack) => {
      ack({
        message_id: data.id
      })
      this.messageReceivedHandler(data)
    })

    this.socket.on(SOCKET_SESSION_CREATED, data => {
      const sessionId = data.session_id

      this.sessionId = sessionId
      this.storage.setItem(sessionName, data.session_id)
    })

    this.socket.on(SOCKET_CONNECTION_REJECTED, data => {
      if (data.error_code === ERROR_CHANNEL_ID_CHANGED) {
        this.storage.removeItem(sessionName)
        setTimeout(() => this.connect(config), 0)
      }
    })
  }

  sendMessage(content) {
    if (!this.socket) {
      console.error('Not connected, call connect() first.')
      return
    }

    if (typeof content !== 'object' || content === null) {
      console.error('Content is not an object (did you want to use sendTextMessage() instead?).')
      return
    }

    this.socket.emit(SOCKET_MESSAGE_CLIENT, {
      content: content
    })
  }

  sendTextMessage(text) {
    const content = {
      type: 'text',
      payload: text
    }

    return this.sendMessage(content)
  }

  onMessageReceived(func) {
    this.messageReceivedHandler = func
  }

}

export default new AmioWebchatClient()
