# Antojitos Cakes — Cloudflare

**Edición gratuita:** empieza por [LEEME_GRATIS_SIN_R2.md](LEEME_GRATIS_SIN_R2.md). Esta variante usa D1 + archivos estáticos y no necesita activar R2 ni registrar un método de pago.

Aplicación completa en español: React 19 y TypeScript, renderizado de servidor con Vinext, API de Cloudflare Workers, base de datos D1 (SQLite) y fotografías estáticas/URLs públicas, sin R2. No procesa pagos ni envía mensajes automáticamente. El pedido se guarda antes de ofrecer el enlace a WhatsApp.

## Incluye

Catálogo real de 55 productos y 39 presentaciones, categorías/subcategorías, ocasiones, búsqueda, favoritos, imágenes, variantes, extras obligatorios y opcionales, carrito persistente, checkout, pedidos numerados, consulta por número y teléfono, recibo e historial. Panel `/admin` para productos, clientes, pedidos, estados, campañas, banners, sedes, horarios, métodos de pago, beneficios web, preguntas, páginas, configuración, auditoría, analítica interna y CSV.

Los seis productos sin precio permanecen **por cotizar**. Los precios importados conservan el símbolo `$`; la moneda no se presupone. Disponibilidad, entrega, días de apertura, pagos, promociones y textos legales requieren confirmación del negocio. Estos datos se configuran desde administración. La web oficial anterior permanece intacta.

## Instalación independiente

Requisitos: Node.js 24.19.0, pnpm 11.25.0 y acceso a npm. No hace falta el entorno original.

```sh
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
```

Crear `.dev.vars` (ignorado por Git) con `ADMIN_SETUP_TOKEN` generado localmente. Por ejemplo, generar 24 bytes aleatorios con `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"` y copiar el resultado a esa variable. No usar la clave de ejemplo ni una contraseña del negocio como código de activación.

```sh
pnpm db:local
pnpm dev
```

Abrir la dirección local indicada por el servidor. El servidor de desarrollo utiliza el puerto 5173. D1 local se conserva en `.wrangler/state`; no son los datos de producción. En la primera visita se importa el catálogo una sola vez, sin sobrescribir posteriores cambios del administrador.

## Activar administración

Abrir `/admin`, introducir el código `ADMIN_SETUP_TOKEN`, nombre, correo y una contraseña de 14–128 caracteres. Solo el primer administrador puede activarse por esta ruta. Iniciar sesión con ese correo y contraseña. Las sesiones duran 12 horas; cambiar la contraseña cierra todas. Después de activar la cuenta se puede retirar el secreto de activación en el proveedor y volver a publicar. El proyecto no trae cuentas ni contraseñas de producción predefinidas.

Esta entrega no contiene credenciales del sitio anterior. En Cloudflare se crea un secreto de activación y una cuenta administrativa nuevos.

## Configurar el negocio

1. Revisar productos y precios importados; confirmar moneda ISO en Configuración.
2. Completar sedes, días/horas y anticipación. Solo después activar retiro, delivery o programación según los servicios reales. La tarifa de delivery es global configurable; no hay una integración externa de reparto.
3. Registrar los métodos reales de pago y sus instrucciones. Si no hay métodos activos, se indica que se coordinarán con el equipo.
4. Publicar los textos propios de privacidad y términos en Políticas y páginas. No se han inventado condiciones legales.
5. Configurar el dominio final HTTPS, logo, contactos, portada y códigos opcionales de GA4/Meta. Ambos requieren consentimiento del visitante. No hay claves de estos servicios incluidas.
6. Crear ocasiones, campañas y beneficios reales cuando estén aprobados por el negocio. La medición interna muestra datos registrados; no hay ventas o conversiones ficticias.

## Compilar y verificar

```sh
pnpm typecheck
pnpm build
pnpm test:integration
```

La prueba original fue diseñada para D1/R2 temporales; esta edición de despliegue no vincula R2. No toca la base en uso ni envía WhatsApp. Ver `docs/PRUEBAS.md`. El build genera `dist/server` y `dist/client`. `pnpm run deploy:check` valida el paquete sin publicarlo.

