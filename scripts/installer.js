const { exec } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

function getDiscordPaths() {
  const username = os.userInfo().username;
  const discordBasePath = `C:/Users/${username}/AppData/Local`;

  const discordVersions = {
    stable: "Discord",
    ptb: "DiscordPTB",
    canary: "DiscordCanary",
    development: "DiscordDevelopment",
  };

  let discordPaths = {};

  for (const [versionKey, versionName] of Object.entries(discordVersions)) {
    try {
      const versionPath = path.join(discordBasePath, versionName);
      const appVersions = fs.readdirSync(versionPath).filter((folder) => {
        return (
          fs.statSync(path.join(versionPath, folder)).isDirectory() &&
          folder.startsWith("app-")
        );
      });

      if (appVersions.length === 0) {
        continue; // No version found for this type, skip to the next
      }

      // Sorting to get the latest version
      appVersions.sort();
      const latestVersion = appVersions[appVersions.length - 1];

      discordPaths[versionKey] = path.join(versionPath, latestVersion);
    } catch (err) {
      console.warn(`No ${versionKey} version of Discord found.`);
    }
  }

  return discordPaths;
}

function isDiscordRunning(callback) {
  exec("tasklist", (err, stdout, stderr) => {
    if (err || stderr) {
      console.error("Error checking for Discord process:", err || stderr);
      return callback(false);
    }

    if (stdout.includes("Discord.exe")) {
      callback(true);
    } else {
      callback(false);
    }
  });
}

function promptUser(choices, callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = `Please select the Discord client version to install to:\n${choices
    .map((choice, index) => `${index + 1}: ${choice}`)
    .join("\n")}\n> `;

  rl.question(question, (answer) => {
    const selectedIndex = parseInt(answer, 10) - 1;
    if (selectedIndex >= 0 && selectedIndex < choices.length) {
      callback(choices[selectedIndex]);
    } else {
      console.log("Invalid selection. Please try again.");
      promptUser(choices, callback);
    }
    rl.close();
  });
}

function installFrogcord() {
  const windowsDiscordPaths = getDiscordPaths();
  const availableVersions = Object.keys(windowsDiscordPaths).filter(
    (version) => windowsDiscordPaths[version]
  );

  if (availableVersions.length === 0) {
    console.log("No Discord versions found.");
    return;
  }
  promptUser(availableVersions, (selectedVersion) => {
    const resourcesPath = path.join(
      windowsDiscordPaths[selectedVersion],
      "resources"
    );
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

    isDiscordRunning((running) => {
      if (running) {
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
      } else {
        console.log("Please open Discord.");
      }
    });
  });
}

installFrogcord();
