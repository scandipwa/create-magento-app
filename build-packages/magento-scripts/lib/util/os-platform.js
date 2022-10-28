const fs = require('fs')
const systeminformation = require('systeminformation')
const pathExists = require('./path-exists')
const dependenciesForPlatforms = require('../config/dependencies-for-platforms')

const packageManagers = Object.entries(dependenciesForPlatforms).map((d) => ({
    platform: d[0],
    packageManager: d[1].packageManager
}))
/**
 *
 * @returns {Promise<keyof typeof dependenciesForPlatforms>}
 */
const osPlatform = async () => {
    const binPaths = process.env.PATH.split(':')

    const platforms = (
        await Promise.all(
            binPaths.map(async (binPath) => {
                if (!(await pathExists(binPath))) {
                    return null
                }
                const bins = await fs.promises.readdir(binPath)

                for (const bin of bins) {
                    const possiblePlatforms = packageManagers.filter(
                        (p) => p.packageManager === bin
                    )

                    if (possiblePlatforms.length > 0) {
                        if (possiblePlatforms.length > 1) {
                            const { distro } = await systeminformation.osInfo()

                            const foundDistro = possiblePlatforms.find((p) =>
                                p.platform
                                    .toLowerCase()
                                    .includes(distro.toLowerCase())
                            )

                            if (foundDistro) {
                                return foundDistro.platform
                            }

                            return possiblePlatforms[0].platform
                        }

                        return possiblePlatforms[0].platform
                    }
                }

                return null
            })
        )
    ).filter(Boolean)

    return platforms.shift()
}

module.exports = osPlatform
