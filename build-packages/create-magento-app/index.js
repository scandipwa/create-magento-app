#!/usr/bin/env node
/* eslint-disable @typescript-eslint/ban-ts-comment */

const path = require('path')
const yargs = require('yargs')
const semver = require('semver')
// @ts-ignore
const getLatestVersion = require('@scandipwa/scandipwa-dev-utils/latest-version')
// @ts-ignore
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
// @ts-ignore
const createFilesystem = require('@scandipwa/scandipwa-dev-utils/create-filesystem')
// @ts-ignore
const shouldUseYarn = require('@scandipwa/scandipwa-dev-utils/should-use-yarn')
// @ts-ignore
const installDeps = require('@scandipwa/scandipwa-dev-utils/install-deps')
const { checkDependencies } = require('./lib/dependency')
const { detectProject } = require('./lib/adopt/detect-project')
const { adoptProject } = require('./lib/adopt/adopt-project')
const { getProjectName, toPackageName } = require('./lib/project-name')

/**
 * @param {string} name
 * @param {string} pathname
 */
const greet = (name, pathname) => {
    const relativePathname = `./${pathname}`
    const displayedCommand = shouldUseYarn() ? 'yarn' : 'npm run'

    logger.logN(
        `Success! Created Magento 2 application "${logger.style.misc(
            name
        )}" at ${logger.style.file(relativePathname)}!`
    )

    logger.log('Inside that directory, you can run several commands:')
    logger.logT(
        logger.style.command(`${displayedCommand} start`),
        logger.style.comment('Starts the Magento 2')
    )
    logger.logT(
        logger.style.command(`${displayedCommand} stop`),
        logger.style.comment('Stops the Magento 2')
    )
    logger.logT(
        logger.style.command(`${displayedCommand} restart`),
        logger.style.comment('Restart the Magento 2')
    )
    logger.logT(
        logger.style.command(`${displayedCommand} cleanup`),
        logger.style.comment('Removes the Magento 2 installation')
    )

    logger.log() // add empty line

    logger.log('We suggest that you begin by typing:')
    logger.logT(logger.style.command('cd'), relativePathname)
    logger.logT(logger.style.command(`${displayedCommand} start`))

    logger.log() // add empty line

    logger.logN('Happy coding! <3')
}

/**
 * `create-magento-app .` is the common way to adopt a project, and `./.` reads
 * badly — collapse a self-referencing destination to `.`.
 * @param {string} pathname
 * @returns {string}
 */
const getDisplayPath = (pathname) => {
    const relativePathname = path.relative(
        process.cwd(),
        path.resolve(process.cwd(), pathname)
    )

    return relativePathname === '' ? '.' : `./${relativePathname}`
}

/**
 * @param {import('./lib/adopt/adopt-project').AdoptReport} report
 * @param {string} pathname
 * @param {boolean} isMagento
 */
const greetAdopted = (report, pathname, isMagento) => {
    const relativePathname = getDisplayPath(pathname)
    const displayedCommand = shouldUseYarn() ? 'yarn' : 'npm run'

    logger.logN(
        `Success! Added Create Magento App to the existing ${
            isMagento ? 'Magento 2 ' : ''
        }project at ${logger.style.file(relativePathname)}!`
    )

    if (report.created.length > 0) {
        logger.log('Created:')
        report.created.forEach((file) => logger.logT(logger.style.file(file)))
        logger.log()
    }

    if (report.refreshed.length > 0) {
        logger.log('Updated, because CMA manages them:')
        report.refreshed.forEach((file) => logger.logT(logger.style.file(file)))
        logger.log()
    }

    if (report.addedScripts.length > 0) {
        logger.log('Added to your existing package.json:')
        report.addedScripts.forEach((script) =>
            logger.logT(logger.style.command(script))
        )
        logger.log()
    }

    if (report.preserved.length > 0) {
        logger.log('Left untouched, because your project already has them:')
        report.preserved.forEach((file) => logger.logT(logger.style.file(file)))
        logger.log()
    }

    if (report.conflictingScripts.length > 0) {
        logger.warn(
            'Some package.json scripts already exist with a different value, so they were not changed:'
        )
        report.conflictingScripts.forEach((script) =>
            logger.logT(logger.style.command(script))
        )
        logger.log(
            `Run those through ${logger.style.command(
                'npx magento-scripts <command>'
            )}, or rename your own scripts and re-run this command.`
        )
        logger.log()
    }

    logger.log('We suggest that you begin by typing:')

    if (relativePathname !== '.') {
        logger.logT(logger.style.command('cd'), relativePathname)
    }

    logger.logT(logger.style.command(`${displayedCommand} start`))

    logger.log() // add empty line

    logger.logN('Happy coding! <3')
}

