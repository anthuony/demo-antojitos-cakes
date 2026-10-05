# Montar Antojitos Cakes en Cloudflare

Entrega del 5 de octubre de 2026. Código y configuración verificados localmente. **La cuenta, D1 y R2 de producción todavía deben vincularse; este ZIP no significa que el sitio esté publicado.**

El proyecto funciona como un **Cloudflare Worker** con base D1 y almacenamiento R2. Conserva el catálogo real, los pedidos, las imágenes y el panel de administración.

## 1. Crear o seleccionar los recursos

En la cuenta Cloudflare donde se publicará el negocio, crea estos recursos o reutiliza recursos vacíos destinados exclusivamente a esta aplicación:

| Recurso | Nombre propuesto | Vinculación en el código |
| --- | --- | --- |
| Worker | `antojitos-cakes` | — |
| Base D1 | `antojitos-cakes-db` | `DB` |
| Bucket R2 | `antojitos-cakes-imagenes` | `BUCKET` |

Anota el **Database ID** que muestra D1. Es un identificador, no una contraseña. No necesitas hacer público el bucket: el Worker sirve las imágenes a través de su API.

Con los archivos descomprimidos, abre `wrangler.jsonc` y sustituye `REEMPLAZAR_CON_ID_D1` por ese ID. Si usaste otros nombres, actualiza también `name`, `database_name` y `bucket_name`. No cambies `binding`.

También puedes configurar el archivo desde terminal:

```sh
pnpm run cf:configure --database-id ID-REAL-DE-D1
pnpm run cf:check
```

`ID-REAL-DE-D1` es un marcador: reemplázalo por el ID de tu cuenta. El comando modifica el archivo local y descarta compilaciones anteriores; no crea recursos remotos. Si R2 requiere activar un servicio o aceptar facturación, esa decisión corresponde al titular de la cuenta.

## 2. Subir el código a GitHub

Crea o elige un repositorio privado para esta aplicación. Sube **el contenido descomprimido**, con `package.json`, `pnpm-lock.yaml`, `wrangler.jsonc`, `vite.config.ts` y las carpetas del proyecto en la raíz. No subas el ZIP como único archivo.

Incluye los archivos de configuración `.nvmrc`, `.node-version`, `.gitignore` y `.env.example`. No subas `node_modules`, `dist`, `.wrangler`, `.dev.vars`, respaldos, contraseñas ni tokens. La entrega ya excluye esos archivos.

## 3. Conectar Workers Builds

En Workers & Pages, crea un Worker conectado al repositorio. Usa estos valores:

| Campo | Valor |
| --- | --- |
| Nombre del Worker | `antojitos-cakes`, o el mismo `name` de `wrangler.jsonc` |
| Rama de producción | `main`, o la rama principal real del repositorio |
| Root directory | `/`, si `package.json` está en la raíz |
| Build command | `pnpm run build` |
| Deploy command | `pnpm run deploy` |
| Preview command | `pnpm run deploy:preview` |
| Compilaciones de ramas de prueba | Desactivadas en esta entrega |
| Variable de compilación `NODE_VERSION` | `24.19.0` |
| Variable de compilación `PNPM_VERSION` | `11.25.0` |

El despliegue aplica primero las migraciones de `drizzle/`, después publica el Worker y los archivos de `dist/client`. No hay que rellenar un campo de salida de Cloudflare Pages.

**Permiso D1 del token de compilación:** el token que Workers Builds genera por defecto puede carecer de D1. En My Profile → API Tokens, revisa el token seleccionado para este Worker y añade **Account → D1 → Edit** para la cuenta del proyecto antes de ejecutar las migraciones remotas. Conserva los permisos de despliegue de Workers y R2 que ya requiera la integración. No copies el token en GitHub ni en el chat.

Las ramas de prueba se bloquean para evitar que una vista previa escriba en la base de producción. Antes de habilitarlas, configura una base y un bucket independientes.

## 4. Activar el administrador

Después del primer despliegue, abre el Worker → Settings → Variables and Secrets → Add. Elige **Secret**, nombre **`ADMIN_SETUP_TOKEN`**, y guarda un valor aleatorio nuevo de al menos 32 caracteres. Pulsa Deploy para aplicar el cambio.

Ese secreto es de ejecución del Worker, no una variable de compilación. Puedes generar uno en tu equipo con:

```sh
node -e "console.log(require('node:crypto').randomBytes(24).toString('hex'))"
```

Abre la dirección HTTPS que Cloudflare haya asignado al Worker y entra en `/admin`. Introduce el secreto de activación, tu nombre, correo y una contraseña de 14–128 caracteres. La activación inicial funciona una sola vez. Después inicia sesión con tu correo y contraseña y elimina `ADMIN_SETUP_TOKEN` de los secretos del Worker.

Esta base nueva empieza sin los pedidos ni las cuentas del sitio anterior. Si necesitas trasladar datos reales existentes, realiza una exportación/importación específica antes de usarla con clientes; no copies una base local de pruebas.

## 5. Verificar y conectar el dominio

Comprueba el catálogo, una imagen, el acceso a `/admin` y un pedido identificado como prueba. Debe quedar guardado antes de aparecer el botón de WhatsApp. Revisa la persistencia recargando el panel. Puedes cancelar ese pedido de prueba; quedará en el historial.

En Configuración del panel, confirma moneda, precios, disponibilidad, pagos, entrega y textos legales. El catálogo contiene seis productos por cotizar; no se les ha inventado precio.

Primero verifica la URL asignada por Cloudflare. Después conecta un dominio o subdominio que controles mediante la configuración de dominios del Worker y actualiza `site_url` en la administración. Revisa cualquier registro DNS existente antes de sustituirlo. El proyecto no modifica por sí solo `antojitoscakespzo.com`.

## Alternativa: publicar desde terminal

Con Node.js 24.19.0 y desde la carpeta que contiene `package.json`:

```sh
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm exec wrangler login
pnpm run cf:configure --database-id ID-REAL-DE-D1
pnpm run typecheck
pnpm run build
pnpm run deploy:check
pnpm run deploy
pnpm run cf:secret
```

Elige la cuenta correcta durante la autorización. Si tienes varias cuentas, configura `CLOUDFLARE_ACCOUNT_ID` en tu terminal para seleccionar la del proyecto. Los recursos D1/R2 deben existir antes del despliegue. `deploy:check` valida el paquete sin publicarlo; `deploy` sí aplica migraciones y publica.

## Actualizaciones y respaldo

Publica desde la misma rama y mantén los mismos recursos. Las migraciones ya aplicadas se registran y no se repiten. Antes de cambios de esquema, exporta D1 y respalda las imágenes nuevas de R2. Los datos de clientes no deben guardarse en el repositorio.

Consulta `README.md` para desarrollo, seguridad, respaldos y límites; `docs/OPERACION.md` para gestión diaria; `docs/PRUEBAS.md` para la cobertura verificada.

## Referencias oficiales consultadas

- [Configuración de Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Versiones de Node.js y pnpm en compilaciones](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/)
- [Secretos de Workers](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Migraciones D1](https://developers.cloudflare.com/d1/reference/migrations/)

Los permisos reales, la disponibilidad de recursos y el resultado de producción se verifican al desplegar en la cuenta del propietario.
