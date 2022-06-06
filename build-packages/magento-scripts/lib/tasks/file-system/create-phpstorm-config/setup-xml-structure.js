const xmlConfiguration = {
    '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8'
    },
    project: {
        '@_version': '4',
        component: []
    }
};

const setupXMLStructure = (data = {}) => {
    if (!data) {
        data = xmlConfiguration;
    }
    if (!('?xml' in data['?xml'])) {
        data['?xml'] = xmlConfiguration['?xml'];
    }

    if (!('project' in data)) {
        data.project = xmlConfiguration.project;
    }

    if (!('component' in data.project)) {
        data.project.component = xmlConfiguration.project.component;
    }

    if (!Array.isArray(data.project.component) && Boolean(data.project.component)) {
        data.project.component = [
            data.project.component
        ];
    }

    return data;
};

module.exports = {
    setupXMLStructure
};
