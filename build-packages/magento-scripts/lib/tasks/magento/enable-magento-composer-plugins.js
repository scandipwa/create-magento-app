const path = require('path')
const fs = require('fs')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const semver = require('semver')
const pathExists = require('../../util/path-exists')
const getJsonfileData = require('../../util/get-jsonfile-data')

const vendorPath = path.join(process.cwd(), 'vendor')
const composerJsonPath = path.join(process.cwd(), 'composer.json')

/**
 * @returns {Promise<string[]}
 */
const getInstalledComposerPlugins = async () => {
    const rootVendorFolders = await fs.promises.readdir(vendorPath, {
        encoding: 'utf-8',
        withFileTypes: true
    })

    /** @type {string[]} */
    const init = []
    const composerPlugins = (
        await Promise.all(
            rootVendorFolders.map(async (f) => {
                if (f.isDirectory()) {
                    const vendorDirectoryPath = path.join(vendorPath, f.name)

                    const vendorPackages = await fs.promises.readdir(
                        vendorDirectoryPath,
                        {
                            encoding: 'utf-8',
                            withFileTypes: true
                        }
                    )

                    /**
                     * @type {string[]}
                     */
                    const vendorPackagesComposerPlugins = (
                        await Promise.all(
                            vendorPackages.map(async (p) => {
                                if (p.isDirectory()) {
                                    const vendorPackageComposerJsonPath =
                                        path.join(
                                            vendorDirectoryPath,
                                            p.name,
                                            'composer.json'
                                        )

                                    if (
                                        await pathExists(
                                            vendorPackageComposerJsonPath
                                        )
                                    ) {
                                        /**
                                         *
                                         */
                                        const {
                                            name: vendorPackageName,
                                            type: vendorPackageType
                                        } = JSON.parse(
                                            await fs.promises.readFile(
                                                vendorPackageComposerJsonPath,
                                                {
                                                    encoding: 'utf-8'
                                                }
                                            )
                                        )

                                        if (
                                            vendorPackageType ===
                                            'composer-plugin'
                                        ) {
                                            return vendorPackageName
                                        }

                                        return null
                                    }
                                }

                                return null
                            })
                        )
                    ).filter((p) => typeof p === 'string')

                    return vendorPackagesComposerPlugins
                }

                return null
            })
        )
    )
        .reduce((acc, val) => (val ? acc.concat(val) : acc), init) // flattens the array
        .filter((p) => typeof p === 'string')

    return composerPlugins
}

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const enableMagentoComposerPlugins = () => ({
    task: async (ctx, task) => {
        if (!semver.satisfies(ctx.composerVersion, '^2.2.0')) {
            task.skip()
            return
        }

        task.title = 'Checking allowed Composer plugins...'

        const composerPlugins = await getInstalledComposerPlugins()
        const composerJsonData = await getJsonfileData(composerJsonPath)
        const { config: { 'allow-plugins': allowPlugins = {} } = {} } =
            composerJsonData
        const allowPluginsKeys = Object.keys(allowPlugins)

        const missingPluginsFromAllowPlugins = composerPlugins.filter(
            (plugin) => {
                const [pluginVendor, pluginName] = plugin.split('/')
                return !allowPluginsKeys.some((allowedPlugin) => {
                    const [allowedPluginVendor, allowedPluginName] =
                        allowedPlugin.split('/')
                    if (allowedPluginVendor === pluginVendor) {
                        if (allowedPluginName === '*') {
                            return true
                        }

                        return allowedPluginName === pluginName
                    }

                    return false
                })
            }
        )

        if (
            allowPluginsKeys.length === 0 ||
            missingPluginsFromAllowPlugins.length > 0
        ) {
            /** @type {string[]} */
            const init = []
            const missingVendors = missingPluginsFromAllowPlugins.reduce(
                (acc, val) => {
                    const [pluginVendor] = val.split('/')

                    if (acc.length === 0) {
                        return [pluginVendor]
                    }

                    if (!acc.includes(pluginVendor)) {
                        return [...acc, pluginVendor]
                    }

                    return acc
                },
                init
            )

            const pluginOptions = [
                {
                    name: 'all-individual',
                    message: 'Enable all individually'
                },
                {
                    name: 'manual',
                    message: 'Configure manually'
                },
                {
                    name: 'skip',
                    message: 'Skip this step'
                }
            ]

            if (missingVendors.length === 1) {
                pluginOptions.unshift({
                    name: 'all',
                    message: `Enable all (${logger.style.code(
                        `"${missingVendors[0]}/*"`
                    )})`
                })
            }

            const answerForEnablingPlugins = await task.prompt({
                type: 'Select',
                message: `Composer 2.2 requires manually allowing composer-plugins to run.
Magento requires the following plugins to correctly operate:

${missingPluginsFromAllowPlugins.map((p) => logger.style.code(p)).join('\n')}

Do you want to enable them all or disable some of them?`,
                choices: pluginOptions
            })

            switch (answerForEnablingPlugins.toLowerCase()) {
                case 'all': {
                    composerJsonData.config = {
                        ...(composerJsonData.config || {}),
                        'allow-plugins': {
                            ...allowPlugins,
                            [`${missingVendors[0]}/*`]: true
                        }
                    }

                    await fs.promises.writeFile(
                        composerJsonPath,
                        JSON.stringify(composerJsonData, null, 4),
                        {
                            encoding: 'utf-8'
                        }
                    )
                    break
                }
                case 'all-individual': {
                    composerJsonData.config = {
                        ...(composerJsonData.config || {}),
                        'allow-plugins': {
                            ...allowPlugins,
                            ...missingPluginsFromAllowPlugins.reduce(
                                (acc, val) => ({ ...acc, [val]: true }),
                                {}
                            )
                        }
                    }

                    await fs.promises.writeFile(
                        composerJsonPath,
                        JSON.stringify(composerJsonData, null, 4),
                        {
                            encoding: 'utf-8'
                        }
                    )
                    break
                }
                case 'manual': {
                    const userEnabledPlugins = await task.prompt({
                        type: 'MultiSelect',
                        message: 'Please pick plugins you want to enable!',
                        choices: missingPluginsFromAllowPlugins.map((p) => ({
                            name: p
                        }))
                    })

                    const disabledPlugins = composerPlugins.filter(
                        (p) => !userEnabledPlugins.includes(p)
                    )

                    composerJsonData.config = {
                        ...(composerJsonData.config || {}),
                        'allow-plugins': {
                            ...allowPlugins,
                            ...disabledPlugins.reduce(
                                (acc, val) => ({ ...acc, [val]: false }),
                                {}
                            ),
                            ...userEnabledPlugins.reduce(
                                (acc, val) => ({ ...acc, [val]: true }),
                                {}
                            )
                        }
                    }

                    await fs.promises.writeFile(
                        composerJsonPath,
                        JSON.stringify(composerJsonData, null, 4),
                        {
                            encoding: 'utf-8'
                        }
                    )

                    break
                }
                case 'skip this step': {
                    task.skip()
                    break
                }
                default: {
                    //
                }
            }
        }
    }
})

module.exports = enableMagentoComposerPlugins
