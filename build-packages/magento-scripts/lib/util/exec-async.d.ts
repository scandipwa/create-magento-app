/* eslint-disable max-len */
import { ExecOptions } from 'child_process'

/**
 * Execute bash command
 * @param command Bash command
 * @param options Child process exec options ([docs](https://nodejs.org/dist/latest-v14.x/docs/api/child_process.html#child_process_child_process_exec_command_options_callback))
 */
export function execAsync(
    command: string,
    options?: { encoding: BufferEncoding } & ExecOptions
): Promise<string>
