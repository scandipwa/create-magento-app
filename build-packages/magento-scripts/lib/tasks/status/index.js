const path = require('path');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { getProjectCreatedAt, getPrefix } = require('../../util/prefix');

const { version: packageVersion } = require('../../../package.json');
const { getArchSync } = require('../../util/arch');
const ConsoleBlock = require('../../util/console-block');

const prettyStatus = async (ctx) => {
    const {
        ports,
        config: {
            magentoConfiguration,
            baseConfig,
            overridenConfiguration: { host, ssl },
            php
        },
        magentoVersion,
        dockerVersion,
        PHPBrewVersion,
        platform,
        platformVersion,
        containers
    } = ctx;
    // const strings = [];
    // const separator = () => block.addLine(`>${'-'.repeat(30)}`);
    const projectCreatedAt = getProjectCreatedAt();

    // separator();

    const prefix = getPrefix();

    const { name: folderName } = path.parse(process.cwd());

    const block = new ConsoleBlock();

    block
        .addHeader(`magento-scripts version: ${ logger.style.link(packageVersion) }`)
        .addEmptyLine()
        .addLine(`Project: ${logger.style.file(baseConfig.prefix)} ${prefix === folderName ? '(without prefix)' : '(with prefix)'}`)
        .addLine(`Project location: ${logger.style.link(process.cwd())}`);

    if (projectCreatedAt) {
        block.addLine(`Project created: ${logger.style.link(projectCreatedAt.toDateString())} at ${logger.style.link(projectCreatedAt.toTimeString())}`);
    }

    block
        .addLine(`Magento 2 version: ${logger.style.file(magentoVersion)}`)
        .addLine(`PHP version: ${logger.style.file(php.version)}`)
        .addLine(`PHP location: ${logger.style.link(php.binPath)}`)
        .addLine(`Docker version: ${logger.style.file(dockerVersion)}`)
        .addLine(`PHPBrew version: ${logger.style.file(PHPBrewVersion)}`)
        .addLine(`Platform: ${logger.style.code(platform)}`)
        .addLine(`Platform version: ${logger.style.file(platformVersion)}`)
        .addLine(`Platform architecture: ${logger.style.file(getArchSync())}`)
        .addEmptyLine()
        .addSeparator('Docker containers status');

    Object.values(containers).forEach((container) => {
        block
            .addEmptyLine()
            .addLine(`> ${logger.style.misc(container._)}`)
            .addEmptyLine();

        let containerStatus;
        if (container.status) {
            if (container.status.Status === 'healthy') {
                containerStatus = `✓ ${logger.style.file('running')}`;
            } else {
                containerStatus = logger.style.code(container.status.Status);
            }
        } else {
            containerStatus = logger.style.code('stopped');
        }

        block
            .addLine(`Status: ${containerStatus}`)
            .addLine(`Name: ${logger.style.misc(container.name)}`)
            .addLine(`Image: ${logger.style.file(container.image)}`)
            .addLine(`Network: ${logger.style.link(container.network)}`);

        if (container.ports.length > 0) {
            block.addLine(`Port forwarding: ${container.ports.map((port) => logger.style.link(port)).join(', ')}`);
        }

        if (container.env) {
            block.addLine('Environment variables:');
            for (const [envName, envValue] of Object.entries(container.env)) {
                block.addLine(`${' '.repeat(3)} ${logger.style.misc(envName)}=${logger.style.file(envValue)}`);
            }
        }
    });

    block
        .addEmptyLine()
        .addSeparator('Magento status')
        .addEmptyLine()
        .addLine(`Web location: ${logger.style.link(`${ssl.enabled ? 'https' : 'http'}://${host}${ports.app === 80 ? '' : `:${ports.app}`}/`)}`)
        .addLine(`Magento Admin panel location: ${logger.style.link(`${ssl.enabled ? 'https' : 'http'}://${host}${ports.app === 80 ? '' : `:${ports.app}`}/${magentoConfiguration.adminuri}`)}`)
        .addLine(`Magento Admin panel credentials: ${logger.style.misc(magentoConfiguration.user)} - ${logger.style.misc(magentoConfiguration.password)}`)
        .addEmptyLine();

    block.log();

    // logger.log(strings.join('\n'));
};

module.exports = { prettyStatus };
