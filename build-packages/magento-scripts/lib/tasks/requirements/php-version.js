const semver = require('semver');
const { execAsyncSpawn } = require('../../util/exec-async-command');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkPHPVersion = () => ({
    title: 'Checking system PHP version',
    task: async (_ctx, _task) => {
        const phpVersionResponse = await execAsyncSpawn('php --version');

        const phpVersionResponseResult = phpVersionResponse.match(/^PHP\s(\d\.\d\.\d)/i);

        if (phpVersionResponseResult.length > 0) {
            const phpVersion = phpVersionResponseResult[1];

            if (!semver.satisfies(phpVersion, '7.4.x')) {
                throw new Error(`Your installed PHP version ${phpVersion} is not supported by PHPBrew.`);
            }
        }

        //         if (!semver.gte(node, '7.4')) {
        //             throw new Error(
        //                 `Your Node.js version is out of date!
        // You need to upgrade Node.js to at lease version 12 to work with this software!`
        //             );
        //         }

        // task.title = `Using Node.js version ${node} ${process.arch}`;
    }
});

module.exports = checkPHPVersion;
