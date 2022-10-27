/**
 * Update table in **magento** database
 * @param {String} table Table name
 * @param {{ path: string, value: string | number | null }[]} values
 * @param {{ databaseConnection: import('../../typings/context').ListrContext['databaseConnection'], task: import('listr2').ListrTaskWrapper<import('../../typings/context').ListrContext, any> }} param2
 */
const updateTableValues = async (
    table,
    values,
    { databaseConnection, task }
) => {
    const [rows] = await databaseConnection.query(`
        SELECT * FROM ${table}
        WHERE ${values.map((p) => `path = '${p.path}'`).join(' OR ')};
    `)

    if (rows.filter(Boolean).length !== values.length) {
        const lostConfigs = values.filter(
            (p) => !rows.some((row) => row.path === p.path)
        )
        for (const config of lostConfigs) {
            await databaseConnection.query(
                `
                INSERT INTO ${table}
                (scope, path, value)
                VALUES ('default', ?, ?);
            `,
                [config.path, config.value]
            )
        }

        const configsToUpdate = values.filter((p) =>
            rows.some((row) => row.path === p.path)
        )
        for (const config of configsToUpdate) {
            await databaseConnection.query(
                `
                UPDATE ${table}
                SET value = ?
                WHERE path = ?;
            `,
                [config.value, config.path]
            )
        }

        return
    }

    /**
     * @param {{ path: string, value: unknown }} param0
     */
    const checkIfValueIsCorrect = ({ path, value }) => {
        const val = values.find((p) => p.path === path)

        return val && val.value === value
    }

    if (rows.every(checkIfValueIsCorrect)) {
        task.skip()
        return
    }

    const configsToUpdate = values.filter(({ path, value }) => {
        const row = rows.find((row) => row.path === path)

        return row && row.value !== value
    })

    for (const config of configsToUpdate) {
        await databaseConnection.query(
            `
            UPDATE ${table}
            SET value = ?
            WHERE path = ?;
        `,
            [config.value, config.path]
        )
    }
}

/**
 * @param {String} database
 * @param {String} tableName
 * @param {import('../../typings/context').ListrContext} param2
 */
const isTableExists = async (database, tableName, { databaseConnection }) => {
    /**
     * @type {{ tableCount: number }[][]}
     */
    const [[{ tableCount }]] = await databaseConnection.query(
        `
   SELECT count(*) as tableCount
   FROM information_schema.TABLES
   WHERE (TABLE_SCHEMA = ?) AND (TABLE_NAME = ?);
`,
        [database, tableName]
    )

    return tableCount > 0
}

module.exports = {
    updateTableValues,
    isTableExists
}
