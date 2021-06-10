/* eslint-disable max-len */
/**
 * @type {import(listr2).ListrTask<import(../../../../typings/context).ListrContext>}
 */
const deleteCustomers = {
    title: 'Deleting customers',
    task: async (ctx) => {
        const { mysqlConnection } = ctx;
        await mysqlConnection.query(`
        SET FOREIGN_KEY_CHECKS=0;
        TRUNCATE customer_address_entity;
        TRUNCATE customer_address_entity_datetime;
        TRUNCATE customer_address_entity_decimal;
        TRUNCATE customer_address_entity_int;
        TRUNCATE customer_address_entity_text;
        TRUNCATE customer_address_entity_varchar;
        TRUNCATE customer_entity;
        TRUNCATE customer_entity_datetime;
        TRUNCATE customer_entity_decimal;
        TRUNCATE customer_entity_int;
        TRUNCATE customer_entity_text;
        TRUNCATE customer_entity_varchar;
        TRUNCATE login_as_customer;
        TRUNCATE customer_visitor;

        ALTER TABLE customer_address_entity AUTO_INCREMENT=1;
        ALTER TABLE customer_address_entity_datetime AUTO_INCREMENT=1;
        ALTER TABLE customer_address_entity_decimal AUTO_INCREMENT=1;
        ALTER TABLE customer_address_entity_int AUTO_INCREMENT=1;
        ALTER TABLE customer_address_entity_text AUTO_INCREMENT=1;
        ALTER TABLE customer_address_entity_varchar AUTO_INCREMENT=1;
        ALTER TABLE customer_entity AUTO_INCREMENT=1;
        ALTER TABLE customer_entity_datetime AUTO_INCREMENT=1;
        ALTER TABLE customer_entity_decimal AUTO_INCREMENT=1;
        ALTER TABLE customer_entity_int AUTO_INCREMENT=1;
        ALTER TABLE customer_entity_text AUTO_INCREMENT=1;
        ALTER TABLE customer_entity_varchar AUTO_INCREMENT=1;
        ALTER TABLE login_as_customer AUTO_INCREMENT=1;
        ALTER TABLE customer_visitor AUTO_INCREMENT=1;
        SET FOREIGN_KEY_CHECKS=1;
        `);
    }
};

module.exports = deleteCustomers;
