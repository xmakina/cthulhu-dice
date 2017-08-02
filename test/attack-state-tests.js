/* eslint-env mocha */
(function () {
  const CthuluDice = require('../index.js')
  const Random = require('./utils/mock-random')
  const assert = require('assert')

  describe('when attacking', () => {
    let response = null
    let players = []
    let currentPlayerIndex = 0
    let gameState = {}
    let random = new Random()
    let subject = new CthuluDice(random)

    beforeEach(() => {
      random = new Random()
      subject = new CthuluDice(random)

      players = [ '<@201981727873171456>', '<@196004823802445824>', '<@135478939966504970>' ]
      currentPlayerIndex = 0
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
        currentAction: CthuluDice.STATES.CHOOSE_TARGET
      }
    })

    describe('a valid target', () => {
      let currentPlayer = players[currentPlayerIndex]
      let content = players[currentPlayerIndex + 1]

      beforeEach(() => {
        currentPlayer = players[currentPlayerIndex]
        content = players[currentPlayerIndex + 1]
      })

      describe('and a yellow sign is rolled', () => {
        beforeEach(() => {
          random.setRandom(0.2)
        })

        describe('and a yellow sign is rolled in response', () => {
          beforeEach(() => {
            random.setRandom(0.2)
            response = subject.run(currentPlayer, content, gameState)
          })

          it('should lower the target by one sanity', () => {
            assert.equal(response.gameState.players[currentPlayerIndex + 1].sanity, 2)
          })

          it('should report a yellow sign was rolled', () => {
            assert.equal(response.message.indexOf('<@201981727873171456> rolled a yellow sign! <@196004823802445824> loses 1 sanity to Cthulu.'), 0)
          })

          it('should lower the attacker by one sanity', () => {
            assert.equal(response.gameState.players[currentPlayerIndex].sanity, 2)
          })

          it('should report a yellow sign was rolled in response', () => {
            assert.equal(response.message.indexOf('<@196004823802445824> responded with a yellow sign! <@201981727873171456> loses 1 sanity to Cthulu.'), 92)
          })

          it('should add one sanity to cthulu', () => {
            assert.equal(response.gameState.cthulu, 2)
          })
        })

        describe('and a tentacle is rolled in response', () => {
          beforeEach(() => {
            random.setRandom(0.7)
            response = subject.run(currentPlayer, content, gameState)
          })

          it('should lower the target by two sanity', () => {
            assert.equal(response.gameState.players[currentPlayerIndex + 1].sanity, 1)
          })

          it('should report a yellow sign was rolled', () => {
            assert.equal(response.message.indexOf('<@201981727873171456> rolled a yellow sign! <@196004823802445824> loses 1 sanity to Cthulu.'), 0)
          })

          it('should increase the attacker to four sanity', () => {
            assert.equal(response.gameState.players[currentPlayerIndex].sanity, 4)
          })

          it('should report a tentacle was rolled in response', () => {
            assert.equal(response.message.indexOf('<@196004823802445824> responded with a tentacle! <@196004823802445824> loses 1 sanity to <@201981727873171456>.'), 92)
          })

          it('should add one sanity to cthulu', () => {
            assert.equal(response.gameState.cthulu, 1)
          })
        })
      })

      // describe('and a tentacle is rolled', () => {
      //   beforeEach(() => {
      //     random.setRandom(0.1)
      //   })

      //   it('should steal one sanity from the target', () => {
      //     assert.equal(response.gameState.players[currentPlayerIndex + 1].sanity, 2)
      //   })

      //   it('should steal add one sanity to the current player', () => {
      //     assert.equal(response.gameState.players[currentPlayerIndex].sanity, 4)
      //   })
      // })
    })
  })
})()
