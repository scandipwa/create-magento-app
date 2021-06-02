/**
 * Safely extract data from string using regex
 * @param {object} param0
 * @param {string} param0.string
 * @param {RegExp} param0.regex
 * @param {(result: RegExpMatchArray) => string} param0.onNoMatch
 */
const safeRegexExtract = ({
    string,
    regex,
    onNoMatch
}) => {
    const result = string.match(regex);

    if (result.length > 1) {
        return result[1];
    }

    if (onNoMatch) {
        return onNoMatch(result);
    }

    return result;
};

module.exports = safeRegexExtract;
