/* eslint-disable no-param-reassign */
const path = require('path');
const runPhpCode = require('../../util/run-php');

const updateEnvPHP = {
    title: 'Updating env.php',
    task: async (ctx, task) => {
        await runPhpCode(`-f ${ path.join(__dirname, 'update-env.php') }`, {
            callback: (t) => {
                task.output = t;
            }
        });
    }
};

module.exports = updateEnvPHP;
