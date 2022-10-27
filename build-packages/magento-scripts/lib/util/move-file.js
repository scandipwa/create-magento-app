const fs = require('fs')

/**
 * @param {{ from: string, to: string }} param0
 */
const moveFile = async ({ from, to }) => {
    /**
     * @returns {Promise<void>}
     */
    const copy = () =>
        new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(from)
            const writeStream = fs.createWriteStream(to)
            /**
             * @param {Error} e
             */
            const onError = async (e) => {
                await fs.promises.unlink(to)
                reject(e)
            }

            readStream.on('error', onError)
            writeStream.on('error', onError)

            readStream.on('close', async () => {
                try {
                    await fs.promises.unlink(from)
                } catch (e) {
                    if (e instanceof Error) {
                        onError(e)
                        return
                    } else if (typeof e === 'string') {
                        onError(new Error(e))
                    }
                }
                resolve()
            })

            readStream.pipe(writeStream)
        })

    try {
        await fs.promises.rename(from, to)
    } catch (e) {
        if (e && e.code === 'EXDEV') {
            await copy()
        } else {
            throw e
        }
    }
}

module.exports = moveFile
