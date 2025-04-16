/**
 *
 * @param {import('./types').DockerfileInstruction[]} instructions
 */
const buildInstructions = (instructions) => {
    /**
     * @type {string[]}
     */
    const dockerFileInstructions = []

    for (const instruction of instructions) {
        switch (instruction.type) {
            case 'COPY':
            case 'ADD': {
                let addInstruction = instruction.type

                if (instruction.type === 'COPY' && instruction.from) {
                    addInstruction += ` --from=${instruction.from}`
                }

                if (instruction.chown) {
                    addInstruction += ` --chown=${instruction.chown}`
                }

                addInstruction += ` ${
                    Array.isArray(instruction.src)
                        ? instruction.src.join(' ')
                        : instruction.src
                }`
                addInstruction += ` ${instruction.dest}`

                dockerFileInstructions.push(addInstruction)
                break
            }
            case 'ARG': {
                let argInstruction = instruction.type

                argInstruction += ` ${instruction.name}`

                if (instruction.defaultValue) {
                    argInstruction += `=${instruction.defaultValue}`
                }

                dockerFileInstructions.push(argInstruction)
                break
            }
            case 'RUN':
            case 'ENTRYPOINT':
            case 'CMD': {
                let cmdInstruction = instruction.type

                if (typeof instruction.command === 'string') {
                    cmdInstruction += ` ${instruction.command}`
                } else if (
                    Array.isArray(instruction.command) &&
                    instruction.command.every((c) => typeof c === 'string')
                ) {
                    cmdInstruction += ` ["${instruction.command.join('", "')}"]`
                } else {
                    throw new Error(
                        `Unknown command type, it must be string or array of strings! ${instruction.command}`
                    )
                }

                dockerFileInstructions.push(cmdInstruction)
                break
            }

            case 'COMMENT': {
                const commentInstruction = `# ${instruction.comment}`

                dockerFileInstructions.push(commentInstruction)
                break
            }
            case 'ENV': {
                let envInstruction = instruction.type

                envInstruction += ` ${instruction.name}="${instruction.value}"`

                dockerFileInstructions.push(envInstruction)
                break
            }
            case 'EXPOSE': {
                let exposeInstruction = instruction.type

                if (instruction.protocol) {
                    exposeInstruction += ` ${instruction.port}/${instruction.protocol}`
                } else {
                    exposeInstruction += ` ${instruction.port}`
                }

                dockerFileInstructions.push(exposeInstruction)
                break
            }
            case 'FROM': {
                let fromInstruction = instruction.type

                if (instruction.platform) {
                    fromInstruction += ` --platform=${instruction.platform}`
                }

                fromInstruction += ` ${instruction.image}:${
                    instruction.tag || 'latest'
                }`

                if (instruction.name) {
                    fromInstruction += ` AS ${instruction.name}`
                }

                dockerFileInstructions.push(fromInstruction)
                break
            }
            case 'HEALTHCHECK': {
                let healthCheckInstruction = instruction.type

                if (instruction.interval) {
                    healthCheckInstruction += ` --interval=${instruction.interval}`
                }

                if (instruction.retries) {
                    healthCheckInstruction += ` --retries=${instruction.retries}`
                }

                if (instruction.startPeriod) {
                    healthCheckInstruction += ` --start-period=${instruction.startPeriod}`
                }

                if (instruction.timeout) {
                    healthCheckInstruction += ` --timeout=${instruction.timeout}`
                }

                healthCheckInstruction += ` ${instruction.command}`

                dockerFileInstructions.push(healthCheckInstruction)
                break
            }
            case 'LABEL': {
                Object.entries(instruction.labels).forEach(([name, value]) => {
                    let labelInstruction = instruction.type
                    labelInstruction += ` "${name}"="${value}"`
                    dockerFileInstructions.push(labelInstruction)
                })
                break
            }
            case 'ONBUILD': {
                let onBuildInstruction = instruction.type

                onBuildInstruction += ` ${instruction.instruction}`

                dockerFileInstructions.push(onBuildInstruction)
                break
            }
            case 'SHELL': {
                let shellInstruction = instruction.type

                shellInstruction += ` ["${instruction.exec.join('", "')}"]`

                dockerFileInstructions.push(shellInstruction)
                break
            }
            case 'STOPSIGNAL': {
                let stopSignalInstruction = instruction.type

                stopSignalInstruction += ` ${instruction.signal}`

                dockerFileInstructions.push(stopSignalInstruction)
                break
            }
            case 'USER': {
                let userInstruction = instruction.type

                userInstruction += ` ${instruction.user}`

                dockerFileInstructions.push(userInstruction)
                break
            }
            case 'VOLUME': {
                let volumeInstruction = instruction.type

                if (typeof instruction.volume === 'string') {
                    volumeInstruction += ` ${instruction.volume}`
                } else if (
                    Array.isArray(instruction.volume) &&
                    instruction.volume.every((c) => typeof c === 'string')
                ) {
                    volumeInstruction += ` ["${instruction.volume.join(
                        '", "'
                    )}"]`
                } else {
                    throw new Error(
                        `Unknown volume type, it must be string or array of strings! ${instruction.volume}`
                    )
                }

                dockerFileInstructions.push(volumeInstruction)
                break
            }
            case 'WORKDIR': {
                const workDirInstruction = `${instruction.type} ${instruction.workdir}`

                dockerFileInstructions.push(workDirInstruction)
                break
            }
            default: {
                throw new Error(
                    `I don't know instruction with type ${instruction.type}`
                )
            }
        }
    }

    return dockerFileInstructions.join('\n')
}

module.exports = {
    buildInstructions
}
