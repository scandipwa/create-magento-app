/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * @type {<T extends { [key: string]: unknown }, K extends string[]>(object: T, filterKeys: K) => T}
 */
function cleanObject(object, filterKeys) {
    const init = {}

    // @ts-ignore
    return Object.keys(object).reduce(
        (acc, key) =>
            filterKeys.includes(key)
                ? Object.assign(acc, { [key]: object[key] })
                : acc,
        init
    )
}

module.exports = cleanObject
