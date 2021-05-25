/* eslint-disable no-restricted-syntax */
const Conf = require('conf');

const pkg = require('../../package.json');

const projectsConfig = new Conf({
    configName: 'projects',
    projectName: 'create-magento-app',
    projectVersion: pkg.version,
    defaults: {}
});
const projectKey = process.cwd();

const getProjectsFromProjectKeys = (path, project) => {
    if (project.createdAt) {
        return { [path]: project };
    }

    return Object.entries(project)
        .map(([subProjectPath, subProjectValue]) => getProjectsFromProjectKeys(`${path}.${subProjectPath}`, subProjectValue))
        .reduce((acc, val) => ({ ...acc, ...val }), {});
};
/**
 *
 * @returns {Record<string, { createdAt?: string, prefix?: string}>}
 */
const getProjectsList = () => {
    const projects = {};
    for (const [projectPath, projectValueWithProjects] of projectsConfig) {
        const projectList = getProjectsFromProjectKeys(projectPath, projectValueWithProjects);
        Object.entries(projectList).forEach(([key, value]) => {
            projects[key] = value;
        });
    }

    return projects;
};
/**
 * Those 2 functions are needed to remain compatibility with older CMA instances,
 * because when this part of code was written,
 * I haven't considered option in Conf package accessPropertiesByDotNotation - https://www.npmjs.com/package/conf#accesspropertiesbydotnotation
 * So, now some projects that have dots in names of then will stack up.
 * And it will be real pain in the butt to try use migrations option to update them, so we'll just leave it as is for now.
 */

module.exports = {
    projectsConfig,
    projectKey,
    getProjectsList
};
