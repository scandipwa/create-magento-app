const logger = require('@scandipwa/scandipwa-dev-utils/logger');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkComposer = {
    title: 'Checking composer environmental variables',
    task: () => {
        try {
            if (!process.env.COMPOSER_AUTH) {
                throw new Error(`Environmental variable ${ logger.style.misc('COMPOSER_AUTH') } is not set.`);
            }

            let magento;

            try {
                magento = JSON.parse(process.env.COMPOSER_AUTH);
            } catch (e) {
                throw new Error(`Environmental variable ${ logger.style.misc('COMPOSER_AUTH') } is not valid JSON.`);
            }

            if (!magento || !magento['http-basic'] || !magento['http-basic']['repo.magento.com']) {
                throw new Error(`Environmental variable ${ logger.style.misc('COMPOSER_AUTH') } does not contain the ${ logger.style.misc('repo.magento.com') } field.`);
            }
        } catch (e) {
            throw new Error(
                `To generate Composer credentials login into Magento Marketplace and follow the official guide.
        The guide is found here: ${ logger.style.link('https://devdocs.magento.com/guides/v2.3/install-gde/prereq/connect-auth.html') }
        Then, insert obtained credentials into this command, and execute:
        ${logger.style.code('export COMPOSER_AUTH=\'{"http-basic":{"repo.magento.com": {"username": "<PUBLIC KEY FROM MAGENTO MARKETPLACE>", "password": "<PRIVATE KEY FROM MAGENTO MARKETPLACE>"}}}\'')}\n\n${e}`
            );
        }
    }
};

module.exports = checkComposer;
