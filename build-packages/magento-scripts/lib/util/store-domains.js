/**
 * Enable nginx host → store mapping only when multiple stores use distinct domains.
 * Duplicate hostnames produce invalid nginx map directives.
 *
 * @param {Record<string, string> | undefined} storeDomains
 * @returns {boolean}
 */
const shouldUseStoreDomainMapping = (storeDomains) => {
    if (!storeDomains) {
        return false
    }

    const entries = Object.entries(storeDomains)

    if (entries.length <= 1) {
        return false
    }

    const domains = entries.map(([, domain]) => domain)

    return new Set(domains).size === domains.length
}

/**
 * Map store/website entities to domains from storeDomains, falling back to admin
 * for scopes not explicitly configured (e.g. website "base" on single-domain setups).
 *
 * @param {Record<string, string>} storeDomains
 * @param {{ code: string }[]} entities
 * @param {'website_id' | 'store_id'} idField
 * @returns {Record<string, { scopeId: number, domain: string }>}
 */
const resolveStoreDomainsForScopes = (storeDomains, entities, idField) => {
    const defaultDomain = storeDomains.admin

    /** @type {Record<string, { scopeId: number, domain: string }>} */
    const mapped = Object.entries(storeDomains).reduce(
        (acc, [key, val]) => {
            const entity = entities.find((entity) => entity.code === key)

            if (entity) {
                return {
                    ...acc,
                    [entity.code]: {
                        scopeId: entity[idField],
                        domain: val
                    }
                }
            }

            return acc
        },
        {}
    )

    for (const entity of entities) {
        if (!mapped[entity.code]) {
            mapped[entity.code] = {
                scopeId: entity[idField],
                domain: defaultDomain
            }
        }
    }

    return mapped
}

module.exports = {
    shouldUseStoreDomainMapping,
    resolveStoreDomainsForScopes
}
