const Joi = require('joi')
const semver = require('semver')
const KnownError = require('../errors/known-error')
const pathExistsSync = require('./path-exists-sync')

/**
 * @type {Joi.CustomValidator<string>}
 */
const fileExistsValidator = (value) => {
    const fileExists = pathExistsSync(value)

    if (!fileExists) {
        throw new KnownError(`File "${value}" does not exists!`)
    }

    return undefined
}

/**
 * @type {Joi.CustomValidator<string>}
 */
const versionValidator = (value, helpers) => {
    const isValid = semver.valid(value)

    if (!isValid) {
        return helpers.error('any.invalid')
    }

    return undefined
}

/**
 * @type {Joi.ObjectSchema<import('../../typings').CMAConfiguration['magento']>}
 */
const magentoSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().required(),
    user: Joi.string().required(),
    password: Joi.string().required(),
    adminuri: Joi.string().required(),
    mode: Joi.string().valid(
        'default',
        'developer',
        'production',
        'maintenance'
    ),
    edition: Joi.string().valid('community', 'enterprise')
})

/**
 * @type {Joi.ObjectSchema<import('../../typings').SSLConfiguration>}
 */
const sslSchema = Joi.object({
    enabled: Joi.bool().required(),
    ssl_certificate: Joi.string().required(),
    ssl_certificate_key: Joi.string().required()
})

/**
 * @type {Joi.ObjectSchema<import('../../typings/index').PHPExtensions>}
 */
const phpExtensionConfiguration = Joi.object().pattern(
    Joi.string(),
    Joi.object({
        name: Joi.string().optional(),
        alternativeName: Joi.array().items(Joi.string()).optional(),
        command: Joi.alternatives().try(Joi.func(), Joi.string()).optional(),
        dependencies: Joi.array().items(Joi.string()).optional(),
        version: Joi.string().optional()
    }).unknown()
)

/**
 * @type {Joi.ObjectSchema<import('../../typings').PHPConfiguration>}
 */
const phpConfigurationSchema = Joi.object({
    baseImage: Joi.string().optional(),
    debugImage: Joi.string().optional(),
    fpmConfigTemplate: Joi.string().optional(),
    configTemplate: Joi.string().optional().custom(fileExistsValidator),
    debugTemplate: Joi.string().optional().custom(fileExistsValidator),
    extensions: phpExtensionConfiguration.optional()
})

/**
 * @type {Joi.ObjectSchema<import('../../typings').NginxConfiguration>}
 */
const nginxConfigurationSchema = Joi.object({
    image: Joi.string().optional(),
    configTemplate: Joi.string().optional().custom(fileExistsValidator)
})

/**
 * @type {Joi.ObjectSchema<import('../../typings').VarnishConfiguration>}
 */
const varnishConfigurationSchema = Joi.object({
    enabled: Joi.boolean().optional(),
    healthCheck: Joi.boolean().optional(),
    image: Joi.string().optional(),
    configTemplate: Joi.string().optional().custom(fileExistsValidator)
})

/**
 * @type {Joi.ObjectSchema<import('../../typings').ServiceWithImage>}
 */
const serviceConfigurationSchema = Joi.object({
    image: Joi.string().optional()
})

/**
 * @type {Joi.ObjectSchema<import('../../typings').MariaDBConfiguration>}
 */
const mariadbConfigurationSchema = Joi.object({
    image: Joi.string().optional(),
    useOptimizerSwitch: Joi.alternatives()
        .try(Joi.string(), Joi.boolean())
        .optional()
})

/**
 * @type {Joi.ObjectSchema<import('../../typings').ElasticSearchConfiguration>}
 */
const elasticsearchConfigurationSchema = Joi.object({
    image: Joi.string().optional(),
    env: Joi.object().optional()
})

/**
 * @type {Joi.ObjectSchema<import('../../typings').ComposerConfiguration>}
 */
const composerConfigurationSchema = Joi.object({
    version: Joi.string()
        .optional()
        .custom((value, helper) => {
            if (['1', '2'].includes(value)) {
                return undefined
            }

            return versionValidator(value, helper)
        }),
    plugins: Joi.object().pattern(
        Joi.string(),
        Joi.object({
            version: Joi.string().optional(),
            options: Joi.string().optional(),
            enabled: Joi.boolean().optional()
        }).unknown()
    )
})

/**
 * @type {Joi.ObjectSchema<import('../../typings').CMAConfiguration['configuration']>}
 */
const configurationSchema = Joi.object({
    php: phpConfigurationSchema.optional(),
    nginx: nginxConfigurationSchema.optional(),
    mariadb: mariadbConfigurationSchema.optional(),
    elasticsearch: elasticsearchConfigurationSchema.optional(),
    redis: serviceConfigurationSchema.optional(),
    composer: composerConfigurationSchema.optional(),
    varnish: varnishConfigurationSchema.optional(),
    sslTerminator: nginxConfigurationSchema.optional(),
    maildev: serviceConfigurationSchema.optional()
})

/**
 * @type {Joi.ObjectSchema<import('../../typings').CMAConfiguration>}
 */
const configFileSchema = Joi.object({
    magento: magentoSchema.required(),
    host: Joi.string().optional(),
    ssl: sslSchema.optional(),
    prefix: Joi.bool().optional(),
    configuration: configurationSchema.required()
})

/**
 * @type {Joi.ObjectSchema<{ useNonOverlappingPorts:boolean, analytics:boolean }>}
 */
const systemConfigurationSchema = Joi.object({
    useNonOverlappingPorts: Joi.bool().optional(),
    analytics: Joi.bool().optional()
})

module.exports = {
    configFileSchema,
    systemConfigurationSchema
}
