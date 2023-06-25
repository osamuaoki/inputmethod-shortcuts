Keyboard shortcuts for switching input methods under GNOME shell
================================================================

This is a simple GNOME shell extension that adds some extra keyboard shortcuts
to switch input methods under GNOME shell.

The latest version is available at:

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
from this github repo and use `gnome-tweak-tool` to install it.

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

This code is based on a similar GNOME shell extension:
 - https://github.com/matthijskooijman/gnome-shell-more-keyboard-shortcuts

See [Keyboard shortcut customization (Input Method)](https://osamuaoki.github.io/en/2023/02/25/debian-usability-2023/#keyboard-shortcut-customization-input-method)
and [GNOME shell extension for input methods](https://osamuaoki.github.io/en/2023/06/19/gnome-im-1/)
for how I came to this extension.

License
=======
This extension and all accompanying files are licensed under the MIT license.

Copyright (c) 2014 Matthijs Kooijman <matthijs@stdin.nl>
Copyright (c) 2023 Osamu Aoki <osamu@debian.org>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
