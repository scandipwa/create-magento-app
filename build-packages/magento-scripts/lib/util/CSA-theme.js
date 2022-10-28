const path = require('path')
const getJsonfileData = require('./get-jsonfile-data')

const getCSAThemes = async ({ cwd = process.cwd() } = {}) => {
    const composerData = await getJsonfileData(path.join(cwd, 'composer.json'))

    if (!composerData || !composerData.repositories) {
        return []
    }

    const pathRepositories = Object.entries(composerData.repositories).filter(
        ([_, repoOptions]) => repoOptions.type === 'path'
    )

    const CSAThemes = (
        await Promise.all(
            pathRepositories.map(async ([_, repoOptions]) => {
                const pkg =
                    (await getJsonfileData(
                        path.join(cwd, repoOptions.url, 'package.json')
                    )) || {}

                return {
                    themePath: repoOptions.url,
                    isCSATheme:
                        (pkg.scandipwa && pkg.scandipwa.type === 'theme') ||
                        (pkg.mosaic && pkg.mosaic.type === 'theme')
                }
            })
        )
    ).filter(({ isCSATheme }) => isCSATheme)

    return CSAThemes
}

module.exports = {
    getCSAThemes
}
