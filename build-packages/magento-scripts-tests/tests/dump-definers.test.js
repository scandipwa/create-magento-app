const assert = require('assert')
const path = require('path')
const { spawnSync } = require('child_process')
const { libDir } = require('../magento-scripts')
const { stripDefinersSedScript } = require(path.join(
    libDir,
    'tasks/database/dump-definers'
))

// the task inlines the script in single quotes for bash
assert.ok(!stripDefinersSedScript.includes("'"))

const strip = (/** @type {string} */ input) => {
    const { stdout, stderr, status } = spawnSync(
        'bash',
        ['-c', `sed -E '${stripDefinersSedScript}'`],
        { input, encoding: 'utf-8' }
    )
    assert.strictEqual(status, 0, stderr)
    return stdout
}

// trigger header, as written by mysqldump and mariadb-dump
assert.strictEqual(
    strip(
        '/*!50003 CREATE*/ /*!50017 DEFINER=`prod_user`@`10.0.%`*/ /*!50003 TRIGGER trg_catalog_product_entity_after_insert AFTER INSERT ON catalog_product_entity FOR EACH ROW\n'
    ),
    '/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER trg_catalog_product_entity_after_insert AFTER INSERT ON catalog_product_entity FOR EACH ROW\n'
)

// view
assert.strictEqual(
    strip('/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */\n'),
    '/*!50013  SQL SECURITY DEFINER */\n'
)

// routine
assert.strictEqual(
    strip('CREATE DEFINER=`admin`@`%` FUNCTION `f`() RETURNS int(11)\n'),
    'CREATE  FUNCTION `f`() RETURNS int(11)\n'
)

// event
assert.strictEqual(
    strip(
        '/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `e` ON SCHEDULE EVERY 1 DAY */\n'
    ),
    '/*!50106 CREATE*/ /*!50117 */ /*!50106 EVENT `e` ON SCHEDULE EVERY 1 DAY */\n'
)

// MariaDB role definer has no host
assert.strictEqual(
    strip('/*!50013 DEFINER=`app_role` SQL SECURITY DEFINER */\n'),
    '/*!50013  SQL SECURITY DEFINER */\n'
)

// doubled backtick inside a quoted name
assert.strictEqual(
    strip('/*!50017 DEFINER=`we``ird`@`h``ost`*/\n'),
    '/*!50017 */\n'
)

// view, full statement form
assert.strictEqual(
    strip(
        '/*!50001 CREATE ALGORITHM=UNDEFINED DEFINER=`app_role` SQL SECURITY DEFINER VIEW `v` AS select 1 AS `x` */;\n'
    ),
    '/*!50001 CREATE ALGORITHM=UNDEFINED  SQL SECURITY DEFINER VIEW `v` AS select 1 AS `x` */;\n'
)

// row data is never rewritten, in any layout the dump tools emit
for (const insert of [
    // mysqldump, mariadb-dump < 10.11
    "INSERT INTO `cms_block` VALUES (1,'DEFINER=`x`@`y` in content');\n",
    // --insert-ignore, --replace
    "INSERT IGNORE INTO `cms_block` VALUES (1,'DEFINER=`x`@`y`');\n",
    "REPLACE INTO `cms_block` VALUES (1,'DEFINER=`x`@`y`');\n",
    // mariadb-dump >= 10.11 puts each row on its own line
    "INSERT INTO `cms_block` VALUES\n(1,'DEFINER=`x`@`y`'),\n(2,'CREATE DEFINER=`x`@`y`');\n"
]) {
    assert.strictEqual(strip(insert), insert)
}

// lines without a definer pass through
const table = 'CREATE TABLE `store` (\n  `store_id` smallint(5) unsigned\n);\n'
assert.strictEqual(strip(table), table)

console.log('dump-definers.test.js: ok')
