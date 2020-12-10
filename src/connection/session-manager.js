import {
  STORAGE_SESSION_NAME
} from '../constants'

class SessionManager {

  constructor(type) {
    this.type = type
  }

  _getStorage() {
    // Chrome can return Access Denied error when trying to access window.localStorage
    try {
      switch(this.type) {
        case 'local': return window.localStorage
        case 'session': return window.sessionStorage
        default: return new TestStorage() // used in tests
      }
    } catch(e) {
      return new TestStorage()
    }
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

export default SessionManager
