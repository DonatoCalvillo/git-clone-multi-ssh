# git-clone-multi

CLI interactivo para clonar repositorios de GitHub cuando tienes múltiples llaves SSH configuradas en tu máquina.

## El problema que resuelve

Si tienes varias cuentas de GitHub (personal, trabajo, cliente) cada una con su propia llave SSH, un `git clone git@github.com:usuario/repo.git` normal siempre usará la llave por defecto. Este CLI te deja elegir qué llave usar en cada clon.

## Demo

```
┌  git-clone-multi
│
◆  URL SSH del repositorio
│  git@github.com:mi-org/mi-repo.git
│
◆  Selecciona la llave SSH a usar
│  ● github.com-personal   hostname: github.com  |  key: ~/.ssh/id_ed25519_personal
│  ○ github.com-trabajo    hostname: github.com  |  key: ~/.ssh/id_ed25519_trabajo
│  ○ github.com-cliente    hostname: github.com  |  key: ~/.ssh/id_ed25519_cliente
└

  Clonando con: git clone git@github.com-personal:mi-org/mi-repo.git
```

## Requisitos

- Node.js 18+
- pnpm
- Git
- Un archivo `~/.ssh/config` con tus llaves configuradas

## Configuración de `~/.ssh/config`

El CLI detecta automáticamente todos los bloques `Host` que tengan `IdentityFile` definida:

```ssh-config
Host github.com-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal

Host github.com-trabajo
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_trabajo
```

## Instalación

El repositorio no incluye la carpeta `dist/` compilada, por lo que debes generarla antes de instalar.

```bash
git clone git@github.com:tu-usuario/git-clone-multi.git
cd git-clone-multi

# 1. Instalar dependencias
pnpm install --ignore-scripts

# 2. Compilar el TypeScript → genera la carpeta dist/
pnpm run build

# 3. Registrar el comando globalmente
pnpm install -g .
```

Después de esto el comando `git-clone-multi` estará disponible en cualquier directorio.

## Uso

```bash
git-clone-multi
```

El CLI te guiará paso a paso:

1. Ingresa la URL SSH del repositorio (`git@github.com:usuario/repo.git`)
2. Selecciona la llave SSH a usar con las flechas del teclado
3. El clon se ejecuta automáticamente con la llave correcta

## Desarrollo

```bash
# Ejecutar sin compilar
pnpm run dev

# Compilar
pnpm run build

# Reinstalar globalmente tras cambios
pnpm run build && pnpm install -g .
```

## Cómo funciona

La URL SSH estándar usa `github.com` como host:

```
git@github.com:usuario/repo.git
```

SSH resuelve el host contra `~/.ssh/config`. Al reemplazar `github.com` por un alias configurado, SSH sabe exactamente qué llave usar:

```
git@github.com-trabajo:usuario/repo.git
        ↑ alias en ~/.ssh/config que apunta a IdentityFile ~/.ssh/id_ed25519_trabajo
```
