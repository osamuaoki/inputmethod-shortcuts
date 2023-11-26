import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class TestKeysExtension extends Extension {
    enable() {
        this.settings = this.getSettings();
    };

    disable() {
        this.settings = null;
    };
};
