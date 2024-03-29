import connection from './connection/connection'
import {
  SOCKET_MESSAGE_DELIVERED
} from './constants'

class Events {

  constructor() {
    this.messageReceivedHandler = () => {
      console.error('MessageReceivedHandler is not set, use events.onMessageReceived() to set it.')
    }

    connection.setMessageReceivedHandler(data => {
      connection.emit(SOCKET_MESSAGE_DELIVERED, {
        message_id: data.id
      })
      this.messageReceivedHandler(data)
    })

    connection.setMessageEchoHandler(() => {
      console.error('MessageEchoHandler is not set, use events.onMessageEcho() to set it.')
    })

    connection.setNotificationReceivedHandler(() => {
      console.error('NotificationReceivedHandler is not set, use events.onNotificationReceived() to set it.')
    })

    connection.setDictationResultReceivedHandler(() => {
      console.error('DictationResultReceivedHandler is not set, use events.onDictationResultReceived() to set it.')
    })
  }

  onMessageReceived(func) {
    this.messageReceivedHandler = func
  }

  onMessageEcho(func) {
    connection.setMessageEchoHandler(func)
  }

  onNotificationReceived(func) {
    connection.setNotificationReceivedHandler(func)
  }

  onConnectionStateChanged(func) {
    connection.setConnectionStateChangedHandler(func)
  }

  onDictationResultReceived(func) {
    connection.setDictationResultReceivedHandler(func)
  }

}

export default new Events()
