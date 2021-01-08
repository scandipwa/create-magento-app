![Create Magneto app](https://user-images.githubusercontent.com/29531824/104042050-9dfd1600-51e2-11eb-9d96-b8e34b754235.png)

A zero-configuration tool-chain which allows to deploy Magento 2 application in minutes!

- [Creating an App](https://docs.create-magento-app.com/getting-started/getting-started) – How to create a new app.
- [Available commands](https://docs.create-magento-app.com/getting-started/available-commands) – Learn how to use apps bootstrapped with Create Magento App.

## Most important features

### Conflict-less design :handshaking:

The application will automatically select free ports. It will never let services previously installed on your machine down!

**Screwed a local installation?** Worry not, Create Magento App will set you up!

### Easy debugging :bug:

The powerful [XDebug tool](https://docs.create-magento-app.com/usage-guide/enabling-xdebug) is a single command-line option flag away from you!

## Creating an App

**You’ll need to have Node >= 12 on your local development machine**. You can use [n](https://www.npmjs.com/package/n) to switch Node versions between different projects.

**You’ll need to install platform specific dependencies** for [Linux](https://docs.create-magento-app.com/getting-started/prerequisites/installation-on-linux) and [MacOS](https://docs.create-magento-app.com/getting-started/prerequisites/installation-on-macos).

To create a new app, you may choose one of the following methods:

#### NPX

```bash
npx create-magento-app my-app
```

[npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher

#### NPM

```bash
npm init magento-app my-app
```

`npm init <initializer>` is available in npm 6+

#### Yarn

```bash
yarn create magento-app my-app
```

`yarn create` is available in Yarn 0.25+


## Contribution

We'd love to have your helping hand on `create-magento-app`! See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information on what we're looking for and how to get started.

Thanks to these **awesome** :heart: people for contribution!

<a href="https://github.com/scandipwa/create-magento-app/graphs/contributors">
<img src="https://contributors-img.web.app/image?repo=scandipwa/create-magento-app" />
</a>

## License

Create Magento App is open source software licensed as [OSL-3.0](./LICENSE).
