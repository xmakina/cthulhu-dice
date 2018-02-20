const { FACES, STATES } = require('./cthulu-dice')

function findTarget (players, target) {
  for (var i = 0; i < players.length; i++) {
    if (players[i].name === target) {
      if (players[i].sanity === 0) {
        return null
      }
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

  if (score === 11) {
    return FACES.STAR
  }

  if (score === 12) {
    return FACES.CTHULU
  }

  throw new Error('Not yet implemented')
}

function fixSanity (gameState, message) {
  var sanePlayers = []
  for (var i = 0; i < gameState.players.length; i++) {
    if (gameState.players[i].sanity < 0) {
      gameState.players[i].sanity = 0
      message = message + '\n' + gameState.players[i].name + ' has gone mad!'
    } else if (gameState.players[i].sanity > 0) {
      sanePlayers.push(i)
    }
  }

  if (sanePlayers === 1) {
    return {gameState: false, message: 'The winner is ' + gameState.players[sanePlayers[0]].name}
  }

  if (sanePlayers === 0) {
    return {gameState: false, message: 'Everyone has gone mad! All hail Cthulu!'}
  }

  return { gameState, message }
}

module.exports = function (gameState, content, message, playerId, math) {
  let targetIndex = null
  let victimName = null
  let dice = null
  if (gameState.currentAction === STATES.EYE_CHOICE_ATTACKER || gameState.currentAction === STATES.EYE_CHOICE_VICTIM) {
    targetIndex = findTarget(gameState.players, gameState.eyeChoicePlayer)
    if (targetIndex === null) {
      return { gameState, message: 'Invalid choice. You cannot target a player who has gone mad.' }
    }

    victimName = gameState.players[targetIndex].name

    switch (content.toLowerCase()) {
      case 'yellow sign':
        dice = FACES.YELLOW_SIGN
        break
      case 'tentacle':
        dice = FACES.TENTACLE
        break
      case 'star':
        dice = FACES.STAR
        break
      case 'cthulu':
        dice = FACES.CTHULU
        break
      default:
        return { gameState, message: 'Invalid choice. Your choices are: "yellow sign", "tentacle", "star" or "cthulu"' }
    }
  } else {
    dice = roll(math.random())
    targetIndex = findTarget(gameState.players, content)
    if (targetIndex === null) {
      return { gameState, message: `I don't see a player called ${content}` }
    }

    victimName = gameState.players[targetIndex].name
  }

  switch (dice) {
    case FACES.YELLOW_SIGN:
      gameState.players[targetIndex].sanity--
      if (gameState.currentAction === STATES.EYE_CHOICE_ATTACKER || gameState.currentAction === STATES.EYE_CHOICE_VICTIM) {
        message = `${playerId} chose a yellow sign! ${victimName} loses 1 sanity to Cthulu.\n`
      } else {
        message = `${playerId} rolled a yellow sign! ${victimName} loses 1 sanity to Cthulu.\n`
      }

      gameState.cthulu = gameState.cthulu + 1 || 1
      break
    case FACES.TENTACLE:
      gameState.players[targetIndex].sanity--
      gameState.players[gameState.currentPlayer].sanity++
      if (gameState.currentAction === STATES.EYE_CHOICE_ATTACKER || gameState.currentAction === STATES.EYE_CHOICE_VICTIM) {
        message += `${playerId} chose a tentacle! ${victimName} loses 1 sanity to ${playerId}.\n`
      } else {
        message += `${playerId} rolled a tentacle! ${victimName} loses 1 sanity to ${playerId}.\n`
      }
      break
    case FACES.EYE:
      gameState.currentAction = STATES.EYE_CHOICE_ATTACKER
      gameState.eyeChoicePlayer = victimName
      message += `${playerId} has opened The Eye! What do you want to do, ${playerId}?`
      return {
        message,
        gameState
      }
    case FACES.STAR:
      if (gameState.currentAction === STATES.EYE_CHOICE_ATTACKER || gameState.currentAction === STATES.EYE_CHOICE_VICTIM) {
        message += `${playerId} chose an ancient star`
      } else {
        message += `${playerId} rolled an ancient star`
      }
      if (gameState.cthulu > 0) {
        gameState.cthulu--
        gameState.players[gameState.currentPlayer].sanity++
        message += `! ${playerId} gains a sanity from Cthulu.`
      } else {
        message += `, but Cthulu has not stolen any sanity.`
      }

      message += '\n'
      break
    case FACES.CTHULU:
      message += `${playerId} has awoken Cthulu! @everyone loses a sanity!\n`
      for (let player of gameState.players) {
        player.sanity--
        gameState.cthulu++
      }
      break
  }

  dice = roll(math.random())
  switch (dice) {
    case FACES.YELLOW_SIGN:
      gameState.players[gameState.currentPlayer].sanity--
      message += `${victimName} responded with a yellow sign! ${playerId} loses 1 sanity to Cthulu.`
      gameState.cthulu = gameState.cthulu + 1 || 1
      gameState.currentAction = STATES.CHOOSE_TARGET
      break
    case FACES.TENTACLE:
      gameState.players[targetIndex].sanity--
      gameState.players[gameState.currentPlayer].sanity++
      message += `${victimName} responded with a tentacle! ${victimName} loses 1 sanity to ${playerId}.`
      gameState.currentAction = STATES.CHOOSE_TARGET
      break
    case FACES.EYE:
      gameState.currentAction = STATES.EYE_CHOICE_VICTIM
      gameState.eyeChoicePlayer = victimName
      message += `${victimName} responded with opening the eye! What do you want to do, ${victimName}?`
      break
    case FACES.STAR:
      message += `${victimName} responded with the ancient stars shining`
      if (gameState.cthulu > 0) {
        gameState.cthulu--
        gameState.players[targetIndex].sanity++
        message += `! ${victimName} gains a sanity from Cthulu.`
      } else {
        message += `, but Cthulu has not stolen any sanity.`
      }
      gameState.currentAction = STATES.CHOOSE_TARGET
      break
    case FACES.CTHULU:
      message += `${victimName} responded with awakening Cthulu! @everyone loses a sanity to Cthulu!`
      for (let player of gameState.players) {
        player.sanity--
        gameState.cthulu++
      }
      gameState.currentAction = STATES.CHOOSE_TARGET
      break
  }

  return fixSanity(gameState, message)
}
