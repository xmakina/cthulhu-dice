(function () {
  const details = {
    players: {
      min: 3,
      max: 6,
      recommended: 4
    },
    title: 'Cthulhu Dice',
    description: 'Serving Cthulhu is fun... except for all those other cultists out to get you. So get them first!',
    invite: 'Be stabbed at from Hell\'s Heart?',
    intro: '',
    rules: 'Players choose a target, roll the dice and do the related action. Then their victim does the same. Play then moves to the next player to choose a target.'
  }

  class CthuluDice {
    constructor (math) {
      if (math) {
        this.math = math
      } else {
        this.math = Math
      }
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
      message: [`${gameState.players[gameState.currentPlayer].name} is the start player, who do you want to attack?`],
      gameState
    }
  }

  CthuluDice.prototype.run = function (playerId, content, gameState) {
    let message = []

    if (content.toLowerCase() === 'quit') {
      return {
        message: [`${playerId} has conceded the game`],
        gameState: false
      }
    }

    if (gameState.currentAction !== STATES.EYE_CHOICE_ATTACKER && gameState.currentAction !== STATES.EYE_CHOICE_VICTIM) {
      if (playerId !== gameState.players[gameState.currentPlayer].name) {
        return {
          message: [`${playerId}, it's not your turn yet`],
          gameState
        }
      }
    } else {
      // we're choosing an eye
      if (playerId !== gameState.eyeChoicePlayer) {
        return {
          message: [`${playerId}, please wait for ${gameState.eyeChoicePlayer} to choose`],
          gameState
        }
      }
    }

    let attack = {}
    switch (gameState.currentAction) {
      case STATES.CHOOSE_TARGET:
        attack = require('./attack')(gameState, content, message, playerId, this.math)
        message = [attack.message]
        gameState = attack.gameState
        break
      case STATES.EYE_CHOICE_ATTACKER:
        attack = require('./attack')(gameState, content, message, playerId, this.math)
        message = [attack.message]
        gameState = attack.gameState
        break
      case STATES.EYE_CHOICE_VICTIM:
        attack = require('./attack')(gameState, content, message, playerId, this.math)
        message = [attack.message]
        gameState = attack.gameState
        break
    }

    console.log('gameState.currentAction', gameState.currentAction)
    if (attack.err === undefined && (gameState.currentAction !== STATES.EYE_CHOICE_ATTACKER && gameState.currentAction !== STATES.EYE_CHOICE_VICTIM)) {
      gameState = nextPlayer(gameState)

      var finalForm = fixSanity(gameState, message)

      message = finalForm.message
      gameState = finalForm.gameState

      if (gameState === false) {
        return {
          message,
          gameState
        }
      }

      for (var i = 0; i < gameState.players.length; i++) {
        var player = gameState.players[i]
        message.push(`${player.name} has ${player.sanity} sanity remaining`)
      }

      message.push(`It is now ${gameState.players[gameState.currentPlayer].name}'s turn`)
    }

    return {
      message,
      gameState
    }
  }

  function fixSanity (gameState, message) {
    if (!message) {
      message = []
    }

    var sanePlayers = []
    for (var i = 0; i < gameState.players.length; i++) {
      if (gameState.players[i].sanity <= 0) {
        gameState.players[i].sanity = 0
        message.push(gameState.players[i].name + ' has gone mad!')
      } else if (gameState.players[i].sanity > 0) {
        sanePlayers.push(i)
      }
    }

    if (sanePlayers.length === 1) {
      message.push(`The winner is ${gameState.players[sanePlayers[0]].name}`)
      return {gameState: false, message}
    }

    if (sanePlayers.length === 0) {
      return {gameState: false, message: ['Everyone has gone mad! All hail Cthulu!']}
    }

    return { gameState, message }
  }

  function nextPlayer (gameState) {
    gameState.currentPlayer++
    if (gameState.currentPlayer >= gameState.players.length) {
      gameState.currentPlayer = 0
    }

    return gameState
  }
})()
