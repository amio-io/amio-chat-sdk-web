/* global describe, it, before */

import chai from 'chai'
import amioChat from '../lib/amio-chat-sdk-web'

chai.expect()

const expect = chai.expect

let lib

describe('Test', () => {
  before(() => {
    lib = amioChat
  })
  describe('Basic test', () => {
    it('should be defined', () => {
      expect(lib).to.not.be.undefined
    })

    it('should have connect function', () => {
      expect(lib.connect).to.not.be.undefined
    })
  })
})
