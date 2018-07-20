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

import { JSMs, XPCOM } from "bootstrap/api/interfaces";
import { XPConnectService } from "bootstrap/api/services/xpconnect-service";
import { MessageListenerModule } from "lib/classes/message-listener-module";
import { AppContent } from "./app.content.module";
import { ManagerForBlockedContent } from "./contentscript/blocked-content";
import { ContentscriptModule } from "./contentscript/contentscript.module";
import { ManagerForDOMContentLoaded } from "./contentscript/dom-content-loaded";
import {
  FramescriptToBackgroundCommunication,
} from "./contentscript/framescript-to-background-communication";
import { ContentscriptMisc } from "./contentscript/misc";
import { dAsyncSettings, log } from "./log";
import { RPContentServices } from "./services/services.module.content";
import { UriService } from "./services/uri-service";
import { AsyncSettings } from "./storage/async-settings";
import { SETTING_SPECS } from "./storage/setting-specs";
import { Storage } from "./storage/storage.module";

declare const Ci: XPCOM.nsXPCComponents_Interfaces;
declare const Services: JSMs.Services;
declare const cfmm: XPCOM.nsIContentFrameMessageManager;

const storageReadyPromise = Promise.resolve();

const msgListener = new MessageListenerModule(
    "AppContent.contentSide.msgListener",
    log,
    cfmm,
);
const bgCommunication = new FramescriptToBackgroundCommunication(
    log,
    cfmm,
    msgListener,
);
const blockedContent = new ManagerForBlockedContent(log);
const xpconnectService = new XPConnectService();
const uriService = new UriService(log, "AppContent", Services.eTLD,
    xpconnectService.getIDNService(), Services.io);
const domContentLoaded = new ManagerForDOMContentLoaded(
    log,
    Ci,
    cfmm,
    bgCommunication,
    blockedContent,
    uriService,
);
const contentscriptMisc = new ContentscriptMisc(
    log,
    cfmm,
    bgCommunication,
    msgListener,
);
const contentSide = new ContentscriptModule(
    log,
    bgCommunication,
    blockedContent,
    domContentLoaded,
    contentscriptMisc,
);

const rpServices = new RPContentServices(log, uriService);

const asyncSettings = new AsyncSettings(
    log,
    browser.storage,
    browser.storage.local,
    SETTING_SPECS.defaultValues,
    storageReadyPromise,
);
dAsyncSettings.resolve(asyncSettings);
const storage = new Storage(log, asyncSettings, null, storageReadyPromise);
export const rp = new AppContent(
    log,
    contentSide,
    rpServices,
    storage,
);
