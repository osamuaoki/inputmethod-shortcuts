const { Adw, Gio, Gdk, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
//const _ = ExtensionUtils.gettext;

const MAX_INPUT_METHODS = 10;
const MAX_TOUCHPADS = 3;

function init() {
   //ExtensionUtils.initTranslations();
};

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings();
    const InputSources = new Gio.Settings({
        schema_id: 'org.gnome.desktop.input-sources'
    });
    const InputMethods = InputSources.get_value('sources');
    // nInputMethods : number of input method shortcuts managed (max 10)
    const nInputMethods = (
        (InputMethods.n_children() < MAX_INPUT_METHODS )
            ? InputMethods.n_children()
            : MAX_INPUT_METHODS
    );
    const im_labels = Array(nInputMethods);
    let id0_xkb = ''; // start with invalid index to indicate no xkb set
    let i0_xkb = -1; // start with invalid index to indicate no xkb set
    for (let i = 0; i < nInputMethods; i++) {
        let [type, id] = InputMethods.get_child_value(i).deepUnpack();
        im_labels[i] = `IM${i}: <b>${id}</b> (<i>${type}</i>)`;
        if ( type === "xkb" ) {
            if (i0_xkb === -1 ) {
                id0_xkb = id;
                i0_xkb = i;  // the first index for xkb
            };
        };
    };
    const tp_labels = Array(MAX_TOUCHPADS);
    tp_labels[0] = 'Touchpad <b>On</b>';
    tp_labels[1] = 'Touchpad <b>Off</b>';
    tp_labels[2] = 'Touchpad <b>Toggle</b>';
    addShortcutPage(window, settings,
        'Input Method Shortcuts', 'input-keyboard-symbolic',
        'imkey', im_labels, MAX_INPUT_METHODS
    );
    addShortcutPage(window, settings,
        'Touchpad Shortcuts', 'input-touchpad-symbolic',
        'tpkey', tp_labels, MAX_TOUCHPADS
    );
    addSwitchPage(window, settings,
        'Operation Preference', 'preferences-system-symbolic', i0_xkb, id0_xkb
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
        row[i] = new Adw.ActionRow({ title: `${labels[i]}`, use_markup: true });
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
    const group_extra = new Adw.PreferencesGroup();
    page.add(group_extra);
    row_extra = new Adw.ActionRow(
        {
            title: 'Click each row to set a new keyboard shortcut.\nPress <b>Esc</b> to cancel or <b>Backspace</b> to disable keyboard shortcut.',
            use_markup: true
        }
    );
    group_extra.add(row_extra)

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

            if (mask === 0 && keyval === Gdk.KEY_BackSpace) {
                settings.set_strv(`${shortcut_name}`, []);
                updateButton(button, shortcut_name, settings);
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

// Core logic from https://gitlab.gnome.org/GNOME/gnome-control-center/-/blob/main/panels/keyboard/keyboard-shortcuts.c
// Logic with *** are added here
// keyvals are defined in /usr/include/gtk-4.0/gdk/gdkkeysyms.h
// modifiers are defined as enums in /usr/include/gtk-4.0/gdk/gdkenums.h
// gjs code from https://github.com/jqno/gnome-happy-appy-hotkey.git
function keyvalIsForbidden(keyval) {
    return [
        // Navigation keys
        Gdk.KEY_Home,
        Gdk.KEY_Left,
        Gdk.KEY_Up,
        Gdk.KEY_Right,
        Gdk.KEY_Down,
        Gdk.KEY_Page_Up,
        Gdk.KEY_Page_Down,
        Gdk.KEY_End,
        Gdk.KEY_Tab,

        // Return
        Gdk.KEY_KP_Enter,
        Gdk.KEY_Return,

        Gdk.KEY_Mode_switch,
    ].includes(keyval);
};

// *** Only to be used with some Modifier-pressed
function keyvalIsAcceptedCombo(keyval) {
    return [
        // Modifier keys
        Gdk.KEY_Shift_L,
        Gdk.KEY_Control_L,
        Gdk.KEY_Meta_L,
        Gdk.KEY_Super_L,
        Gdk.KEY_Shift_R,
        Gdk.KEY_Control_R,
        Gdk.KEY_Meta_R,
        Gdk.KEY_Super_R,
        Gdk.KEY_Caps_Lock, // *** This is debatable and may be skipped
    ].includes(keyval);
};
// The above doesn't cause problem even if Caps_Lock is set to work as Control by GNOME Tweak

function isBindingValid({ mask, keycode, keyval }) {
    if ((mask === 0 || mask === Gdk.ModifierType.SHIFT_MASK) && keycode !== 0) {
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
            || (keyval === Gdk.KEY_WakeUp && mask === 0) // *** Add for Thinkpad Fn-key
            || keyvalIsForbidden(keyval)
        )
        {
            return false;
        };
    };

    // White list (basic Gtk) -- this takes care (mask && keyvalIsForbidden(keyval) cases
    // - Thinkpad Fn->Shift_R emitting Gdk.KEY_Launch3 is taken care here
    if (Gtk.accelerator_valid(keyval, mask)) {
        return true;
    };
    // *** Extra whitelist with some Modifier-pressed as combo
    if ( mask && keyvalIsAcceptedCombo(keyval) ) {
        return true;
    };
    // Default not allow
    return false;
};

function addSwitchPage(window, settings, title, icon_name, i0_xkb, id0_xkb) {
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
        use_markup: true
    });
    if (i0_xkb >= 0) {
        row_0.set_title(`Set to the first <i>xkb</i> (currently, IM${i0_xkb}: <b>${id0_xkb}</b>) before using any <i>ibus</i>.\nThis is helpful when IM can select non-latin <i>xkb</i>.`);
    } else {
        row_0.set_title('Nothing to configure (since no <i>xkb</i> are selected as IM)');
    }
    group.add(row_0);
    if (i0_xkb >= 0) {
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
    }
    // Extra text to explain
    const group_extra = new Adw.PreferencesGroup();
    page.add(group_extra);
    row_extra = new Adw.ActionRow(
        {
            title: '<a href="https://github.com/osamuaoki/inputmethod-shortcuts">See more on the upstream document</a>',
            use_markup: true
        }
    );
    group_extra.add(row_extra)

    window._settings = settings;
}

