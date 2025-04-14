const valkey80 = require('./valkey-8.0')
const valkey81 = require('./valkey-8.1')

module.exports = {
    redis50: require('./redis-5.0'),
    redis60: require('./redis-6.0'),
    redis62: require('./redis-6.2'),
    redis70: require('./redis-7.0'),
    redis72: require('./redis-7.2'),
    valkey80,
    valkey81
}
