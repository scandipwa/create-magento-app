# Getting Started with Create Magneto App

## Installation

- [On Linux](https://scandipwa.gitbook.io/create-magento-app/getting-started/installation-on-linux)
- [On Mac](https://scandipwa.gitbook.io/create-magento-app/getting-started/installation-on-macos)

> Currently Create Magneto App **does not support Windows platform**.

## Available Scripts

### `npm start` or `yarn start`

This command executes a local deployment of your Magento 2 application. It does it in following steps:
- Prepare your project for Magento 2.
- Install and compile correct PHP version with required extensions to run Magento 2.
- Deploy services, Redis, MySQL, ElasticSearch and Nginx, in Docker containers for Magento 2.
- Install Magento 2 with Composer.
- Setup Magento 2.
- Open browser with up and running Magento 2 store.

**Command options**:
- **port** - A port to run your application on. *By default CMA will select a random available port.*

    ```bash
    yarn start --port <port> # for Yarn
    npm run start -- --port <port> # for NPM
    ```

- **no-open** - Disable auto-open of a browser window at the end of workflow.

    ```bash
    yarn start --no-open # for Yarn
    npm run start -- --no-open # for NPM
    ```

### `npm run stop` or `yarn stop`

This command stops a local deployment of your Magento 2 application. It does it in following steps:
- Gracefully stops PHP-FPM with running Magento.
- Gracefully stops Docker containers.

### `npm run cli` or `yarn cli`

Opens a new instance of Bash with aliases for PHP, Composer and Magento used in CMA project.

**Usage example**:
```bash
npm run cli

php -v
> PHP 7.4.13 (cli) ...

composer --version
> Composer version 1.10.19

# Can be used with alias
c --version
> Composer version 1.10.19

magento setup:upgrade
> ... magento upgrade output

# Can be used with alias
m se:up
> ...magento upgrade output
```

### `npm run logs -- <scope>` or `yarn logs <scope>`

Gives simple access to logs from Nginx, Redis, MySQL and ElasticSearch containers and Magento.

This command attaches logs from chosen service to your terminal so to exit press `CTRL + C`.

**Available scopes**:
- `mysql`
- `nginx`
- `redis`
- `elasticsearch`
- `magento`

**Usage example**:
```bash
yarn logs nginx

> ... nginx logs

# ctrl + c

# this is not alias, but rather service name matching
yarn logs n # or n

> ... nginx logs

# and for mysql
yarn logs m # or mysql

> ... mysql logs

# and for magento
yarn logs ma # or magento

> ... magento logs
```

### `npm run link <theme path>` or `yarn link <theme path>`

Installs ScandiPWA as a Magento Theme from your specified folder.

**Usage example**:
```bash
yarn link ./path/to/my/scandipwa-app
```
