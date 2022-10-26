import { ExecAsyncSpawnOptions } from '../../../util/exec-async-command'

export interface ImagesLsOptions<T extends boolean = false> {
    all?: boolean
    digests?: boolean
    filter?: string | string[]
    format?: string
    quiet?: boolean
    noTrunc?: boolean
    formatToJSON?: T
}

export interface ImagesLsResult {
    Containers: string
    CreatedAt: string
    CreatedSince: string
    Digest: string
    ID: string
    Repository: string
    SharedSize: string
    Size: string
    Tag: string
    UniqueSize: string
    VirtualSize: string
}

export function ls(
    options?: ImagesLsOptions,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>
export function ls(
    options?: ImagesLsOptions<true>,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<ImagesLsResult[]>

export interface ImagesInspectOptions<T extends boolean = false> {
    image: string
    format?: string
    formatToJSON?: T
}

export interface ImagesInspectResult {
    Id: string
    RepoTags: string[]
    RepoDigests: string[]
    Parent: string
    Comment: string
    Created: string
    ContainerConfig: unknown
    DockerVersion: string
    Author: string
    Config: {
        Env: string[]
        Cmd: string[]
        WorkingDir: string
        Entrypoint: string[]
        StopSignal: string
    }
    Architecture: string
    Os: string
    Size: number
    VirtualSize: number
    GraphDriver: unknown
    RootFs: unknown
    Metadata: Record<string, unknown>
    CreatedTime: number
    Container: Record<string, unknown>
}

export function inspect(
    options?: ImagesInspectOptions,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>
export function inspect(
    options?: ImagesInspectOptions<true>,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<ImagesInspectResult>
