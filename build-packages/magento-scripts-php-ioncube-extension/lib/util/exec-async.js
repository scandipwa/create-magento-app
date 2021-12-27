const { exec } = require('child_process');

const execAsync = (command, options) => new Promise((resolve, reject) => {
    exec(command, options, (err, stdout) => (err ? reject(err) : resolve(stdout)));
});

module.exports = execAsync;
