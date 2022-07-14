const path = require('path');
const fs = require('fs');

const phpExtensionInstallationInstructions = fs.readdirSync(__dirname, {
    withFileTypes: true
})
    .filter((f) => f.isFile())
    .filter((f) => f.name !== 'index.js')
    .map((f) => require(path.join(__dirname, f.name)));

module.exports = {
    phpExtensionInstallationInstructions
};
