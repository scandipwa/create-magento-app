/* eslint-disable no-param-reassign,no-unused-vars */
const { execAsyncSpawn } = require('../../util/exec-async-command');

const getDockerVersion = async () => {
    const { result, code } = await execAsyncSpawn('docker -v', {
        withCode: true
    });

    if (code === 0) {
        const [_, dockerVersion] = result.match(/Docker version ([\d.]+)/);

        return dockerVersion;
    }

    return null;
};
const checkDocker = {
    title: 'Checking docker',
    task: async (ctx, task) => {
        const { code } = await execAsyncSpawn('docker -v', {
            withCode: true
        });

        if (code !== 0) {
            throw new Error('Docker is not installed');
            // logger.note(
            //     `To install Docker, follow the official instruction: ${ logger.style.link('https://docs.docker.com/engine/install/') }.`,
            //     'Once there, select your distribution and follow the instructions on the page.',
            //     'When completed, try running this script again.'
            // );
        }

        const dockerVersion = await getDockerVersion();

        task.title = `Using docker version ${dockerVersion}`;

        ctx.dockerVersion = dockerVersion;
    }
};

module.exports = checkDocker;
