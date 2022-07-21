import { ExecAsyncSpawnOptions } from '../../../util/exec-async-command';

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
