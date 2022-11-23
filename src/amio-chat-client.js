import connection from './connection/connection'
import session from './connection/session-manager'
import events from './events'
import messages from './messages'
import notifications from './notifications'
import postbacks from './postbacks'
import files from './files'
import dictation from './dictation'

class AmioChatClient {

  constructor() {
    this.events = events
    this.messages = messages
    this.notifications = notifications
    this.postbacks = postbacks
    this.files = files
    this.dictation = dictation
  }

  connect(config) {
    return connection.connect(config)
  }

  disconnect() {
    connection.disconnect()
  }

  isConnected() {
    return connection.online
  }

  getSessionId() {
    return session.getId()
  }

}

const instance = new AmioChatClient()
export {instance as amioChat}
