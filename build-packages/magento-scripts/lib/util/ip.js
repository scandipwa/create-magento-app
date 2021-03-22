const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const isIpAddress = (text) => ipRegex.test(text);

module.exports = {
    ipRegex,
    isIpAddress
};
