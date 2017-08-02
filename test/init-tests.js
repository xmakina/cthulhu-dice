/* eslint-env mocha */
(function () {
  const CthuluDice = require('../index.js')
  const Random = require('./utils/mock-random')
  const assert = require('assert')

  let random = null
  let subject = null
  describe('during initialisation', () => {
    beforeEach(() => {
      random = new Random()
      random.setRandom(0.1)
      subject = new CthuluDice(random)
    })

    describe('with 3 players', () => {
      let response = null
      const players = [ '<@201981727873171456>', '<@196004823802445824>', '<@135478939966504970>' ]
      beforeEach(() => {
        response = subject.init(players)
      })

      it('should return 3 player slots', () => {
        assert.equal(response.gameState.players.length, 3)
      })

      it('should give each player 3 sanity', () => {
        assert.equal(response.gameState.players[0].sanity, 3)
        assert.equal(response.gameState.players[1].sanity, 3)
        assert.equal(response.gameState.players[2].sanity, 3)
      })

      it('should set a start player', () => {
        assert.ok(response.gameState.currentPlayer < 3 && response.gameState.currentPlayer >= 0)
      })

      it('should be waiting to choose a target', () => {
        assert.equal(response.gameState.currentAction, CthuluDice.STATES.CHOOSE_TARGET)
      })

      it('should report the start player', () => {
        assert.equal(response.message, '<@201981727873171456> is the start player, who do you want to attack?')
      })
    })

    describe('with 2 players', () => {
      const players = [ '', '' ]

      it('should throw an error', () => {
        assert.throws(() => subject.init(players))
      })
    })

    describe('with 7 players', () => {
      const players = [ '', '', '', '', '', '', '' ]

      it('should throw an error', () => {
        assert.throws(() => subject.init(players))
      })
    })
  })
})()
