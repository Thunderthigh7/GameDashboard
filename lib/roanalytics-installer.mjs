import fs from "node:fs/promises";
import path from "node:path";

const INSTALLER_FILES = Object.freeze([
  { path: "API.lua", className: "ModuleScript" },
  { path: "Config/Settings.lua", className: "ModuleScript" },
  { path: "Core/Methods.lua", className: "ModuleScript" },
  { path: "Start.server.lua", className: "Script" },
]);

export async function buildRoAnalyticsInstallerPackage({
  rootDir,
  secret,
  version = "1",
} = {}) {
  if (!rootDir) throw new Error("RoAnalytics source root is required.");
  const cleanRoot = path.resolve(String(rootDir || ""));
  const cleanSecret = String(secret || "").trim();
  if (!/^roa_[A-Za-z0-9_-]{24,}$/.test(cleanSecret)) {
    throw new Error("A valid generated RoAnalytics secret is required.");
  }

  const files = await Promise.all(INSTALLER_FILES.map(async (entry) => {
    let source = await fs.readFile(path.join(cleanRoot, ...entry.path.split("/")), "utf8");
    if (entry.path === "Config/Settings.lua") {
      const replacements = new Map([["Secret", cleanSecret]]);
      for (const [settingName, settingValue] of replacements) {
        const pattern = new RegExp(`Settings\\.${settingName}\\s*=\\s*"[^"]*"`);
        if (!pattern.test(source)) {
          throw new Error(`RoAnalytics Settings.lua is missing Settings.${settingName}.`);
        }
        source = source.replace(pattern, `Settings.${settingName} = ${toLuauString(settingValue)}`);
      }
    }
    return { ...entry, source };
  }));

  return {
    name: "RoAnalytics",
    version: String(version || "1").slice(0, 40),
    targetService: "ServerScriptService",
    files,
  };
}

function toLuauString(value) {
  return JSON.stringify(String(value));
}

export function listRoAnalyticsInstallerFiles() {
  return INSTALLER_FILES.map((entry) => ({ ...entry }));
}
