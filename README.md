
---

## Descripción de cada scraper

### 1. `Scraper_Cat` — **Scraper de Catálogo**

- **Propósito:**  
  Automatiza la extracción de información de productos desde el catálogo online del proveedor.  

- **Funcionalidad:**  
  - Obtiene códigos, descripciones, precios y variantes de productos.
  - Guarda los datos en un archivo `productos.json`.

- **Tecnologías:**  
  - Node.js
  - Puppeteer
  - Otros módulos auxiliares.

### 2. `Scraper_Fac` — **Scraper de Facturas**

- **Propósito:**  
  Automatiza la descarga y el procesamiento de facturas desde la web del proveedor.

- **Funcionalidad:**  
  - Accede a la plataforma online de facturación.
  - Extrae información detallada de cada factura (número, fecha, artículos, cantidades, totales, etc.).
  - Guarda la información en el archivo `facturas.json`.

- **Tecnologías:**  
  - Node.js
  - Puppeteer (o similar)
  - Otros módulos auxiliares.

---

## ¿Cómo usar cada scraper?

Cada subcarpeta contiene su propio `README.md` con instrucciones específicas.  
En general:

1. Ingresá en la carpeta deseada (`Scraper_Cat/scraper_cat` o `Scraper_Fac/Scraper_fac`).
2. Instalá dependencias:
3. Ejecutá el script principal:

    node scraper.js         # Para catálogo
    node scraping.js        # Para facturas

4. Los resultados se guardan en los archivos `.json` correspondientes.

---

## Contacto

Desarrollado por [Luis Haedo]

