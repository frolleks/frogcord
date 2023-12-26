import electron, {
  app,
  BrowserWindow,
  session,
  type BrowserWindowConstructorOptions,
} from "electron";
import path from "path";
import { onceDefined } from "./utils/onceDefined";

const injectorPath = require.main!.filename;

// special discord_arch_electron injection method
const asarName = require.main!.path.endsWith("app.asar")
  ? "_app.asar"
  : "app.asar";

// The original app.asar
const asarPath = path.join(path.dirname(injectorPath), "..", asarName);

const discordPkg = require(path.join(asarPath, "package.json"));
require.main!.filename = path.join(asarPath, discordPkg.main);

// @ts-ignore
app.setAppPath(asarPath);

export default class PatchedBrowserWindow extends BrowserWindow {
  constructor(options: BrowserWindowConstructorOptions) {
    if (options.webPreferences && options.webPreferences.preload) {
      const originalPreload = options.webPreferences.preload;
      options.webPreferences.preload = path.join(__dirname, "preload.js");
      options.webPreferences.sandbox = false;

      process.env.DISCORD_PRELOAD = originalPreload;
    }
    super(options);
  }
}

Object.assign(PatchedBrowserWindow, BrowserWindow);
Object.defineProperty(PatchedBrowserWindow, "name", {
  value: "BrowserWindow",
  configurable: true,
});

const electronPath = require.resolve("electron");
delete require.cache[electronPath]!.exports;
require.cache[electronPath]!.exports = {
  ...electron,
  PatchedBrowserWindow,
};

onceDefined(global, "appSettings", (s) => {
  s.set(
    "DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING",
    true
  );
});

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived(
    ({ responseHeaders, url }, cb) => {
      if (responseHeaders) {
        delete responseHeaders["content-security-policy-report-only"];
        delete responseHeaders["content-security-policy"];
      }
      cb({ cancel: false, responseHeaders });
    }
  );

  // Drop science and sentry requests
  session.defaultSession.webRequest.onBeforeRequest(
    { urls: ["https://*/api/v*/science", "https://sentry.io/*"] },
    (_, callback) => callback({ cancel: true })
  );
});

require(require.main!.filename);
