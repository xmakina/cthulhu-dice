/* eslint-env mocha */
(function () {
  const CthuluDice = require('../index.js')
  const Random = require('./utils/mock-random')
  const assert = require('assert')

  describe('when attacking', () => {
    let response = null
    let players = []
    let currentPlayerIndex = null
    let targetPlayerIndex = null
    let gameState = {}
    let random = new Random()
    let subject = new CthuluDice(random)

    beforeEach(() => {
      random = new Random()
      subject = new CthuluDice(random)

      players = [ '<@201981727873171456>', '<@196004823802445824>', '<@135478939966504970>' ]
      currentPlayerIndex = 0
      targetPlayerIndex = 1
      gameState = {
        players: [{
          name: players[0],
          sanity: 3
        }, {
          name: players[1],
          sanity: 3
        }, {
          name: players[2],
          sanity: 3
        }],
        currentPlayer: currentPlayerIndex,
        currentAction: CthuluDice.STATES.CHOOSE_TARGET,
        cthulu: 0
      }
    })

    describe('a valid target', () => {
      let currentPlayer = players[currentPlayerIndex]
      let content = players[targetPlayerIndex]

      beforeEach(() => {
        currentPlayer = players[currentPlayerIndex]
        content = players[targetPlayerIndex]
      })

      describe('and an eye is rolled', () => {
        beforeEach(() => {
          random.setRandom(0.8)
          response = subject.run(currentPlayer, content, gameState)
        })
        const attackMessage = '<@201981727873171456> has opened The Eye! What do you want to do, <@201981727873171456>?'

        it('should leave the target at three sanity', () => {
          assert.equal(response.gameState.players[targetPlayerIndex].sanity, 3)
        })

        it('should report an eye was rolled', () => {
          assert.equal(response.message, attackMessage)
        })

        it('should leave the attacker at three sanity', () => {
          assert.equal(response.gameState.players[currentPlayerIndex].sanity, 3)
        })

        it('should leave cthulu at zero sanity', () => {
          assert.equal(response.gameState.cthulu, 0)
        })

        it('should set the game state to be awaiting attacker eye choice', () => {
          assert.equal(response.gameState.currentAction, CthuluDice.STATES.EYE_CHOICE_ATTACKER)
        })

        it('should know who is being targeted', () => {
          assert.equal(response.gameState.eyeChoicePlayer, players[targetPlayerIndex])
        })
      })
    })
  })
})()
