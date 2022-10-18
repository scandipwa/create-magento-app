const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const path = require('path')
const KnownError = require('../../errors/known-error')
const getJsonfileData = require('../../util/get-jsonfile-data')
const pathExists = require('../../util/path-exists')

/**
 * @type {(themePath: string) => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const retrieveThemeData = (themePath) => ({
    title: 'Checking theme folder',
    task: async (ctx) => {
        let absoluteThemePath = path.resolve(themePath)

        // validate if theme is located inside magento directory
        if (!absoluteThemePath.includes(process.cwd())) {
            throw new KnownError(`You are trying to link the theme from outside of your Magento project!

This is not supported in ${logger.style.command('magento-scripts')} version 2.

Move your theme inside Magento project!`)
        }

        // check if path not relative
        if (
            !(await pathExists(path.join(absoluteThemePath, 'composer.json')))
        ) {
            // if composer.json is not found, then it's not correct path
            // and we need to test if it's absolute one
            if (await pathExists(path.join(themePath, 'composer.json'))) {
                // if so, use it as absolute path
                absoluteThemePath = themePath
            }
        } else {
            // path is relative, so we use it
            absoluteThemePath = themePath
        }

        const composerData = await getJsonfileData(
            path.join(absoluteThemePath, 'composer.json')
        )

        if (!composerData) {
            throw new KnownError(
                `composer.json file not found in "${themePath}"`
            )
        }

        ctx.themePath = themePath
        ctx.composerData = composerData
        ctx.absoluteThemePath = absoluteThemePath
    }
})

module.exports = retrieveThemeData
