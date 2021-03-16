/* eslint-disable no-param-reassign */
const path = require('path');
const pathExists = require('../../util/path-exists');
const runPhpCode = require('../../util/run-php');

const updateEnvPHP = {
    title: 'Updating env.php',
    task: async (ctx, task) => {
        // update env.php only if it's exist
        if (await pathExists(path.resolve('app', 'etc', 'env.php'))) {
            await runPhpCode(`-f ${ path.join(__dirname, 'update-env.php') }`, {
                callback: (t) => {
                    task.output = t;
                },
                throwNonZeroCode: true
            });
        } else {
            task.skip();
        }
    }
};

module.exports = updateEnvPHP;
