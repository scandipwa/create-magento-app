/**
 * Merge object deeply
 * @type {<T>(target: T, ...sources: Partial<T>[]) => T}
 */
function deepmerge(target, ...sources) {
    const targetCopy = { ...target }
    const isObject = (obj) => obj && typeof obj === 'object'
    sources.forEach((source) =>
        Object.keys(source).forEach((key) => {
            const targetValue = targetCopy[key]
            const sourceValue = source[key]

            if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
                targetCopy[key] = targetValue.concat(sourceValue)
            } else if (isObject(targetValue) && isObject(sourceValue)) {
                targetCopy[key] = deepmerge({ ...targetValue }, sourceValue)
            } else {
                targetCopy[key] = sourceValue
            }
        })
    )

    return targetCopy
}

module.exports = {
    deepmerge
}
