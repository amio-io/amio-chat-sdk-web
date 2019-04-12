import {
  STORAGE_SESSION_NAME
} from '../constants'

class Session {

  constructor() {
    this.storage = window.localStorage
    if(!this.storage) {
      // for tests
      this.storage = {}
      this.storage.getItem = () => {
      }
      this.storage.setItem = () => {
      }
    }
  }

  getId() {
    return this.storage.getItem(STORAGE_SESSION_NAME)
  }

  setId(value) {
    return this.storage.setItem(STORAGE_SESSION_NAME, value)
  }

  clear() {
    return this.storage.removeItem(STORAGE_SESSION_NAME)
  }
}

export default new Session()
