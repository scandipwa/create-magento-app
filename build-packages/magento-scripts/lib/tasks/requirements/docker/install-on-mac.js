const { execAsyncSpawn } = require('../../../util/exec-async-command');
const {
    BREW_BIN_PATH_ARM_NATIVE,
    BREW_BIN_PATH_INTEL
} = require('../../../util/get-brew-bin-path');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installDockerOnMac = () => ({
    title: 'Installing Docker on Mac OS',
    task: async (ctx, task) => {
        const interval = !ctx.verbose ? setInterval(() => {
            task.output = `Installing Docker on Mac... Yep, still in progress ${Date.UTC()}`;
        }, 5000) : null;

        const brewBinPath = ctx.arch === 'arm64'
            ? `arch -arm64 ${BREW_BIN_PATH_ARM_NATIVE}`
            : BREW_BIN_PATH_INTEL;

        await execAsyncSpawn(`${brewBinPath} install --cask docker`, {
            callback: !ctx.verbose ? undefined : (t) => {
                task.output = t;
            }
        });

        if (!ctx.verbose) {
            clearInterval(interval);
        }
    },
    options: {
        bottomBar: 10
    }
});

module.exports = installDockerOnMac;
