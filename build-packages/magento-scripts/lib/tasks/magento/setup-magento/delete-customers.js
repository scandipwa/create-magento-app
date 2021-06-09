/* eslint-disable max-len */
/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const deleteCustomers = {
    title: 'Deleting customers',
    task: async (ctx) => {
        const { mysqlConnection } = ctx;
        await mysqlConnection.query(`
        ***********for categories********************
        TRUNCATE TABLE 'catalog_category_entity';
        TRUNCATE TABLE 'catalog_category_entity_datetime';
        TRUNCATE TABLE 'catalog_category_entity_decimal';
        TRUNCATE TABLE 'catalog_category_entity_int';
        TRUNCATE TABLE 'catalog_category_entity_text';
        TRUNCATE TABLE 'catalog_category_entity_varchar';
        TRUNCATE TABLE 'catalog_category_product';
        TRUNCATE TABLE 'catalog_category_product_index';

        INSERT  INTO 'catalog_category_entity'('entity_id','entity_type_id','attribute_set_id','parent_id','created_at','updated_at','path','POSITION','level','children_count') VALUES (1,3,0,0,'0000-00-00 00:00:00','2009-02-20 00:25:34','1',1,0,1),(2,3,3,0,'2009-02-20 00:25:34','2009-02-20 00:25:34','1/2',1,1,0);
        INSERT  INTO 'catalog_category_entity_int'('value_id','entity_type_id','attribute_id','store_id','entity_id','value') VALUES (1,3,32,0,2,1),(2,3,32,1,2,1);
        INSERT  INTO 'catalog_category_entity_varchar'('value_id','entity_type_id','attribute_id','store_id','entity_id','value') VALUES (1,3,31,0,1,'Root Catalog'),(2,3,33,0,1,'root-catalog'),(3,3,31,0,2,'Default Category'),(4,3,39,0,2,'PRODUCTS'),(5,3,33,0,2,'default-category');

            *****************for customers*****************

            SET FOREIGN_KEY_CHECKS=0;
        -- reset customers
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
        TRUNCATE log_customer;
        TRUNCATE log_visitor;
        TRUNCATE log_visitor_info;

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
        ALTER TABLE log_customer AUTO_INCREMENT=1;
        ALTER TABLE log_visitor AUTO_INCREMENT=1;
        ALTER TABLE log_visitor_info AUTO_INCREMENT=1;
        SET FOREIGN_KEY_CHECKS=1;
        `);
    }
};

module.exports = deleteCustomers;
