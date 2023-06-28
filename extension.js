/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Matthijs Kooijman <matthijs@stdin.nl>
 * Copyright (c) 2023 Osamu Aoki <osamu@debian.org>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * This is a simple gnome-shell extension that adds some extra keyboard
 * shortcuts for navigating through windows.
 */
const {Meta, Shell} = imports.gi;
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
    }

    disable() {
        for (let i = 0; i < MAX_SHORTCUTS; i++) {
            Main.wm.removeKeybinding(`imkey-${i}`);
        };
        this.settings = null;
    }
}

function init() {
    return new Extension();
}

