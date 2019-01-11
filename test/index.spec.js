/* global describe, it, before */

import chai from 'chai'
import AmioWebchatClient from '../lib/amio-webchat-client'

chai.expect()

const expect = chai.expect

let lib

describe('Test', () => {
  before(() => {
    lib = AmioWebchatClient
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