/**
 * @returns {Promise<string>}
 */
const getMagentoScriptsVersion = async () => {
    try {
        return await getLatestVersion('@scandipwa/magento-scripts')
    } catch (e) {
        logger.warn(
            `Package ${logger.style.misc(
                '@scandipwa/magento-scripts'
            )} is not yet published.`
        )

        return '0.0.0'
    }
}

/**
 * @param {{ name: string, path: string }} options
 */
const createApp = async (options) => {
    const { name, path: pathname } = options

    const destination = path.resolve(process.cwd(), pathname)

    const latestVersion = await getMagentoScriptsVersion()

    const templateOptions = {
        scandipwaBeScriptsVersion: latestVersion,
        name
    }

    // create filesystem from template
    await createFilesystem(
        destination,
        path.join(__dirname, 'template'),
        (filesystem, templatePath, destinationPath) => {
            // copy the entire template tree verbatim, including dotfiles and
            // directories like .claude and .agents. `dot: true` is required for
            // globby to pick up the dot-prefixed entries. Files are copied as-is
            // (no EJS processing), so docs that contain template-like syntax are
            // preserved.
            filesystem.copy(templatePath(), destinationPath(), {
                globOptions: { dot: true }
            })

            // render the files that use EJS placeholders on top of the copies
            filesystem.copyTpl(
                templatePath('package.json'),
                destinationPath('package.json'),
                templateOptions
            )
        }
    )

    // install dependencies
    await installDeps(destination)

    // greet the user
    greet(name, pathname)
}

/**
 * Add CMA to a project that already exists, merging into it instead of copying
 * the template over the top of it.
 * @param {{ name: string, path: string }} options
 * @param {import('./lib/adopt/detect-project').ProjectDescriptor} project
 */
const addToExistingApp = async (options, project) => {
    const { name, path: pathname } = options

    const destination = path.resolve(process.cwd(), pathname)

    logger.note(
        `Found an existing ${
            project.isMagento ? 'Magento 2 project' : 'project'
        } at ${logger.style.file(getDisplayPath(pathname))}.`,
        'Adding Create Magento App to it — your existing files will not be overwritten.'
    )

    const report = await adoptProject({
        destination,
        name,
        magentoScriptsVersion: await getMagentoScriptsVersion()
    })

    await installDeps(destination)

    greetAdopted(report, pathname, project.isMagento)
}

/**
 * @param {{ name: string, path: string }} options
 */
const init = async (options) => {
    await checkDependencies()

    try {
        // Validate we are on the latest version of the application
        const latest = await getLatestVersion('create-magento-app')
        const packageJson = require('./package.json')

        if (latest && semver.lt(packageJson.version, latest)) {
            logger.error(
                `You are running ${logger.style.misc(
                    'create-magento-app'
                )} ${logger.style.misc(
                    packageJson.version
                )}, which is behind the latest release ${logger.style.misc(
                    latest
                )}.`,
                'We no longer support global installation of Create Magento App.'
            )

            logger.log(
                'Please remove any global installs with one of the following commands:'
            )
            logger.logT('npm uninstall -g create-magento-app')
            logger.logT('yarn global remove create-magento-app')

            process.exit(1)
        }
    } catch (e) {
        logger.warn(
            `Package ${logger.style.misc(
                'create-magento-app'
            )} is not yet published.`
        )
    }

    const project = await detectProject(
        path.resolve(process.cwd(), options.path)
    )

    if (project.isExisting) {
        await addToExistingApp(options, project)
        return
    }

    await createApp(options)
}

// eslint-disable-next-line no-unused-expressions
yargs.command(
    '$0 <destination>',
    'Create Magento App',
    (yargs) =>
        yargs
            .example(
                '$0 my-app',
                'Creates a new Magento 2 application in the "my-app" folder relative to current working directory.'
            )
            .example(
                '$0 .',
                'Adds Create Magento App to the existing Magento 2 project in the current directory.'
            ),
    /**
     * @arg {import('yargs').ArgumentsCamelCase<{ destination: string }>} args
     */
    async (args) => {
        const { destination } = args

        await init({
            // we do not care about organization it is or not
            name: toPackageName(getProjectName(destination)),
            path: destination
        })
    }
).argv
