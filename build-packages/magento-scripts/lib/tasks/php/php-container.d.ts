import { ListrContext } from "../../../typings/context";
import { ExecAsyncSpawnOptions } from "../../util/exec-async-command";

export function runPHPContainerCommand<T>(
    ctx: ListrContext,
    command: string,
    options?: ExecAsyncSpawnOptions<T> & { useXDebugContainer?: boolean }
): Promise<any>

export function runPHPContainerCommandTask<T>(
    command: string,
    options?: ExecAsyncSpawnOptions<T> & { useXDebugContainer?: boolean }
): import('listr2').ListrTask<import('../../../typings/context').ListrContext>

export function execPHPContainerCommand<T>(
    ctx: ListrContext,
    command: string,
    options?: ExecAsyncSpawnOptions<T> & { useXDebugContainer?: boolean }
): Promise<any>
