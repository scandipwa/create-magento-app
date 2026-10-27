const path = require('path')

// Tests reach into the sibling package by path instead of depending on it, so
// they run straight from a checkout without an install (see lint.yml).
const packageDir = path.join(__dirname, '..', 'magento-scripts')

module.exports = {
    packageDir,
    libDir: path.join(packageDir, 'lib')
}
