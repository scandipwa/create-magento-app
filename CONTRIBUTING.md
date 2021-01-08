# Contributing to Create Magento App

Loving Create Magento App and want to get involved? Thanks! There are plenty of ways you can help.

Please take a moment to review this document in order to make the contribution process straightforward and effective for everyone involved.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue or assessing patches and features.

## Core Ideas

> TO BE DEFINED :octocat:

## Submitting a Pull Request

Good pull requests, such as patches, improvements, and new features, are a fantastic help. They should remain focused in scope and avoid containing unrelated commits.

Please ask first if somebody else is already working on this or the core developers think your feature is in-scope for Create Magento App. Generally always have a related issue with discussions for whatever you are including.

Please also provide a test plan, i.e. specify how you verified that your addition works.

## Folder Structure

```
└── 📁  build-packages
   ├── 📁 create-magento-app
   └── 📁 magento-scripts
```

## Setting up a local copy

Setting Up a Local Copy
1. Clone the repo with `git clone https://github.com/scandipwa/create-magento-app`
2. Run `yarn` in the root `create-magento-app` folder.

You may now create a test project using `create-magento-app`, for that, type in: `yarn cma`. This will create a Magento 2 project in `runtime-packages/cma` and print you further instructions.

## Publishing

Use `lerna publish --exact` command.

For canary publishing, use `lerna publish --canary --exact --preid next --dist-tag=next minor`

