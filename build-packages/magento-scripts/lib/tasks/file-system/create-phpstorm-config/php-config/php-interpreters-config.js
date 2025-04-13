const { nameKey, propertyKey } = require('../keys')

const PHP_INTERPRETERS_COMPONENT_NAME = 'PhpInterpreters'

/**
 * @param {Array<Record<string, any>>} phpConfigs
 * @param {import('../../../../../typings/context').ListrContext} ctx
 * @returns {Promise<Boolean>}
 */
const setupPHPInterpreters = async (phpConfigs, ctx) => {
    let hasChanges = false
    const phpInterpretersComponent = phpConfigs.find(
        (phpConfig) => phpConfig[nameKey] === PHP_INTERPRETERS_COMPONENT_NAME
    )

    const {
        phpWithXdebug: { image: currentInterpreterImage }
    } = ctx.config.docker.getContainers(ctx.ports)

    const defaultPhpInterpreterConfiguration = {
        [nameKey]: currentInterpreterImage,
        [propertyKey('id')]: '2fbe75d5-bc8f-4adb-8e62-ddb0ccee6428',
        [propertyKey('home')]: 'docker://DATA',
        [propertyKey('debugger_id')]: 'php.debugger.XDebug',
        remote_data: {
            [propertyKey('INTERPRETER_PATH')]: 'php',
            [propertyKey('HELPERS_PATH')]: '/opt/.phpstorm_helpers',
            [propertyKey('VALID')]: 'true',
            [propertyKey('RUN_AS_ROOT_VIA_SUDO')]: 'false',
            [propertyKey('DOCKER_ACCOUNT_NAME')]: 'Docker',
            [propertyKey('DOCKER_IMAGE_NAME')]: currentInterpreterImage,
            [propertyKey('DOCKER_REMOTE_PROJECT_PATH')]:
                ctx.config.baseConfig.containerMagentoDir
        }
    }

    if (phpInterpretersComponent) {
        if (!phpInterpretersComponent.interpreters) {
            hasChanges = true
            phpInterpretersComponent.interpreters = {}
        }

        if (!Array.isArray(phpInterpretersComponent.interpreters.interpreter)) {
            hasChanges = true
            phpInterpretersComponent.interpreters.interpreter = [
                phpInterpretersComponent.interpreters.interpreter
            ]
        }

        const phpInterpreterConfiguration =
            phpInterpretersComponent.interpreters.interpreter.find(
                (interpreter) =>
                    interpreter[nameKey] === currentInterpreterImage
            )

        if (!phpInterpreterConfiguration) {
            hasChanges = true
            phpInterpretersComponent.interpreters.interpreter.push(
                defaultPhpInterpreterConfiguration
            )
        } else {
            if (
                phpInterpreterConfiguration[nameKey] !== currentInterpreterImage
            ) {
                hasChanges = true
                phpInterpreterConfiguration[nameKey] = currentInterpreterImage
            }
            if (
                phpInterpreterConfiguration.remote_data[
                    propertyKey('DOCKER_IMAGE_NAME')
                ] !== currentInterpreterImage
            ) {
                hasChanges = true
                phpInterpreterConfiguration.remote_data[
                    propertyKey('DOCKER_IMAGE_NAME')
                ] = currentInterpreterImage
            }

            if (
                phpInterpreterConfiguration.remote_data[
                    propertyKey('DOCKER_REMOTE_PROJECT_PATH')
                ] !== ctx.config.baseConfig.containerMagentoDir
            ) {
                hasChanges = true
                phpInterpreterConfiguration.remote_data[
                    propertyKey('DOCKER_REMOTE_PROJECT_PATH')
                ] = ctx.config.baseConfig.containerMagentoDir
            }
        }
    } else {
        hasChanges = true
        phpConfigs.push({
            [nameKey]: PHP_INTERPRETERS_COMPONENT_NAME,
            interpreters: {
                interpreter: defaultPhpInterpreterConfiguration
            }
        })
    }

    return hasChanges
}

module.exports = setupPHPInterpreters
