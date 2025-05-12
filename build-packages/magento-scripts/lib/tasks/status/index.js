/* eslint-disable max-len */
const path = require('path')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const { getProjectCreatedAt, getPrefix } = require('../../util/prefix')

const { version: packageVersion } = require('../../../package.json')
const { getArchSync } = require('../../util/arch')
const ConsoleBlock = require('../../util/console-block')
const { getInstanceMetadata } = require('../../util/instance-metadata')

/**
 * @param {any} str
 * @returns {str is string}
 */
const isJSON = (str) => {
    try {
        const result = JSON.parse(str)
        if (typeof result === 'object') {
            return true
        }
    } catch (e) {
        //
    }

    return false
}

/**
 * @param {string} port
 * @return {{ host: string, hostPort: string, containerPort: string }}
 */
const parsePort = (port) => {
    const [host, hostPort, containerPort] = port.split(':')

    return {
        host,
        hostPort,
        containerPort
    }
}

/**
 * @param {import('../../../typings/context').ListrContext & { containers: ReturnType<Awaited<ReturnType<import('../../config/docker')>>['getContainers']> }} ctx
 */
const prettyStatus = async (ctx) => {
    const {
        config: { baseConfig, projectConfig },
        magentoVersion,
        dockerVersion,
        platform,
        platformVersion,
        containers,
        composerVersion,
        systemDFData
    } = ctx
    const projectCreatedAt = getProjectCreatedAt()

    const prefix = getPrefix()

    const { name: folderName } = path.parse(process.cwd())

    const block = new ConsoleBlock()

    block
        .addHeader(
            `magento-scripts version: ${logger.style.link(packageVersion)}`
        )
        .addEmptyLine()
        .addLine(
            `Project: ${logger.style.file(baseConfig.prefix)} ${
                prefix === folderName ? '(without prefix)' : '(with prefix)'
            } (with php container)${
                projectConfig.debug ? ' (with debugging)' : ''
            }`
        )
        .addLine(`Project location: ${logger.style.link(process.cwd())}`)

    if (projectCreatedAt) {
        block.addLine(
            `Project created: ${logger.style.link(
                projectCreatedAt.toDateString()
            )} at ${logger.style.link(projectCreatedAt.toTimeString())}`
        )
    }

    block
        .addLine(`Magento 2 version: ${logger.style.file(magentoVersion)}`)
        .addLine(`PHP version: ${logger.style.file(ctx.phpVersion)}`)
        .addLine(`Composer version: ${logger.style.file(composerVersion)}`)
        .addLine(`Docker version: ${logger.style.file(dockerVersion)}`)
        .addLine(`Platform: ${logger.style.code(platform)}`)
        .addLine(`Platform version: ${logger.style.file(platformVersion)}`)
        .addLine(`Platform architecture: ${logger.style.file(getArchSync())}`)
        .addLine(`CGroup version: ${logger.style.file(ctx.cgroupVersion)}`)
        .addEmptyLine()
        .addSeparator('Docker containers status')

    Object.values(containers).forEach((container) => {
        block
            .addEmptyLine()
            .addLine(`> ${logger.style.misc(container._)}`)
            .addEmptyLine()

        let containerStatus

        if (
            container.status &&
            container.status.State &&
            container.status.State.Health &&
            container.status.State.Status === 'running'
        ) {
            containerStatus = `✓ ${logger.style.file(
                container.status.State.Health.Status
            )} and ${logger.style.file('running')}`
        } else if (
            container.status &&
            container.status.State &&
            container.status.State.Status !== 'exited'
        ) {
            containerStatus = logger.style.file(container.status.State.Status)
        } else {
            containerStatus = '✖ Not running'
        }

        block
            .addLine(`Status: ${containerStatus}`)
            .addLine(`Name: ${logger.style.misc(container.name)}`)

        if (
            container.status &&
            container.status.Config &&
            container.status.Config.Image
        ) {
            block.addLine(
                `Image: ${logger.style.file(container.status.Config.Image)}`
            )
        } else {
            block.addLine(`Image: ${logger.style.file(container.image)}`)
        }

        block.addLine(`Network: ${logger.style.link(container.network)}`)

        if (
            !containerStatus.includes('Not running') &&
            container.forwardedPorts &&
            container.forwardedPorts.length > 0
        ) {
            block.addLine('Port forwarding:')
            container.forwardedPorts.forEach((port) => {
                const { host, hostPort, containerPort } = parsePort(port)
                if (container.network !== 'host') {
                    block.addLine(
                        `${' '.repeat(3)} ${logger.style.link(
                            `${host}:${hostPort}`
                        )} -> ${logger.style.file(
                            containerPort
                        )} (${logger.style.link('host')} -> ${logger.style.file(
                            'container'
                        )})`
                    )
                } else {
                    block.addLine(
                        `${' '.repeat(3)} ${logger.style.link(
                            `Running on host network - ${host}:${hostPort}`
                        )}`
                    )
                }
            })
        }

        if (container.env && Object.keys(container.env).length > 0) {
            block.addLine('Environment variables:')
            for (const [envName, envValue] of Object.entries(container.env)) {
                if (isJSON(envValue)) {
                    const beautifyJSONLines = JSON.stringify(
                        JSON.parse(envValue),
                        null,
                        1
                    ).split('\n')

                    block.addLine(
                        `${' '.repeat(3)} ${logger.style.misc(
                            envName
                        )}=${logger.style.file(beautifyJSONLines.shift())}`
                    )

                    let currentOpeningBracket = 0

                    beautifyJSONLines.forEach((line) => {
                        block.addLine(
                            `${'  '.repeat(
                                2 + currentOpeningBracket
                            )}${logger.style.file(line)}`
                        )
                        if (
                            ['{', '['].some((openingBracketVariant) =>
                                line.includes(openingBracketVariant)
                            )
                        ) {
                            currentOpeningBracket++
                        } else if (
                            ['}', ']'].some((closingBracketVariant) =>
                                line.includes(closingBracketVariant)
                            )
                        ) {
                            currentOpeningBracket--
                        }
                    })
                } else {
                    block.addLine(
                        `${' '.repeat(3)} ${logger.style.misc(
                            envName
                        )}=${logger.style.file(envValue)}`
                    )
                }
            }
        }

        if (container.description) {
            block.addLine('Description:')
            container.description.split('\n').forEach((line) => {
                block.addLine(line)
            })
        }
    })

    block.addSeparator('Docker volume data').addEmptyLine()

    const { volumes } = ctx.config.docker

    Object.values(volumes)
        .map((volume) => {
            volume.volumeData = systemDFData.Volumes.find(
                (v) => v.Name === volume.name
            )

            return volume
        })
        .forEach((v) => {
            block.addLine(`> ${logger.style.misc(v.name)}`)
            if (v.volumeData) {
                block.addLine(`Size: ${logger.style.code(v.volumeData.Size)}`)
            }

            if (ctx.isDockerDesktop && v.opt && v.opt.device) {
                block.addLine(
                    `Mountpoint: ${logger.style.file(
                        v.opt.device.replace(
                            process.cwd(),
                            '<project location>'
                        )
                    )}`
                )
            }
        })

    const instanceMetadata = getInstanceMetadata(ctx)

    block.addEmptyLine().addSeparator('Magento 2').addEmptyLine()

    block.addLine(logger.style.misc('Frontend'))
    instanceMetadata.frontend.forEach(({ title, text }) => {
        block.addLine(`  ${title}: ${text}`)
    })

    block.addEmptyLine()

    block.addLine(logger.style.misc('Admin'))
    instanceMetadata.admin.forEach(({ title, text }) => {
        block.addLine(`  ${title}: ${text}`)
    })

    block.log()
}

module.exports = { prettyStatus }
