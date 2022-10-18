function cleanObject(object, filterKeys) {
    return Object.keys(object).reduce(
        (acc, key) =>
            filterKeys.includes(key)
                ? Object.assign(acc, { [key]: object[key] })
                : acc,
        {}
    )
}

module.exports = cleanObject
