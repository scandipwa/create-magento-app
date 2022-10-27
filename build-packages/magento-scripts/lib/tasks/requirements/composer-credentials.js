/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-nested-ternary */
const path = require('path')
const fs = require('fs')
const os = require('os')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const pathExists = require('../../util/path-exists')
const KnownError = require('../../errors/known-error')
const UnknownError = require('../../errors/unknown-error')

const authJsonPath = path.join(process.cwd(), 'auth.json')
const shellName = process.env.SHELL.split('/').pop()
const shellConfigFileName = `.${shellName}rc`
const shellConfigFilePath = path.join(os.homedir(), shellConfigFileName)

const pasteKeybinding =
    process.platform === 'darwin' ? 'CMD + V' : 'CTRL + SHIFT + V'

const MISSING_COMPOSER_AUTH_ENV = 'missing composer auth environment variable'
const MISSING_AUTH_JSON = 'missing auth.json file'

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const configureComposerCredentials = () => ({
    title: 'Configuring Composer Credentials',
    task: async (ctx, task) => {
        const configureLocation = await task.prompt({
            type: 'Select',
            message: `We didn't find Composer credentials in your ${logger.style.misc(
                '$COMPOSER_AUTH'
            )} environment variable or in your ${logger.style.file(
                './auth.json'
            )} file.

Those credentials are required to install Magento.

Where do you want to store them?`,
            choices: [
                {
                    message: `Inside my projects directory in ${logger.style.file(
                        'auth.json'
                    )} file [${logger.style.misc('Recommended')}]`,
                    name: 'auth.json'
                },
                {
                    message: `Inside my shells configuration file located in users home directory ${logger.style.file(
                        shellConfigFileName
                    )} [${logger.style.misc(
                        'Shared credentials, not recommended'
                    )}] `,
                    name: 'shell'
                }
            ]
        })

        const usernameCredentials = await task.prompt({
            type: 'Input',
            message: `Please enter your username key.

You can obtain this key from Magento Marketplace

1. Go to ${logger.style.link(
                'https://marketplace.magento.com/customer/accessKeys/'
            )}
2. Use created Access Keypair or click ${logger.style.misc(
                'Generate Access Keypair'
            )} to generate new Access Keypair
3. Click ${logger.style.misc('Copy')} on ${logger.style.misc(
                'Public key'
            )} and paste it here (${logger.style.misc(pasteKeybinding)})

${logger.style.misc('Username')} (${logger.style.misc('Public key')}):`,
            required: true,
            validate: (value) => {
                if (value.trim() === '') {
                    return 'Username must not be empty'
                }

                return true
            }
        })

        const passwordCredentials = await task.prompt({
            type: 'Input',
            message: `Please enter your password key.

You can obtain this key from Magento Marketplace

1. Go to ${logger.style.link(
                'https://marketplace.magento.com/customer/accessKeys/'
            )}
2. Use created Access Keypair or click ${logger.style.misc(
                'Generate Access Keypair'
            )} to generate new Access Keypair
3. Click ${logger.style.misc('Copy')} on ${logger.style.misc(
                'Private key'
            )} and paste it here (${logger.style.misc(pasteKeybinding)})

${logger.style.comment(
    'Make sure to use Private key from the same Keypair as your Public key!'
)}

${logger.style.misc('Password')} (${logger.style.misc('Private key')}):`,
            required: true,
            validate: (value) => {
                if (value.trim() === '') {
                    return 'Password must not be empty'
                }

                return true
            }
        })

        const authContent = {
            'http-basic': {
                'repo.magento.com': {
                    username: usernameCredentials.trim(),
                    password: passwordCredentials.trim()
                }
            }
        }

        const authJsonContent = JSON.stringify(authContent, null, 4)
        const authEnvContent = `export COMPOSER_AUTH='${JSON.stringify(
            authContent,
            null,
            0
        )}'`

        process.env.COMPOSER_AUTH = JSON.stringify(
            JSON.parse(authJsonContent),
            null,
            0
        )

        if (configureLocation === 'auth.json') {
            await fs.promises.writeFile(authJsonPath, authJsonContent, 'utf-8')
            return
        }

        switch (shellName) {
            case 'bash':
            case 'zsh': {
                await fs.promises.appendFile(
                    path.join(os.homedir(), shellConfigFileName),
                    `\n${authEnvContent}\n`
                )
                break
            }
            default: {
                throw new KnownError(
                    `Unfortunately we cannot automatically add credentials for your shell ${
                        process.env.SHELL
                    }!

You will need to that manually!

Add following string to your shell configuration file: ${logger.style.code()}`
                )
            }
        }

        await task.prompt({
            type: 'Confirm',
            message: `Before we continue with installation...

You selected to add your Magento credentials to your shell environment, you should know that shell configuration does not update automatically.

To update it you can either restart your existing shell or run the following command to update the configuration temporarily: ${logger.style.code(
                'source <path/to/config/file>'
            )}

Press ${logger.style.misc('Y')} to continue`
        })
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkComposerCredentials = () => ({
    title: 'Checking Composer credentials',
    task: async (ctx, task) => {
        const problems = new Map()
        if (!process.env.COMPOSER_AUTH) {
            problems.set(MISSING_COMPOSER_AUTH_ENV, true)
        }

        if (!(await pathExists(authJsonPath))) {
            problems.set(MISSING_AUTH_JSON, true)
        }

        if (
            problems.has(MISSING_COMPOSER_AUTH_ENV) &&
            problems.has(MISSING_AUTH_JSON)
        ) {
            let doConfigure = true
            if (await pathExists(shellConfigFilePath)) {
                const rcFileContent = await fs.promises.readFile(
                    shellConfigFilePath,
                    'utf-8'
                )

                const lines = rcFileContent.split('\n')
                const composerAuthInRcFile = lines.some((line) =>
                    line.startsWith('export COMPOSER_AUTH=')
                )

                if (composerAuthInRcFile) {
                    doConfigure = false
                    const loadCredentialsFrom = await task.prompt({
                        type: 'Confirm',
                        message: `We detected that you have ${logger.style.misc(
                            'COMPOSER_AUTH'
                        )} environment variable set in ${logger.style.file(
                            shellConfigFilePath
                        )} file,
but we do not see this variable inside ${logger.style.code(
                            'magento-scripts'
                        )} process.

${logger.style.misc(
    "! Don't forget to reload your shell after process is finished !"
)}

Would you like to load them now?`
                    })

                    if (loadCredentialsFrom) {
                        const credentialsLine = lines.find((line) =>
                            line.startsWith('export COMPOSER_AUTH=')
                        )
                        process.env.COMPOSER_AUTH = JSON.stringify(
                            JSON.parse(
                                // credentialsLine does exists, we know it from check above
                                // @ts-ignore
                                credentialsLine
                                    .replace('export COMPOSER_AUTH=', '')
                                    .replace(/'/gi, '')
                                    .trim()
                            ),
                            null,
                            0
                        )
                        problems.delete(MISSING_COMPOSER_AUTH_ENV)
                    }
                }
            }

            if (doConfigure) {
                return task.newListr(configureComposerCredentials())
            }
        }

        let composerAuthContent

        if (!problems.has(MISSING_AUTH_JSON)) {
            try {
                const composerAuthFileContent = await fs.promises.readFile(
                    authJsonPath,
                    'utf-8'
                )

                composerAuthContent = JSON.parse(composerAuthFileContent)

                const repoMagentoCredentials =
                    composerAuthContent &&
                    composerAuthContent['http-basic'] &&
                    composerAuthContent['http-basic']['repo.magento.com']

                const hasEmptyCharacterInUsername =
                    repoMagentoCredentials &&
                    /\s/i.test(repoMagentoCredentials.username)
                const hasEmptyCharacterInPassword =
                    repoMagentoCredentials &&
                    /\s/i.test(repoMagentoCredentials.password)

                // TODO refactor to check all fields, not only for magento
                const message =
                    hasEmptyCharacterInUsername && hasEmptyCharacterInPassword
                        ? `Both ${logger.style.misc(
                              'username'
                          )} and ${logger.style.misc(
                              'password'
                          )} fields in ${logger.style.misc(
                              'http-basic -> repo.magento.com'
                          )} in ${logger.style.file(
                              './auth.json'
                          )} contains empty characters (spaces).
Do you want to remove them now? File will be overwritten.`
                        : hasEmptyCharacterInUsername
                        ? `Your ${logger.style.misc(
                              'http-basic -> repo.magento.com -> username'
                          )} field in ${logger.style.file(
                              './auth.json'
                          )} contains empty characters (spaces).
Do you want to remove them now? File will be overwritten.`
                        : hasEmptyCharacterInPassword
                        ? `Your ${logger.style.misc(
                              'http-basic -> repo.magento.com -> password'
                          )} field in ${logger.style.file(
                              './auth.json'
                          )} contains empty characters (spaces).
Do you want to remove them now? File will be overwritten.`
                        : null

                if (message) {
                    const response = await task.prompt({
                        message,
                        type: 'Select',
                        choices: [
                            {
                                name: 'overwrite',
                                message: 'Yes, please!'
                            },
                            {
                                name: 'skip',
                                message: "No, I know what I'm doing"
                            }
                        ]
                    })

                    if (response === 'overwrite') {
                        if (repoMagentoCredentials.username) {
                            repoMagentoCredentials.username =
                                repoMagentoCredentials.username.replace(
                                    /\s/i,
                                    ''
                                )
                        }

                        if (repoMagentoCredentials.password) {
                            repoMagentoCredentials.password =
                                repoMagentoCredentials.password.replace(
                                    /\s/i,
                                    ''
                                )
                        }

                        await fs.promises.writeFile(
                            authJsonPath,
                            JSON.stringify(composerAuthContent, null, 4),
                            'utf-8'
                        )
                    }
                }

                process.env.COMPOSER_AUTH = composerAuthFileContent
            } catch (e) {
                throw new UnknownError(
                    `We found an error in your ${logger.style.file(
                        './auth.json'
                    )} file.

Make sure that this file contains a valid JSON!

You can try linting your file here: ${logger.style.link(
                        'https://jsonformatter.curiousconcept.com/'
                    )}

Error message that we got: ${e}`
                )
            }
        }

        if (!problems.has(MISSING_COMPOSER_AUTH_ENV) && !composerAuthContent) {
            try {
                composerAuthContent = JSON.parse(process.env.COMPOSER_AUTH)
            } catch (e) {
                throw new UnknownError(
                    `We found an error in your ${logger.style.misc(
                        '$COMPOSER_AUTH'
                    )} environment variable.

Make sure that this variable contains a valid JSON!

You can try linting your variable here: ${logger.style.link(
                        'https://jsonformatter.curiousconcept.com/'
                    )}

Error message that we got: ${e}`
                )
            }
        }
    }
})

module.exports = {
    checkComposerCredentials
}
