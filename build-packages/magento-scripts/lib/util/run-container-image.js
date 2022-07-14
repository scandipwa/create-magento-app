const { execAsync } = require('./exec-async');

const runContainerImage = async (imageWithTag, command) => execAsync(`docker run ${imageWithTag} ${command}`);

module.exports = {
    runContainerImage
};
