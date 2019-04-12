import {
  STORAGE_SESSION_NAME
} from '../constants'

class Session {

  constructor() {
    if(window.localStorage) {
      this.storage = window.localStorage
    } else {
      this.storage = new TestStorage()
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
