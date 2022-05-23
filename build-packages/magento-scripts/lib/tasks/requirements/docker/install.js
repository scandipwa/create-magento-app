const osPlatform = require('../../../util/os-platform');
const { execCommandTask } = require('../../../util/exec-async-command');
const installDependenciesTask = require('../../../util/install-dependencies-task');
const executeSudoCommand = require('../../../util/execute-sudo-command');
const KnownError = require('../../../errors/known-error');

const downloadDockerInstallScriptCommand = () => execCommandTask('curl -fsSL https://get.docker.com -o get-docker.sh');
const runDockerInstallScriptCommand = () => executeSudoCommand('sudo sh get-docker.sh');
const enableAndStartDockerCommand = () => executeSudoCommand('sudo systemctl enable docker --now');

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
        const distro = await osPlatform();
        switch (distro) {
        case 'Arch Linux': {
            return task.newListr([
                installDependenciesTask({
                    platform: 'Arch Linux',
                    dependenciesToInstall: ['docker']
                }),
                enableAndStartDockerCommand(),
                ...postInstallSteps
            ]);
        }
        case 'Fedora':
        case 'CentOS': {
            return task.newListr([
                downloadDockerInstallScriptCommand(),
                runDockerInstallScriptCommand(),
                enableAndStartDockerCommand()
            ]);
        }
        case 'Ubuntu': {
            return task.newListr([
                downloadDockerInstallScriptCommand(),
                runDockerInstallScriptCommand(),
                enableAndStartDockerCommand(),
                ...postInstallSteps
            ]);
        }
        default: {
            throw new KnownError(`Docker is not installed!
Your distro ${distro} is not supported by automatic installation.`);
        }
        }
    }
});

module.exports = installDocker;
