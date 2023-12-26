import electron, { type BrowserWindowConstructorOptions } from "electron";
import path from "path";
import Module from "module";

class BrowserWindow extends electron.BrowserWindow {
  constructor(options: BrowserWindowConstructorOptions) {
    if (options?.webPreferences?.preload && options.title) {
      const original = options.webPreferences.preload;
      options.webPreferences.preload = path.join(__dirname, "preload.js");
      options.webPreferences.sandbox = false;

      process.env.DISCORD_PRELOAD = original;

      super(options);
    } else super(options);
  }
}

Object.assign(BrowserWindow, electron.BrowserWindow);

Object.defineProperty(BrowserWindow, "name", {
  value: "BrowserWindow",
  configurable: true,
});

const electronPath = require.resolve("electron");
const discordAsar = path.join(
  path.dirname(require.main!.filename),
  "..",
  "app.asar"
);
require.main!.filename = path.join(discordAsar, "index.js");

delete require.cache[electronPath]!.exports;
require.cache[electronPath]!.exports = {
  ...electron,
  BrowserWindow,
};

Object.defineProperty(global, "appSettings", {
  set: (v: typeof global.appSettings) => {
    v.set(
      "DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING",
      true
    );
    // @ts-ignore
    delete global.appSettings;
    global.appSettings = v;
  },
  configurable: true,
});

electron.app.whenReady().then(() => {
  // Remove CSP
  electron.session.defaultSession.webRequest.onHeadersReceived(
    ({ responseHeaders, url }, cb) => {
      if (responseHeaders) {
        delete responseHeaders["content-security-policy-report-only"];
        delete responseHeaders["content-security-policy"];
      }
      cb({ cancel: false, responseHeaders });
    }
  );

  // Drop science and sentry requests
  electron.session.defaultSession.webRequest.onBeforeRequest(
    { urls: ["https://*/api/v*/science", "https://sentry.io/*"] },
    (_, callback) => callback({ cancel: true })
  );
});

const discPackage = require(path.join(discordAsar, "package.json"));
// @ts-ignore - Hidden property
electron.app.setAppPath(discPackage.name, discordAsar);
electron.app.name = discPackage.name;

console.log("Discord is loading...");
// @ts-ignore
Module._load(path.join(discordAsar, discPackage.main), null, true);
