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
const Meta = imports.gi.Meta;
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

let settings;

function init() {
    settings = Convenience.getSettings();
}

function enable() {
    // Switch to the next/previous window within this workspace. Window
    // ordering is fixed (not based on most recent use like the alt-tab
    // switcher) so it can match a window list shown by e.g. the
    // Frippery Bottom Panel.
    Main.wm.addKeybinding("switch-to-im-0",
        settings,
        Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
        Shell.ActionMode ? Shell.ActionMode.NORMAL : Shell.KeyBindingMode.NORMAL,
        function(display, screen, window, binding) {
            imports.ui.status.keyboard.getInputSourceManager().inputSources[0].activate();
        }
    );
    Main.wm.addKeybinding("switch-to-im-1",
        settings,
        Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
        Shell.ActionMode ? Shell.ActionMode.NORMAL : Shell.KeyBindingMode.NORMAL,
        function(display, screen, window, binding) {
            imports.ui.status.keyboard.getInputSourceManager().inputSources[1].activate();
        }
    );
    Main.wm.addKeybinding("switch-to-im-2",
        settings,
        Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
        Shell.ActionMode ? Shell.ActionMode.NORMAL : Shell.KeyBindingMode.NORMAL,
        function(display, screen, window, binding) {
            imports.ui.status.keyboard.getInputSourceManager().inputSources[2].activate();
        }
    );
    Main.wm.addKeybinding("switch-to-im-3",
        settings,
        Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
        Shell.ActionMode ? Shell.ActionMode.NORMAL : Shell.KeyBindingMode.NORMAL,
        function(display, screen, window, binding) {
            imports.ui.status.keyboard.getInputSourceManager().inputSources[3].activate();
        }
    );
}

function disable() {
}
