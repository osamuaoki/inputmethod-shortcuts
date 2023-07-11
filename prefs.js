const { Adw, Gio, Gdk, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
//const _ = ExtensionUtils.gettext;

const MAX_INPUT_METHODS = 10;
const MAX_TOUCHPADS = 2;
const InputSources = new Gio.Settings({
    schema_id: 'org.gnome.desktop.input-sources'
});
const InputMethods = InputSources.get_value('sources');
// nInputMethods : number of input method shortcuts managed
const nInputMethods = (
    (InputMethods.n_children() < MAX_INPUT_METHODS )
        ? InputMethods.n_children()
        : MAX_INPUT_METHODS
);

function init() {
   //ExtensionUtils.initTranslations();
};

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings();
    const im_labels = Array(nInputMethods);
    for (let i = 0; i < nInputMethods; i++) {
        let [type, id] = InputMethods.get_child_value(i).deepUnpack();
        im_labels[i] = `IM${i}: ${id}  (${type})`;
    };
    addShortcutPage(window, settings,
        'Input Method Shortcuts', 'input-keyboard-symbolic',
        'imkey', im_labels, MAX_INPUT_METHODS
    );
    const tp_labels = Array(MAX_TOUCHPADS);
    tp_labels[0] = 'Touchpad On';
    tp_labels[1] = 'Touchpad Off';
    addShortcutPage(window, settings,
        'Touchpad Shortcuts', 'input-touchpad-symbolic',
        'tpkey', tp_labels, MAX_TOUCHPADS
    );
    addSwitchPage(window, settings,
        'Operation Preference', 'preferences-system-symbolic'
    );
};

function addShortcutPage(window, settings, title, icon_name, prefix, labels, max) {

    // Create a preferences page
    const page = new Adw.PreferencesPage();
    page.set_title(title);
    page.set_icon_name(icon_name);
    window.add(page);

    // List of inputmethod settings as a group
    const group = new Adw.PreferencesGroup();
    page.add(group);

    // Create inputmethod setting rows, each with title and (right aligned) button
    const row = Array(labels.length)
    const button = Array(labels.length)
    for (let i = 0; i < labels.length; i++) {
        row[i] = new Adw.ActionRow({ title: `${labels[i]}` });
        group.add(row[i]);
        button[i] = makeButton(`${prefix}-${i}`, settings);
        row[i].add_suffix(button[i]);
        row[i].activatable_widget = button[i];
    }
    // Ensue to unset unused shortcuts
    for (let i = labels.length; i < max; i++) {
        settings.set_strv(`${prefix}-${i}`, []);
    }
    // Extra text to explain
    const group_extra = new Adw.PreferencesGroup(
        { title: 'Click each row to set a new keyboard shortcut.\n\nPress Esc to cancel or Backspace to disable keyboard shortcut.' }
    );
    page.add(group_extra);

    window._settings = settings;
}

function makeButton(shortcut_name, settings) {
    const button = new Gtk.Button();
    button.connect('clicked', () => {
        button.set_label('*** Enter unused shortcut key ***');

        const eventController = new Gtk.EventControllerKey();
        button.add_controller(eventController);

        eventController.connect('key-pressed', (_widget, keyval, keycode, state) => {
            let mask = state & Gtk.accelerator_get_default_mod_mask();
            mask &= ~ Gdk.ModifierType.LOCK_MASK;
            if (mask === 0 && keyval === Gdk.KEY_Escape) {
                updateButton(button, shortcut_name, settings);
                return Gdk.EVENT_STOP;
            }

            if (keyval === Gdk.KEY_BackSpace) {
                settings.set_strv(`${shortcut_name}`, []);
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
                settings.set_strv(`${shortcut_name}`, [binding]);
            }
            return Gdk.EVENT_STOP;

        })

        button.show();
    })

    settings.connect(`changed::${shortcut_name}`, () => {
        updateButton(button, shortcut_name, settings);
    });

    updateButton(button, shortcut_name, settings);

    return button;
}

function updateButton(button, shortcut_name, settings) {
    const text = settings.get_strv(shortcut_name)[0];
    if (text) {
        button.set_label(text);
    }
    else {
        button.set_label('Disabled');
    };
};

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
        )
        {
            return false;
        };
    };

    return Gtk.accelerator_valid(keyval, mask)
        || (keyval === Gdk.KEY_Tab && mask !== 0);
};

function addSwitchPage(window, settings, title, icon_name) {
    let id_xkb = ''; // start with invalid index to indicate no xkb set
    let i_xkb = -1; // start with invalid index to indicate no xkb set
    for (let i = 0; i < nInputMethods; i++) {
        let [type, id] = InputMethods.get_child_value(i).deepUnpack();
        if ( type === "xkb" ) { // id isn't used
            if (i_xkb === -1 ) {
                id_xkb = id;
                i_xkb = i;  // the first index for xkb
            }
        }
    }
    // Create a preferences page
    const page = new Adw.PreferencesPage();
    page.set_title(title);
    page.set_icon_name(icon_name);
    window.add(page);

    // List of inputmethod settings as a group
    const group = new Adw.PreferencesGroup();
    page.add(group);

    // Step though primary xkb before setting ibus IM : default=ON
    const row_0 = new Adw.ActionRow({
        title: `Set to 'IM${i_xkb}: ${id_xkb} (xkb)' (the first xkb)\nbefore entering any ibus input methods`
    });
    group.add(row_0);
    let primary_xkb = new Gtk.Switch({
        active: settings.get_boolean('primary-xkb'),
        halign: Gtk.Align.END,
        vexpand: false,
        hexpand: false,
        margin_top: 18,
        margin_bottom: 18
    })
    settings.bind('primary-xkb', primary_xkb, 'active', Gio.SettingsBindFlags.DEFAULT)
    row_0.add_suffix(primary_xkb);
    row_0.activatable_widget = primary_xkb;
    window._settings = settings;
}

