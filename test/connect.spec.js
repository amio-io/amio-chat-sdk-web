// this is a workaround for CORS issue. 'jsdom-global/register' must be the very 1st line.
// "jsdom-global": "zatziky/jsdom-global#default-url-in-register" must be used.
import 'jsdom-global/register'

import chai from 'chai'
import amioChat from '../lib/amio-chat-sdk-web'

chai.expect()
const expect = chai.expect
const CHANNEL_ID = process.env.TEST_AMIO_CHANNEL_ID
const CHANNEL_ID2 = process.env.TEST_AMIO_CHANNEL_ID2

console.log('process.env', process.env)
console.log('CHANNEL_ID:', CHANNEL_ID)
console.log('CHANNEL_ID2:', CHANNEL_ID2)

if(!CHANNEL_ID || !CHANNEL_ID2) {
  throw new Error('Test channels are not defined, could not run tests. Please set TEST_AMIO_CHANNEL_ID and TEST_AMIO_CHANNEL_ID2 envvars.')
}

describe('connect()', () => {

  after(() => {
    amioChat.disconnect()
  })

  describe('ERR - wrong configuration - channelId', () => {
    describe('config.channelId', () => {
      const testChannelIdMissing = opts => testFailedConnect(opts, 'Could not connect: config.channelId is missing.')
      const testChannelIdIsString = (opts, wrongValue) => {
        return testFailedConnect(opts, `Could not connect: config.channelId must be a string. The provided value is: ${JSON.stringify(wrongValue)}`)
      }

      it('undefined configuration', () => testChannelIdMissing(undefined))
      it('null configuration', () => testChannelIdMissing(null))
      it('empty configuration', () => testChannelIdMissing({}))
      it('config.channelId is null', () => testChannelIdMissing({channelId: null}))
      it('config.channelId is empty', () => testChannelIdMissing({channelId: ''}))

      it('config.channelId must be string - provided []', () => {
        const wrongValue = []
        return testChannelIdIsString({channelId: wrongValue}, wrongValue)
      })
    })
  })

  it('ERR - channelId not found', () => {
    const channelId = 'i-do-not-exist'
    const expectedError = 'Connection rejected from server. ' +
      'Error: {"error_code":2,"details":{' +
      `"message":"Channel with channelId ${channelId} doesn't exist"}}`
    return testFailedConnect({channelId}, expectedError)
  })

  it('connection accepted', () => {
    return amioChat.connect({channelId: CHANNEL_ID})
      .then(() => {
        expect(amioChat.getSessionId()).to.not.be.undefined
      })
  })

  it('connection accepted - reconnect to an existing session', () => {
    return amioChat.connect({channelId: CHANNEL_ID})
      .then(() => {
        expect(amioChat.getSessionId()).to.not.be.undefined
        const firstSessionId = amioChat.getSessionId()

        return amioChat.connect({channelId: CHANNEL_ID})
          .then(() => {
            expect(amioChat.getSessionId()).to.eql(firstSessionId)
          })
      })
  })

  it('connection accepted - old sessionId is invalidated', () => {

    return amioChat.connect({channelId: CHANNEL_ID})
      .then(() => {
        expect(amioChat.getSessionId()).to.not.be.undefined
        const firstSessionId = amioChat.getSessionId()

        return amioChat.connect({channelId: CHANNEL_ID2})
          .then(() => {
            expect(amioChat.getSessionId()).to.not.be.undefined
            expect(amioChat.getSessionId()).to.not.eql(firstSessionId)
          })
      })
  })
})

function testFailedConnect(opts, expectedErr) {
  return amioChat.connect(opts)
    .then(
      () => expect.fail(null, null, 'Should have failed'),
      actualErr => {
        expect(actualErr).to.eql(expectedErr)
      })
}

