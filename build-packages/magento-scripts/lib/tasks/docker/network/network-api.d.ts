import { ExecAsyncSpawnOptions } from '../../../util/exec-async-command'

export interface NetworkLsOptions<T extends boolean = false> {
    filter?: string | string[]
    format?: string
    formatToJSON?: T
    quiet?: boolean
    noTrunc?: boolean
}

export interface NetworkLsResult {
    CreatedAt: string
    Driver: string
    ID: string
    IPv6: string
    Internal: string
    Labels: string
    Name: string
    Scope: string
}

export function ls(
    options?: NetworkLsOptions,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>
export function ls(
    options?: NetworkLsOptions<true>,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<NetworkLsResult[]>

export interface NetworkInspectOptions<T extends boolean = false> {
    network: string | string[]
    format?: string
    formatToJSON?: T
    verbose?: boolean
}

export interface NetworkInspectResult {
    Name: string
    Id: string
    Created: string
    Scope: string
    EnableIPv6: boolean
    IPAM: {
        Driver: string
        Options: Record<string, unknown>
        Config: {
            Subnet: string
            Gateway: string
        }[]
    }
    Internal: boolean
    Attachable: boolean
    Ingress: boolean
    ConfigFrom: {
        Network: string
    }
    ConfigOnly: boolean
    Containers: Record<
        string,
        {
            Name: string
            EndpointID: string
            MacAddress: string
            IPv4Address: string
            IPv6Address: string
        }
    >
    Options: Record<string, unknown>
    Labels: Record<string, unknown>
}

export function inspect(
    options?: NetworkInspectOptions,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>

export function inspect(
    options?: NetworkInspectOptions<true>,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<NetworkInspectResult>

export interface NetworkCreateOptions {
    network: string | string[]
    attachable?: boolean
    auxAddress?: string
    configFrom?: string
    configOnly?: string
    driver?: string
    gateway?: string
    ingress?: boolean
    internal?: boolean
    ipRange?: string
    ipamDriver?: string
    ipamOpt?: string
    ipv6?: boolean
    label?: string
    opt?: string
    scope?: string
    subnet?: string
}

export function create(
    options?: NetworkCreateOptions,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>
