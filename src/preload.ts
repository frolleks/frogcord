import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("frogcordAPI", {});

require(process.env.DISCORD_PRELOAD!);
