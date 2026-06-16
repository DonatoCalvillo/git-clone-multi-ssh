#!/usr/bin/env node
import * as p from "@clack/prompts";
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SshHost {
  alias: string;
  hostname?: string;
  identityFile?: string;
  user?: string;
}

// ─── SSH Config Parser ────────────────────────────────────────────────────────

function parseSshConfig(configPath: string): SshHost[] {
  const content = readFileSync(configPath, "utf-8");
  const lines = content.split("\n");
  const hosts: SshHost[] = [];
  let current: SshHost | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const [key, ...rest] = line.split(/\s+/);
    const value = rest.join(" ").trim();

    if (key.toLowerCase() === "host") {
      if (current?.identityFile) hosts.push(current);
      current = { alias: value };
    } else if (current) {
      switch (key.toLowerCase()) {
        case "hostname":
          current.hostname = value;
          break;
        case "identityfile":
          current.identityFile = value;
          break;
        case "user":
          current.user = value;
          break;
      }
    }
  }

  // push last block
  if (current?.identityFile) hosts.push(current);

  return hosts;
}

// ─── URL Transformer ──────────────────────────────────────────────────────────

// Matches:  git@github.com:user/repo.git
const SSH_URL_RE = /^git@([^:]+):(.+)$/;

function transformUrl(originalUrl: string, alias: string): string {
  const match = originalUrl.match(SSH_URL_RE);
  if (!match) throw new Error("URL SSH inválida");
  const [, , path] = match;
  return `git@${alias}:${path}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  p.intro(" git-clone-multi ");

  // 1. Locate ~/.ssh/config
  const configPath = join(homedir(), ".ssh", "config");

  if (!existsSync(configPath)) {
    p.cancel("No se encontró ~/.ssh/config. Crea uno con tus llaves SSH.");
    process.exit(1);
  }

  // 2. Parse hosts
  let hosts: SshHost[];
  try {
    hosts = parseSshConfig(configPath);
  } catch {
    p.cancel("No se pudo leer ~/.ssh/config.");
    process.exit(1);
  }

  if (hosts.length === 0) {
    p.cancel(
      "No se encontraron bloques Host con IdentityFile en ~/.ssh/config."
    );
    process.exit(1);
  }

  // 3. Ask for the repo URL
  const repoUrl = await p.text({
    message: "URL SSH del repositorio",
    placeholder: "git@github.com:usuario/repo.git",
    validate(v) {
      if (!v.trim()) return "La URL no puede estar vacía.";
      if (!SSH_URL_RE.test(v.trim()))
        return 'Formato inválido. Debe ser: git@<host>:<usuario>/<repo>.git';
    },
  });

  if (p.isCancel(repoUrl)) {
    p.cancel("Operación cancelada.");
    process.exit(0);
  }

  // 4. Select SSH host alias
  const selected = await p.select({
    message: "Selecciona la llave SSH a usar",
    options: hosts.map((h) => ({
      value: h.alias,
      label: h.alias,
      hint: [h.hostname && `hostname: ${h.hostname}`, h.identityFile && `key: ${h.identityFile}`]
        .filter(Boolean)
        .join("  |  "),
    })),
  });

  if (p.isCancel(selected)) {
    p.cancel("Operación cancelada.");
    process.exit(0);
  }

  // 5. Build transformed URL
  let finalUrl: string;
  try {
    finalUrl = transformUrl(repoUrl.trim(), selected as string);
  } catch (err) {
    p.cancel((err as Error).message);
    process.exit(1);
  }

  // 6. Confirm and clone
  const spin = p.spinner();
  spin.start(`Clonando con: git clone ${finalUrl}`);

  try {
    execSync(`git clone ${finalUrl}`, { stdio: "inherit" });
    spin.stop("Repositorio clonado exitosamente.");
  } catch {
    spin.stop("El comando git clone falló.");
    p.outro("Revisa tu conexión SSH y los permisos del repositorio.");
    process.exit(1);
  }

  p.outro("Listo.");
}

main().catch((err) => {
  console.error("Error inesperado:", err);
  process.exit(1);
});
