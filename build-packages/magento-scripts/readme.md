# magento-scripts

This package contains scripts and configuration used by [Create Magento App](https://github.com/scandipwa/create-magento-app).

## Overview

What this package does:
- Compiles correct PHP version with all necessary extensions to run Magento on your system.
- Organize services required to run Magento on your system, such as Nginx, Redis, MySQL and Elasticsearch in Docker containers with forwarded ports to host system.
- Allows you to run multiple M2 projects simultaneously on the same machine without ports/files/context overlapping.

## Requirements

### Linux Requirements

Dependency list and installation guide is available in our [documentation for installation on Linux](https://docs.create-magento-app.com/getting-started/prerequisites/installation-on-linux)!

### MacOS Requirements

Dependency list and installation guide is available in our [documentation for installation on Mac](https://docs.create-magento-app.com/getting-started/prerequisites/installation-on-macos)!

### Windows Requirements

Dependency list and installation guide is available in our [documentation for installation on Windows](https://docs.create-magento-app.com/getting-started/prerequisites/windows-requirements)!

> If you miss a requirement CMA will tell you and will give instructions or even provide a one click fix!

## Usage

### Start the App

```bash
# Create an App
npx create-magento-app <folder name>

cd <folder name>

# Run it with yarn
yarn start

# Or with npm
npm run start
```

> Documentation for `start` command is available [here](https://docs.create-magento-app.com/getting-started/available-commands/start).

### Access Application CLI

To access Magento CLI, Composer and PHP use `cli` command:
```bash
# With yarn
yarn cli

# Or npm
npm run cli
```

This will a new instance of Bash with aliases for PHP, Composer and Magento used in Create Magento App project.

> Documentation for `cli` command is available [here](https://docs.create-magento-app.com/getting-started/available-commands/cli).

### Access Application Logs

To open logs use command `logs` with one of the scopes: `redis`, `mysql`, `elasticsearch`, `nginx` or `magento`.
```bash
# With yarn
yarn logs nginx

# Or npm
npm run logs nginx

> ... nginx logs
```

> NOTE: you can also use name matching for logs! Like `yarn logs m` will show `mysql` logs, `yarn logs ma` will show `magento` logs and e.t.c.  
Read more about this [here](https://docs.create-magento-app.com/getting-started/available-commands/logs#usage-example).

---

CMA contains even more useful commands like [checking application status](https://docs.create-magento-app.com/getting-started/available-commands/status), [executing commands in Docker containers](https://docs.create-magento-app.com/getting-started/available-commands/exec), [linking a theme](https://docs.create-magento-app.com/getting-started/available-commands/link) and [importing database](https://docs.create-magento-app.com/getting-started/available-commands/import-db)!
