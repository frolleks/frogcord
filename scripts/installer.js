const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const windowsDiscordPaths = {
  stable: "C:/Users/Frolleks/AppData/Local/Discord/app-1.0.9028",
};

function installFrogcord() {
  const resourcesPath = path.join(windowsDiscordPaths.stable, "resources");
  const appPath = path.join(resourcesPath, "app.asar");
  const newAppPath = path.join(resourcesPath, "_app.asar");

  exec("taskkill /f /im discord.exe", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log("Please relaunch Discord.");
  });

  if (fs.existsSync(appPath)) {
    fs.renameSync(appPath, newAppPath);
    fs.mkdirSync(appPath, { recursive: true });
  } else if (fs.existsSync(newAppPath)) {
    console.log("Successfully reinjected.");
  }

  // Read and write files synchronously
  const indexPath = path.join(appPath, "index.js");
  const packagePath = path.join(appPath, "package.json");
  const patcherPath = path.resolve("dist/patcher.js").replace(/\\/g, "\\\\");

  fs.writeFileSync(indexPath, `require("${patcherPath}")`);
  fs.writeFileSync(
    packagePath,
    '{\n  "name": "discord",\n  "main": "index.js"\n}'
  );
}

installFrogcord();