## Producción en Cloudflare

Seguir [LEEME_CLOUDFLARE.md](LEEME_CLOUDFLARE.md). El Worker usa `DB` (D1) y `ASSETS` (archivos compilados). El catálogo inicial y sus fotos están incluidos. Los pedidos se guardan en D1. Para nuevas imágenes usa rutas incluidas o URLs públicas desde el panel.

El despliegue ejecuta primero las migraciones pendientes. Se detiene si falta el Database ID real, si hay un build desactualizado o si falla la migración. El secreto `ADMIN_SETUP_TOKEN` se configura en el Worker, separado del repositorio y de las variables de compilación.

## Migraciones y actualizaciones

El esquema está en `db/schema.ts`, los SQL en `drizzle/` y sus metadatos en `drizzle/meta/`. Para cambiarlo, editar el esquema y ejecutar `pnpm db:generate`. Inspeccionar la nueva migración, probarla localmente y respaldar producción antes de publicarla. Nunca modificar una migración ya aplicada. Mantener el lockfile, el nombre del Worker y las vinculaciones al actualizar. La importación inicial solo se ejecuta si falta `catalog_imported`; no borrar esa marca para actualizar precios.

## Respaldo y recuperación

- Base: exportar D1 antes de cada cambio y con la frecuencia operativa acordada. Con cuenta Cloudflare propia: `pnpm exec wrangler d1 export DB --remote --config wrangler.jsonc --output backup.sql`. Usar también la recuperación temporal que ofrezca el proveedor. El CSV de pedidos es una exportación operativa, no un backup completo.
- Imágenes: conservar `public/products` y `public/brand` con el código. Las nuevas imágenes están en R2; respaldar el bucket con una herramienta S3 compatible y credenciales de acceso mínimo guardadas fuera del código. Mantener las claves originales `images/...` al restaurar.
- Guardar SQL e imágenes juntos, cifrados, con acceso restringido y fechas. Los respaldos contienen datos personales de clientes. Definir conservación y borrado con el negocio.
- Probar una restauración en recursos separados antes de reemplazar producción: importar SQL, restaurar objetos con las mismas claves, vincular `DB`/`BUCKET`, configurar secretos, desplegar y verificar acceso/pedidos.

## Seguridad y límites

Consultas preparadas; validación de servidor; importes en centavos; transacciones de pedido; idempotencia; comprobación de cambios de precio; cookies HttpOnly/SameSite, Secure bajo HTTPS; control de origen y límites de frecuencia; autorización por sesión; imágenes JPG/PNG/WebP; historial inmutable de productos pedidos y auditoría. Contraseñas PBKDF2-SHA256 con sal aleatoria y 100.000 iteraciones, dentro del límite de Workers. No equivale a una auditoría de seguridad externa.

El seguimiento por número y teléfono tiene límites de intentos. El recibo utiliza un token aleatorio derivado del carrito y la solicitud: quien tenga el enlace puede ver ese pedido, por lo que debe tratarse como privado. No hay autorregistro de clientes. El rol inicial es ADMINISTRADOR; nuevos roles requieren ampliar la política de autorización del servidor. No incluye inventario por unidades, reserva de capacidad, pasarela bancaria, facturación fiscal, campañas de envío masivo ni CRM de pago.

El código aplica una tarifa de delivery global. Los beneficios de producto adicional/personalizados guardan su descripción para coordinación; no crean artículos automáticos. Los reportes separan importes por moneda y distinguen artículos por cotizar. El CSV abre en Excel; no se incluye un exportador XLSX separado.

## Estructura

`app/`: rutas y estilos. `components/`: tienda, checkout, panel y controles accesibles. `lib/server/`: autenticación, catálogo, pedidos y administración. `db/` + `drizzle/`: esquema y migraciones. `data/catalog-source.json`: fuente importada. `public/`: fotos y marca. `tests/`: aceptación de API. `docs/`: operación, fuentes y pruebas.
