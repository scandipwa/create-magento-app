const { execAsyncSpawn } = require('./exec-async-command')
const sleep = require('./sleep')

/**
 * @param {{ containerName: string, timeout?: number, matchText: string }} param0
 * @returns {Promise<void>}
 */
const waitForLogs = ({ containerName, timeout = 30 * 1000, matchText }) =>
    // eslint-disable-next-line no-async-promise-executor
    new Promise(async (resolve, reject) => {
        let matched = false
        let timeoutExceeded = false
        await Promise.race([
            (async () => {
                // eslint-disable-next-line no-unmodified-loop-condition
                while (!timeoutExceeded && !matched) {
                    const { result } = await execAsyncSpawn(
                        `docker logs ${containerName}`,
                        {
                            withCode: true
                        }
                    )

                    if (matched) {
                        return
                    }

                    result.split('\n').forEach((line) => {
                        if (line.includes(matchText)) {
                            matched = true
                            resolve()
                        }
                    })

                    await sleep(500)
                }
            })(),
            sleep(timeout).then(() => {
                timeoutExceeded = true
            })
        ])

        if (timeoutExceeded) {
            reject(new Error('Timeout exception'))
        }
    })

module.exports = waitForLogs
