/* eslint-env mocha */
(function () {
  const CthuluDice = require('../index.js')
  const cdice = new CthuluDice()
  const assert = require('assert')

  describe('structure', () => {
    it('should have an init function', () => {
      assert.equal(typeof cdice.init, 'function')
    })
    it('should have a run function', () => {
      assert.equal(typeof cdice.run, 'function')
    })
    it('should have a details property', () => {
      assert.equal(typeof CthuluDice.details, 'object')
    })
  })
})()
