const os = require('os')
const fs = require('fs')
const path = require('path')
const {
    runPHPContainerCommandTask,
    runPHPContainerCommand
} = require('../../php/php-container')

const directoriesToCheck = [
    'var',
    'generated',
    'vendor',
    'pub/media',
    'pub/static',
    'app/etc'
]

/**
 * @param {string[]} directories
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const makeNewFilesCreatedInFolderUseDirectoryGroup = (directories) => ({
    title: 'Make new files created in folder use directory group',
    task: async (ctx, task) => {
        if (directories.length === 0) {
            task.skip()
            return
        }

        return task.newListr([
            runPHPContainerCommandTask(
                `find ${directories.join(' ')} -type d -exec chmod g+ws {} +`,
                {
                    // should prevent command from failing the task
                    // if the folder does not exist
                    withCode: true,
                    useAutomaticUser: false
                }
            )
        ])
    }
})

/**
 * @param {string[]} directories
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const makeFilesWritableForGroupMembers = (directories) => ({
    title: 'Make files writable for group members',
    task: async (ctx, task) => {
        if (directories.length === 0) {
            task.skip()
            return
        }

        return task.newListr([
            runPHPContainerCommandTask(
                `find ${directories.join(
                    ' '
                )} -type -type f -exec chmod g+w {} +`,
                {
                    // should prevent command from failing the task
                    // if the folder does not exist
                    withCode: true
                }
            )
        ])
    }
})

/**
 * @param {string} folder
 * @param {string | number} user
 * @param {string | number} [group]
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const makeFolderOwnedByUser = (folder, user, group) => ({
    title: `Make folder ${folder} owned by ${user} user${
        group ? ` and ${group} group` : ''
    }`,
    task: (ctx, task) =>
        task.newListr([
            runPHPContainerCommandTask(
                `chown -R ${user}${group ? `:${group}` : ''} ${folder}`,
                {
                    user: 'root:root'
                }
            )
        ])
})

/**
 * @param {import('../../../../typings/context').ListrContext} ctx
 * @param {string[]} directories
 * @return {Promise<{directory: string, exists: boolean, new_files_inherit_group: boolean, has_group_write_permissions: boolean, writable: boolean, permissions: string, directory_owner: {name: string, passwd: string, uid: number, gid: number, gecos: string, dir: string, shell: string} | boolean, directory_group: boolean, current_user: {name: string, passwd: string, uid: number, gid: number, gecos: string, dir: string, shell: string} | boolean, is_current_user_directory_owner: boolean}[]>}
 */
const checkDirectoriesPermissions = async (ctx, directories) => {
    const checkPHPPermissionsFileName = 'check-file-permissions.php'
    const cacheDirFilePath = path.join(
        ctx.config.baseConfig.cacheDir,
        `${Date.now()}-${checkPHPPermissionsFileName}`
    )
    await fs.promises.copyFile(
        path.join(__dirname, checkPHPPermissionsFileName),
        cacheDirFilePath
    )
    const user =
        ctx.platform === 'linux' ? `${os.userInfo().username}` : 'www-data'
    const group =
        ctx.platform === 'linux' ? `${os.userInfo().username}` : 'www-data'

    const userWithGroup = `${user}:${group}`

    const result = await runPHPContainerCommand(
        ctx,
        `php ${path.relative(
            ctx.config.baseConfig.containerMagentoDir,
            cacheDirFilePath
        )} ${directories.join(',')}`,
        {
            user: userWithGroup,
            cwd: ctx.config.baseConfig.containerMagentoDir
        }
    )

    await fs.promises.unlink(cacheDirFilePath)

    return JSON.parse(result)
}

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupMagentoFilePermissions = () => ({
    title: 'Setting Magento file permissions',
    task: async (ctx, task) => {
        const parsedResult = await checkDirectoriesPermissions(
            ctx,
            directoriesToCheck.map((directory) =>
                path.join(ctx.config.baseConfig.containerMagentoDir, directory)
            )
        )
        const nonWritableDirectories = parsedResult.filter(
            ({ exists, writable }) => exists && !writable
        )

        const tasks = []

        if (nonWritableDirectories.length !== 0) {
            const nonWritableDirectoriesPaths = nonWritableDirectories.map(
                ({ directory }) => directory
            )
            const user =
                ctx.platform === 'linux'
                    ? `${os.userInfo().username}`
                    : 'www-data'
            const group =
                ctx.platform === 'linux'
                    ? `${os.userInfo().username}`
                    : 'www-data'

            tasks.push(
                makeFilesWritableForGroupMembers(nonWritableDirectoriesPaths),
                {
                    task: (subCtx, subTask) =>
                        subTask.newListr(
                            nonWritableDirectoriesPaths.map((directory) =>
                                makeFolderOwnedByUser(directory, user, group)
                            )
                        ),
                    options: {
                        concurrent: true
                    }
                }
            )
        }

        const directoriesThatNeedNewFilesInheritGroup = parsedResult
            .filter(
                ({ exists, new_files_inherit_group: nfig }) => exists && !nfig
            )
            .map(({ directory }) => directory)

        if (directoriesThatNeedNewFilesInheritGroup.length > 0) {
            tasks.push(
                makeNewFilesCreatedInFolderUseDirectoryGroup(
                    directoriesThatNeedNewFilesInheritGroup
                )
            )
        }

        if (tasks.length === 0) {
            task.skip()
            return
        }

        return task.newListr(tasks)
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupComposerCachePermissions = () => ({
    title: 'Setting Composer Cache permissions',
    task: async (ctx, task) => {
        const parsedResult = await checkDirectoriesPermissions(ctx, [
            '/composer/home'
        ])

        if (parsedResult.every((dir) => dir.writable)) {
            task.skip()
            return
        }

        const userAndGroup =
            ctx.platform === 'linux' ? `${os.userInfo().username}` : 'www-data'

        return task.newListr([
            makeFolderOwnedByUser('/composer/home', userAndGroup, userAndGroup),
            runPHPContainerCommandTask('chmod g+ws /composer/home/cache', {
                user: ctx.platform === 'linux' ? 'root:root' : ''
            }),
            runPHPContainerCommandTask('chmod g+w /composer/home/cache', {
                user: ctx.platform === 'linux' ? 'root:root' : ''
            })
        ])
    }
})

module.exports = {
    makeFilesWritableForGroupMembers,
    makeNewFilesCreatedInFolderUseDirectoryGroup,
    setupMagentoFilePermissions,
    setupComposerCachePermissions
}
