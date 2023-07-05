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
        const InputSources = new Gio.Settings({ schema_id: 'org.gnome.desktop.input-sources' });
        const InputMethods = InputSources.get_value('sources');
        const nInputMethods = ( (InputMethods.n_children() < MAX_SHORTCUTS ) ? InputMethods.n_children() : MAX_SHORTCUTS ) ;

            // Switch to the input method $i
        let i_base = -1; // invalid to indicate no xkb set
        for (let i = 0; i < nInputMethods; i++) {
            let [type, _] = InputMethods.get_child_value(i).deepUnpack();
            if ( type === "xkb" ) { // id isn't used
                if (i_base === -1 ) {
                    i_base = i;
                }
            }
        }
        // i_base is the first xkb setting if 0 or plus value
        for (let i = 0; i < nInputMethods; i++) {
            let [type, _] = InputMethods.get_child_value(i).deepUnpack();
            if ( i_base === -1 || type === "xkb" ) {
                Main.wm.addKeybinding(`imkey-${i}`,
                    this.settings,
                    Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
                    Shell.ActionMode.ALL,
                    () => Keyboard.getInputSourceManager().inputSources[i].activate()
                );
            } else {
                Main.wm.addKeybinding(`imkey-${i}`,
                    this.settings,
                    Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
                    Shell.ActionMode.ALL,
                    () => {
                        Keyboard.getInputSourceManager().inputSources[i_base].activate();
                        Keyboard.getInputSourceManager().inputSources[i].activate();
                    }
                );
            };
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

