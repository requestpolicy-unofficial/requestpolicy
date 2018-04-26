/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * RequestPolicy - A Firefox extension for control over cross-site requests.
 * Copyright (c) 2018 Martin Kimmerle
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

import { API } from "bootstrap/api/interfaces";
import { Common } from "common/interfaces";
import { Module } from "lib/classes/module";

export class NetworkPredictionEnabledSetting extends Module
    implements API.privacy.network.networkPredictionEnabled {
  constructor(
      log: Common.ILog,
      private rootPrefBranch: API.storage.IPrefBranch,
  ) {
    super("browser.privacy.network.networkPredictionEnabled", log);
  }

  public set({value}: {value: any}) {
    if (value) {
      throw new Error("not supported");
    } else {
      this.rootPrefBranch.set("network.dns.disablePrefetch", !value);
      this.rootPrefBranch.set("network.dns.disablePrefetchFromHTTPS", !value);
      this.rootPrefBranch.set("network.http.speculative-parallel-limit", 0);
      this.rootPrefBranch.set("network.predictor.enabled", !!value);
      this.rootPrefBranch.set("network.prefetch-next", !!value);
      return Promise.resolve(true);
    }
  }

  public clear(details: {}) {
    return Promise.resolve(false);
  }
}
