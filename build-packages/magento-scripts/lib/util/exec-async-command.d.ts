/* eslint-disable max-len */
import { ListrTask } from 'listr2';

import { ListrContext } from '../../typings/context';

interface ExecAsyncSpawnOptions<T extends boolean> {
    callback?: (result: string) => void
    pipeInput?: boolean
    logOutput?: boolean
    cwd?: string
    withCode?: T
    // only for mac
    useRosetta2?: boolean
    env: NodeJS.ProcessEnv
}

/**
 * Execute bash command in child process
 */
export function execAsyncSpawn(
    command: string,
    options?: ExecAsyncSpawnOptions<false>
): Promise<string>;
export function execAsyncSpawn (
    command: string,
    options?: ExecAsyncSpawnOptions<true>
): Promise<{ code: number, result: string }>;

export function execCommandTask(
    command: string,
    options?: Omit<ExecAsyncSpawnOptions<false>, 'callback'>
): ListrTask<ListrContext>
