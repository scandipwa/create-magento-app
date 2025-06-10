const path = require('path')
const fs = require('fs')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const { volumeApi, createVolumes } = require('./volume')
const { execAsyncSpawn } = require('../../util/exec-async-command')
const { containerApi, stopContainers, pullImages } = require('./containers')
const { importDumpToDatabase, connectToDatabase } = require('../database')
const getProjectConfiguration = require('../../config/get-project-configuration')
const {
    getAvailablePorts,
    getCachedPorts
} = require('../../config/get-port-config')
const { saveConfiguration } = require('../../config/save-config')
const { buildProjectImage } = require('./project-image-builder')
const checkPHPVersion = require('../requirements/php-version')
const { getComposerVersionTask } = require('../composer')
const { prepareFileSystem } = require('../file-system')
const { installMagentoProject } = require('../magento')
const enableMagentoComposerPlugins = require('../magento/enable-magento-composer-plugins')
const { startServices } = require('./index')
const dockerNetwork = require('./network')
const KnownError = require('../../errors/known-error')
const { createCacheFolder } = require('../cache')
const { getSystemConfigTask } = require('../../config/system-config')
const sleep = require('../../util/sleep')
const { setProjectConfigTask } = require('../project-config')
const checkSearchEngineVersion = require('../requirements/searchengine-version')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const convertMySQLDatabaseToMariaDB = () => ({
    task: async (ctx, task) => {
        const mysqlVolumeName = `${ctx.config.baseConfig.prefix}_mysql-data`
        const volumes = await volumeApi.ls({ formatToJSON: true })
        if (ctx.isArmMac) {
            if (
                volumes.some((volume) => volume.Name === mysqlVolumeName) &&
                !volumes.some(
                    (volume) =>
                        volume.Name === ctx.config.docker.volumes.mariadb.name
                )
            ) {
                task.title = 'Converting MySQL database to MariaDB'
                return task.newListr([
                    stopContainers(),
                    {
                        title: 'Converting MySQL volume to MariaDB',
                        task: async (subCtx, subTask) => {
                            subTask.output = `Creating volume ${subCtx.config.docker.volumes.mariadb.name}...`
                            await volumeApi.create(
                                subCtx.config.docker.volumes.mariadb
                            )
                            subTask.output = `Copying data from ${mysqlVolumeName} to ${subCtx.config.docker.volumes.mariadb.name}...`
                            await execAsyncSpawn(
                                `docker run --rm -v ${mysqlVolumeName}:/from:ro -v ${subCtx.config.docker.volumes.mariadb.name}:/to alpine ash -c "cd /from; cp -av . /to"`,
                                {
                                    callback: (t) => {
                                        subTask.output = t
                                    }
                                }
                            )
                            subTask.output = 'Deleting old volume...'
                            await execAsyncSpawn(
                                `docker volume rm ${mysqlVolumeName}`
                            )
                        },
                        options: {
                            bottomBar: 10
                        }
                    }
                ])
            }

            return
        }

        if (
            volumes.some((volume) => volume.Name === mysqlVolumeName) &&
            !volumes.some(
                (volume) =>
                    volume.Name === ctx.config.docker.volumes.mariadb.name
            )
        ) {
            task.title = 'Converting MySQL database to MariaDB'
            const confirmConvert = await task.prompt({
                type: 'Select',
                message: `We see that you have old mysql-data volume in the project!
Since ${logger.style.code('magento-scripts@2.0.0')} ${logger.style.misc(
                    'MariaDB'
                )} is used as database instead of MySQL.

To use MariaDB with data from MySQL we need to convert your database.
`,
                choices: [
                    {
                        name: 'yes',
                        message: "Okay, let's do that!"
                    },
                    {
                        name: 'no',
                        message: 'ABORT ABORT ABORT'
                    }
                ]
            })

            if (confirmConvert === 'yes') {
                const pathToMySQLDumpFile = path.join(
                    process.cwd(),
                    'mysql-database.sql'
                )
                const containerName = 'mysql-database'
                task.output = 'Creating dump file from MySQL database...'

                const existingContainers = await containerApi.ls({
                    formatToJSON: true,
                    all: true
                })

                if (existingContainers.some((c) => c.Names === containerName)) {
                    await execAsyncSpawn(
                        `docker container stop ${containerName}`
                    )
                    await execAsyncSpawn(`docker container rm ${containerName}`)
                }

                task.output = 'Starting MySQL server...'

                await containerApi.run({
                    mounts: [`source=${mysqlVolumeName},target=/var/lib/mysql`],
                    env: {
                        MYSQL_PORT: 3306,
                        MYSQL_ROOT_PASSWORD: 'scandipwa',
                        MYSQL_USER: 'magento',
                        MYSQL_PASSWORD: 'magento',
                        MYSQL_DATABASE: 'magento'
                    },
                    command: [
                        '--log_bin_trust_function_creators=1',
                        '--default-authentication-plugin=mysql_native_password',
                        '--max_allowed_packet=1GB',
                        '--bind-address=0.0.0.0'
                    ].join(' '),
                    securityOptions: ['seccomp=unconfined'],
                    name: containerName,
                    image: `mysql:${ctx.config.overridenConfiguration.configuration.mysql.version}`
                })

                task.output = 'Waiting for MySQL to initialize...'

                let mysqlReadyForConnections = false

                while (!mysqlReadyForConnections) {
                    const mysqlOutput = await execAsyncSpawn(
                        `docker logs ${containerName}`
                    )
                    if (mysqlOutput.includes('ready for connections')) {
                        mysqlReadyForConnections = true
                        task.output = 'MySQL is ready!'
                        break
                    } else if (
                        mysqlOutput.includes('Initializing database files')
                    ) {
                        task.output = `MySQL is initializing database files!
Please wait, this will take some time and do not restart the MySQL container until initialization is finished!`

                        let mysqlFinishedInitialization = false
                        while (!mysqlFinishedInitialization) {
                            const mysqlOutput = await execAsyncSpawn(
                                `docker logs ${containerName}`
                            )
                            if (
                                mysqlOutput.includes('init process done.') &&
                                !mysqlFinishedInitialization
                            ) {
                                mysqlFinishedInitialization = true
                                task.output = 'MySQL is initialized!'
                                break
                            }
                            await sleep(2000)
                        }
                    }

                    await sleep(2000)
                }

                task.output = 'Dumping MySQL database to dump file...'

                await containerApi.exec(
                    {
                        container: containerName,
                        command: [
                            'mysqldump',
                            '--user=root',
                            '--password=scandipwa',
                            'magento',
                            `--result-file=${
                                path.parse(pathToMySQLDumpFile).base
                            }`
                        ].join(' ')
                    },
                    {
                        callback: (t) => {
                            task.output = t
                        }
                    }
                )

                task.output = 'Copying dump file from container to system...'

                await execAsyncSpawn(
                    `docker cp ${containerName}:/${
                        path.parse(pathToMySQLDumpFile).base
                    } ${pathToMySQLDumpFile}`
                )

                task.output = 'Removing migration container...'

                await execAsyncSpawn(`docker container stop ${containerName}`)
                await execAsyncSpawn(`docker container rm ${containerName}`)

                ctx.importDb = pathToMySQLDumpFile

                return task.newListr([
                    createCacheFolder(),
                    getSystemConfigTask(),
                    getCachedPorts(),
                    stopContainers(),
                    setProjectConfigTask(),
                    getProjectConfiguration(),
                    // get fresh ports
                    getAvailablePorts(),
                    saveConfiguration(),
                    pullImages(),
                    dockerNetwork.tasks.createNetwork(),
                    createVolumes(),
                    buildProjectImage(),
                    checkPHPVersion(),
                    getComposerVersionTask(),
                    prepareFileSystem(),
                    installMagentoProject(),
                    enableMagentoComposerPlugins(),
                    startServices(),
                    checkSearchEngineVersion(),
                    connectToDatabase(),
                    importDumpToDatabase(),
                    {
                        task: async (subCtx, subTask) => {
                            const confirmDeleteOldVolume = await subTask.prompt(
                                {
                                    type: 'Select',
                                    message:
                                        'Okay, looks like conversion went well, do you want to delete old mysql-data volume?',
                                    choices: [
                                        {
                                            name: 'yes',
                                            message: 'Sure'
                                        },
                                        {
                                            name: 'no',
                                            message: 'No, I want to keep it'
                                        }
                                    ]
                                }
                            )

                            if (confirmDeleteOldVolume === 'yes') {
                                await execAsyncSpawn(
                                    `docker volume rm ${mysqlVolumeName}`
                                )

                                const confirmDeleteDump = await subTask.prompt({
                                    type: 'Select',
                                    message: `Last question for today.
Do you want to keep database dump created during conversion process? (${logger.style.file(
                                        pathToMySQLDumpFile
                                    )})`,
                                    choices: [
                                        {
                                            name: 'yes',
                                            message: "I don't need it, thanks"
                                        },
                                        {
                                            name: 'no',
                                            message:
                                                'I would like to keep it, thanks'
                                        }
                                    ]
                                })

                                if (confirmDeleteDump === 'yes') {
                                    await fs.promises.rm(pathToMySQLDumpFile)
                                }
                            }
                        }
                    }
                ])
            }
            throw new KnownError('ABORTING')
        }

        task.skip()
    },
    options: {
        bottomBar: 10
    }
})

module.exports = convertMySQLDatabaseToMariaDB
