/* global describe, it, before */

import chai from 'chai'
import amioChat from '../lib/amio-chat-sdk-web'

chai.expect()
const expect = chai.expect

describe('connect()', () => {
  before(() => {
  })

  describe('ERR - wrong configuration - channelId', () => {
    function testChannelIdMissing(opts) {
      return amioChat.connect(opts)
        .then(
          () => expect.fail(null, null, 'Should have failed'),
          err => {
            expect(err).to.eql('Could not connect: config.channelId is missing.')
          })
    }

    it('config - undefined', () => testChannelIdMissing(undefined))
    it('config - null', () => testChannelIdMissing(null))
    it('config - empty', () => testChannelIdMissing({}))
    it('channelId is empty', () => testChannelIdMissing({channelId: null}))
    it('channelId is empty', () => testChannelIdMissing({channelId: ''}))

  })


  it('connection accepted', () => {

  })
})
