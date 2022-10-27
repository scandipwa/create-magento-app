import { ExecAsyncSpawnOptions } from '../../../util/exec-async-command'

export interface SystemDFOptions<T extends boolean = false> {
    format?: string
    formatToJSON?: T
    verbose?: boolean
}

export interface SystemDFResult {
    Images: {
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
    }[]
    Containers: {
        Command: string
        CreatedAt: string
        ID: string
        Image: string
        Labels: string
        LocalVolumes: string
        Mounts: string
        Names: string
        Networks: string
        Ports: string
        RunningFor: string
        Size: string
        State: string
        Status: string
    }[]
    Volumes: {
        Driver: string
        Labels: string
        Links: string
        Mountpoint: string
        Name: string
        Scope: string
        Size: string
    }[]
    BuildCache: {
        CacheType: string
        CreatedAt: string
        CreatedSince: string
        Description: string
        ID: string
        InUse: string
        LastUsedAt: string
        LastUsedSince: string
        Parent: string
        Shared: string
        Size: string
        UsageCount: string
    }[]
}

export function df(
    options?: SystemDFOptions,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>
export function df(
    options?: SystemDFOptions<true>,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<SystemDFResult>
