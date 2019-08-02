import connection from './connection/connection'
import {
  SOCKET_POSTBACK
} from './constants'

class Postbacks {

  send(postbackPayload = null) {
    return new Promise((resolve, reject) => {
      const data = {
        payload: postbackPayload
      }

      connection.emit(SOCKET_POSTBACK, data)
        .then(resolve)
        .catch(reject)
    })
  }

}

export default new Postbacks()
