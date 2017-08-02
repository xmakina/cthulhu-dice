(function () {
  class MockRandom {
  }

  let nextRandom = []

  MockRandom.prototype.random = () => {
    return nextRandom.shift() || Math.random()
  }

  MockRandom.prototype.setRandom = (value) => {
    nextRandom.push(value)
  }

  module.exports = MockRandom
})()
