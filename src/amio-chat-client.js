import connection from './connection'
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

}

const instance = new AmioChatClient()
export { instance as amioChat }
