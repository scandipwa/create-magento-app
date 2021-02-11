const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const prettyStatus = async ({
    ports,
    config,
    magentoVersion,
    dockerVersion,
    phpBrewVersion,
    platform,
    platformVersion,
    containers
}) => {
    const { magentoConfiguration, baseConfig, overridenConfiguration: { host } } = config;
    const strings = [];
    const separator = () => strings.push(`>${'-'.repeat(30)}`);

    separator();

    strings.push(`Project: ${logger.style.file(baseConfig.prefix)}`);
    strings.push(`Project location: ${logger.style.link(process.cwd())}`);
    strings.push(`Magento 2 version: ${logger.style.file(magentoVersion)}`);
    strings.push(`PHP version: ${logger.style.file(config.php.version)}`);
    strings.push(`PHP location: ${logger.style.link(config.php.binPath)}`);
    strings.push(`Docker version: ${logger.style.file(dockerVersion)}`);
    strings.push(`PHPBrew version: ${logger.style.file(phpBrewVersion)}`);
    strings.push(`Platfrom: ${logger.style.code(platform)}`);
    strings.push(`Platform version: ${logger.style.file(platformVersion)}`);

    separator();

    strings.push('Docker containers status:');

    strings.push('');

    const containersStrings = [];

    Object.values(containers).forEach((container) => {
        const containerString = [];
        containerString.push(logger.style.misc(container._));

        let containerStatus;
        if (container.status) {
            if (container.status.Status === 'healthy') {
                containerStatus = `✅ ${logger.style.file('running')}`;
            } else {
                containerStatus = logger.style.code(container.status.Status);
            }
        } else {
            containerStatus = logger.style.code('stopped');
        }

        containerString.push(`Status: ${containerStatus}`);
        containerString.push(`Name: ${logger.style.misc(container.name)}`);
        containerString.push(`Image: ${logger.style.file(container.image)}`);
        containerString.push(`Network: ${logger.style.link(container.network)}`);
        containerString.push(`Port forwarding: ${container.ports.map((port) => logger.style.link(port)).join(', ')}`);
        if (container.env) {
            containerString.push('Environment variables:');
            const containerEnvStrings = [''];
            // eslint-disable-next-line no-restricted-syntax
            for (const [envName, envValue] of Object.entries(container.env)) {
                containerEnvStrings.push(`${logger.style.misc(envName)}=${logger.style.file(envValue)}`);
            }

            containerString.push(containerEnvStrings.join('\n   '));
        }
        containersStrings.push(containerString.join('\n  '));
        containersStrings.push('');
    });

    // containersStrings.push('');

    strings.push(containersStrings.join('\n'));

    separator();

    strings.push(`Web location: ${logger.style.link(`http://${host}:${ports.app}/`)}`);
    strings.push(`Magento Admin panel location: ${logger.style.link(`http://${host}:${ports.app}/${magentoConfiguration.adminuri}`)}`);
    strings.push(`Magento Admin panel credentials: ${logger.style.misc(magentoConfiguration.user)} - ${logger.style.misc(magentoConfiguration.password)}`);

    separator();

    logger.log(strings.join('\n'));
};

module.exports = { prettyStatus };
