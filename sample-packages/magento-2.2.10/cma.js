/** @type {import('@scandipwa/magento-scripts').CMAConfiguration} */
module.exports = {
    magento: {
        first_name: 'Scandiweb',
        last_name: 'Developer',
        email: 'developer@scandipwa.com',
        user: 'admin',
        password: 'scandipwa123',
        adminuri: 'admin',
        mode: 'developer',
        edition: 'community'
    },
    configuration: {
        php: {
            extensions: {
                xdebug: {
                    version: '2.9.8'
                }
            }
        }
    }
}
