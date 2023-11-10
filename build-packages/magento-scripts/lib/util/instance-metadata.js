const logger = require('@scandipwa/scandipwa-dev-utils/logger')

const WEB_LOCAL_LOCATION_TITLE = `Location on ${logger.style.misc('localhost')}`
const WEB_LOCATION_TITLE = 'Location on the Web'
const WEB_ADMIN_LOCATION_TITLE = 'Panel location'
const WEB_ADMIN_CREDENTIALS_TITLE = 'Panel credentials'
const WEB_MAILDEV_LOCATION_TITLE = 'Panel location'

/**
 * @param {{ title: string, text: string }} param0
 */
const mapDataStyle = ({ title, text }) => ({
    title,
    text: logger.style.link(text),
    link: text
})

/**
 * @param {import("../../typings/context").ListrContext} ctx
 * @return {{ frontend: { title: string, text: string }[], admin: { title: string, text: string }[], maildev: { title: string, text: string }[] }}
 */
const getInstanceMetadata = (ctx) => {
    const {
        ports,
        config: {
            magentoConfiguration,
            overridenConfiguration: { ssl, storeDomains }
        }
    } = ctx

    /**
     * @type {{ title: string, text: string }[]}
     */
    const frontend = []

    /**
     * @type {{ title: string, text: string }[]}
     */
    const admin = []

    /**
     * @type {{ title: string, text: string }[]}
     */
    const maildev = []

    frontend.push({
        title: WEB_LOCATION_TITLE,
        text: `${ssl.enabled ? 'https' : 'http'}://${storeDomains.admin}${
            ssl.enabled || ports.sslTerminator === 80
                ? ''
                : `:${ports.sslTerminator}`
        }/`
    })

    for (const [storeCode, domain] of Object.entries(storeDomains)) {
        if (storeCode === 'admin') {
            continue
        }
        frontend.push({
            title: `Frontend store ${logger.style.file(storeCode)} location`,
            text: `${ssl.enabled ? 'https' : 'http'}://${domain}${
                ssl.enabled || ports.sslTerminator === 80
                    ? ''
                    : `:${ports.sslTerminator}`
            }/`
        })
    }

    const webLocation = frontend.find((u) => u.title === WEB_LOCATION_TITLE)

    if (webLocation) {
        admin.push({
            title: WEB_ADMIN_LOCATION_TITLE,
            text: logger.style.link(`${webLocation.text}admin`)
        })
    }

    admin.push({
        title: WEB_ADMIN_CREDENTIALS_TITLE,
        text: `${logger.style.misc(
            magentoConfiguration.user
        )} - ${logger.style.misc(magentoConfiguration.password)}`
    })

    maildev.push({
        title: WEB_MAILDEV_LOCATION_TITLE,
        text: `http://localhost:${ports.maildevWeb}/`
    })

    return {
        admin,
        frontend: frontend.map(mapDataStyle),
        maildev: maildev.map(mapDataStyle)
    }
}

module.exports = {
    getInstanceMetadata,
    constants: {
        WEB_LOCAL_LOCATION_TITLE,
        WEB_LOCATION_TITLE,
        WEB_ADMIN_LOCATION_TITLE,
        WEB_ADMIN_CREDENTIALS_TITLE
    }
}
