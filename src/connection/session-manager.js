import {
  STORAGE_SESSION_NAME,
  STORAGE_EXTERNAL_ID
} from '../constants'

class SessionManager {

  constructor(type) {
    this.type = type
  }

  _getStorage() {
    // Chrome can return Access Denied error when trying to access window.localStorage in Private Mode
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

  getSessionId() {
    return this._getStorage().getItem(STORAGE_SESSION_NAME)
  }

  getExternalId() {
    return this._getStorage().getItem(STORAGE_EXTERNAL_ID)
  }

  setSessionId(value) {
    return this._getStorage().setItem(STORAGE_SESSION_NAME, value)
  }

  setExternalId(value) {
    return this._getStorage().setItem(STORAGE_EXTERNAL_ID, value)
  }

  clear() {
    this._getStorage().removeItem(STORAGE_SESSION_NAME)
    this._getStorage().removeItem(STORAGE_EXTERNAL_ID)
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
