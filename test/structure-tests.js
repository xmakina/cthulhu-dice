/* eslint-env mocha */
(function () {
  const CthuluDice = require('../index.js')
  const subject = new CthuluDice()
  const assert = require('assert')

  describe('structure', () => {
    it('should have an init function', () => {
      assert.equal(typeof subject.init, 'function')
    })
    it('should have a run function', () => {
      assert.equal(typeof subject.run, 'function')
    })
    it('should have a details property', () => {
      assert.equal(typeof CthuluDice.details, 'object')
    })
  })
})()
