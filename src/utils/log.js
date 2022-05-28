const { Signale } = require('signale');

module.exports = new Signale({
  types: {
    transform: {
      badge: '🎅',
      color: 'blue',
      label: 'transform',
    },
    success: {
      badge: '🔥',
      color: 'green',
      label: 'success'
    }
  }
});