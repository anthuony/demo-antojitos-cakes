# Antojitos Cakes — edición gratuita sin R2

Esta edición está preparada para publicar sin activar R2 ni registrar un método de pago.

## Recursos
- Worker: `antojitos-cakes`
- D1: `antojitos-cakes-db`
- Database ID ya configurado: `0a078b2c-2130-46c5-b7ca-8fbba3b5ba40`
- R2: **no se usa**

## Imágenes
El catálogo inicial conserva todas las fotografías incluidas en `public/products` y `public/brand`.
Desde el panel, los campos de imagen aceptan:
- una ruta incluida, por ejemplo `/products/chocofresa.webp`; o
- una URL pública `https://...`.

La subida directa de un archivo desde el panel queda desactivada en esta edición, porque esa función necesitaba R2.

## Cloudflare
Conecta el repositorio en Workers & Pages y usa:
- Build command: `pnpm run build`
- Deploy command: `pnpm run deploy`
- Root directory: `/`
- Production branch: `main`
- Preview builds: desactivado

Variables de build recomendadas:
- `NODE_VERSION=24.19.0`
- `PNPM_VERSION=11.25.0`

Después del despliegue crea el secreto `ADMIN_SETUP_TOKEN` para activar el administrador por primera vez.
