/* eslint-disable no-redeclare */
import { ListrTask } from 'listr2'

import { ListrContext } from '../../typings/context'

interface ExecAsyncSpawnOptions<T extends boolean = false> {
    callback?: (result: string) => void
    pipeInput?: boolean
    logOutput?: boolean
    cwd?: string
    withCode?: T
    // only for mac
    useRosetta2?: boolean
    env?: Record<string, string>
}

/**
 * Execute bash command in child process
 */
export function execAsyncSpawn(
    command: string,
    options?: ExecAsyncSpawnOptions
): Promise<string>
export function execAsyncSpawn(
    command: string,
    options?: ExecAsyncSpawnOptions<true>
): Promise<{ code: number; result: string }>

export function execCommandTask(
    command: string,
    options?: Omit<ExecAsyncSpawnOptions<false>, 'callback'>
): ListrTask<ListrContext>
