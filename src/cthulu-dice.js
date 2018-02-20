(function () {
  const details = {
    players: {
      min: 3,
      max: 6,
      recommended: 4
    },
    title: 'Test Game',
    description: 'Play a game for fun!',
    invite: 'Would you like to play a game?',
    intro: 'Type Start to get started!',
    rules: 'none'
  }

  class CthuluDice {
    constructor (math) {
      this.math = math
    }
  }

  module.exports = CthuluDice

  const STATES = {
    CHOOSE_TARGET: 'Choosing target',
    EYE_CHOICE_VICTIM: 'Victim choosing Eye option',
    EYE_CHOICE_ATTACKER: 'Attacker choosing Eye option',
    WINNER: 'Someone has won',
    DRAW: 'Cthulu has won'
  }

  const FACES = {
    YELLOW_SIGN: 'Yellow Sign',
    TENTACLE: 'Tentacle',
    EYE: 'Eye',
    STAR: 'Star',
    CTHULU: 'Cthulu'
  }

  CthuluDice.STATES = STATES
  CthuluDice.FACES = FACES
  CthuluDice.details = details

  CthuluDice.prototype.init = function (players) {
    if (players.length < details.players.min) {
      throw new Error('Need at least 3 players')
    }
    if (players.length > details.players.max) {
      throw new Error('There can be no more than 6 players')
    }

    let playerObjects = []
    for (var i = 0; i < players.length; i++) {
      const player = players[i]
      playerObjects.push({name: player, sanity: 3})
    }

    let gameState = {
      players: playerObjects,
      cthulu: 0
    }

    gameState.currentPlayer = Math.floor(this.math.random() * gameState.players.length)
    gameState.currentAction = STATES.CHOOSE_TARGET
    return {
      message: `${gameState.players[gameState.currentPlayer].name} is the start player, who do you want to attack?`,
      gameState
    }
  }

  CthuluDice.prototype.run = function (playerId, content, gameState) {
    let message = ''

    if (playerId !== gameState.players[gameState.currentPlayer].name) {
      return {
        message: `${playerId}, it's not your turn yet`,
        gameState
      }
    }

    let attack = {}
    switch (gameState.currentAction) {
      case STATES.CHOOSE_TARGET:
        attack = require('./attack')(gameState, content, message, playerId, this.math)
        message = attack.message
        gameState = attack.gameState
        break
      case STATES.EYE_CHOICE_ATTACKER:
        attack = require('./attack')(gameState, content, message, playerId, this.math)
        message = attack.message
        gameState = attack.gameState
        break
    }

    gameState = nextPlayer(gameState)

    return {
      message,
      gameState
    }
  }

  function nextPlayer (gameState) {
    gameState.currentPlayer++
    if (gameState.currentPlayer >= gameState.players.length) {
      gameState.currentPlayer = 0
    }

    return gameState
  }
})()
