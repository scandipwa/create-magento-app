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
    configuration: {},
    ssl: {
        enabled: true,
        external_provider: true
    },
    storeDomains: {
        admin: '4448-195-13-221-74.ngrok-free.app'
    }
}
