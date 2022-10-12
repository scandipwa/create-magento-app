const pdo_sqlsrv = require('./extensions/pdo_sqlsrv');
const sqlsrv = require('./extensions/sqlsrv');
const ioncube = require('./extensions/ioncube');
const memcached = require('./extensions/memcached');

module.exports = {
    sqlsrv,
    pdo_sqlsrv,
    ioncube,
    memcached
};
