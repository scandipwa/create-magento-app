const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const prettyStatus = async ({
    ports,
    config,
    magentoVersion,
    dockerVersion,
    phpBrewVersion,
    platform,
    platformVersion,
    magentoConfig,
    containers
}) => {
    const strings = [];
    const separator = () => strings.push(`>${'-'.repeat(30)}`);

    separator();

    strings.push(`Project: ${logger.style.file(config.config.prefix)}`);
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
        containerString.push(`Status: ${container.status && container.status.Status === 'healthy' ? `✅ ${logger.style.file('running')}` : logger.style.code(container.status.Status)}`);
        containerString.push(`Name: ${logger.style.misc(container.name)}`);
        containerString.push(`Image: ${logger.style.file(container.image)}`);
        containerString.push(`Network: ${logger.style.link(container.network)}`);
        containerString.push(`Port forwarding: ${container.ports.map((port) => logger.style.link(port)).join(', ')}`);

        containersStrings.push(containerString.join('\n  '));
    });

    containersStrings.push('');

    strings.push(containersStrings.join('\n'));

    separator();

    strings.push(`Web location: ${logger.style.link(`http://localhost:${ports.app}/`)}`);
    strings.push(`Magento Admin panel location: ${logger.style.link(`http://localhost:${ports.app}/${magentoConfig.adminuri}`)}`);
    strings.push(`Magento Admin panel credentials: ${logger.style.misc(magentoConfig.user)} - ${logger.style.misc(magentoConfig.password)}`);

    separator();

    logger.log(strings.join('\n'));
};

module.exports = { prettyStatus };
