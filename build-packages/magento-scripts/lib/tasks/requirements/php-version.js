const UnknownError = require('../../errors/unknown-error');
const { runContainerImage } = require('../../util/run-container-image');
const { runPHPContainerCommand } = require('../php/run-php-container');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkPHPVersion = () => ({
    title: 'Checking container PHP version',
    task: async (ctx, task) => {
        const { php } = ctx.config.docker.getContainers(ctx.ports);
        const phpVersionResponse = await runContainerImage(php.image, 'php --version');

        const phpVersionResponseResult = phpVersionResponse.match(/PHP\s(\d+\.\d+\.\d+)/i);

        if (phpVersionResponseResult && phpVersionResponseResult.length > 0) {
            const phpVersion = phpVersionResponseResult[1];

            ctx.phpVersion = phpVersion;
            task.title = `Using PHP version ${phpVersion} in container`;
        } else {
            throw new UnknownError(`Cannot retrieve PHP Version!\n\n${phpVersionResponse}`);
        }
    }
});

module.exports = checkPHPVersion;
