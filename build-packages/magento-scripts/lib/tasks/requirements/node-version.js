const semver = require('semver')
const KnownError = require('../../errors/known-error')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkNodeVersion = () => ({
    title: 'Checking Node.js',
    task: (ctx, task) => {
        const { node } = process.versions

        if (!semver.gte(node, '12.0.0')) {
            throw new KnownError(
                `Your Node.js version is out of date!
You need to upgrade Node.js to at lease version 12 to work with this software!`
            )
        }

        task.title = `Using Node.js version ${node} ${process.arch}`
    }
})

module.exports = checkNodeVersion
