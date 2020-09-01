import {
  STORAGE_SESSION_NAME
} from '../constants'

class Session {

  _getStorage() {
    if(window.localStorage) {
      return window.localStorage
    }
    return new TestStorage()
  }

  getId() {
    return this._getStorage().getItem(STORAGE_SESSION_NAME)
  }

  setId(value) {
    return this._getStorage().setItem(STORAGE_SESSION_NAME, value)
  }

  clear() {
    return this._getStorage().removeItem(STORAGE_SESSION_NAME)
  }
}

class TestStorage {

  constructor() {
    this.storage = {}
  }

  getItem(key) {
    return this.storage[key]
  }

  setItem(key, value) {
    this.storage[key] = value
  }

  removeItem(key) {
    delete this.storage[key]
  }
}

export default new Session()
