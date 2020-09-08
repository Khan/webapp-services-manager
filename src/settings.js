

const defaults = {
    "dark-mode": function() {
        const mode = getComputedStyle(document.documentElement).getPropertyValue('content');
        return mode === "\"dark\"";
    },
};

export function getSetting(name) {
    const settingsJson = localStorage.getItem("settings") || "{}";
    const settings = JSON.parse(settingsJson) || {};
    const value = settings[name];

    if (value === null || value === undefined) {
        if (defaults[name]) {
            return defaults[name]();
        }
        return undefined;
    }

    return value;
}

export function saveSetting(name, value) {
    const settingsJson = localStorage.getItem("settings") || "{}";
    const settings = JSON.parse(settingsJson) || {};
    settings[name] = value;
    localStorage.setItem("settings", JSON.stringify(settings));
}
