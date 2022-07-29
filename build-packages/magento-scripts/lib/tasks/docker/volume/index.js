const volumeApi = require('./volume-api');
const { createVolumes, removeVolumes } = require('./tasks');

module.exports = {
    createVolumes,
    removeVolumes,
    volumeApi
};
