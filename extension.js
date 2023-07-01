const {Meta, Shell, Gio} = imports.gi;
const Main = imports.ui.main;
const Keyboard = imports.ui.status.keyboard
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();


const MAX_SHORTCUTS = 10;

class Extension {

    constructor () {
        this.settings = null;
    }

    enable () {
        this.settings = ExtensionUtils.getSettings();
        // Switch to the input method $i
        for (let i = 0; i < MAX_SHORTCUTS; i++) {
            Main.wm.addKeybinding(`imkey-${i}`,
                this.settings,
                Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
                Shell.ActionMode ? Shell.ActionMode.NORMAL : Shell.KeyBindingMode.NORMAL,
                () => Keyboard.getInputSourceManager().inputSources[i].activate()
            );
        };
        // Touchpad control
        const Touchpad = new Gio.Settings({ schema_id: 'org.gnome.desktop.peripherals.touchpad' });
        // Emulate "gsettings set org.gnome.desktop.peripherals.touchpad send-events enabled"
        Main.wm.addKeybinding('tpkey-0',
            this.settings,
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode ? Shell.ActionMode.NORMAL : Shell.KeyBindingMode.NORMAL,
            () => Touchpad.set_string("send-events", "enabled")
        );
        // Emulate "gsettings set org.gnome.desktop.peripherals.touchpad send-events disabled"
        Main.wm.addKeybinding('tpkey-1',
            this.settings,
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode ? Shell.ActionMode.NORMAL : Shell.KeyBindingMode.NORMAL,
            () => Touchpad.set_string("send-events", "disabled")
        );
    }

    disable() {
        for (let i = 0; i < MAX_SHORTCUTS; i++) {
            Main.wm.removeKeybinding(`imkey-${i}`);
        };
        Main.wm.removeKeybinding('tpkey-0');
        Main.wm.removeKeybinding('tpkey-1');
        this.settings = null;
    }
}

function init() {
    return new Extension();
}

