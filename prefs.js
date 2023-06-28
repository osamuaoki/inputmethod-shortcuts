const { Adw, Gio, Gdk, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
//const _ = ExtensionUtils.gettext;

const MAX_SHORTCUTS = 10;

function init() {
   //ExtensionUtils.initTranslations();
}

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings();

    const InputSources = new Gio.Settings({ schema_id: 'org.gnome.desktop.input-sources' });
    const InputMethods = InputSources.get_value('sources');
    // nInputMethods : number of input method shortcuts managed
    const nInputMethods = ( (InputMethods.n_children() < MAX_SHORTCUTS ) ? InputMethods.n_children() : MAX_SHORTCUTS ) ;

    // Create a preferences page
    const page = new Adw.PreferencesPage();
    page.set_title('Input Method Shortcuts');
    window.add(page);

    // List of inputmethod settings as a group
    const group = new Adw.PreferencesGroup();
    page.add(group);

    // Create inputmethod setting rows, each with title and (right aligned) button
    const row = Array(nInputMethods);
    const button = Array(nInputMethods);
    // Menu rows for all active IM
    for (let i = 0; i < nInputMethods; i++) {
        let [type, id] = InputMethods.get_child_value(i).deepUnpack();
        row[i] = new Adw.ActionRow({ title: `${id}  (${type})` });
        group.add(row[i]);
        button[i] = makeImkeyButton(i, settings);
        row[i].add_suffix(button[i]);
        row[i].activatable_widget = button[i];
    }
    // Ensue to unset unused shortcuts
    for (let i = nInputMethods; i < MAX_SHORTCUTS; i++) {
        settings.set_strv(`imkey-${i}`, []);
    }
    // Extra text to explain
    const group_extra = new Adw.PreferencesGroup(
        { title: 'Click each row to set a new keyboard shortcut.\n\nPress Esc to cancel or Backspace to disable keyboard shortcut.' }
    );
    page.add(group_extra);

    window._settings = settings;
}

function makeImkeyButton(i, settings) {
    const button = new Gtk.Button();
    button.connect('clicked', () => {
        button.set_label('*** Enter unused shortcut key ***');

        const eventController = new Gtk.EventControllerKey();
        button.add_controller(eventController);

        eventController.connect('key-pressed', (_widget, keyval, keycode, state) => {
            let mask = state & Gtk.accelerator_get_default_mod_mask();
            mask &= ~ Gdk.ModifierType.LOCK_MASK;
            if (mask === 0 && keyval === Gdk.KEY_Escape) {
                updateImkeyButton(button, i, settings);
                return Gdk.EVENT_STOP;
            }

            if (keyval === Gdk.KEY_BackSpace) {
                settings.set_strv(`imkey-${i}`, []);
                return Gdk.EVENT_STOP;
            }

            if (isBindingValid({ mask, keycode, keyval })) {
                const binding = Gtk.accelerator_name_with_keycode(
                    null,
                    keyval,
                    keycode,
                    mask
                );
                // console.log(`  binding = ${binding}`);
                settings.set_strv(`imkey-${i}`, [binding]);
            }
            return Gdk.EVENT_STOP;

        })

        button.show();
    })

    settings.connect(`changed::imkey-${i}`, () => {
        updateImkeyButton(button, i, settings);
    });

    updateImkeyButton(button, i, settings);

    return button;
}

function updateImkeyButton(button, i, settings) {
    const text = settings.get_strv(`imkey-${i}`)[0];
    if (text) {
        button.set_label(text);
    }
    else {
        button.set_label('Disabled');
    }
}

function isBindingValid({ mask, keycode, keyval }) {
    if ((mask === 0 || mask === Gdk.SHIFT_MASK) && keycode !== 0) {
        if (
            (keyval >= Gdk.KEY_a && keyval <= Gdk.KEY_z)
            || (keyval >= Gdk.KEY_A && keyval <= Gdk.KEY_Z)
            || (keyval >= Gdk.KEY_0 && keyval <= Gdk.KEY_9)
            || (keyval >= Gdk.KEY_kana_fullstop && keyval <= Gdk.KEY_semivoicedsound)
            || (keyval >= Gdk.KEY_Arabic_comma && keyval <= Gdk.KEY_Arabic_sukun)
            || (keyval >= Gdk.KEY_Serbian_dje && keyval <= Gdk.KEY_Cyrillic_HARDSIGN)
            || (keyval >= Gdk.KEY_Greek_ALPHAaccent && keyval <= Gdk.KEY_Greek_omega)
            || (keyval >= Gdk.KEY_hebrew_doublelowline && keyval <= Gdk.KEY_hebrew_taf)
            || (keyval >= Gdk.KEY_Thai_kokai && keyval <= Gdk.KEY_Thai_lekkao)
            || (keyval >= Gdk.KEY_Hangul_Kiyeog && keyval <= Gdk.KEY_Hangul_J_YeorinHieuh)
            || (keyval === Gdk.KEY_space && mask === 0)
        ) {
            return false;
        }
    }

    return Gtk.accelerator_valid(keyval, mask)
        || (keyval === Gdk.KEY_Tab && mask !== 0);
}

