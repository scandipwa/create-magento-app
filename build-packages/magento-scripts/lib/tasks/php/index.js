const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const pathExists = require('../../util/path-exists');
const compile = require('./compile');
const configure = require('./configure');
const updatePhpBrew = require('./update-phpbrew');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const installPhp = () => ({
    title: 'Installing PHP',
    task: async (ctx, task) => {
        const { config: { php }, recompilePhp } = ctx;
        const phpBinExists = await pathExists(php.binPath);

        if (phpBinExists && !recompilePhp) {
            task.title = `Using PHP version ${php.version}`;

            return;
        }

        task.title = `Installing PHP ${php.version}`;
        const versionRegex = new RegExp(php.version);

        try {
            const phpVersions = await execAsyncSpawn('phpbrew list');

            if (versionRegex.test(phpVersions) && !recompilePhp) {
                task.skip();
                // eslint-disable-next-line consistent-return
                return;
            }
        } catch (e) {
            throw new Error(
                `Failed to extract the list of installed PHP versions.
                Possibly, you forgot to setup PHPBrew?
                Follow these instruction: ${ logger.style.link('https://phpbrew.github.io/phpbrew/#setting-up') }
                Otherwise, See error details in the output below.\n\n${e}`
            );
        }

        // eslint-disable-next-line consistent-return
        return task.newListr([
            updatePhpBrew(),
            compile()
        ], {
            concurrent: false,
            exitOnError: true
        });
    }
});

module.exports = {
    installPhp,
    compilePhp: compile,
    configurePhp: configure
};
