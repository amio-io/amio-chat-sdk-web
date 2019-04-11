/* global describe, it, before */

import chai from 'chai'
import amioChat from '../lib/amio-chat-sdk-web'
// TODO put back
// import {amioChat} from '../src/amio-chat-client'

chai.expect()
const expect = chai.expect

describe('connect()', () => {
  before(() => {
  })

  describe('ERR - wrong configuration - channelId', () => {
    describe('config.channelId', () => {
      function testConnect(opts, expectedErr) {
        return amioChat.connect(opts)
          .then(
            () => expect.fail(null, null, 'Should have failed'),
            actualErr => {
              expect(actualErr).to.eql(expectedErr)
            })
      }

      const testChannelIdMissing = opts => testConnect(opts, 'Could not connect: config.channelId is missing.')
      const testChannelIdIsString = (opts, wrongValue) => {
        return testConnect(opts, `Could not connect: config.channelId must be a string. The provided value is: ${JSON.stringify(wrongValue)}`)
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

  it('connection accepted', () => {

  })
})
