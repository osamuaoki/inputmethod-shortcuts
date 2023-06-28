Keyboard shortcuts for switching input methods under GNOME shell
================================================================

This is a simple GNOME shell extension that adds some extra keyboard shortcuts
to switch input methods under GNOME shell.

This should be available from GNOME extensions site:

- https://extensions.gnome.org/extension/6066/shortcuts-to-activate-input-methods/

The latest development version is available at:

  https://github.com/osamuaoki/inputmethod-shortcuts

You can install this extension by:

```sh
$ git clone https://github.com/osamuaoki/inputmethod-shortcuts
$ cd inputmethod-shortcuts
$ make install
```

This will install files into your `
~/.local/share/gnome-shell/extensions/inputmethod-shortcuts@osamu.debian.org`
directory.

Afterwards, restart the GNOME shell by log-out and log-in from GUI.  You can
also use CLI `killall gnome-shell` to log out.  This is essential process to
get GNOME shell extension to function as expected.

Then, enable this extension from, e.g., `gnome-extensions-app` (**Extensions**)
in GNOME 43; or from **GNOME tweak** menu in older GNOME.

(I only tested this for GNOME 43 but this extension should work for older
version if `metadata.json` is adjusted.)

Alternatively, you may download `inputmethod-shortcuts@osamu.debian.org.zip`
from this github repo or GNOME extension site and use `gnome-tweak-tool` or
browser to install it.

At this moment, configuring of shortcut key assignments requires you to rewrite
`schema/org.gnome.shell.extensions.inputmethod-shortcuts.gschema.xml` file and
re-building the source tree.  (Patch welcomed)

Currently, I have US keyboard and assigned keys as:

- `<Super>Return` activates "Input Method 0"
- `<Super>u` activates "Input Method 0" (**u** for US)
- `<Super><Shift>Return` activates "Input Method 1"
- `<Super>j` activates "Input Method 1" (**j** for JP)
- `<Super><Control>Return` activates "Input Method 2"
- `<Super>i` activates "Input Method 2" (**i** for International)
- `<Super><Alt>Return` activates "Input Method 3"
- `<Super>k` activates "Input Method 3" (**k** for Kanji)

You can check and set input methods from GUI `Settings` -> `Keyboard`.  Reordering is tedious via GUI.

You can also check input method settings from CLI and reorder them easily as:

```sh
$ gsettings get org.gnome.desktop.input-sources sources
[('xkb', 'us'), ('ibus', 'anthy'), ('ibus', 'mozc-jp'), ('xkb', 'us+altgr-intl')]
$ gsettings set org.gnome.desktop.input-sources sources "[('xkb', 'us'), ('ibus', 'mozc-jp'), ('xkb', 'us+altgr-intl'), ('ibus', 'anthy')]"
$ gsettings get org.gnome.desktop.input-sources sources
[('xkb', 'us'), ('ibus', 'mozc-jp'), ('xkb', 'us+altgr-intl'), ('ibus', 'anthy')]
```

Now, Input Methods are reordered in good order for me:

- "Input Method 0" = `('xkb', 'us')` -- standard US keyboard
- "Input Method 1" = `('ibus', 'mozc-jp')` -- ibus with MOZC (Japanese)
- "Input Method 2" = `('xkb', 'us+altgr-intl')` -- standard US keyboard with right-Alt for international inputs
- "Input Method 3" = `('ibus', 'anthy')` -- ibus with Anthy (Japanese)

This code was started to be based on similar GNOME shell extensions and
previous method to switch input methods:
 - https://github.com/matthijskooijman/gnome-shell-more-keyboard-shortcuts
 - https://gitlab.com/paddatrapper/shortcuts-gnome-extension (IGNORE_AUTOREPEAT)
 - https://www.mail-archive.com/gnome-shell-list@gnome.org/msg08988.html (previous method)

Resulting extension code was useful and functional for me but it had many rough
edges since this was my first javascript program without even reading its
references. Prior to getting this accepted by GNOME extension site,
**JustPerfection** guided me to fix such rough edges by making me to rewrite
practically the whole code.

See [Keyboard shortcut customization (Input Method)](https://osamuaoki.github.io/en/2023/02/25/debian-usability-2023/#keyboard-shortcut-customization-input-method)
and [GNOME shell extension for input methods](https://osamuaoki.github.io/en/2023/06/19/gnome-im-1/)
for how I came to this extension.

License
=======
Copyright (c) 2023 Osamu Aoki <osamu@debian.org>

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

[GPL2+](LICENSE)

