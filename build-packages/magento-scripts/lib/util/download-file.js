const https = require('https')
const http = require('http')
const fs = require('fs')

/**
 * @param {string} url
 * @param {Object} param1
 * @param {string} param1.destination
 * @returns {Promise<void>}
 */
const downloadFile = (url, { destination }) =>
    new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http

        const writeStream = fs.createWriteStream(destination, {
            encoding: 'utf-8'
        })

        /**
         * @param {Error} err
         */
        const onError = (err) => {
            reject(err)
        }
        const req = client.get(url, (res) => {
            res.pipe(writeStream)
        })

        req.on('error', onError)
        req.once('close', resolve)
    })

module.exports = downloadFile
