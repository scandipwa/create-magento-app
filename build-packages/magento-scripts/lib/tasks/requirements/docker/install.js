/* eslint-disable max-len,no-multi-str,no-param-reassign,consistent-return */
const osPlatform = require('../../../util/os-platform');
const { execCommandTask } = require('../../../util/exec-async-command');
const installDependenciesTask = require('../../../util/install-dependencies-task');
const executeSudoCommand = require('../../../util/execute-sudo-command');

const installDockerOnDebianSystemsTasks = [
    execCommandTask('curl -fsSL https://get.docker.com -o get-docker.sh'),
    executeSudoCommand('sudo sh get-docker.sh'),
    executeSudoCommand('sudo systemctl start docker'),
    executeSudoCommand('sudo systemctl enable docker')
];

const postInstallSteps = [
    executeSudoCommand('sudo groupadd docker'),
    executeSudoCommand('sudo usermod -aG docker $USER')
];

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installDocker = {
    title: 'Installing Docker',
    task: async (ctx, task) => {
        const { dist } = await osPlatform();
        switch (dist) {
        case 'Arch Linux':
        case 'Manjaro Linux': {
            return task.newListr([
                installDependenciesTask({
                    platform: 'Arch Linux',
                    dependenciesToInstall: ['docker']
                }),
                executeSudoCommand('sudo systemctl start docker.service'),
                executeSudoCommand('sudo systemctl enable docker.service'),
                ...postInstallSteps
            ]);
        }
        case 'Fedora':
        case 'CentOS':
        case 'Linux Mint':
        case 'Ubuntu': {
            return task.newListr([
                ...installDockerOnDebianSystemsTasks,
                ...postInstallSteps
            ]);
        }
        default: {
            throw new Error(`Docker is not installed!
Your distro ${dist} is not supported by automatic installation.`);
        }
        }
    }
};

module.exports = installDocker;
