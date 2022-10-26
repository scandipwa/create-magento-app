const osPlatform = require('../../../util/os-platform')
const { execCommandTask } = require('../../../util/exec-async-command')
const installDependenciesTask = require('../../../util/install-dependencies-task')
const executeSudoCommand = require('../../../util/execute-sudo-command')
const KnownError = require('../../../errors/known-error')

const downloadDockerInstallScriptCommand = () =>
    execCommandTask('curl -fsSL https://get.docker.com -o get-docker.sh')
const runDockerInstallScriptCommand = () =>
    executeSudoCommand('sudo sh get-docker.sh')
const enableAndStartDockerCommand = () =>
    executeSudoCommand('sudo systemctl enable docker --now')

const postInstallSteps = [
    executeSudoCommand('[ $(getent group docker) ] && sudo groupadd docker', {
        withCode: true
    }),
    executeSudoCommand(`sudo usermod -aG docker ${process.env.USER}`)
]
/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installDockerEngine = () => ({
    title: 'Installing Docker Engine',
    task: async (ctx, task) => {
        const distro = await osPlatform()
        switch (distro) {
            case 'Arch Linux': {
                return task.newListr([
                    installDependenciesTask({
                        platform: 'Arch Linux',
                        dependenciesToInstall: ['docker']
                    }),
                    enableAndStartDockerCommand(),
                    ...postInstallSteps
                ])
            }
            case 'Fedora': {
                return task.newListr([
                    executeSudoCommand('sudo dnf -y install dnf-plugins-core'),
                    executeSudoCommand(
                        'sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo'
                    ),
                    executeSudoCommand(
                        'sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin'
                    ),
                    enableAndStartDockerCommand(),
                    ...postInstallSteps
                ])
            }
            case 'CentOS': {
                return task.newListr([
                    executeSudoCommand('sudo yum install -y yum-utils'),
                    executeSudoCommand(
                        'sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo'
                    ),
                    executeSudoCommand(
                        'sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin'
                    ),
                    ...postInstallSteps
                ])
            }
            case 'Ubuntu': {
                return task.newListr([
                    downloadDockerInstallScriptCommand(),
                    runDockerInstallScriptCommand(),
                    enableAndStartDockerCommand(),
                    ...postInstallSteps
                ])
            }
            default: {
                throw new KnownError(`Docker is not installed!
Your distro ${distro} is not supported by automatic installation.`)
            }
        }
    },
    options: {
        bottomBar: 10
    }
})

module.exports = {
    installDockerEngine
}
