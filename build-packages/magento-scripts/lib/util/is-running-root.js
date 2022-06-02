const isRunningRoot = () => process.getuid() === 0; // UID 0 is always root

module.exports = isRunningRoot;
