/* eslint-disable no-await-in-loop, no-restricted-syntax */
/**
 * Update table in **magento** database
 * @param {String} table Table name
 * @param {{path: string, value: string}[]} values
 * @param {Object} param1
 */
const updateTableValues = async (table, values, { mysqlConnection, task }) => {
    const [rows] = await mysqlConnection.query(`
        SELECT * FROM ${table}
        WHERE ${values.map((p) => `path = '${p.path}'`).join(' OR ')};
    `);

    if (rows.filter(Boolean).length !== values.length) {
        const lostConfigs = values.filter((p) => !rows.some((row) => row.path === p.path));
        for (const config of lostConfigs) {
            await mysqlConnection.query(`
                INSERT INTO ${table}
                (scope, path, value)
                VALUES ('default', ?, ?);
            `, [config.path, config.value]);
        }

        const configsToUpdate = values.filter((p) => rows.some((row) => row.path === p.path));
        for (const config of configsToUpdate) {
            await mysqlConnection.query(`
                UPDATE ${table}
                SET value = ?
                WHERE path = ?;
            `, [config.value, config.path]);
        }

        return;
    }

    const checkIfValueIsCorrect = ({ path, value }) => {
        const val = values.find((p) => p.path === path);

        return val && val.value === value;
    };

    if (rows.every(checkIfValueIsCorrect)) {
        task.skip();
        return;
    }

    const configsToUpdate = values.filter(({ path, value }) => {
        const row = rows.find((row) => row.path === path);

        return row && row.value !== value;
    });

    for (const config of configsToUpdate) {
        await mysqlConnection.query(`
            UPDATE ${table}
            SET value = ?
            WHERE path = ?;
        `, [config.value, config.path]);
    }
};

module.exports = {
    updateTableValues
};
