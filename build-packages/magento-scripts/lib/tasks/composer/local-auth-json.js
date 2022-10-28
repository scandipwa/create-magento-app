const path = require('path')
const fs = require('fs')
const pathExists = require('../../util/path-exists')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const UnknownError = require('../../errors/unknown-error')
const KnownError = require('../../errors/known-error')

const authJsonPath = path.join(process.cwd(), 'auth.json')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const localAuthJson = () => ({
    task: async (ctx, task) => {
        if (await pathExists(authJsonPath)) {
            task.title = 'Using local auth.json'
            const localAuthJson = await fs.promises.readFile(authJsonPath)

            let localAuthJsonContent
            try {
                localAuthJsonContent = JSON.parse(localAuthJson)
            } catch (e) {
                throw new UnknownError(
                    `Could not parse ./auth.json file as JSON!\n\n${e}`
                )
            }

            if (
                !localAuthJsonContent ||
                !localAuthJsonContent['http-basic'] ||
                !localAuthJsonContent['http-basic']['repo.magento.com']
            ) {
                throw new KnownError(
                    `Your ./auth.json file does not contain the ${logger.style.misc(
                        "{ 'http-basic': { 'repo.magento.com': <> } }"
                    )} field.`
                )
            }

            process.env.COMPOSER_AUTH = JSON.stringify(
                JSON.parse(localAuthJson),
                null,
                0
            )
        }
    },
    options: {
        showTimer: false
    }
})

module.exports = localAuthJson
