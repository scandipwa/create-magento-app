/** @type {import('@scandipwa/magento-scripts').CMAConfiguration} */
module.exports = {
    magento: {
<% Object.entries(it.magentoConfiguration).forEach(([name, value]) => { %>
        <%= name %>: '<%= value%>',
<% }) %>
    },
    configuration: {}
};
