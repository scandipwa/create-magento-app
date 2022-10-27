const { propertyKey } = require('../keys')

const PHP_DOCKER_CONTAINER_SETTINGS_COMPONENT_NAME =
    'PhpDockerContainerSettings'

/**
 * @param {Array} phpDockerSettingsConfigs
 * @param {import('../../../../../typings/context').ListrContext} ctx
 * @returns {Promise<Boolean>}
 */
const setupPHPDockerContainerSettingsConfig = async (
    phpDockerSettingsConfigs,
    ctx
) => {
    let hasChanges = false
    const phpDockerContainerSettingsComponent = phpDockerSettingsConfigs.find(
        (phpDockerSettingsConfig) =>
            phpDockerSettingsConfig[propertyKey('name')] ===
            PHP_DOCKER_CONTAINER_SETTINGS_COMPONENT_NAME
    )

    const defaultList = {
        map: {
            entry: {
                [propertyKey('key')]: '2fbe75d5-bc8f-4adb-8e62-ddb0ccee6428',
                value: {
                    DockerContainerSettings: {
                        option: [
                            {
                                [propertyKey('name')]: 'runCliOptions',
                                [propertyKey('value')]: ''
                            },
                            {
                                [propertyKey('name')]: 'version',
                                [propertyKey('value')]: '1'
                            },
                            {
                                [propertyKey('name')]: 'volumeBindings',
                                list: {
                                    DockerVolumeBindingImpl: {
                                        option: [
                                            {
                                                [propertyKey('name')]:
                                                    'containerPath',
                                                [propertyKey('value')]:
                                                    ctx.config.baseConfig
                                                        .containerMagentoDir
                                            },
                                            {
                                                [propertyKey('name')]:
                                                    'hostPath',
                                                [propertyKey('value')]:
                                                    '$PROJECT_DIR$'
                                            }
                                        ]
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }
    }

    if (!phpDockerContainerSettingsComponent) {
        hasChanges = true
        phpDockerSettingsConfigs.push({
            [propertyKey('name')]: PHP_DOCKER_CONTAINER_SETTINGS_COMPONENT_NAME,
            list: defaultList
        })
    }

    return hasChanges
}

module.exports = setupPHPDockerContainerSettingsConfig
