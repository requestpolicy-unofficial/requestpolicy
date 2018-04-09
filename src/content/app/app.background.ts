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

// @if EXTENSION_TYPE='legacy'
import {V0RulesMigration} from "legacy/app/migration/v0-rules";
// @endif

import { RulesServices } from "app/services/rules/rules-services.module";
import { V0RulesService } from "app/services/rules/v0-rules-service";
import { VersionInfoService } from "app/services/version-info-service";
import { InitialSetup } from "app/ui/initial-setup";
import { C } from "data/constants";
import * as compareVersions from "lib/third-party/mozilla-version-comparator";
import { Log } from "models/log";
import { AppBackground } from "./app.background.module";
import { Migration } from "./migration/migration.module";
import { Policy } from "./policy/policy.module";
import { RulesetStorage } from "./policy/ruleset-storage";
import { Subscriptions } from "./policy/subscriptions";
import { RPServices } from "./services/services.module";
import { UriService } from "./services/uri-service";
import * as RPStorageConfig from "./storage/rp-config.background";
import { Storage } from "./storage/storage.module";
import { Ui } from "./ui/ui.module";

const log = Log.instance;

//
// NOTES ABOUT BUILD-SPECIFIC (or optional) MODULES:
//
// 1. All optional modules should be defined as `const` using ternary operator.
// 2. All optional modules should fall back to `null` if unused or not
//    applicable. Do **not** use `undefined`.
//
// Rule 1+2 combined will ensure that nobody forgets to pass an optional
// module to the constructor of another module. (Optional constructor
// parameters are `undefined` and can be forgotten, `null` cannot.)
//

const rulesetStorage = new RulesetStorage(log);
const subscriptions = new Subscriptions(log, rulesetStorage);
const policy = new Policy(log, subscriptions, rulesetStorage);

const storage = new Storage(log, RPStorageConfig);

const uriService = new UriService(log);
const v0RulesService = new V0RulesService(log, uriService);
const rulesServices = new RulesServices(log, v0RulesService);
const versionComparator = { compare: compareVersions };
const versionInfoService = new VersionInfoService(
    log, versionComparator, storage,
);
const rpServices = new RPServices(
    log, rulesServices, uriService, versionInfoService,
);

const v0RulesMigration = C.EXTENSION_TYPE === "legacy" ?
    new V0RulesMigration(
        log, policy, v0RulesService, versionInfoService,
    ) : null;

const migration = new Migration(log, v0RulesMigration);

const initialSetup = new InitialSetup(log, storage, versionInfoService);
const ui = new Ui(log, initialSetup);

export const rp = new AppBackground(
    log,
    migration,
    policy,
    rpServices,
    storage,
    ui,
);