import connection from './connection/connection'
import {
  SOCKET_FILE_UPLOAD,
  SOCKET_VOICE_UPLOAD
} from './constants'

class Files {

  upload(fileName, mimeType, binaryData) {
    return new Promise((resolve, reject) => {
      const data = {
        name: fileName,
        mime_type: mimeType,
        content_buffer: Buffer.from(binaryData)
      }

      connection.emit(SOCKET_FILE_UPLOAD, data)
        .then(resolve)
        .catch(reject)
    })
  }

  uploadVoice(mimeType, binaryData) {
    return new Promise((resolve, reject) => {
      const data = {
        mime_type: mimeType,
        content_buffer: Buffer.from(binaryData)
      }

      connection.emit(SOCKET_VOICE_UPLOAD, data)
        .then(resolve)
        .catch(reject)
    })
  }

}

export default new Files()
