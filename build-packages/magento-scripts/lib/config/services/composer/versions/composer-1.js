/**
 * @returns {import('../../../../../typings/index').ComposerConfiguration}
 */
const composer1 = () => ({
    version: '1',
    plugins: {
        'hirak/prestissimo': {
            enabled: true
        }
    }
})

module.exports = composer1
