import { spawn } from "node:child_process";

const useTunnel = process.argv.includes("--tunnel");
const children = [];
let shuttingDown = false;

function startProcess(name, command, args) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    shell: false,
    stdio: ["inherit", "pipe", "pipe"],
  });

  children.push(child);

  child.stdout.on("data", (chunk) => writePrefixed(name, chunk));
  child.stderr.on("data", (chunk) => writePrefixed(name, chunk));

  child.on("error", (error) => {
    console.error(`[${name}] failed to start: ${error.message || error}`);
    shutdown(1);
  });

  child.on("exit", (code, signal) => {
    const status = signal ? `signal ${signal}` : `code ${code}`;
    console.log(`[${name}] exited with ${status}`);
    if (!shuttingDown) shutdown(1);
  });

  return child;
}

function writePrefixed(name, chunk) {
  const lines = String(chunk).split(/\r?\n/);
  for (const line of lines) {
    if (line) console.log(`[${name}] ${line}`);
  }
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  process.exitCode = code;

  for (const child of children) {
    if (!child.killed && child.exitCode === null && child.signalCode === null) {
      child.kill();
    }
  }

  const forceExitTimer = setTimeout(() => process.exit(code), 5_000);
  forceExitTimer.unref();
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("[start-all] Starting dashboard on http://localhost:3000");
startProcess("dashboard", process.execPath, ["server.mjs"]);

console.log("[start-all] Starting Rojo sync server from default.project.json");
startProcess("rojo", "rojo", ["serve", "default.project.json"]);

if (useTunnel) {
  console.log("[start-all] Starting Cloudflare tunnel to http://localhost:3000");
  startProcess("cloudflared", "cloudflared", ["tunnel", "--url", "http://localhost:3000"]);
} else {
  console.log("[start-all] Tunnel not started. Add -- --tunnel if you want a new quick tunnel.");
}
