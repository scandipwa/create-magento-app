# magento-scripts-php-ioncube-extension

This extension simplifies installation of ionCube extension in CMA project.

## Installation

1. Install package.
    ```bash
    npm i @scandipwa/magento-scripts-php-ioncube-extension

    # with yarn

    yarn add @scandipwa/magento-scripts-php-ioncube-extension
    ```

2. Enable extension in `cma.js`

    ```js
    // cma.js
    const ioncube = require('@scandipwa/magento-scripts-php-ioncube-extension');

    /** @type {import('@scandipwa/magento-scripts').CMAConfiguration} */
    module.exports = {
        magento: {
            // ... magento config
        },
        configuration: {
            php: {
                extensions: {
                    ioncube // <- set extension here
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
