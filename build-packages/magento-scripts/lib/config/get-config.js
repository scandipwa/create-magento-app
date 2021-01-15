/* eslint-disable no-param-reassign */
const {
    getApplicationConfig,
    defaultConfig,
    saveApplicationConfig
} = require('../util/application-config');
const sleep = require('../util/sleep');

const getAppConfig = {
    title: 'Checking app config (300 sec left...)',
    task: async (ctx, task) => {
        const configExists = await getApplicationConfig();
        if (configExists) {
            const { magento } = configExists;
            ctx.magentoConfig = magento;
            task.skip('App config already created');
            return;
        }
        let promptSkipper = false;
        const timer = async () => {
            for (let i = 5 * 60; i !== 0; i--) {
                // eslint-disable-next-line no-await-in-loop
                await sleep(1000);
                if (promptSkipper) {
                    return null;
                }
                task.title = `Checking app config (${i} sec left...)`;
            }
            task.cancelPrompt();
            return 'default';
        };
        const configType = !process.stdin.isTTY ? 'default' : await Promise.race([
            task.prompt({
                type: 'Select',
                message: 'How do you want to create config for magento?',
                choices: [
                    {
                        message: 'Use default values (recommended)',
                        name: 'default'
                    },
                    {
                        message: 'Let me choose custom options.',
                        name: 'custom'
                    },
                    {
                        message: 'I\'ll create config later myself.',
                        name: 'cancel'
                    }
                ]
            }),
            timer()]);

        promptSkipper = true;

        if (configType === 'custom') {
            task.title = 'User have chosen custom Magento config...';
            const magentoConfig = await task.prompt([
                {
                    type: 'Input',
                    name: 'first_name',
                    message: 'Magento first name',
                    default: defaultConfig.magento.first_name
                },
                {
                    type: 'Input',
                    name: 'last_name',
                    message: 'Magento last name',
                    default: defaultConfig.magento.last_name
                },
                {
                    type: 'Input',
                    name: 'email',
                    message: 'Magento email',
                    default: defaultConfig.magento.email
                },
                {
                    type: 'Input',
                    name: 'user',
                    message: 'Magento admin user',
                    default: defaultConfig.magento.user
                },
                {
                    type: 'Input',
                    name: 'password',
                    message: 'Magento admin password',
                    default: defaultConfig.magento.password
                },
                {
                    type: 'Input',
                    name: 'adminuri',
                    message: 'Magento admin panel url path',
                    default: defaultConfig.magento.adminuri
                },
                {
                    type: 'Select',
                    name: 'mode',
                    message: 'Magento mode',
                    choices: [
                        'developer',
                        'production'
                    ],
                    default: defaultConfig.magento.mode
                }
            ]);

            await saveApplicationConfig({
                magento: magentoConfig
            });
            ctx.magentoConfig = magentoConfig;
            task.title = 'Config created!';
        } else if (configType === 'default') {
            task.title = 'User have chosen default Magento config.';
            await saveApplicationConfig(defaultConfig);
            const { magento } = defaultConfig;
            ctx.magentoConfig = magento;
            task.title = 'Using default config!';
        } else {
            throw new Error('User have chosen to create config later.');
        }
    }
};

module.exports = getAppConfig;
