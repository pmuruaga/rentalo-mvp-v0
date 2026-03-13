# Proyecto 10 Alquileres

MVP: Alquiler para Eventos Infantiles en Frías.

## Ejecutar

```bash
npm install
cp .env.example .env.local   # Editar WHATSAPP_NUMBER con tu número real
npm run dev
```

## Estructura

- `app/` - Landing, Catálogo, Detalle
- `lib/productService.ts` - listProducts(), getProductBySlug() (usa JsonProductRepository)
- `data/products.json` - Datos (id, name, slug, category, pricePerDay, etc.)
- `components/WhatsAppButton.tsx` - Botón de contacto

## Env vars

| Variable | Descripción |
|----------|-------------|
| WHATSAPP_NUMBER | Número con código país, ej: 5493851234567 |
| CITY_DEFAULT | Ciudad por defecto (Frías) |
| SITE_NAME | Nombre del sitio |

## Ejecución
Resumen:
npm install instala Prisma.
prisma db push crea la base y las tablas.
db:seed carga los productos desde data/products.json.
npm run dev inicia la app.
Admin: http://localhost:3000/admin con la clave que definiste en ADMIN_KEY (por defecto tu-clave-secreta).
Si npm install ya terminó, ejecutá en este orden:
npx prisma db push
npm run db:seed
npm run dev