const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const windowsDiscordPaths = {
  stable: "C:/Users/Frolleks/AppData/Local/Discord/app-1.0.9028",
};

function installFrogcord() {
  const resourcesPath = path.join(windowsDiscordPaths.stable, "resources");
  const appPath = path.join(resourcesPath, "app");

  // Ensure the 'app' directory exists
  if (!fs.existsSync(appPath)) {
    fs.mkdirSync(appPath, { recursive: true });
  }

  // Read and write files synchronously
  const indexPath = path.join(appPath, "index.js");
  const packagePath = path.join(appPath, "package.json");
  let patcherPath = path.resolve("dist/patcher.js");

  patcherPath = patcherPath.replace(/\\/g, "\\\\");

  fs.writeFileSync(indexPath, `require("${patcherPath}")`);
  fs.writeFileSync(
    packagePath,
    '{\n  "name": "discord",\n  "main": "index.js"\n}'
  );

  // Kill Discord process
  exec("taskkill /f /im discord.exe", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(`Stdout: ${stdout}`);
  });
}

installFrogcord();
