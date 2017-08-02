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
    EYE_CHOICE: 'Choosing Eye option'
  }

  const FACES = {
    YELLOW_SIGN: 'Yellow Sign',
    TENTACLE: 'Tentacle',
    EYE: 'Eye'
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
      players: playerObjects
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

    if (gameState.currentAction === STATES.CHOOSE_TARGET) {
      const targetIndex = findTarget(gameState.players, content)
      const victimName = gameState.players[targetIndex].name

      let dice = roll(this.math.random())
      switch (dice) {
        case FACES.YELLOW_SIGN:
          gameState.players[targetIndex].sanity--
          message = `${playerId} rolled a yellow sign! ${victimName} loses 1 sanity to Cthulu.\n`
          gameState.cthulu = gameState.cthulu + 1 || 1
          break
      }

      dice = roll(this.math.random())
      switch (dice) {
        case FACES.YELLOW_SIGN:
          gameState.players[gameState.currentPlayer].sanity--
          message += `${victimName} responded with a yellow sign! ${playerId} loses 1 sanity to Cthulu.`
          gameState.cthulu = gameState.cthulu + 1 || 1
          break
        case FACES.TENTACLE:
          gameState.players[targetIndex].sanity--
          gameState.players[gameState.currentPlayer].sanity++
          message += `${victimName} responded with a tentacle! ${victimName} loses 1 sanity to ${playerId}.`
          break
        case FACES.EYE:
          gameState.currentAction = STATES.EYE_CHOICE
          gameState.eyeChoicePlayer = victimName
          message += `${victimName} responded with opening the eye! What do you want to do, ${victimName}?`
          break
      }
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

  function findTarget (players, target) {
    for (var i = 0; i < players.length; i++) {
      if (players[i].name === target) {
        return i
      }
    }

    return null
  }

  function roll (number) {
    const score = Math.floor(number * 12) + 1
    if (score <= 5) {
      return FACES.YELLOW_SIGN
    }

    if (score > 5 && score <= 9) {
      return FACES.TENTACLE
    }

    if (score === 10) {
      return FACES.EYE
    }

    throw new Error('Not yet implemented')
  }
})()
