/**
 * @license "Highsoft Dashboard" v@product.version@ (@product.date@)
 *
 * Highsoft Dashboard
 *
 * License: www.highcharts.com/license
 */

'use strict';

import _Dashboard from '../Dashboards/Dashboards.js';
import _Globals from '../Dashboards/Globals.js';
import _PluginHandler from '../Dashboards/PluginHandler.js';
import _Sync from '../Dashboards/Component/Sync/Sync.js';
import _Utilities from '../Dashboards/Utilities.js';

export const classNamePrefix = _Globals.classNamePrefix;
export const guiElementType = _Globals.guiElementType;
export const uniqueKey = _Utilities.uniqueKey;
export const win = _Globals.win;

export const Dashboard = _Dashboard;
export const PluginHandler = _PluginHandler;
export const Sync = _Sync;
