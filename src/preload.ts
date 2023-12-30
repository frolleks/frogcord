import { contextBridge, webFrame } from "electron";
import { readFileSync } from "fs";
import { join } from "path";

contextBridge.exposeInMainWorld("frogcordAPI", {
  sayHello: () => console.log("hello world"),
});

webFrame.executeJavaScript(
  readFileSync(join(__dirname, "renderer.js"), "utf-8")
);

require(process.env.DISCORD_PRELOAD!);
