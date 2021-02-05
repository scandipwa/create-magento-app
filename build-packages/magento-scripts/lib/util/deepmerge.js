/* eslint-disable no-param-reassign */

/**
 * Merge object deeply
 * @param {object} target
 * @param  {...object} sources
 * @returns {object}
 */
function deepmerge(
    target,
    ...sources
) {
    const isObject = (obj) => obj && typeof obj === 'object';
    sources.forEach((source) => Object.keys(source).forEach((key) => {
        const targetValue = target[key];
        const sourceValue = source[key];

        if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            target[key] = targetValue.concat(sourceValue);
        } else if (
            isObject(targetValue)
          && isObject(sourceValue)
        ) {
            target[key] = deepmerge(
                { ...targetValue },
                sourceValue
            );
        } else {
            target[key] = sourceValue;
        }
    }));

    return target;
}

module.exports = deepmerge;
