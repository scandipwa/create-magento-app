const Joi = require('joi');
const semver = require('semver');
const pathExistsSync = require('./path-exists-sync');

const fileExistsValidator = (value) => {
    const fileExists = pathExistsSync(value);

    if (!fileExists) {
        throw new Error(`File "${value}" does not exists!`);
    }

    return undefined;
};

const versionValidator = (value, helpers) => {
    const isValid = semver.valid(value);

    if (!isValid) {
        return helpers.error('any.invalid');
    }

    return undefined;
};

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
    mode: Joi.string().valid('default', 'developer', 'production', 'maintenance'),
    edition: Joi.string().valid('community', 'enterprise')
});

/**
 * @type {Joi.ObjectSchema<import('../../typings').SSLConfiguration>}
 */
const sslSchema = Joi.object({
    enabled: Joi.bool().required(),
    ssl_certificate: Joi.string().required(),
    ssl_certificate_key: Joi.string().required()
});

const phpExtensionConfiguration = Joi.object()
    .pattern(
        Joi.string(),
        Joi.object({
            version: Joi.string().optional()
        })
            .unknown()
    );

/**
 * @type {Joi.ObjectSchema<import('../../typings').PHPConfiguration>}
 */
const phpConfigurationSchema = Joi.object({
    version: Joi.string().optional().custom(versionValidator),
    configTemplate: Joi.string().optional().custom(fileExistsValidator),
    extensions: phpExtensionConfiguration.optional(),
    disabledExtensions: Joi.array().items(Joi.string())
});

/**
 * @type {Joi.ObjectSchema<import('../../typings').NginxConfiguration>}
 */
const nginxConfigurationSchema = Joi.object({
    version: Joi.string().optional(),
    configTemplate: Joi.string().optional().custom(fileExistsValidator)
});

/**
 * @type {Joi.ObjectSchema<import('../../typings').NginxConfiguration>}
 */
const varnishConfigurationSchema = Joi.object({
    enabled: Joi.boolean().optional(),
    version: Joi.string().optional(),
    configTemplate: Joi.string().optional().custom(fileExistsValidator)
});

/**
 * @type {Joi.ObjectSchema<import('../../typings').ServiceWithVersion>}
 */
const serviceConfigurationSchema = Joi.object({
    version: Joi.string().optional()
});

/**
 * @type {Joi.ObjectSchema<import('../../typings').CMAConfiguration['configuration']['composer']>}
 */
const composerConfigurationSchema = Joi.object({
    version: Joi.string().optional().custom((value) => {
        if (['1', '2'].includes(value)) {
            return undefined;
        }

        return versionValidator(value);
    })
});

/**
 * @type {Joi.ObjectSchema<import('../../typings').CMAConfiguration['configuration']>}
 */
const configurationSchema = Joi.object({
    php: phpConfigurationSchema.optional(),
    nginx: nginxConfigurationSchema.optional(),
    mysql: serviceConfigurationSchema.optional(),
    elasticsearch: serviceConfigurationSchema.optional(),
    redis: serviceConfigurationSchema.optional(),
    composer: composerConfigurationSchema.optional(),
    varnish: varnishConfigurationSchema.optional()
});

/**
 * @type {Joi.ObjectSchema<import('../../typings').CMAConfiguration>}
 */
const configFileSchema = Joi.object({
    magento: magentoSchema.required(),
    host: Joi.string().optional(),
    ssl: sslSchema.optional(),
    prefix: Joi.bool().optional(),
    configuration: configurationSchema.required(),
    useNonOverlappingPorts: Joi.bool().forbidden()
});

/**
 * @type {Joi.ObjectSchema<{ useNonOverlappingPorts:boolean, analytics:boolean }>}
 */
const systemConfigurationSchema = Joi.object({
    useNonOverlappingPorts: Joi.bool().optional(),
    analytics: Joi.bool().optional()
});

module.exports = {
    configFileSchema,
    systemConfigurationSchema
};
