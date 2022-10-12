# magento-scripts-php-extensions

This extension simplifies installation of memcached, pdo_sqlsrv, sqlsrv and ionCube extensions in CMA project.

## Installation

1. Install package.
    ```bash
    npm i @scandipwa/magento-scripts-php-extensions

    # with yarn

    yarn add @scandipwa/magento-scripts-php-extensions
    ```

2. Enable extensions in `cma.js`

    ```js
    // cma.js
    const {
        ioncube,
        memcached,
        pdo_sqlsrv,
        sqlsrv
    } = require('@scandipwa/magento-scripts-php-extensions');

    /** @type {import('@scandipwa/magento-scripts').CMAConfiguration} */
    module.exports = {
        // ... other configurations
        configuration: {
            php: {
                extensions: { // <- set extensions here
                    ioncube,
                    memcached,
                    pdo_sqlsrv,
                    sqlsrv
                }
            }
        }
    };
    ```

3. Run `magento-scripts`

    ```bash
    npm start

    # with yarn

    yarn start
    ```


## Demo

Demo setup available [here](https://github.com/scandipwa/create-magento-app/tree/master/sample-packages/magento-2.4.3-p1-ioncube)
