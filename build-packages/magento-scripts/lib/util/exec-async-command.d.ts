/* eslint-disable no-redeclare */
import { ListrTask } from 'listr2'

import { ListrContext } from '../../typings/context'

interface ExecAsyncSpawnOptions<T extends boolean> {
    callback?: (result: string) => void
    pipeInput?: boolean
    logOutput?: boolean
    cwd?: string
    withCode?: T
    env?: Record<string, string> & NodeJS.ProcessEnv
    // only for mac
    useRosetta2?: boolean
}

/**
 * Execute bash command in child process
 */
export function execAsyncSpawn(
    command: string,
    options?: ExecAsyncSpawnOptions<false>
): Promise<string>
export function execAsyncSpawn(
    command: string,
    options?: ExecAsyncSpawnOptions<true>
): Promise<{ code: number; result: string }>

export function execCommandTask<T extends boolean>(
    command: string,
    options?: Omit<ExecAsyncSpawnOptions<T>, 'callback'>
): ListrTask<ListrContext>
