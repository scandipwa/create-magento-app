const { buildInstructions } = require('./build-instructions')

class DockerFileBuilder {
    /**
     * @type {import('./types').DockerfileInstruction[]}
     */
    instructions = []

    /**
     * @param {Omit<import('./types').FromInstruction, 'type'>} param0
     * @returns {this}
     */
    from({ image, tag = 'latest', platform, name }) {
        this.instructions.push({
            type: 'FROM',
            image,
            tag,
            platform,
            name
        })

        return this
    }

    /**
     * @param {import('./types').RunInstruction['command']} command
     */
    run(command) {
        this.instructions.push({
            type: 'RUN',
            command
        })

        return this
    }

    /**
     * @param {import('./types').CmdInstruction['command']} command
     */
    cmd(command) {
        this.instructions.push({
            type: 'CMD',
            command
        })

        return this
    }

    /**
     * @param {import('./types').LabelInstruction['labels']} labels
     */
    label(labels) {
        this.instructions.push({
            type: 'LABEL',
            labels
        })

        return this
    }

    /**
     * @param {Omit<import('./types').ExposeInstruction, 'type'>} param0
     */
    expose({ port, protocol }) {
        this.instructions.push({
            type: 'EXPOSE',
            port,
            protocol
        })

        return this
    }

    /**
     * @param {Record<string, string>} env
     */
    env(env) {
        Object.entries(env).forEach(([name, value]) => {
            this.instructions.push({
                type: 'ENV',
                name,
                value
            })
        })

        return this
    }

    /**
     * @param {Omit<import('./types').AddInstruction, 'type'>} param0
     */
    add({ src, dest, chown }) {
        this.instructions.push({
            type: 'ADD',
            src,
            dest,
            chown
        })

        return this
    }

    /**
     * @param {Omit<import('./types').CopyInstruction, 'type'>} param0
     */
    copy({ src, dest, chown, from }) {
        this.instructions.push({
            type: 'COPY',
            src,
            dest,
            chown,
            from
        })

        return this
    }

    /**
     * @param {import('./types').EntrypointInstruction['command']} command
     */
    entrypoint(command) {
        this.instructions.push({
            type: 'ENTRYPOINT',
            command
        })

        return this
    }

    /**
     * @param {import('./types').VolumeInstruction['volume']} volume
     */
    volume(volume) {
        this.instructions.push({
            type: 'VOLUME',
            volume
        })

        return this
    }

    /**
     * @param {import('./types').UserInstruction['user']} user
     */
    user(user) {
        this.instructions.push({
            type: 'USER',
            user
        })

        return this
    }

    /**
     * @param {import('./types').WorkDirInstruction['workdir']} workdir
     */
    workDir(workdir) {
        this.instructions.push({
            type: 'WORKDIR',
            workdir
        })

        return this
    }

    /**
     * @param {Omit<import('./types').ArgInstruction, 'type'>} param0
     */
    arg({ name, defaultValue }) {
        this.instructions.push({
            type: 'ARG',
            name,
            defaultValue
        })

        return this
    }

    /**
     * @param {import('./types').OnBuildInstruction['instruction']} instruction
     */
    onBuild(instruction) {
        this.instructions.push({
            type: 'ONBUILD',
            instruction
        })

        return this
    }

    /**
     * @param {import('./types').StopSignalInstruction['signal']} signal
     */
    stopSignal(signal) {
        this.instructions.push({
            type: 'STOPSIGNAL',
            signal
        })

        return this
    }

    /**
     * @param {Omit<import('./types').HealthCheckInstruction, 'type'>} param0
     */
    healthCheck({ command, interval, timeout, startPeriod, retries }) {
        this.instructions.push({
            type: 'HEALTHCHECK',
            command,
            interval,
            retries,
            startPeriod,
            timeout
        })

        return this
    }

    /**
     * @param {import('./types').ShellInstruction['exec']} exec
     */
    shell(exec) {
        this.instructions.push({
            type: 'SHELL',
            exec
        })

        return this
    }

    /**
     * @param {import('./types').CommentInstruction['comment']} comment
     */
    comment(comment) {
        this.instructions.push({
            type: 'COMMENT',
            comment
        })

        return this
    }

    build() {
        return buildInstructions(this.instructions)
    }
}

module.exports = {
    DockerFileBuilder
}
