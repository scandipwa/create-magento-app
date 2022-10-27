const { getArch, getArchSync } = require('./arch')

const BREW_BIN_PATH_INTEL = '/usr/local/bin/brew'
const BREW_BIN_PATH_ARM_ROSETTA = '/usr/local/homebrew/bin/brew'
// native is not used ATM
const BREW_BIN_PATH_ARM_NATIVE = '/opt/homebrew/bin/brew'

const getBrewBinPath = async () => {
    const arch = await getArch()

    if (arch === 'arm64') {
        return BREW_BIN_PATH_ARM_ROSETTA
    }

    return BREW_BIN_PATH_INTEL
}

const getBrewBinPathSync = () => {
    const arch = getArchSync()

    if (arch === 'arm64') {
        return BREW_BIN_PATH_ARM_ROSETTA
    }

    return BREW_BIN_PATH_INTEL
}

const getBrewCommand = async ({ native } = { native: false }) => {
    const arch = await getArch()

    if (arch === 'arm64') {
        if (native) {
            return `arch -arm64 ${BREW_BIN_PATH_ARM_NATIVE}`
        }

        return `arch -x86_64 ${BREW_BIN_PATH_ARM_ROSETTA}`
    }

    return BREW_BIN_PATH_INTEL
}

/**
 * @param {{ native?: boolean }} param0
 * @returns
 */
const getBrewCommandSync = ({ native } = { native: false }) => {
    const arch = getArchSync()

    if (arch === 'arm64') {
        if (native) {
            return `arch -arm64 ${BREW_BIN_PATH_ARM_NATIVE}`
        }

        return `arch -x86_64 ${BREW_BIN_PATH_ARM_ROSETTA}`
    }

    return BREW_BIN_PATH_INTEL
}

module.exports = {
    getBrewBinPath,
    getBrewBinPathSync,
    getBrewCommand,
    getBrewCommandSync,
    BREW_BIN_PATH_INTEL,
    BREW_BIN_PATH_ARM_ROSETTA,
    BREW_BIN_PATH_ARM_NATIVE
}
