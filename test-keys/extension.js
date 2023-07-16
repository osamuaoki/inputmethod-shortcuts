const { Meta, Shell, Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

class Extension {

    constructor() {
        this.settings = null;
    }

    enable() {
        this.settings = ExtensionUtils.getSettings();
    };

    disable() {
        this.settings = null;
    };
};

function init() {
    return new Extension();
};

