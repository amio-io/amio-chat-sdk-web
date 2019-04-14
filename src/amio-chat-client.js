import connection from './connection/connection'
import session from './connection/session'
import events from './events'
import messages from './messages'
import notifications from './notifications'

class AmioChatClient {

  constructor() {
    this.events = events
    this.messages = messages
    this.notifications = notifications
  }

  connect(config) {
    return connection.connect(config)
  }

  // TODO to docs
  disconnect() {
    connection.disconnect()
  }

  // TODO to docs
  isConnected() {
    return connection.online
  }

  // TODO to docs
  getSessionId() {
    return session.getId()
  }

}

const instance = new AmioChatClient()
export {instance as amioChat}
