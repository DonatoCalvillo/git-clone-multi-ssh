# Git Clone Multi

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js 18+"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-11-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm"></a>
  <a href="https://git-scm.com/"><img src="https://img.shields.io/badge/Git-required-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git"></a>
  <a href="https://github.com/"><img src="https://img.shields.io/badge/GitHub-SSH-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub SSH"></a>
</p>

**Clone GitHub repos by choosing which SSH key to use** — no manual URL edits, no fighting the default key.

An interactive CLI that reads your `~/.ssh/config`, shows available keys, and runs `git clone` with the right identity.

---

## The Problem

You have more than one GitHub account: personal, work, a client. Each has its own SSH key and an alias in `~/.ssh/config`.

But when you run:

```bash
git clone git@github.com:my-org/my-repo.git
```

SSH always picks the **same default key**. The clone fails with *Permission denied* — or worse, authenticates with the wrong account.

The manual fix is remembering the right alias and rewriting the URL:

```bash
git clone git@github.com-work:my-org/my-repo.git
```

It works, but it's tedious and easy to forget. **git-clone-multi** does that replacement for you in a two-step menu.

---

## How to Install

You need [Node.js 18+](https://nodejs.org/), [pnpm](https://pnpm.io/), and [Git](https://git-scm.com/).

**1. Clone the repository**

```bash
git clone https://github.com/your-username/git-clone-multi.git
cd git-clone-multi
```

**2. Install dependencies and build**

```bash
pnpm install --ignore-scripts && pnpm run build
```

**3. Register it as a global command**

```bash
pnpm install -g .
```

Done. You can run `git-clone-multi` from any directory.

> **Prerequisite:** your `~/.ssh/config` must have `Host` blocks with `IdentityFile` set. [See example ↓](#ssh-config)

---

## How to Use

```bash
git-clone-multi
```

The CLI walks you through two steps: paste the repo's SSH URL and pick a key with the arrow keys. The clone runs automatically.

```
┌  git-clone-multi
│
◆  Repository SSH URL
│  git@github.com:my-org/my-repo.git
│
◆  Select which SSH key to use
│  ● github.com-personal   hostname: github.com  |  key: ~/.ssh/id_ed25519_personal
│  ○ github.com-work       hostname: github.com  |  key: ~/.ssh/id_ed25519_work
│  ○ github.com-client     hostname: github.com  |  key: ~/.ssh/id_ed25519_client
└

  Cloning with: git clone git@github.com-personal:my-org/my-repo.git
  ✓ Repository cloned successfully.
```

---

## SSH config

The CLI automatically detects all `Host` blocks that define an `IdentityFile`:

```ssh-config
Host github.com-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal

Host github.com-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
```

## How it works

The standard SSH URL uses `github.com` as the host:

```
git@github.com:user/repo.git
```

SSH resolves the host against `~/.ssh/config`. By swapping `github.com` for a configured alias, SSH knows exactly which key to use:

```
git@github.com-work:user/repo.git
        ↑ alias in ~/.ssh/config → IdentityFile ~/.ssh/id_ed25519_work
```

## Development

```bash
pnpm run dev          # run without compiling
pnpm run build        # compile TypeScript
pnpm run build && pnpm install -g .   # reinstall after changes
```
