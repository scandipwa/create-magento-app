const path = require('path');
const semver = require('semver');
const fs = require('fs');
const os = require('os');
const hjson = require('hjson');
const pathExists = require('../../util/path-exists');
const setConfigFile = require('../../util/set-config');

const phpXDebug2port = 9111;
const phpXDebug3port = 9003;
const listenForXDebugConfigName = 'Listen for XDebug';

const vscodeLaunchConfigPath = path.join(process.cwd(), '.vscode', 'launch.json');

/**
 * @param {import('../../../typings/context').ListrContext['config']['php']} php
 */
const getCurrentXDebugPort = (php) => (semver.satisfies(php.extensions.xdebug.version, '>=3')
    ? phpXDebug3port
    : phpXDebug2port);

/**
 * @param {import('../../../typings/context').ListrContext['config']['php']} php
 */
const getPHPBinPathWithHomeVariable = (php) => php.binPath.replace(os.homedir(), '$HOME');
/**
 * @param {import('../../../typings/context').ListrContext['config']['php']} php
 */
const addPHPDebugConfig = (vscodeLaunchConfig, php) => {
    const phpXDebugConfig = vscodeLaunchConfig.configurations.find(
        ({ name }) => name === listenForXDebugConfigName
    );

    const phpXDebugPort = getCurrentXDebugPort(php);
    const phpBingPath = getPHPBinPathWithHomeVariable(php);

    if (!phpXDebugConfig) {
        vscodeLaunchConfig.configurations.push({
            name: listenForXDebugConfigName,
            type: 'php',
            request: 'launch',
            port: phpXDebugPort,
            runtimeExecutable: phpBingPath
        });

        return true;
    }

    if (
        phpXDebugConfig.port !== phpXDebugPort
        && phpXDebugConfig.runtimeExecutable !== phpBingPath
    ) {
        phpXDebugConfig.port = phpXDebugPort;
        phpXDebugConfig.runtimeExecutable = phpBingPath;

        return true;
    }

    return false;
};

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createPhpFpmConfig = () => ({
    title: 'Setting VSCode config',
    task: async ({ config: { php, baseConfig } }, task) => {
        if (await pathExists(vscodeLaunchConfigPath)) {
            const vscodeLaunchConfig = hjson.parse(await fs.promises.readFile(vscodeLaunchConfigPath, 'utf-8'), {
                keepWsc: true
            });

            const vscodeConfigEdited = addPHPDebugConfig(vscodeLaunchConfig, php);

            // if vscode config is up-to-date, skip task
            if (!vscodeConfigEdited) {
                task.skip();
                return;
            }

            await fs.promises.writeFile(vscodeLaunchConfigPath, hjson.stringify(vscodeLaunchConfig));

            return;
        }

        if (!await pathExists(path.join(process.cwd(), '.vscode'))) {
            try {
                await fs.promises.mkdir(path.join(process.cwd(), '.vscode'));
            } catch (e) {
                throw new Error(`Unable to creade .vscode directory in your project!\n\n${e}`);
            }
        }

        try {
            const phpXDebugPort = getCurrentXDebugPort(php);
            const vscodeLaunchConfigTemplatePath = path.join(baseConfig.templateDir, 'vscode-launch.template.json');
            await setConfigFile({
                template: vscodeLaunchConfigTemplatePath,
                configPathname: vscodeLaunchConfigPath,
                templateArgs: {
                    XDebugPort: phpXDebugPort,
                    PHPBinPath: getPHPBinPathWithHomeVariable(php)
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during launch.json config creation!\n\n${e}`);
        }
    }
});

module.exports = createPhpFpmConfig;
