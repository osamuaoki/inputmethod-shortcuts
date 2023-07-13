const { Meta, Shell, Gio } = imports.gi;
const Main = imports.ui.main;
const Keyboard = imports.ui.status.keyboard;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const MAX_INPUT_METHODS = 10;

class Extension {

    constructor() {
        this.settings = null;
    }

    enable() {
        this.settings = ExtensionUtils.getSettings();
        const InputSources = new Gio.Settings({ schema_id: 'org.gnome.desktop.input-sources' });
        const InputMethods = InputSources.get_value('sources');
        const nInputMethods = ((InputMethods.n_children() < MAX_INPUT_METHODS) ? InputMethods.n_children() : MAX_INPUT_METHODS);
        //
        this.i_base = -1; // start with invalid index to indicate no xkb set
        for (let i = 0; i < nInputMethods; i++) {
            let [type, _] = InputMethods.get_child_value(i).deepUnpack();
            if (type === "xkb") { // id isn't used
                if (this.i_base === -1) {
                    this.i_base = i;  // the first index for xkb
                };
            };
        };
        // i_base is the first xkb setting if 0 or plus value
        for (let i = 0; i < nInputMethods; i++) {
            let [type, _] = InputMethods.get_child_value(i).deepUnpack();
            Main.wm.addKeybinding(`imkey-${i}`,
                this.settings,
                Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
                Shell.ActionMode.ALL,
                () => {
                    if (this.i_base === -1 || type === "xkb" || !this.settings.get_boolean('primary-xkb')) {
                        Keyboard.getInputSourceManager().inputSources[i].activate();
                    } else {
                        Keyboard.getInputSourceManager().inputSources[this.i_base].activate();
                        Keyboard.getInputSourceManager().inputSources[i].activate();
                    };
                }
            );
        };
        // Touchpad control
        const Touchpad = new Gio.Settings({ schema_id: 'org.gnome.desktop.peripherals.touchpad' });
        // Emulate "gsettings set org.gnome.desktop.peripherals.touchpad send-events enabled"
        Main.wm.addKeybinding('tpkey-0',
            this.settings,
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.ALL,
            () => Touchpad.set_string("send-events", "enabled")
        );
        // Emulate "gsettings set org.gnome.desktop.peripherals.touchpad send-events disabled"
        Main.wm.addKeybinding('tpkey-1',
            this.settings,
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.ALL,
            () => Touchpad.set_string("send-events", "disabled")
        );
        // Emulate "gsettings set org.gnome.desktop.peripherals.touchpad send-events enable/disabled"
        Main.wm.addKeybinding('tpkey-2',
            this.settings,
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.ALL,
            () => {
                if (Touchpad.get_string("send-events") === "enabled") {
                    Touchpad.set_string("send-events", "disabled");
                } else {
                    Touchpad.set_string("send-events", "enabled");
                };
            }
        );
    };

    disable() {
        for (let i = 0; i < MAX_INPUT_METHODS; i++) {
            Main.wm.removeKeybinding(`imkey-${i}`);
        };
        Main.wm.removeKeybinding('tpkey-0');
        Main.wm.removeKeybinding('tpkey-1');
        Main.wm.removeKeybinding('tpkey-2');
        this.settings = null;
    };
};

function init() {
    return new Extension();
};

