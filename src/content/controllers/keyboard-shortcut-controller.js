/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * RequestPolicy - A Firefox extension for control over cross-site requests.
 * Copyright (c) 2015 Martin Kimmerle
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * ***** END LICENSE BLOCK *****
 */

import {rp} from "app/app.background";
import {KeyboardShortcut} from "lib/keyboard-shortcut";
import {pWindowsAvailable} from "models/ui-startup";
import {rpWindowManager} from "main/window-manager";

// =============================================================================
// KeyboardShortcutController
// =============================================================================

const keyboardShortcuts = [];

export const KeyboardShortcutController = {
  startupPreconditions: [
    rp.storage.cachedSettings.pReady,
    pWindowsAvailable,
    rpWindowManager.pStartup,
  ],

  startup() {
    keyboardShortcuts.push(new KeyboardShortcut("openMenu", "alt shift r",
        function(window) {
          window.rpcontinued.overlay.toggleMenu();
        },
        "keyboardShortcuts.openMenu.enabled",
        "keyboardShortcuts.openMenu.combo"));
    keyboardShortcuts.push(new KeyboardShortcut(
        "openRequestLog", "none",
        function(window) {
          window.rpcontinued.overlay.toggleRequestLog();
        },
        "keyboardShortcuts.openRequestLog.enabled",
        "keyboardShortcuts.openRequestLog.combo"
    ));
  },

  shutdown() {
    keyboardShortcuts.forEach((ks) => {
      ks.destroy();
    });
    keyboardShortcuts.length = 0;
  },
};
