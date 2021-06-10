/* eslint-disable max-len */
/**
 * @type {import(listr2).ListrTask<import(../../../../typings/context).ListrContext>}
 */
const deleteOrders = {
    title: 'Deleting orders',
    task: async (ctx) => {
        const { mysqlConnection } = ctx;

        /**
         * Delete orders
         */
        await mysqlConnection.query(`
        SET FOREIGN_KEY_CHECKS=0;
        TRUNCATE sales_creditmemo;
        TRUNCATE sales_creditmemo_comment;
        TRUNCATE sales_creditmemo_grid;
        TRUNCATE sales_creditmemo_item;
        TRUNCATE sales_invoice;
        TRUNCATE sales_invoice_comment;
        TRUNCATE sales_invoice_grid;
        TRUNCATE sales_invoice_item;
        TRUNCATE sales_order;
        TRUNCATE sales_order_address;
        TRUNCATE sales_order_grid;
        TRUNCATE sales_order_item;
        TRUNCATE sales_order_payment;
        TRUNCATE sales_order_status_history;
        TRUNCATE quote;
        TRUNCATE quote_address;
        TRUNCATE quote_address_item;
        TRUNCATE quote_item;
        TRUNCATE quote_item_option;
        TRUNCATE quote_payment;
        TRUNCATE quote_shipping_rate;
        TRUNCATE sales_shipment;
        TRUNCATE sales_shipment_comment;
        TRUNCATE sales_shipment_grid;
        TRUNCATE sales_shipment_item;
        TRUNCATE sales_shipment_track;
        TRUNCATE sales_invoiced_aggregated;
        TRUNCATE sales_invoiced_aggregated_order;
        TRUNCATE sales_payment_transaction;
        TRUNCATE sales_order_aggregated_created;
        TRUNCATE sales_order_tax;
        TRUNCATE sales_order_tax_item;
        TRUNCATE sendfriend_log;
        TRUNCATE report_event;
        ALTER TABLE sales_creditmemo AUTO_INCREMENT=1;
        ALTER TABLE sales_creditmemo_comment AUTO_INCREMENT=1;
        ALTER TABLE sales_creditmemo_grid AUTO_INCREMENT=1;
        ALTER TABLE sales_creditmemo_item AUTO_INCREMENT=1;
        ALTER TABLE sales_invoice AUTO_INCREMENT=1;
        ALTER TABLE sales_invoice_comment AUTO_INCREMENT=1;
        ALTER TABLE sales_invoice_grid AUTO_INCREMENT=1;
        ALTER TABLE sales_invoice_item AUTO_INCREMENT=1;
        ALTER TABLE sales_order AUTO_INCREMENT=1;
        ALTER TABLE sales_order_address AUTO_INCREMENT=1;
        ALTER TABLE sales_order_grid AUTO_INCREMENT=1;
        ALTER TABLE sales_order_item AUTO_INCREMENT=1;
        ALTER TABLE sales_order_payment AUTO_INCREMENT=1;
        ALTER TABLE sales_order_status_history AUTO_INCREMENT=1;
        ALTER TABLE quote AUTO_INCREMENT=1;
        ALTER TABLE quote_address AUTO_INCREMENT=1;
        ALTER TABLE quote_address_item AUTO_INCREMENT=1;
        ALTER TABLE quote_item AUTO_INCREMENT=1;
        ALTER TABLE quote_item_option AUTO_INCREMENT=1;
        ALTER TABLE quote_payment AUTO_INCREMENT=1;
        ALTER TABLE quote_shipping_rate AUTO_INCREMENT=1;
        ALTER TABLE sales_shipment AUTO_INCREMENT=1;
        ALTER TABLE sales_shipment_comment AUTO_INCREMENT=1;
        ALTER TABLE sales_shipment_grid AUTO_INCREMENT=1;
        ALTER TABLE sales_shipment_item AUTO_INCREMENT=1;
        ALTER TABLE sales_shipment_track AUTO_INCREMENT=1;
        ALTER TABLE sales_invoiced_aggregated AUTO_INCREMENT=1;
        ALTER TABLE sales_invoiced_aggregated_order AUTO_INCREMENT=1;
        ALTER TABLE sales_payment_transaction AUTO_INCREMENT=1;
        ALTER TABLE sales_order_aggregated_created AUTO_INCREMENT=1;
        ALTER TABLE sales_order_tax AUTO_INCREMENT=1;
        ALTER TABLE sales_order_tax_item AUTO_INCREMENT=1;
        ALTER TABLE sendfriend_log AUTO_INCREMENT=1;
        ALTER TABLE report_event AUTO_INCREMENT=1;
        SET FOREIGN_KEY_CHECKS=1;
        `);
    }
};

module.exports = deleteOrders;
