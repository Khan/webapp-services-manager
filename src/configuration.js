export default class Configuration {
    constructor(services) {
        this.services = services;
    }

    get(serviceName, configName, defaultValue) {
        if (!this.services[serviceName]) {
            return defaultValue;
        }

        const environmentVars = this.services[serviceName].env;

        if (environmentVars[configName]) {
            return environmentVars[configName];
        }

        const prefixedConfigName = "KHANDO_" + configName;
        if (environmentVars[prefixedConfigName]) {
            return environmentVars[prefixedConfigName];
        }

        return defaultValue;
    }
}
