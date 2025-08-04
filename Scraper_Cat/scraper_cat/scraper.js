const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });

  const page = await browser.newPage();

  await page.goto('https://www.tavernitionline.com.ar/', { waitUntil: 'networkidle2' });

  console.log("👉 Iniciá sesión manualmente.");
  console.log("👉 Tocá el botón para abrir el catálogo (nueva pestaña).");
  console.log("👉 Elegí una categoría y esperá que se carguen los productos.");
  console.log("👉 Luego, volvé acá y presioná Enter...");

  await new Promise((resolve) => {
    process.stdin.once('data', () => resolve());
  });

  const pages = await browser.pages();
  const catalogPage = pages.find(p => p.url().includes('catalogoNG'));

  if (!catalogPage) {
    console.log("❌ No se encontró la pestaña del catálogo.");
    await browser.close();
    return;
  }

  await catalogPage.bringToFront();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  async function scrapePage() {
    const selector = 'article.articuloBusqueda';
    try {
      await catalogPage.waitForSelector(selector, { timeout: 30000 });
    } catch (e) {
      console.log(`⚠️ No se encontró el selector '${selector}'. Verificá que haya productos cargados.`);
      return;
    }

    const productos = await catalogPage.evaluate(() => {
      const items = Array.from(document.querySelectorAll('article.articuloBusqueda'));
      return items.map(item => {
        const nombre = item.querySelector('.nombreArticulo')?.innerText.trim();
        const codigo = item.querySelector('.codigoArticulo')?.innerText.trim();
        const precio = item.querySelector('.precioArticulo')?.innerText.trim();
        const img = item.querySelector('img.imgArticulo')?.src;
        return { nombre, codigo, precio, imagen: img };
      });
    });

    // Leer productos anteriores
    let productosAnteriores = [];
    try {
      if (fs.existsSync('productos.json')) {
        const datos = fs.readFileSync('productos.json', 'utf-8');
        productosAnteriores = JSON.parse(datos);
      }
    } catch (e) {
      console.log("⚠️ No se pudo leer productos.json, se creará desde cero.");
    }

    // Evitar duplicados por código
    const codigosAnteriores = new Set(productosAnteriores.map(p => p.codigo));
    const productosNuevos = productos.filter(p => !codigosAnteriores.has(p.codigo));

    // Combinar
    const todosLosProductos = [...productosAnteriores, ...productosNuevos];

    // Guardar
    fs.writeFileSync('productos.json', JSON.stringify(todosLosProductos, null, 2), 'utf-8');

    console.log(`📦 Productos anteriores: ${productosAnteriores.length}`);
    console.log(`📥 Nuevos encontrados en esta página: ${productos.length}`);
    console.log(`✅ Agregados al archivo (sin duplicar): ${productosNuevos.length}`);
    console.log(`📊 Total acumulado: ${todosLosProductos.length}`);
    console.log("🟢 Pasá a la siguiente página en el navegador y presioná Enter para continuar (o Ctrl+C para salir).");
  }

  console.log("🟢 Comenzamos. Presioná Enter para scrapear la primera página.");
  rl.on('line', async () => {
    await scrapePage();
  });

})();
