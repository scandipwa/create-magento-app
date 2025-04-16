export interface FromInstruction {
    type: 'FROM'
    image: string
    tag?: string
    platform?: string
    name?: string
}

export interface RunInstruction {
    type: 'RUN'
    command: string | string[]
}

export interface CmdInstruction {
    type: 'CMD'
    command: string | string[]
}

export interface LabelInstruction {
    type: 'LABEL'
    labels: Record<string, string>
}

export interface ExposeInstruction {
    type: 'EXPOSE'
    port: number
    protocol?: 'udp' | 'tcp'
}

export interface EnvInstruction {
    type: 'ENV'
    name: string
    value: string
}

export interface AddInstruction {
    type: 'ADD'
    src: string[]
    dest: string
    chown?: string
}

export interface CopyInstruction {
    type: 'COPY'
    src:  string | string[]
    dest: string
    chown?: string
    from?: string
}

export interface EntrypointInstruction {
    type: 'ENTRYPOINT'
    command: string | string[]
}

export interface VolumeInstruction {
    type: 'VOLUME'
    volume: string | string[]
}

export interface UserInstruction {
    type: 'USER'
    user: string
}

export interface WorkDirInstruction {
    type: 'WORKDIR'
    workdir: string
}

export interface ArgInstruction {
    type: 'ARG'
    name: string
    defaultValue?: string
}

export interface OnBuildInstruction {
    type: 'ONBUILD'
    instruction: string
}

export interface StopSignalInstruction {
    type: 'STOPSIGNAL'
    signal: string
}

export interface HealthCheckInstruction {
    type: 'HEALTHCHECK'
    command: string
    interval?: string
    timeout?: string
    startPeriod?: string
    retries?: number
}

export interface ShellInstruction {
    type: 'SHELL'
    exec: string[]
}

export interface CommentInstruction {
    type: 'COMMENT'
    comment: string
}

export type DockerfileInstruction =
    | FromInstruction
    | RunInstruction
    | CmdInstruction
    | LabelInstruction
    | ExposeInstruction
    | EnvInstruction
    | AddInstruction
    | CopyInstruction
    | EntrypointInstruction
    | VolumeInstruction
    | UserInstruction
    | WorkDirInstruction
    | ArgInstruction
    | OnBuildInstruction
    | StopSignalInstruction
    | HealthCheckInstruction
    | ShellInstruction
    | CommentInstruction
