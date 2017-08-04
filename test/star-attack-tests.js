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

      describe('and a star is rolled', () => {
        beforeEach(() => {
          random.setRandom(0.9)
        })

        describe('and cthulu has no sanity', () => {
          const attackMessage = '<@201981727873171456> rolled an ancient star, but Cthulu has not stolen any sanity.\n'
          describe('and a yellow sign is rolled in response', () => {
            beforeEach(() => {
              random.setRandom(0.2)
              response = subject.run(currentPlayer, content, gameState)
            })

            it('should leave the target at three sanity', () => {
              assert.equal(response.gameState.players[targetPlayerIndex].sanity, 3)
            })

            it('should report a star was rolled', () => {
              assert.equal(attackMessage, response.message.substring(0, attackMessage.length))
            })

            it('should lower the attacker by one sanity', () => {
              assert.equal(response.gameState.players[currentPlayerIndex].sanity, 2)
            })

            it('should report a yellow sign was rolled in response', () => {
              assert.equal(response.message.substring(attackMessage.length), '<@196004823802445824> responded with a yellow sign! <@201981727873171456> loses 1 sanity to Cthulu.')
            })

            it('should add one sanity to cthulu', () => {
              assert.equal(response.gameState.cthulu, 1)
            })

            it('should move to the next player', () => {
              assert.equal(response.gameState.currentPlayer, targetPlayerIndex)
            })
          })

          describe('and a tentacle is rolled in response', () => {
            beforeEach(() => {
              random.setRandom(0.7)
              response = subject.run(currentPlayer, content, gameState)
            })

            it('should lower the target by one sanity', () => {
              assert.equal(response.gameState.players[targetPlayerIndex].sanity, 2)
            })

            it('should report a star was rolled', () => {
              assert.equal(attackMessage, response.message.substring(0, attackMessage.length))
            })

            it('should increase the attacker to four sanity', () => {
              assert.equal(response.gameState.players[currentPlayerIndex].sanity, 4)
            })

            it('should report a tentacle was rolled in response', () => {
              assert.equal(response.message.substring(attackMessage.length), '<@196004823802445824> responded with a tentacle! <@196004823802445824> loses 1 sanity to <@201981727873171456>.')
            })

            it('should not change cthulu', () => {
              assert.equal(response.gameState.cthulu, 0)
            })

            it('should move to the next player', () => {
              assert.equal(response.gameState.currentPlayer, targetPlayerIndex)
            })
          })

          describe('and an eye is rolled in response', () => {
            beforeEach(() => {
              random.setRandom(0.8)
              response = subject.run(currentPlayer, content, gameState)
            })

            it('should leave the target at three', () => {
              assert.equal(response.gameState.players[targetPlayerIndex].sanity, 3)
            })

            it('should report a star was rolled', () => {
              assert.equal(attackMessage, response.message.substring(0, attackMessage.length))
            })

            it('should leave the attacker at three sanity', () => {
              assert.equal(response.gameState.players[currentPlayerIndex].sanity, 3)
            })

            it('should report an eye was rolled in response', () => {
              assert.equal(response.message.substring(attackMessage.length), '<@196004823802445824> responded with opening the eye! What do you want to do, <@196004823802445824>?')
            })

            it('should not change cthulu', () => {
              assert.equal(response.gameState.cthulu, 0)
            })

            it('should set the game state to be awaiting eye choice', () => {
              assert.equal(response.gameState.currentAction, CthuluDice.STATES.EYE_CHOICE_VICTIM)
            })

            it('should know who should respond', () => {
              assert.equal(response.gameState.eyeChoicePlayer, players[targetPlayerIndex])
            })
          })

          describe('and a star is rolled in response', () => {
            beforeEach(() => {
              random.setRandom(0.9)
              response = subject.run(currentPlayer, content, gameState)
            })

            it('should leave the target at three', () => {
              assert.equal(response.gameState.players[targetPlayerIndex].sanity, 3)
            })

            it('should report a star was rolled', () => {
              assert.equal(attackMessage, response.message.substring(0, attackMessage.length))
            })

            it('should leave the attacker at three sanity', () => {
              assert.equal(response.gameState.players[currentPlayerIndex].sanity, 3)
            })

            it('should report a star was rolled in response', () => {
              assert.equal(response.message.substring(attackMessage.length), '<@196004823802445824> responded with the ancient stars shining, but Cthulu has not stolen any sanity.')
            })

            it('should leave cthulu at zero sanity', () => {
              assert.equal(response.gameState.cthulu, 0)
            })

            it('should set the game state to be awaiting an attack', () => {
              assert.equal(response.gameState.currentAction, CthuluDice.STATES.CHOOSE_TARGET)
            })

            it('should move to the next player', () => {
              assert.equal(response.gameState.currentPlayer, targetPlayerIndex)
            })
          })

          describe('and a cthulu is rolled in response', () => {
            beforeEach(() => {
              random.setRandom(0.99)
              response = subject.run(currentPlayer, content, gameState)
            })

            it('should remove one sanity from the target', () => {
              assert.equal(response.gameState.players[targetPlayerIndex].sanity, 2)
            })

            it('should report a star was rolled', () => {
              assert.equal(attackMessage, response.message.substring(0, attackMessage.length))
            })

            it('should remove one sanity from the attacker', () => {
              assert.equal(response.gameState.players[currentPlayerIndex].sanity, 2)
            })

            it('should remove one sanity from the other player', () => {
              assert.equal(response.gameState.players[currentPlayerIndex + 2].sanity, 2)
            })

            it('should report a cthulu was rolled in response', () => {
              assert.equal(response.message.substring(attackMessage.length), '<@196004823802445824> responded with awakening Cthulu! @everyone loses a sanity to Cthulu!')
            })

            it('should give cthulu four sanity', () => {
              assert.equal(response.gameState.cthulu, 3)
            })

            it('should set the game state to be awaiting an attack', () => {
              assert.equal(response.gameState.currentAction, CthuluDice.STATES.CHOOSE_TARGET)
            })

            it('should move to the next player', () => {
              assert.equal(response.gameState.currentPlayer, targetPlayerIndex)
            })
          })
        })
        describe('and cthulu has a sanity', () => {
          const attackMessage = '<@201981727873171456> rolled an ancient star! <@201981727873171456> gains a sanity from Cthulu.\n'
          beforeEach(() => {
            gameState.cthulu = 1
          })

          describe('and a yellow sign is rolled in response', () => {
            beforeEach(() => {
              random.setRandom(0.2)
              response = subject.run(currentPlayer, content, gameState)
            })

            it('should leave the target at three sanity', () => {
              assert.equal(response.gameState.players[targetPlayerIndex].sanity, 3)
            })

            it('should report a star was rolled', () => {
              assert.equal(attackMessage, response.message.substring(0, attackMessage.length))
            })

            it('should leave the attacker at three sanity', () => {
              assert.equal(response.gameState.players[currentPlayerIndex].sanity, 3)
            })

            it('should report a yellow sign was rolled in response', () => {
              assert.equal(response.message.substring(attackMessage.length), '<@196004823802445824> responded with a yellow sign! <@201981727873171456> loses 1 sanity to Cthulu.')
            })

            it('should leave cthulu at one sanity', () => {
              assert.equal(response.gameState.cthulu, 1)
            })

            it('should move to the next player', () => {
              assert.equal(response.gameState.currentPlayer, targetPlayerIndex)
            })
          })

          describe('and a tentacle is rolled in response', () => {
            beforeEach(() => {
              random.setRandom(0.7)
              response = subject.run(currentPlayer, content, gameState)
            })

            it('should lower the target by one sanity', () => {
              assert.equal(response.gameState.players[targetPlayerIndex].sanity, 2)
            })

            it('should report a star was rolled', () => {
              assert.equal(attackMessage, response.message.substring(0, attackMessage.length))
            })

            it('should increase the attacker to five sanity', () => {
              assert.equal(response.gameState.players[currentPlayerIndex].sanity, 5)
            })

            it('should report a tentacle was rolled in response', () => {
              assert.equal(response.message.substring(attackMessage.length), '<@196004823802445824> responded with a tentacle! <@196004823802445824> loses 1 sanity to <@201981727873171456>.')
            })

            it('should reduce cthulu by one', () => {
              assert.equal(response.gameState.cthulu, 0)
            })

            it('should move to the next player', () => {
              assert.equal(response.gameState.currentPlayer, targetPlayerIndex)
            })
          })

          describe('and an eye is rolled in response', () => {
            beforeEach(() => {
              random.setRandom(0.8)
              response = subject.run(currentPlayer, content, gameState)
            })

            it('should leave the target at three', () => {
              assert.equal(response.gameState.players[targetPlayerIndex].sanity, 3)
            })

            it('should report a star was rolled', () => {
              assert.equal(attackMessage, response.message.substring(0, attackMessage.length))
            })

            it('should increase the attacker by one sanity', () => {
              assert.equal(response.gameState.players[currentPlayerIndex].sanity, 4)
            })

            it('should report an eye was rolled in response', () => {
              assert.equal(response.message.substring(attackMessage.length), '<@196004823802445824> responded with opening the eye! What do you want to do, <@196004823802445824>?')
            })

            it('should reduce cthulu by one', () => {
              assert.equal(response.gameState.cthulu, 0)
            })

            it('should set the game state to be awaiting eye choice', () => {
              assert.equal(response.gameState.currentAction, CthuluDice.STATES.EYE_CHOICE_VICTIM)
            })

            it('should know who should respond', () => {
              assert.equal(response.gameState.eyeChoicePlayer, players[targetPlayerIndex])
            })
          })

          describe('and a star is rolled in response', () => {
            beforeEach(() => {
              random.setRandom(0.9)
              response = subject.run(currentPlayer, content, gameState)
            })

            it('should leave the target at three', () => {
              assert.equal(response.gameState.players[targetPlayerIndex].sanity, 3)
            })

            it('should report a star was rolled', () => {
              assert.equal(attackMessage, response.message.substring(0, attackMessage.length))
            })

            it('should increase the attacker by one sanity', () => {
              assert.equal(response.gameState.players[currentPlayerIndex].sanity, 4)
            })

            it('should report a star was rolled in response', () => {
              assert.equal(response.message.substring(attackMessage.length), '<@196004823802445824> responded with the ancient stars shining, but Cthulu has not stolen any sanity.')
            })

            it('should leave cthulu at zero sanity', () => {
              assert.equal(response.gameState.cthulu, 0)
            })

            it('should set the game state to be awaiting an attack', () => {
              assert.equal(response.gameState.currentAction, CthuluDice.STATES.CHOOSE_TARGET)
            })

            it('should move to the next player', () => {
              assert.equal(response.gameState.currentPlayer, targetPlayerIndex)
            })
          })

          describe('and a cthulu is rolled in response', () => {
            beforeEach(() => {
              random.setRandom(0.99)
              response = subject.run(currentPlayer, content, gameState)
            })

            it('should remove one sanity from the target', () => {
              assert.equal(response.gameState.players[targetPlayerIndex].sanity, 2)
            })

            it('should report a star was rolled', () => {
              assert.equal(attackMessage, response.message.substring(0, attackMessage.length))
            })

            it('should leave the attacker at three', () => {
              assert.equal(response.gameState.players[currentPlayerIndex].sanity, 3)
            })

            it('should remove one sanity from the other player', () => {
              assert.equal(response.gameState.players[currentPlayerIndex + 2].sanity, 2)
            })

            it('should report a cthulu was rolled in response', () => {
              assert.equal(response.message.substring(attackMessage.length), '<@196004823802445824> responded with awakening Cthulu! @everyone loses a sanity to Cthulu!')
            })

            it('should give cthulu three sanity', () => {
              assert.equal(response.gameState.cthulu, 3)
            })

            it('should set the game state to be awaiting an attack', () => {
              assert.equal(response.gameState.currentAction, CthuluDice.STATES.CHOOSE_TARGET)
            })

            it('should move to the next player', () => {
              assert.equal(response.gameState.currentPlayer, targetPlayerIndex)
            })
          })
        })
      })
    })
  })
})()
