import connection from './connection/connection'
import {
  SOCKET_POSTBACK
} from './constants'

class Postbacks {

  send(postbackPayload) {
    return new Promise((resolve, reject) => {
      if(!postbackPayload || typeof postbackPayload !== 'string') {
        reject('Postback payload has to be a valid, non-empty string.')
        return
      }

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
