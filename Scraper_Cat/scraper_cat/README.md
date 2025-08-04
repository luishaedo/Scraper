# 🧾 Scraper Manual de Catálogo Taverniti (versión corregida)

Este proyecto permite extraer productos visibles desde el catálogo privado de Taverniti, guardando nombre, código, precio e imagen en un archivo JSON.

---

## 🚀 ¿Qué hace?

1. Abre una ventana de Chrome.
2. Te permite iniciar sesión manualmente.
3. Detecta la pestaña con el catálogo.
4. Espera que navegues a una categoría (ej. remeras).
5. Extrae los productos visibles.
6. Guarda los datos en `productos.json`.

---

## 🛠 Instrucciones

1. Abrí una terminal dentro del proyecto.
2. Ejecutá:

```bash
npm install
npm start
```

3. Iniciá sesión en Taverniti manualmente.
4. Tocá el botón para abrir el catálogo (se abre en otra pestaña).
5. Navegá a la categoría que quieras scrapear.
6. Esperá que se carguen los productos.
7. Volvé a la terminal y presioná **Enter**.
8. Se generará un archivo `productos.json` con los datos.

---

## 📂 Resultado

```json
[
  {
    "nombre": "RUNDEN",
    "codigo": "Código: 00406",
    "precio": "$35.000,00 - $36.000,00",
    "imagen": "https://www.tavernitionline.com.ar/temp/catalogos/..."
  }
]
```

---

## 📦 Archivos

- `scraper.js` → Script principal
- `productos.json` → Resultado generado automáticamente
- `package.json` → Configuración del proyecto

---

## 🛡️ Licencia

Este proyecto es de uso privado y educativo. Usalo con responsabilidad.

