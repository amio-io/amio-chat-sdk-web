import connection from './connection'
import events from './events'
import messages from './messages'
import notifications from './notifications'

class AmioWebchatClient {

  constructor() {
    this.events = events
    this.messages = messages
    this.notifications = notifications
  }

  connect(config) {
    return connection.connect(config)
  }

}

const instance = new AmioWebchatClient()
export { instance as AmioWebchatClient }
