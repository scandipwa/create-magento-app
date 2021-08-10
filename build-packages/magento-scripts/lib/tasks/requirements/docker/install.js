const osPlatform = require('../../../util/os-platform');
const { execCommandTask } = require('../../../util/exec-async-command');
const installDependenciesTask = require('../../../util/install-dependencies-task');
const executeSudoCommand = require('../../../util/execute-sudo-command');

const postInstallSteps = [
    executeSudoCommand('[ $(getent group docker) ] && sudo groupadd docker', {
        withCode: true
    }),
    executeSudoCommand(`sudo usermod -aG docker ${process.env.USER}`)
];

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installDocker = () => ({
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
        case 'CentOS': {
            return task.newListr([
                execCommandTask('curl -fsSL https://get.docker.com -o get-docker.sh'),
                executeSudoCommand('sudo sh get-docker.sh'),
                executeSudoCommand('sudo systemctl start docker'),
                executeSudoCommand('sudo systemctl enable docker')
            ]);
        }
        case 'Linux Mint':
        case 'Ubuntu': {
            return task.newListr([
                execCommandTask('curl -fsSL https://get.docker.com -o get-docker.sh'),
                executeSudoCommand('sudo sh get-docker.sh'),
                executeSudoCommand('sudo service docker start'),
                executeSudoCommand('sudo service docker enable'),
                ...postInstallSteps
            ]);
        }
        default: {
            throw new Error(`Docker is not installed!
Your distro ${dist} is not supported by automatic installation.`);
        }
        }
    }
});

module.exports = installDocker;
