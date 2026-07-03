const assert = require('assert')
const {
    shouldUseStoreDomainMapping,
    resolveStoreDomainsForScopes
} = require('./store-domains')

assert.strictEqual(shouldUseStoreDomainMapping(undefined), false)
assert.strictEqual(shouldUseStoreDomainMapping({ admin: 'localhost' }), false)
assert.strictEqual(
    shouldUseStoreDomainMapping({
        admin: 'shop.local',
        base: 'shop.local'
    }),
    false
)
assert.strictEqual(
    shouldUseStoreDomainMapping({
        admin: 'admin.local',
        base: 'shop.local'
    }),
    true
)

const websites = [
    { website_id: 0, code: 'admin' },
    { website_id: 1, code: 'base' }
]

const resolved = resolveStoreDomainsForScopes(
    { admin: 'jollyes.local' },
    websites,
    'website_id'
)

assert.deepStrictEqual(resolved, {
    admin: { scopeId: 0, domain: 'jollyes.local' },
    base: { scopeId: 1, domain: 'jollyes.local' }
})

assert.deepStrictEqual(
    resolveStoreDomainsForScopes(
        { admin: 'jollyes.local', base: 'other.local' },
        websites,
        'website_id'
    ),
    {
        admin: { scopeId: 0, domain: 'jollyes.local' },
        base: { scopeId: 1, domain: 'other.local' }
    }
)

console.log('store-domains.test.js: ok')
