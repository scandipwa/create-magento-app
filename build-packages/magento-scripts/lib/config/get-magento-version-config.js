const { allVersions, defaultConfiguration } = require('./versions')
const getInstalledMagentoVersion = require('../util/get-installed-magento-version')
const sleep = require('../util/sleep')
const scandipwaMagentoVersionMapping = require('./scandipwa-versions')

const longestMagentoName = allVersions
    .map(({ name }) => name)
    .reduce((acc, val) => (val.length > acc ? val.length : acc), 0)

/**
 * @param {{ name: string }} version
 * @returns {string}
 */
const getMagentoVersionMessage = (version) => {
    const pureMagentoVersion = version.name.replace(/-p[0-9]+$/i, '')
    if (scandipwaMagentoVersionMapping[pureMagentoVersion]) {
        const padding = longestMagentoName - version.name.length
        return `${version.name}${' '.repeat(
            padding
        )} (Supported ScandiPWA version: ${
            scandipwaMagentoVersionMapping[pureMagentoVersion]
        })`
    }

    return version.name
}

/**
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const getMagentoVersion = () => ({
    task: async (ctx, task) => {
        const {
            throwMagentoVersionMissing = false,
            projectPath = process.cwd()
        } = ctx
        let { magentoVersion } = ctx

        if (!magentoVersion) {
            task.title = 'Loading Magento version'
            try {
                magentoVersion = await getInstalledMagentoVersion(projectPath)
            } catch (e) {
                if (throwMagentoVersionMissing) {
                    throw e
                }
                if (allVersions.length === 1) {
                    const { magentoVersion: defaultMagentoVersion } =
                        defaultConfiguration
                    magentoVersion = defaultMagentoVersion
                } else {
                    let promptSkipper = false
                    const timer = async () => {
                        for (let i = 5 * 60; i !== 0; i--) {
                            await sleep(1000)
                            if (promptSkipper) {
                                return null
                            }
                            task.title = `Checking app config (${i} sec left...)`
                        }
                        task.cancelPrompt()
                        return defaultConfiguration.magento
                    }

                    magentoVersion = await Promise.race([
                        task.prompt({
                            type: 'Select',
                            message: 'Choose Magento Version',
                            name: 'magentoVersion',
                            choices: allVersions.map((version) => ({
                                name: version.name,
                                message: getMagentoVersionMessage(version)
                            })),
                            initial: defaultConfiguration.name,
                            scroll: true,
                            limit: 7,
                            footer: `(use arrow keys to select other magento versions, in total we support ${allVersions.length} versions)`
                        }),
                        timer()
                    ])

                    promptSkipper = true
                }
            }
            task.title = `Using Magento ${magentoVersion}`
        }

        ctx.magentoVersion = magentoVersion
    }
})

module.exports = getMagentoVersion
