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

  // Check if both _app.asar file and app.asar folder exist
  const appAsarExists =
    fs.existsSync(appPath) && fs.statSync(appPath).isDirectory();
  const appAsarFileExists =
    fs.existsSync(newAppPath) && fs.statSync(newAppPath).isFile();

  if (appAsarExists && appAsarFileExists) {
    console.log(
      "Both _app.asar file and app.asar folder already exist. Skipping renaming and folder creation."
    );
  } else {
    if (fs.existsSync(appPath) && !fs.statSync(appPath).isDirectory()) {
      fs.renameSync(appPath, newAppPath);
    }
    if (!fs.existsSync(appPath)) {
      fs.mkdirSync(appPath, { recursive: true });
    }
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
}

installFrogcord();
