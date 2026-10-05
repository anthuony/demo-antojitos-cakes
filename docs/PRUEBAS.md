# Verificación — 5 de octubre de 2026

## Pruebas automatizadas de aceptación

Se ejecutó `tests/integration.mjs` contra el Worker compilado, con base D1 y bucket R2 temporales. Todos los registros de prueba son ficticios y no se incorporan al catálogo ni a la base publicada.

| Grupo | Cobertura |
| --- | --- |
| Esquema | Migración limpia de 28 tablas |
| Catálogo real | 55 productos, 5 categorías, 39 presentaciones, 6 precios por cotizar |
| Acceso | Rutas administrativas protegidas, origen externo rechazado |
| Administración | Activación única, contraseña inválida, inicio y cierre de sesión |
| Carrito | Persistencia, edición, variantes, cantidades y aislamiento entre visitantes |
| Productos | Creación, edición de precios, opciones obligatorias, categorías y ocasiones |
| Pedido | Transacción, número de orden, importe de servidor, cambios de precio e idempotencia |
| Historial | Conservación de productos y precios aunque se editen o retiren |
| Estados | Transiciones válidas, rechazo de saltos y notas internas privadas |
| Cotización | Precio desconocido identificado, sin precio inventado |
| Entrega | Configuración, horarios por sede, anticipación y fechas bloqueadas |
| Beneficios | Métodos de pago, códigos y cálculo de descuentos |
| Contenido | Creación, visibilidad y retirada de campañas, banners, FAQ y páginas |
| Imágenes | Subida R2, recuperación y rechazo de formatos incompatibles |
| Gestión | Pedidos administrativos, clientes, informes, CSV, conversión y auditoría |
| Sesiones | Cambio de contraseña invalida sesiones anteriores |

El log de las pruebas repetidas sobre esta adaptación se incluye en `docs/resultado-pruebas.txt`. TypeScript, build de producción, migración local y empaquetado Wrangler en modo dry-run también se verificaron. Ver `docs/VERIFICACION_CLOUDFLARE.txt`.

## Navegador — revisión funcional anterior a la adaptación

Verificación visual de inicio, ficha de producto, carrito, checkout y recibo. Se creó un pedido de prueba local AC-000001 y se comprobó que el enlace de WhatsApp solo aparece después de guardarse. No se enviaron mensajes. Navegación, búsqueda, carrito y checkout revisados en un marco de ancho móvil; catálogo revisado en tableta. Anchos útiles medidos: 375 y 753 px, sin desbordamiento horizontal en las vistas observadas. La versión de escritorio se revisó a 1348 px.

Se corrigieron el identificador de checkout en navegadores sin `crypto.randomUUID` y el encuadre de imágenes de catálogo. Las funciones protegidas del panel se verificaron por sus API autenticadas; no se completó una sesión administrativa en el navegador de pruebas. Las pruebas no constituyen una auditoría de seguridad, de accesibilidad WCAG ni un ensayo de carga. No se comprobó un dispositivo físico.

## Datos operativos por confirmar

Moneda, disponibilidad/precios actuales, métodos de pago, retiro/delivery, días y horas de servicio, anticipación y textos legales. La aplicación se entrega con edición y validación de estos campos; no se han rellenado con datos ficticios. Esta entrega aún no está desplegada en la cuenta Cloudflare del propietario. Las pruebas locales no verifican permisos, límites del plan, DNS ni recursos remotos.
