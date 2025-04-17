const os = require('os')
const fs = require('fs')
const path = require('path')
const {
    runPHPContainerCommandTask,
    runPHPContainerCommand
} = require('../../php/php-container')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const makeNewFilesCreatedInFolderUseDirectoryGroup = () => ({
    title: 'Make new files created in folder use directory group',
    task: (ctx, task) =>
        task.newListr([
            runPHPContainerCommandTask(
                'find var generated vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} +',
                {
                    // should prevent command from failing the task
                    // if the folder does not exist
                    withCode: true
                }
            )
        ])
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const makeFilesWritableForGroupMembers = () => ({
    title: 'Make files writable for group members',
    task: (ctx, task) =>
        task.newListr([
            runPHPContainerCommandTask(
                'find var generated vendor pub/static pub/media app/etc -type f -exec chmod g+w {} +',
                {
                    // should prevent command from failing the task
                    // if the folder does not exist
                    withCode: true
                }
            )
        ])
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
 */
const doesFileSystemNeedsPermissionsSetup = async (ctx) => {
    const checkPHPPermissionsFileName = 'check-file-permissions.php'
    const cacheDirFilePath = path.join(
        ctx.config.baseConfig.cacheDir,
        checkPHPPermissionsFileName
    )
    await fs.promises.copyFile(
        path.join(__dirname, checkPHPPermissionsFileName),
        cacheDirFilePath
    )

    const result = await runPHPContainerCommand(
        ctx,
        `php ${path.relative(process.cwd(), cacheDirFilePath)}`,
        {
            user: 'www-data:www-data',
            cwd: ctx.config.baseConfig.containerMagentoDir
        }
    )

    await fs.promises.unlink(cacheDirFilePath)

    /**
     * @type {{directory: string, exists: boolean, writable: boolean, permissions: string, directory_owner: {name: string, passwd: string, uid: number, gid: number, gecos: string, dir: string, shell: string} | boolean, directory_group: boolean, current_user: {name: string, passwd: string, uid: number, gid: number, gecos: string, dir: string, shell: string} | boolean, is_current_user_directory_owner: boolean}[]}
     */
    const parsedResult = JSON.parse(result)

    if (parsedResult.some(({ exists, writable }) => exists && !writable)) {
        return true
    }

    return false
}

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupMagentoFilePermissions = () => ({
    title: 'Setting Magento file permissions',
    // skip: true,
    skip: async (ctx) =>
        ctx.magentoFirstInstall ||
        !(await doesFileSystemNeedsPermissionsSetup(ctx)),
    task: (ctx, task) =>
        task.newListr(
            [
                makeNewFilesCreatedInFolderUseDirectoryGroup(),
                makeFilesWritableForGroupMembers()
            ].concat(
                ctx.isDockerDesktop
                    ? [
                          makeFolderOwnedByUser(
                              ctx.config.baseConfig.containerMagentoDir,
                              'www-data',
                              'www-data'
                          )
                      ]
                    : []
            )
        )
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupComposerCachePermissions = () => ({
    title: 'Setting Composer Cache permissions',
    task: (ctx, task) =>
        task.newListr([
            ctx.isDockerDesktop
                ? makeFolderOwnedByUser(
                      '/composer/home',
                      'www-data',
                      'www-data'
                  )
                : makeFolderOwnedByUser(
                      '/composer/home',
                      os.userInfo().uid,
                      os.userInfo().gid
                  ),

            runPHPContainerCommandTask('chmod g+ws /composer/home/cache'),
            runPHPContainerCommandTask('chmod g+w /composer/home/cache')
        ])
})

module.exports = {
    makeFilesWritableForGroupMembers,
    makeNewFilesCreatedInFolderUseDirectoryGroup,
    setupMagentoFilePermissions,
    setupComposerCachePermissions
}
