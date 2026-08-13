const path = require('path')
const fs = require('fs')

const magentoScriptsPackage = '@scandipwa/magento-scripts'

/**
 * The template's package.json is the single source of truth for the scripts
 * CMA owns. It parses as plain JSON — the EJS placeholders in it sit inside
 * string values, so they survive JSON.parse untouched.
 * @returns {Promise<{ scripts: Record<string, string>, scandipwa: any }>}
 */
const readTemplatePackageJson = async () => {
    const templatePackageJson = JSON.parse(
        await fs.promises.readFile(
            path.join(__dirname, '..', '..', 'template', 'package.json'),
            'utf-8'
        )
    )

    return {
        scripts: templatePackageJson.scripts,
        scandipwa: templatePackageJson.scandipwa
    }
}

/**
 * Match the indentation the project already uses so the merge does not show up
 * as a whole-file reformat in git.
 * @param {string} source
 * @returns {string | number}
 */
const detectIndentation = (source) => {
    const match = source.match(/^([ \t]+)"/m)

    if (!match) {
        return 4
    }

    return match[1].includes('\t') ? '\t' : match[1].length
}

/**
 * @typedef {Object} PackageJsonMergeResult
 * @property {string} content serialized package.json to write
 * @property {string[]} addedScripts scripts added by the merge
 * @property {string[]} conflictingScripts scripts left untouched
 * @property {boolean} addedDependency magento-scripts was added
 */

/**
 * Merge the CMA scripts and dependency into an existing package.json without
 * touching anything the project already defines.
 * @param {string} pathname absolute path to the existing package.json
 * @param {string} magentoScriptsVersion
 * @returns {Promise<PackageJsonMergeResult>}
 */
const mergePackageJson = async (pathname, magentoScriptsVersion) => {
    const source = await fs.promises.readFile(pathname, 'utf-8')
    const packageJson = JSON.parse(source)
    const template = await readTemplatePackageJson()

    /** @type {string[]} */
    const addedScripts = []
    /** @type {string[]} */
    const conflictingScripts = []

    packageJson.scripts = packageJson.scripts || {}

    Object.entries(template.scripts).forEach(([name, command]) => {
        const existing = packageJson.scripts[name]

        if (existing === undefined) {
            packageJson.scripts[name] = command
            addedScripts.push(name)
            return
        }

        if (existing !== command) {
            conflictingScripts.push(name)
        }
    })

    const isAlreadyDependency = Boolean(
        (packageJson.dependencies &&
            packageJson.dependencies[magentoScriptsPackage]) ||
            (packageJson.devDependencies &&
                packageJson.devDependencies[magentoScriptsPackage])
    )

    if (!isAlreadyDependency) {
        packageJson.dependencies = packageJson.dependencies || {}
        packageJson.dependencies[magentoScriptsPackage] = magentoScriptsVersion
    }

    if (!packageJson.scandipwa) {
        packageJson.scandipwa = template.scandipwa
    } else if (!packageJson.scandipwa.type) {
        packageJson.scandipwa.type = template.scandipwa.type
    }

    const indentation = detectIndentation(source)
    const trailingNewline = source.endsWith('\n') ? '\n' : ''

    return {
        content: `${JSON.stringify(
            packageJson,
            null,
            indentation
        )}${trailingNewline}`,
        addedScripts,
        conflictingScripts,
        addedDependency: !isAlreadyDependency
    }
}

/**
 * Build a package.json for a project that has none, straight from the template
 * definition. Used when adopting a Magento checkout that was never a Node
 * project.
 * @param {string} name
 * @param {string} magentoScriptsVersion
 * @returns {Promise<string>}
 */
const createPackageJson = async (name, magentoScriptsVersion) => {
    const template = await readTemplatePackageJson()

    return `${JSON.stringify(
        {
            name,
            private: true,
            license: 'proprietary',
            version: '0.0.0',
            scripts: template.scripts,
            scandipwa: template.scandipwa,
            dependencies: {
                [magentoScriptsPackage]: magentoScriptsVersion
            }
        },
        null,
        4
    )}\n`
}

module.exports = {
    mergePackageJson,
    createPackageJson,
    magentoScriptsPackage
}
