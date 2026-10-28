# create-magento-app

This package contains global command for [Create Magento App](https://github.com/scandipwa/create-magento-app).

## Usage

Create a new Magento 2 application:

```bash
npx create-magento-app my-app
```

Add CMA to a Magento 2 project you already have:

```bash
cd /path/to/your/magento/project
npx create-magento-app .
```

When the destination is not empty, the command switches to *adopt* mode: it merges the CMA scripts and dependency into your existing `package.json`, writes `cma.js` and the agent instruction files only when they are missing, and never overwrites a file your project already owns. See [Installing CMA in an existing Magento project](https://docs.create-magento-app.com/usage-guide/installing-cma-in-an-existing-magento-project).

Package is currently under development. Docs too.

**Try at your own risk!**
