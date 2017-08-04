const {FACES, STATES} = require('./cthulu-dice')

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

  if (score === 11) {
    return FACES.STAR
  }

  if (score === 12) {
    return FACES.CTHULU
  }

  throw new Error('Not yet implemented')
}

module.exports = function (gameState, content, message, playerId, math) {
  const targetIndex = findTarget(gameState.players, content)
  const victimName = gameState.players[targetIndex].name

  let dice = roll(math.random())
  switch (dice) {
    case FACES.YELLOW_SIGN:
      gameState.players[targetIndex].sanity--
      message = `${playerId} rolled a yellow sign! ${victimName} loses 1 sanity to Cthulu.\n`
      gameState.cthulu = gameState.cthulu + 1 || 1
      break
    case FACES.TENTACLE:
      gameState.players[targetIndex].sanity--
      gameState.players[gameState.currentPlayer].sanity++
      message += `${playerId} rolled a tentacle! ${victimName} loses 1 sanity to ${playerId}.\n`
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
      message += `${playerId} rolled an ancient star`
      if (gameState.cthulu > 0) {
        gameState.cthulu--
        gameState.players[gameState.currentPlayer].sanity++
        message += `! ${playerId} gains a sanity from Cthulu.`
      } else {
        message += `, but Cthulu has not stolen any sanity.`
      }

      message += '\n'
      break
  }

  dice = roll(math.random())
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
      break
    case FACES.CTHULU:
      message += `${victimName} responded with awakening Cthulu! @everyone loses a sanity to Cthulu!`
      for (let player of gameState.players) {
        player.sanity--
        gameState.cthulu++
      }
      break
  }

  return {message, gameState}
}
