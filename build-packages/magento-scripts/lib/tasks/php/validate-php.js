const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { bundledExtensions } = require('./bundled-extensions');
const configurePHP = require('./configure');
const { getEnabledExtensions } = require('./extensions');
const { installPhp } = require('./index');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const validatePHPInstallation = () => ({
    title: 'Validating PHP installation',
    task: async (ctx, task) => {
        const enabledExtensions = await getEnabledExtensions(ctx.config);
        const enabledExtensionsKeys = Object.keys(enabledExtensions);

        enabledExtensionsKeys.push('fpm');

        if (enabledExtensionsKeys.some((ext) => ext.includes('mysql'))) {
            enabledExtensionsKeys.push('mysql');
        }

        const missingBundledExtensions = bundledExtensions.filter(
            (ext) => !enabledExtensionsKeys.some(
                (ex) => ex.toLowerCase() === ext.toLowerCase()
            )
        );

        if (missingBundledExtensions.length > 0) {
            const selectedOption = await task.prompt({
                type: 'Select',
                message: `Your PHP version compiled by PHPBrew is missing important extensions that are bundled by default by ${logger.style.misc('magento-scripts')}
Maybe you ran PHPBrew by yourself?

Please, consider recompiling PHP using ${logger.style.misc('magento-scripts')}.

${logger.style.command('npm start -- --recompile-php')}
`,
                choices: [
                    {
                        name: 'recompile-php',
                        message: `I want ${logger.style.misc('magento-scripts')} to recompile PHP`
                    },
                    {
                        name: 'skip',
                        message: 'I am sure that it is okay and want to continue with this setup'
                    }
                ]
            });

            if (selectedOption === 'skip') {
                task.skip('User skipped PHP recompilation');
                return;
            }

            ctx.recompilePhp = true;

            return task.newListr([
                installPhp(),
                configurePHP()
            ], {
                concurrent: false
            });
        }
    }
});

module.exports = validatePHPInstallation;
