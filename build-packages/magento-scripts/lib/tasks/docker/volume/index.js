const volumeApi = require('./volume-api')
const { createVolumes, removeVolumes, removeLocalVolumes } = require('./tasks')

module.exports = {
    createVolumes,
    removeVolumes,
    removeLocalVolumes,
    volumeApi
}
