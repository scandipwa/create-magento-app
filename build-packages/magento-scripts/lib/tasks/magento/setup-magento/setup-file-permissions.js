const path = require('path')
const { runPHPContainerCommandTask } = require('../../php/php-container')
const { containerApi } = require('../../docker/containers')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const makeNewFilesCreatedInFolderUseDirectoryGroup = () => ({
    title: 'Make new files created in folder use directory group',
    task: (ctx, task) =>
        task.newListr([
            runPHPContainerCommandTask(
                'find var generated vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} +'
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
                'find var generated vendor pub/static pub/media app/etc -type f -exec chmod g+w {} +'
            )
        ])
})

/**
 * @param {string} folder
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const makeFolderOwnedByWwwDataUser = (folder) => ({
    title: `Make folder ${folder} owned by www-data user`,
    task: (ctx, task) =>
        task.newListr([
            runPHPContainerCommandTask(`chown -R www-data:www-data ${folder}`)
        ])
})

/**
 * @param {import('../../../../typings/context').ListrContext} ctx
 */
const doesFileSystemNeedsPermissionsSetup = async (ctx) => {
    const { php } = ctx.config.docker.getContainers(ctx.ports)

    const result = await containerApi.run({
        env: {},
        command: 'php ./check-file-permissions.php',
        mountVolumes: [
            ...php.mountVolumes,
            `${path.join(__dirname, 'check-file-permissions.php')}:${
                ctx.config.baseConfig.containerMagentoDir
            }/check-file-permissions.php`
        ],
        user: 'www-data:www-data',
        image: php.image,
        detach: false,
        rm: true
    })

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
        task.newListr([
            makeNewFilesCreatedInFolderUseDirectoryGroup(),
            makeFilesWritableForGroupMembers(),
            makeFolderOwnedByWwwDataUser(
                ctx.config.baseConfig.containerMagentoDir
            )
        ])
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupComposerCachePermissions = () => ({
    title: 'Setting Composer Cache permissions',
    task: (ctx, task) =>
        task.newListr([
            makeFolderOwnedByWwwDataUser('/composer/home'),
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
