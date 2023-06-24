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

function get_focus_window() {
    let workspace = (global.screen || global.workspace_manager).get_active_workspace();
    let windows = workspace.list_windows();
    for ( let i = 0; i < windows.length; ++i ) {
        if (windows[i].has_focus()) {
            return windows[i];
        }
    }
    return null;
}

function switchWindow(next) {
    let workspace = (global.screen || global.workspace_manager).get_active_workspace();
    let windows = workspace.list_windows();

    // Generate a stable ordering for the window list (based on the
    // Frippery Bottom Panel extension)
    windows.sort(function(w1, w2) {
        return w1.get_stable_sequence() - w2.get_stable_sequence();
    });

    var current_window = get_focus_window();

    // If the current window is a transient modal window, resolve it
    // to the real, non-transient window first (which is the one
    // that is shown in the taskbar).
    while (current_window &&
           current_window.get_window_type() == Meta.WindowType.MODAL_DIALOG &&
           current_window.get_transient_for())
        current_window = current_window.get_transient_for();

    // Find out the index of the current window
    let current_idx = -1;
    for ( let i = 0; i < windows.length; ++i ) {
        if (windows[i] == current_window) {
            current_idx = i;
            break;
        }
    }

    // Figure out what window to focus
    let target_idx;
    if (current_idx < 0) {
        // No window was focused, just focus the first in the list
        target_idx = 0;
    } else {
        // Focus the next/previous window that does not have
        // skip_taskbar and is not a modal window. Note that focusing a
        // window that has a modal transient will focus the modal
        // instead, but the code above resolves that back to the real
        // window, so everything still works as you'd expect.
        target_idx = current_idx;
        do {
            target_idx += (next ? 1 : -1);
            // Modulo doesn't handle -1 here, so make sure we are
            // positive first
            target_idx += windows.length;
            target_idx %= windows.length;
            // Don't keep looping if this is the only focusable window
            if (target_idx == current_idx)
                break;
        } while (windows[target_idx].skip_taskbar ||
                 windows[target_idx].get_window_type() == Meta.WindowType.MODAL_DIALOG);
    }

    Main.activateWindow(windows[target_idx]);
}

function enable() {
    // Switch to the next/previous window within this workspace. Window
    // ordering is fixed (not based on most recent use like the alt-tab
    // switcher) so it can match a window list shown by e.g. the
    // Frippery Bottom Panel.
    Main.wm.addKeybinding("switch-to-im-0",
        settings,
        Meta.KeyBindingFlags.NONE,
        Shell.ActionMode ? Shell.ActionMode.NORMAL : Shell.KeyBindingMode.NORMAL,
        function(display, screen, window, binding) {
            switchWindow(true);
        }
    );
    Main.wm.addKeybinding("switch-to-im-1",
        settings,
        Meta.KeyBindingFlags.NONE,
        Shell.ActionMode ? Shell.ActionMode.NORMAL : Shell.KeyBindingMode.NORMAL,
        function(display, screen, window, binding) {
            switchWindow(false);
        }
    );
}

function disable() {
}
