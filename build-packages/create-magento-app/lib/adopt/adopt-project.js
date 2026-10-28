const path = require('path')
const fs = require('fs')
const pathExists = require('../path-exists')
const { mergePackageJson, createPackageJson } = require('./merge-package-json')

const templateDir = path.join(__dirname, '..', '..', 'template')

/**
 * Directories whose contents CMA owns outright. They are namespaced under a
 * `magento-scripts` folder, so refreshing them cannot clobber a project's own
 * agent configuration.
 */
const managedDirectories = ['.claude', '.agents']

/**
 * List every file in the template, relative to the template root.
 * @param {string} directory
 * @param {string} [prefix]
 * @returns {Promise<string[]>}
 */
const listTemplateFiles = async (directory, prefix = '') => {
    const entries = await fs.promises.readdir(directory, {
        withFileTypes: true
    })

    const files = await Promise.all(
        entries.map(async (entry) => {
            const relativePath = path.join(prefix, entry.name)

            if (entry.isDirectory()) {
                return listTemplateFiles(
                    path.join(directory, entry.name),
                    relativePath
                )
            }

            return [relativePath]
        })
    )

    return files.flat()
}

/**
 * A template file is CMA-managed when it lives inside one of the namespaced
 * agent directories — those are safe to refresh on every run.
 * @param {string} relativePath
 * @returns {boolean}
 */
const isManagedFile = (relativePath) =>
    managedDirectories.includes(relativePath.split(path.sep)[0])

/**
 * @typedef {Object} AdoptReport
 * @property {string[]} created files written because they were missing
 * @property {string[]} refreshed CMA-managed files written over
 * @property {string[]} preserved files left alone because they already existed
 * @property {string[]} addedScripts package.json scripts added by the merge
 * @property {string[]} conflictingScripts package.json scripts left untouched
 * @property {boolean} addedDependency magento-scripts was added as a dependency
 */

/**
 * Add CMA to a project that already has files in it. Nothing the project owns
 * is overwritten: user-facing files are written only when absent, package.json
 * is merged rather than replaced.
 * @param {Object} options
 * @param {string} options.destination absolute path to the existing project
 * @param {string} options.name project name used when creating a package.json
 * @param {string} options.magentoScriptsVersion
 * @returns {Promise<AdoptReport>}
 */
const adoptProject = async ({ destination, name, magentoScriptsVersion }) => {
    /** @type {AdoptReport} */
    const report = {
        created: [],
        refreshed: [],
        preserved: [],
        addedScripts: [],
        conflictingScripts: [],
        addedDependency: false
    }

    const templateFiles = await listTemplateFiles(templateDir)

    for (const relativePath of templateFiles) {
        const destinationPath = path.join(destination, relativePath)

        if (relativePath === 'package.json') {
            continue
        }

        const exists = await pathExists(destinationPath)

        if (exists && !isManagedFile(relativePath)) {
            report.preserved.push(relativePath)
            continue
        }

        await fs.promises.mkdir(path.dirname(destinationPath), {
            recursive: true
        })
        await fs.promises.copyFile(
            path.join(templateDir, relativePath),
            destinationPath
        )

        if (exists) {
            report.refreshed.push(relativePath)
        } else {
            report.created.push(relativePath)
        }
    }

    const packageJsonPath = path.join(destination, 'package.json')

    if (await pathExists(packageJsonPath)) {
        const { content, addedScripts, conflictingScripts, addedDependency } =
            await mergePackageJson(packageJsonPath, magentoScriptsVersion)

        await fs.promises.writeFile(packageJsonPath, content)

        report.addedScripts = addedScripts
        report.conflictingScripts = conflictingScripts
        report.addedDependency = addedDependency
    } else {
        await fs.promises.writeFile(
            packageJsonPath,
            await createPackageJson(name, magentoScriptsVersion)
        )

        report.created.push('package.json')
        report.addedDependency = true
    }

    return report
}

module.exports = {
    adoptProject
}
