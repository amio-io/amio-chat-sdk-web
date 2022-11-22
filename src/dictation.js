import connection from './connection/connection'
import {
  SOCKET_VOICE_RT_START,
  SOCKET_VOICE_RT_DATA,
  SOCKET_VOICE_RT_END
} from './constants'

class Dictation {

  start(mimeType) {
    return new Promise((resolve, reject) => {
      const data = {
        mime_type: mimeType
      }

      connection.emit(SOCKET_VOICE_RT_START, data)
        .then(resolve)
        .catch(reject)
    })
  }

  stop() {
    return new Promise((resolve, reject) => {
      connection.emit(SOCKET_VOICE_RT_END, {})
        .then(resolve)
        .catch(reject)
    })
  }

  sendData(binaryData, mimeType) {
    return new Promise((resolve, reject) => {
      const data = {
        content_buffer: binaryData,
        mime_type: mimeType
      }

      connection.emit(SOCKET_VOICE_RT_DATA, data)
        .then(resolve)
        .catch(reject)
    })
  }

}

export default new Dictation()
