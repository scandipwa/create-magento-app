/* eslint-disable max-len */
import { ListrTask } from 'listr2';

import { ListrContext } from '../../typings/context';

interface ExecAsyncSpawnOptions<T extends boolean> {
    callback?: (result: string) => void
    pipeInput?: boolean
    logOutput?: boolean
    cwd?: string
    withCode?: T
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

/**
 * Execute bash command
 * @param command Bash command
 * @param options Child process exec options ([docs](https://nodejs.org/dist/latest-v14.x/docs/api/child_process.html#child_process_child_process_exec_command_options_callback))
 */
export function execAsync(
    command: string,
    options?: { encoding: BufferEncoding } & ExecOptions
): Promise<string>

export function execCommandTask(
    command: string,
    options?: Omit<ExecAsyncSpawnOptions<false>, 'callback'>
): ListrTask<ListrContext>
