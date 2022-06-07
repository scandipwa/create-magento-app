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

const setupXMLStructure = (data) => {
    if (!data) {
        data = xmlConfiguration;
    }

    if (data['?xml'] === undefined) {
        data['?xml'] = xmlConfiguration['?xml'];
    }

    if (data.project === undefined) {
        data.project = xmlConfiguration.project;
    }

    if (data.project.component === undefined) {
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
