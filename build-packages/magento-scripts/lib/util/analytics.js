const os = require('os');
const { request } = require('smol-request');
const { getSystemConfigSync } = require('../config/system-config');
const { getExternalIpAddress } = require('./ip');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const generateUUID = require('@tilework/mosaic-dev-utils/uuid');
// const { getSystemConfig } = require('./get-configuration-file');

const GA_TRACKING_ID = process.env.GA_TRACKING_ID || 'UA-127741417-8';
const UNKNOWN = 'unknown';

const anonymizeError = (text) => text.replace(new RegExp(`${os.homedir()}`, 'gi'), '/home/magento-scripts-user');

class Analytics {
    constructor() {
        this.isGaDisabled = this.getIsGaDisabled();
        this.gaTrackingId = GA_TRACKING_ID;
        this.clientIdentifier = UNKNOWN;
        this.currentUrl = UNKNOWN;
        this.lang = UNKNOWN;

        try {
            this.setClientIdentifier(
                generateUUID()
            );
        } catch (e) {
            this.setClientIdentifier(
                Date.now()
            );
        }
    }

    setLang(lang) {
        this.lang = lang;
    }

    setCurrentUrl(currentUrl) {
        this.currentUrl = currentUrl;
    }

    setClientIdentifier(id) {
        this.clientIdentifier = id;
    }

    setGaTrackingId(id) {
        this.gaTrackingId = id;
    }

    getIsGaDisabled() {
        const { analytics } = getSystemConfigSync({ validate: false });

        return !analytics;
    }

    async _collect(data) {
        if (this.isGaDisabled) {
            // skip GA
            return;
        }

        const rawBody = {
            ...data,
            v: '1',
            tid: this.gaTrackingId,
            cid: this.clientIdentifier
        };

        try {
            rawBody.uip = await getExternalIpAddress();
        } catch (e) {
            console.log(e);
            // Do nothing
        }

        if (this.lang !== UNKNOWN) {
            // get system language here
            rawBody.ul = this.lang;
        }

        if (this.currentUrl !== UNKNOWN) {
            const {
                hostname,
                pathname
            } = new URL(this.currentUrl);

            rawBody.dp = pathname;
            rawBody.dh = hostname;
            rawBody.dl = this.currentUrl;
        }

        const params = new URLSearchParams(rawBody).toString();

        try {
            if (!process.env.GA_DEBUG) {
                await request(
                    `https://www.google-analytics.com/collect?${ params }`,
                    {
                        headers: { 'User-Agent': 'Google-Cloud-Functions' },
                        responseType: 'headers'
                    }
                );

                return;
            }

            const { data: jsonResponse } = await request(
                `https://www.google-analytics.com/debug/collect?${ params }`,
                {
                    headers: { 'User-Agent': 'Google-Cloud-Functions' },
                    responseType: 'json'
                }
            );

            logger.log(rawBody, jsonResponse);
            logger.log(jsonResponse.hitParsingResult[0].parserMessage);

        // eslint-disable-next-line no-empty
        } catch (e) {
            console.log('Failed to report telemetry data');
        }
    }

    trackError(error, isFatal = true) {
        // return; // nothing
        return this._collect({
            t: 'exception',
            exd: anonymizeError(typeof error === 'string' ? error : error.message),
            exf: isFatal
        });
    }

    trackTiming(label, time, category = UNKNOWN) {
        return this._collect({
            t: 'timing',
            utc: category,
            utv: label,
            utl: this.currentUrl,
            utt: Math.round(time)
        });
    }

    trackPageView() {
        return this._collect({
            t: 'pageview'
        });
    }

    trackEvent(action, label, value, category = UNKNOWN) {
        return this._collect({
            t: 'event',
            ec: category,
            ea: action,
            el: label,
            ev: value
        });
    }

    printAboutAnalytics() {
        if (!this.isGaDisabled) {
            logger.log('We collect analytics data to make our products more stable and reliable!');
            logger.log('If you want to know more go here https://docs.scandipwa.com/about/data-analytics');
            logger.logN();
        }
    }
}

module.exports = new Analytics();
