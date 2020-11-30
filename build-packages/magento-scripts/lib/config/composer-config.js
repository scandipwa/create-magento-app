const composerConfig = {
    '2.4.1': {
        version: '2.4.1',
        require: {
            'magento/product-community-edition': '^2.4.1',
            'magento/composer-root-update-plugin': '~1.0'
        },
        'require-dev': {
            'allure-framework/allure-phpunit': '~1.2.0',
            'dealerdirect/phpcodesniffer-composer-installer': '^0.5.0',
            'friendsofphp/php-cs-fixer': '~2.16.0',
            'lusitanian/oauth': '~0.8.10',
            'magento/magento-coding-standard': '*',
            'magento/magento2-functional-testing-framework': '^3.0',
            'pdepend/pdepend': '~2.7.1',
            'phpcompatibility/php-compatibility': '^9.3',
            'phpmd/phpmd': '^2.8.0',
            'phpstan/phpstan': '>=0.12.3 <=0.12.23',
            'phpunit/phpunit': '^9',
            'sebastian/phpcpd': '~5.0.0',
            'squizlabs/php_codesniffer': '~3.5.4'
        }
    }
};

module.exports = {
    composerConfig
};
