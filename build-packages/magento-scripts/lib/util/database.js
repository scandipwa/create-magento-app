/**
 * Update table in **magento** database
 * @param {String} table Table name
 * @param {{ path: string, value: string | number | null }[]} values
 * @param {{ databaseConnection: import('../../typings/context').ListrContext['databaseConnection'], task: { skip(): void } }} param2
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
 * Delete table in **magento** database
 * @param {String} table Table name
 * @param {{ path: string, value: string | number | null }[]} values
 * @param {{ databaseConnection: import('../../typings/context').ListrContext['databaseConnection'], task: { skip(): void } }} param2
 */
const deleteTableValues = async (
    table,
    values,
    { databaseConnection, task }
) => {
    const [rows] = await databaseConnection.query(`
        SELECT * FROM ${table}
        WHERE ${values.map((p) => `path = '${p.path}'`).join(' OR ')};
    `)

    if (rows.filter(Boolean).length === 0) {
        task.skip()
        return
    }

    const configsToDelete = rows.filter(({ path }) =>
        values.some((p) => p.path === path)
    )

    for (const config of configsToDelete) {
        await databaseConnection.query(
            `
            DELETE FROM ${table}
            WHERE config_id = ?;
        `,
            [config.config_id]
        )
    }
}

/**
 * Insert values into table in **magento** database
 * @description Will not insert values that already exist in the table
 * @param {string} table Table name
 * @param {{ path: string, value: string | number | null }[]} values
 * @param {{ databaseConnection: import('../../typings/context').ListrContext['databaseConnection'] }} param2
 */
const insertTableValues = async (table, values, { databaseConnection }) => {
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

/**
 * @param {TemplateStringsArray} sqlString
 * @param  {...any} variables
 * @returns {string}
 */
const sql = (sqlString, ...variables) => {
    return sqlString.reduce(
        (acc, val, i) =>
            `${acc}${
                typeof variables[i] === 'undefined'
                    ? ''
                    : typeof variables[i] === 'string'
                    ? `'${variables[i]}'`
                    : String(variables[i])
            }${val}`,
        ''
    )
}

/**
 * @param {Object} param0
 * @param {string} param0.table
 * @param {[string, string, any][]} param0.where
 * @param {Record<string, any>} param0.data
 * @param {import('../../typings/context').ListrContext} param1
 */
const databaseQuery = async (
    { table, where, data },
    { databaseConnection }
) => {
    const values = Object.entries(data).map(([key, val]) => ({
        path: key,
        value: val
    }))

    const whereInQuery = where
        .map(([key, operator, val]) => `${key} ${operator} ${sql`${val}`}`)
        .join(' AND ')

    const query = `
        SELECT * FROM ${table}
        WHERE ${whereInQuery};`

    const [rows] = await databaseConnection.query(query)

    if (rows.length === 0) {
        const query2 = `INSERT INTO ${table}
        (${[...where.map(([key]) => key), ...values.map((p) => p.path)].join(
            ', '
        )})
        VALUES (${[
            ...where.map(([, , val]) => sql`${val}`),
            ...values.map((p) => sql`${p.value}`)
        ].join(', ')});`

        await databaseConnection.query(query2)

        return true
    }

    const [row] = rows

    const incorrectData = Object.entries(data).filter(
        ([key, val]) => row[key] !== val
    )

    if (incorrectData.length > 0) {
        await databaseConnection.query(
            `UPDATE ${table}
            SET ${incorrectData
                .map(([key, val]) => `${key} = ${sql`${val}`}`)
                .join(', ')}
            WHERE ${whereInQuery};`
        )

        return true
    }

    return false
}

module.exports = {
    updateTableValues,
    insertTableValues,
    deleteTableValues,
    isTableExists,
    databaseQuery
}
