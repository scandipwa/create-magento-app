const path = require('path');
const pathExists = require('../../util/path-exists');
const phpTask = require('../../util/php-task');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const updateEnvPHP = () => ({
    title: 'Updating env.php',
    task: async (ctx, task) => {
        // update env.php only if it's exist
        if (!await pathExists(path.resolve('app', 'etc', 'env.php'))) {
            task.skip();
            return;
        }

        return task.newListr(
            phpTask(`-f ${ path.join(__dirname, 'update-env.php') }`, { noTitle: true })
        );
    }
});

module.exports = updateEnvPHP;
