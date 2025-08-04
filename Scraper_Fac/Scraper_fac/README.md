# Scraping Taverniti

Script para scrapear facturas y detalles de la web de Taverniti.

## ¿Cómo funciona?

1. Abrís Chrome con depuración remota (`--remote-debugging-port=9222`).
2. Iniciás sesión manualmente en la web de Taverniti y navegás a la sección de facturas.
3. Ejecutás el script con `npm start`.
4. Cuando te avise, presionás ENTER para que arranque el scraping.

## Instalación

```bash
npm install
```

## Uso

1. Ejecutá Chrome con:
   ```
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome_dev"
   ```
2. Logueate en la web y poné la página de facturas.
3. En la carpeta del proyecto:
   ```
   npm start
   ```
