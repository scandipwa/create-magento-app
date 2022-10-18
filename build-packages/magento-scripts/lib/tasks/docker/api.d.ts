import { ExecAsyncSpawnOptions } from '../../util/exec-async-command'

export interface DockerVersionOptions<T extends boolean = false> {
    format?: string
    formatToJSON?: T
}

export interface DockerClientDetails {
    Platform: {
        Name: string
    }
    CloudIntegration: string
    Version: string
    ApiVersion: string
    DefaultAPIVersion: string
    GitCommit: string
    GoVersion: string
    Os: string
    Arch: string
    BuildTime: string
    Context: string
    Experimental: boolean
}

export interface DockerServerComponent {
    Name: string
    Version: string
    Details: {
        ApiVersion?: string
        Arch?: string
        BuildTime?: string
        Experimental?: string
        GitCommit: string
        GoVersion?: string
        KernelVersion?: string
        MinApiVersion?: string
        Os?: string
    }
}

export interface DockerServerDetails {
    Platform: {
        Name: string
    }
    Components: DockerServerComponent[]
    Version: string
    ApiVersion: string
    MinAPIVersion: string
    GitCommit: string
    GoVersion: string
    Os: string
    Arch: string
    KernelVersion: string
    BuildTime: string
}

export interface DockerVersionResult {
    Client: DockerClientDetails
    Server: DockerServerDetails
}

export function version(
    options: DockerVersionOptions,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>

export function version(
    options: DockerVersionOptions<true>,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<DockerVersionResult>

export interface DockerContextOptions<T extends boolean = false> {
    format?: string
    formatToJSON?: T
}

export interface DockerContextResult {
    Current: boolean
    Description: string
    DockerEndpoint: string
    KubernetesEndpoint: string
    ContextType: string
    Name: string
    StackOrchestrator: string
}

export function context(
    options: DockerContextOptions,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>

export function context(
    options: DockerContextOptions<true>,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<DockerContextResult[]>
