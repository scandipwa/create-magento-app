const path = require('path')
const fs = require('fs')
const hjson = require('hjson')
const pathExists = require('../../util/path-exists')
const setConfigFile = require('../../util/set-config')
const UnknownError = require('../../errors/unknown-error')

const listenForXDebugConfigName = 'Listen for XDebug'

const vscodeLaunchConfigPath = path.join(
    process.cwd(),
    '.vscode',
    'launch.json'
)

/**
 * @param {import('../../../typings/context').ListrContext} ctx
 */
const addPHPDebugConfig = (vscodeLaunchConfig, ctx) => {
    const { ports } = ctx
    const phpXDebugConfig = vscodeLaunchConfig.configurations.find(
        ({ name }) => name === listenForXDebugConfigName
    )

    let hasChanges = false

    const newConfiguration = {
        name: listenForXDebugConfigName,
        type: 'php',
        request: 'launch',
        // port: xdebugPort,
        port: ports.xdebug,
        pathMappings: {
            // eslint-disable-next-line no-template-curly-in-string
            [ctx.config.baseConfig.containerMagentoDir]: '${workspaceFolder}'
        }
    }

    if (phpXDebugConfig && phpXDebugConfig.runtimeExecutable) {
        vscodeLaunchConfig.configurations =
            vscodeLaunchConfig.configurations.filter(
                ({ name }) => name !== listenForXDebugConfigName
            )

        vscodeLaunchConfig.configurations.push(newConfiguration)

        return true
    }
    if (!phpXDebugConfig) {
        vscodeLaunchConfig.configurations.push(newConfiguration)

        return true
    }

    if (!phpXDebugConfig.port || phpXDebugConfig.port !== ports.xdebug) {
        phpXDebugConfig.port = ports.xdebug

        hasChanges = true
    }

    if (
        !phpXDebugConfig.pathMappings ||
        !phpXDebugConfig.pathMappings[ctx.config.baseConfig.containerMagentoDir]
    ) {
        phpXDebugConfig.pathMappings = {
            // eslint-disable-next-line no-template-curly-in-string
            [ctx.config.baseConfig.containerMagentoDir]: '${workspaceFolder}'
        }

        hasChanges = true
    }

    return hasChanges
}

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createVSCodeConfig = () => ({
    title: 'Setting VSCode config',
    task: async (ctx, task) => {
        if (await pathExists(vscodeLaunchConfigPath)) {
            const vscodeLaunchConfig = hjson.parse(
                await fs.promises.readFile(vscodeLaunchConfigPath, 'utf-8'),
                {
                    keepWsc: true
                }
            )

            const vscodeConfigEdited = addPHPDebugConfig(
                vscodeLaunchConfig,
                ctx
            )

            // if vscode config is up-to-date, skip task
            if (!vscodeConfigEdited) {
                task.skip()
                return
            }

            const result = hjson.stringify(vscodeLaunchConfig, {
                keepWsc: true,
                bracesSameLine: true,
                separator: true,
                quotes: 'all'
            })

            await fs.promises.writeFile(vscodeLaunchConfigPath, result)

            return
        }

        if (!(await pathExists(path.join(process.cwd(), '.vscode')))) {
            try {
                await fs.promises.mkdir(path.join(process.cwd(), '.vscode'))
            } catch (e) {
                throw new UnknownError(
                    `Unable to creade .vscode directory in your project!\n\n${e}`
                )
            }
        }

        try {
            const vscodeLaunchConfigTemplatePath = path.join(
                ctx.config.baseConfig.templateDir,
                'vscode-launch.template.json'
            )
            await setConfigFile({
                template: vscodeLaunchConfigTemplatePath,
                configPathname: vscodeLaunchConfigPath,
                templateArgs: {
                    XDebugPort: ctx.ports.xdebug,
                    baseConfig: ctx.config.baseConfig
                }
            })
        } catch (e) {
            throw new UnknownError(
                `Unexpected error accrued during launch.json config creation!\n\n${e}`
            )
        }
    },
    exitOnError: false
})

module.exports = createVSCodeConfig
