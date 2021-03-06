const { FACES, STATES } = require('./cthulu-dice')

function findTarget (players, target, forEye) {
  for (var i = 0; i < players.length; i++) {
    if (players[i].name === target) {
      if (players[i].sanity === 0) {
        if (forEye) {
          return i
        }
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

module.exports = function (gameState, content, message, playerId, math) {
  let targetIndex = null
  let victimName = null
  let dice = null
  if (gameState.currentAction === STATES.EYE_CHOICE_ATTACKER || gameState.currentAction === STATES.EYE_CHOICE_VICTIM) {
    targetIndex = findTarget(gameState.players, gameState.eyeChoicePlayer, true)
    if (targetIndex === null) {
      return { gameState, message: `You cannot attack ${gameState.eyeChoicePlayer}, they have gone mad.`, err: true }
    }

    if (targetIndex === gameState.currentPlayer) {
      return { gameState, message: `You cannot attack yourself!`, err: true }
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
        return { gameState, message: 'Invalid choice. Your choices are: "yellow sign", "tentacle", "star" or "cthulu"', err: true }
    }
  } else {
    targetIndex = findTarget(gameState.players, content)
    if (targetIndex === null) {
      return { gameState, message: `You cannot attack ${content}, they have gone mad.`, err: true }
    }

    if (targetIndex === gameState.currentPlayer) {
      return { gameState, message: `You cannot attack yourself!`, err: true }
    }

    dice = roll(math.random())
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

      if (gameState.players[gameState.currentPlayer].sanity > 0) {
        // player is not mad
        gameState.players[gameState.currentPlayer].sanity++
      } else {
        gameState.cthulu = gameState.cthulu + 1 || 1
      }

      if (gameState.currentAction === STATES.EYE_CHOICE_ATTACKER || gameState.currentAction === STATES.EYE_CHOICE_VICTIM) {
        message += `${playerId} chose a tentacle! ${victimName} loses 1 sanity`
        if (gameState.players[gameState.currentPlayer].sanity > 0) {
          message += ` to ${playerId}.\n`
        } else {
          message += `. ${playerId} has been driven mad, the sanity goes to Cthulu.\n`
        }
      } else {
        message += `${playerId} rolled a tentacle! ${victimName} loses 1 sanity`
        if (gameState.players[gameState.currentPlayer].sanity > 0) {
          message += ` to ${playerId}.\n`
        } else {
          message += `. ${playerId} has been driven mad, the sanity goes to Cthulu.\n`
        }
      }
      break
    case FACES.EYE:
      gameState.currentAction = STATES.EYE_CHOICE_ATTACKER
      gameState.eyeChoicePlayer = playerId
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
      if (gameState.players[gameState.currentPlayer].sanity > 0) {
        gameState.players[gameState.currentPlayer].sanity++
      } else {
        gameState.cthulu = gameState.cthulu + 1 || 1
      }

      message += `${playerId} responded with a tentacle! ${victimName} loses 1 sanity`
      if (gameState.players[gameState.currentPlayer].sanity > 0) {
        message += ` to ${playerId}.\n`
      } else {
        message += `. ${playerId} has been driven mad, the sanity goes to Cthulu.\n`
      }

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

  return {gameState, message}
}
