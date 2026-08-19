import 'jsdom-global/register'

import chai from 'chai'
import { Connection } from '../src/connection/connection'
import { ERROR_CODE_CHANNEL_ID_CHANGED, SOCKET_CONNECTION_ACCEPTED, SOCKET_CONNECTION_REJECTED } from '../src/constants'

chai.expect()
const expect = chai.expect

class FakeSocket {
  constructor() {
    this.connected = false
    this.handlers = {}
    this.io = {opts: {query: {}}}
    this.emitted = []
  }

  on(event, handler) {
    this.handlers[event] = handler
  }

  off() {
    this.handlers = {}
  }

  disconnect() {
    this.connected = false
  }

  emit(event, data, callback) {
    this.emitted.push({event, data})
    if(callback) {
      callback({})
    }
  }

  accept(data) {
    this.connected = true
    this.handlers[SOCKET_CONNECTION_ACCEPTED](data)
  }

  reject(error) {
    this.handlers[SOCKET_CONNECTION_REJECTED](error)
  }
}

describe('Connection.connect()', () => {
  let sockets
  let ioCalls
  let connection

  beforeEach(() => {
    sockets = []
    ioCalls = []
    const ioClient = (url, opts) => {
      const socket = new FakeSocket()
      sockets.push(socket)
      ioCalls.push({url, opts})
      return socket
    }
    connection = new Connection(ioClient)
  })

  afterEach(() => {
    connection.disconnect()
  })

  it('rejects when channelId is missing', () => {
    return connection.connect({}).then(
      () => expect.fail(null, null, 'Should have failed'),
      err => {
        expect(err).to.equal('Could not connect: config.channelId is missing.')
        expect(ioCalls).to.have.length(0)
      }
    )
  })

  it('opens a socket for a first-time visitor with no stored session', () => {
    const pending = connection.connect({channelId: 'channel-1', storageType: 'test'})
    expect(ioCalls).to.have.length(1)
    expect(ioCalls[0].opts.query.channel_id).to.equal('channel-1')
    expect(ioCalls[0].opts.query.session_id).to.equal(undefined)

    sockets[0].accept({
      session_id: 'session-1',
      chat_config: {theme: {header: {bg: '#000'}}, lang: {default: {welcome: 'Hi'}}}
    })

    return pending
  })

  it('does not resolve until connection_accepted', () => {
    let resolved = false
    const pending = connection.connect({channelId: 'channel-1', storageType: 'test'})
      .then(result => {
        resolved = true
        return result
      })

    expect(resolved).to.equal(false)

    sockets[0].accept({session_id: 'session-1', chat_config: {}})
    return pending.then(() => {
      expect(resolved).to.equal(true)
    })
  })

  it('resolves with chatConfig from connection_accepted', () => {
    const chatConfig = {
      theme: {launcher: {bg: '#111'}},
      lang: {default: {welcome: 'Hello'}}
    }
    const pending = connection.connect({channelId: 'channel-1', storageType: 'test'})
    sockets[0].accept({session_id: 'session-1', chat_config: chatConfig})

    return pending.then(result => {
      expect(result).to.eql({chatConfig})
      expect(connection.getSessionId()).to.equal('session-1')
    })
  })

  it('defaults chatConfig to an empty object when the server omits it', () => {
    const pending = connection.connect({channelId: 'channel-1', storageType: 'test'})
    sockets[0].accept({session_id: 'session-1'})

    return pending.then(result => {
      expect(result).to.eql({chatConfig: {}})
    })
  })

  it('shares one in-flight handshake until connection_accepted', () => {
    const first = connection.connect({channelId: 'channel-1', storageType: 'test'})
    const second = connection.ensureConnection()
    expect(ioCalls).to.have.length(1)

    sockets[0].accept({session_id: 'session-1', chat_config: {theme: {}}})
    return Promise.all([first, second]).then(results => {
      expect(results[0]).to.eql({chatConfig: {theme: {}}})
      expect(results[1]).to.eql({chatConfig: {theme: {}}})
    })
  })

  it('reconnects after the server invalidates the session', () => {
    const pending = connection.connect({channelId: 'channel-1', storageType: 'test'})
    sockets[0].reject({error_code: ERROR_CODE_CHANNEL_ID_CHANGED})
    expect(ioCalls).to.have.length(2)

    sockets[1].accept({session_id: 'session-2', chat_config: {}})
    return pending.then(result => {
      expect(result).to.eql({chatConfig: {}})
      expect(connection.getSessionId()).to.equal('session-2')
    })
  })
})
