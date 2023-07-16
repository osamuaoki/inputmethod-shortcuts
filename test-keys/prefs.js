const { Adw, Gio, Gdk, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
//const _ = ExtensionUtils.gettext;

function init() {
   //ExtensionUtils.initTranslations();
};

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings();
    // Create a preferences page
    const page = new Adw.PreferencesPage();
    page.set_title('Test keys');
    page.set_icon_name('input-keyboard-symbolic');
    window.add(page);

    // List of inputmethod settings as a group
    const group = new Adw.PreferencesGroup();
    page.add(group);

    // Create inputmethod setting rows, each with title and (right aligned) button
    const row = new Adw.ActionRow({ title: `Test a <b>key</b>`, use_markup: true });
    group.add(row);
    const button = makeButton('key', settings);
    row.add_suffix(button);
    row.activatable_widget = button;
    // Extra text to explain
    const group_extra = new Adw.PreferencesGroup();
    page.add(group_extra);
    row_extra = new Adw.ActionRow(
        {
            title: 'Click each row to set a new keyboard shortcut.\nPress <b>Esc</b> to cancel or <b>Backspace</b> to disable keyboard shortcut.\n\nkeycode = the hardware keycode. This is an identifying number for a physical key.\nkeyval = <a href="https://gjs-docs.gnome.org/gdk40~4.0-constants/">KEY CONSTANT</a> ... Like ASCII\nmask = <a href="https://gjs-docs.gnome.org/gdk30~3.0/gdk.modifiertype">GDK3 ModifierType</a>\n  SHIFT_MASK\t\t= 0x1\n  CONTROL_MASK\t= 0x4\n  MOD1_MASK\t\t= 0x8 (ALT)\n  SUPER_MASK\t\t= 0x400_0000\n  HYPER_MASK\t\t= 0x800_0000\n  META_MASK\t\t= 0x1000_0000\n  ORDED_MASKSZZ\t= 0x1c00_000d',
            use_markup: true
        }
    );
    group_extra.add(row_extra)
    // Create a preferences page

    // List of inputmethod settings as a group
    const group_0 = new Adw.PreferencesGroup();
    page.add(group_0);

    // Step though primary xkb before setting ibus IM : default=ON
    const row_0 = new Adw.ActionRow({
        title: 'Set filter to limit <b>key</b> to valid shortcut keys',
        use_markup: true
    });
    group.add(row_0);
    let filter_mode = new Gtk.Switch({
        active: settings.get_boolean('filter-mode'),
        halign: Gtk.Align.END,
        vexpand: false,
        hexpand: false,
        margin_top: 18,
        margin_bottom: 18
    })
    settings.bind('filter-mode', filter_mode, 'active', Gio.SettingsBindFlags.DEFAULT)
    row_0.add_suffix(filter_mode);
    row_0.activatable_widget = filter_mode;

    window._settings = settings;
}

function makeButton(shortcut_name, settings) {
    const button = new Gtk.Button();
    button.connect('clicked', () => {
        button.set_label('*** Enter unused shortcut key ***');

        const eventController = new Gtk.EventControllerKey();
        button.add_controller(eventController);

        eventController.connect('key-pressed', (_widget, keyval, keycode, state) => {

            let def_mask = Gtk.accelerator_get_default_mod_mask();
            let mask = state & Gtk.accelerator_get_default_mod_mask();
            // ignore a mask bit for Gdk.ModifierType.LOCK_MASK=2 https://gjs-docs.gnome.org/gdk30~3.0/gdk.modifiertype
            // Not found in GDK4
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

            let filter_mode = settings.get_boolean('filter-mode');
            if (isBindingValid({ mask, keycode, keyval }) || ! filter_mode) {
                const binding = Gtk.accelerator_name_with_keycode(
                    null,
                    keyval,
                    keycode,
                    mask
                );
                //settings.set_strv(`${shortcut_name}`, [binding]);
                // use [1] to retain parameter situation
                // keyval is ASCII for normal keys in US
                let mask_0 = (mask === 0 );
                let mask_s = (mask === Gdk.ModifierType.SHIFT_MASK);
                let keycode_nz = (keycode !== 0);
                settings.set_strv(`${shortcut_name}`, [binding, `  keyval\t=0x${keyval.toString(16)}\n  keycode\t=0x${keycode.toString(16)}\n  mask\t\t=0x${mask.toString(16)}\n  state\t\t=0x${state.toString(16)}\n  def_mask\t=0x${def_mask.toString(16)}\n  filter\t=${filter_mode}\n  mask===0 ${mask_0} / mask===SHIFT ${mask_s} / keycode !== 0 ${keycode_nz}\n *** Gdk.SHIFT_MASK=${Gdk.SHIFT_MASK} / Gdk.ModifierType.SHIFT_MASK=${Gdk.ModifierType.SHIFT_MASK}`]);
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
    const text = settings.get_strv(shortcut_name);
    if (text[0]) {
        if ( text.length === 1 ) {
            button.set_label(text[0]);
        } else {
            button.set_label(`${text[0]}\n${text[1]}`);
        }
    }
    else {
        button.set_label('Disabled');
    };
};

// Functions from https://gitlab.gnome.org/GNOME/gnome-control-center/-/blob/main/panels/keyboard/keyboard-shortcuts.c
// Let's keep out from cursor and return (with or without SHIFT pressed)
// Adopt from https://github.com/jqno/gnome-happy-appy-hotkey.git
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
        Gdk.KEY_KP_Enter, //    65421 = 0xFF8D same as ibus/src/ibuskeysyms.h as IBUS_KEY_KP_Enter
        Gdk.KEY_Return, //      65293 = 0xFF0D same as ibus/src/ibuskeysyms.h as IBUS_KEY_Return

        Gdk.KEY_Mode_switch, // 65406 = 0xFF7E same as ibus/src/ibuskeysyms.h as IBUS_KEY_Mode_switch
    ].includes(keyval);
};

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
            || keyvalIsForbidden(keyval)
        )
        {
            return false;
        };
    };

    return Gtk.accelerator_valid(keyval, mask)
        || (keyval === Gdk.KEY_Tab && mask !== 0);
    // in addition to Gtk.accelerator_valid, Control-Tab, Alt-Tab, Super-Tab are "true"
};

