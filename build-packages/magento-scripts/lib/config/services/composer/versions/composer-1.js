/**
 * @returns {import('../../../../../typings/index').ComposerConfiguration}
 */
const composer1 = () => ({
    version: 'latest-1.x',
    plugins: {
        'hirak/prestissimo': {
            enabled: true
        }
    }
})

module.exports = composer1
