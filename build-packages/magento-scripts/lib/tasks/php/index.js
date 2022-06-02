const fs = require('fs');
const path = require('path');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const pathExists = require('../../util/path-exists');
const compilePhp = require('./compile');
const configurePhp = require('./configure');
const updatePhpBrew = require('./update-phpbrew');
const phpbrewConfig = require('../../config/phpbrew');
const UnknownError = require('../../errors/unknown-error');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const installPhp = () => ({
    title: 'Installing PHP',
    task: async (ctx, task) => {
        const { config: { php }, recompilePhp } = ctx;
        const phpBinExists = await pathExists(php.binPath);

        if (phpBinExists && !recompilePhp) {
            task.title = `Using PHP version ${php.version} in project`;

            return;
        }

        task.title = `Installing PHP ${php.version}`;

        try {
            const hasPHPVersionDirectory = (
                await Promise.all(
                    (
                        await fs.promises.readdir(phpbrewConfig.phpPath, {
                            encoding: 'utf-8',
                            withFileTypes: true
                        })
                    ).map(async (f) => {
                        if (!f.isDirectory()) {
                            return false;
                        }

                        if (f.name !== `php-${php.version}`) {
                            return false;
                        }

                        return pathExists(path.join(phpbrewConfig.phpPath, f.name, 'bin', 'php'));
                    })
                ))
                .includes(true);

            if (hasPHPVersionDirectory && !recompilePhp) {
                task.skip();
                // eslint-disable-next-line consistent-return
                return;
            }
        } catch (e) {
            throw new UnknownError(
                `Failed to extract the list of installed PHP versions.
                Possibly, you forgot to setup PHPBrew?
                Follow these instruction: ${ logger.style.link('https://phpbrew.github.io/phpbrew/#setting-up') }
                Otherwise, See error details in the output below.\n\n${e}`
            );
        }

        // eslint-disable-next-line consistent-return
        return task.newListr([
            updatePhpBrew(),
            compilePhp()
        ], {
            concurrent: false,
            exitOnError: true
        });
    }
});

module.exports = {
    installPhp,
    compilePhp,
    configurePhp
};
