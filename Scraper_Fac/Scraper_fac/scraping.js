const puppeteer = require("puppeteer");
const fs = require("fs");

async function getIframeById(page, iframeId, timeout = 20000) {
  // Espera que el iframe esté visible y devuelve el frame
  await page.waitForSelector(`iframe#${iframeId}`, { timeout });
  const frameHandle = await page.$(`iframe#${iframeId}`);
  if (!frameHandle) throw new Error("No se encontró el iframe esperado");
  const frame = await frameHandle.contentFrame();
  if (!frame) throw new Error("No se pudo obtener el contexto del iframe");
  return frame;
}

(async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();

  await page.goto("https://www.tavernitionline.com.ar/");

  console.log("🔐 Inicia sesión manualmente y navega a la sección de facturas. Cuando estés listo, presioná ENTER en esta consola para empezar...");

  await new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once("data", () => resolve());
  });

  const resultados = [];

  while (true) {
    console.log("\n🕵️‍♂️  Abrí el detalle de la factura manualmente. Cuando esté el popup abierto, presioná ENTER para scrapearla (o Ctrl+C para terminar).");
    await new Promise((resolve) => {
      process.stdin.resume();
      process.stdin.once("data", () => resolve());
    });

    try {
      // Obtené el contexto del iframe
      const frame = await getIframeById(page, "ifajaxframe", 20000);
     
      // Esperá que cargue el contenido de la factura
    await frame.waitForSelector("#DsolapaDetalles", { timeout: 15000 });

const detalles = await frame.evaluate(() => {
  // 1. FACTURA, REMITO, FECHA
  const cabecera = Array.from(document.querySelectorAll('#DsolapaDetalles .texto'));
  let facturaNum = '', remitoNum = '', fecha = '';
  cabecera.forEach((el, i) => {
    if (el.innerText.trim().startsWith('N°:')) {
      const siguiente = cabecera[i+1];
      if (siguiente) {
        const partes = siguiente.innerText.split('/');
        facturaNum = (partes[0] || '').trim();
        remitoNum = (partes[1] || '').trim();
      }
    }
    if (el.innerText.trim().startsWith('Fecha:')) {
      const match = el.innerText.match(/\d{2}\/\d{2}\/\d{4}/);
      fecha = match ? match[0] : '';
    }
  });

  // 2. ARTÍCULOS + CURVA
  const articulos = [];
  const Atalles = window.Atalles || {};
  const Acant = window.Acant || {};

  const filas = Array.from(document.querySelectorAll('#DsolapaDetalles table tr'));
  filas.forEach(fila => {
    const celdas = fila.querySelectorAll("td");
    // Filtra encabezado: si alguna celda dice "Código", "Color", etc. la ignora
    const encabezados = ["Código", "Color", "Descripción", "Precio U.", "Cantidad", "Precio total"];
    if (
      celdas.length === 6 &&
      !encabezados.includes(celdas[0].innerText.trim()) &&
      !encabezados.includes(celdas[1].innerText.trim())
    ) {
      const codigo = celdas[0].innerText.trim();
      const color = celdas[1].innerText.trim();
      const key = codigo + "---" + color;
      let curva = [];
      if (Atalles[key]) {
        curva = Atalles[key].map(talle => ({
          talle,
          cantidad: Acant[key] && Acant[key][talle] ? Acant[key][talle] : '0'
        }));
      }
      articulos.push({
        codigo,
        color,
        descripcion: celdas[2].innerText.trim(),
        precio_unitario: celdas[3].innerText.trim(),
        cantidad: celdas[4].innerText.trim(),
        precio_total: celdas[5].innerText.trim(),
        curva
      });
    }
  });

  // 3. SUBTOTAL, IVA, PERCEPCIONES, TOTAL (al pie)
  let subtotal = '', iva = '', percepciones = '', total = '';

  // Subtotal: busca la fila con "Subtotal"
  const subFila = Array.from(document.querySelectorAll("#DsolapaDetalles tr")).find(tr => tr.textContent.includes("Subtotal"));
  if (subFila) {
    const tds = subFila.querySelectorAll('td');
    subtotal = tds[tds.length - 1]?.innerText.trim() || '';
  }

  // Busca la última fila con totales, iva, percepciones (la que contiene "IVA:")
  const totalFila = Array.from(document.querySelectorAll("#DsolapaDetalles tr")).find(tr => tr.innerText.includes("IVA:"));
  if (totalFila) {
    const aTags = totalFila.querySelectorAll('a.texto');
    aTags.forEach(a => {
      if (a.innerText.includes('IVA:')) {
        iva = a.innerText.replace('IVA:', '').trim();
      }
      if (a.innerText.includes('Percepciones:')) {
        percepciones = a.innerText.replace('Percepciones:', '').trim();
      }
      if (a.innerText.includes('TOTAL:')) {
        total = a.innerText.replace('TOTAL:', '').trim();
      }
    });
  }

  return {
    factura: facturaNum,
    remito: remitoNum,
    fecha,
    articulos,
    subtotal,
    iva,
    percepciones,
    total
  };
});



      resultados.push(detalles);
      console.log("✅ Detalle extraído:");
      console.dir(detalles, { depth: null });

      // Guarda resultados en un archivo por cada iteración (opcional)
      fs.writeFileSync("facturas.json", JSON.stringify(resultados, null, 2));

      // Intentar cerrar el popup desde el frame
      await frame.evaluate(() => {
        const botones = Array.from(document.querySelectorAll("input[type='button'], button"));
        const cerrar = botones.find(btn => btn.value?.includes("Cerrar") || btn.innerText?.includes("Cerrar"));
        cerrar?.click();
      });
      await new Promise(res => setTimeout(res, 1000));

    } catch (err) {
      // Si falla, mostrá el HTML del iframe para debugging
      try {
        const frame = await getIframeById(page, "ifajaxframe", 5000);
        const frameHtml = await frame.evaluate(() => document.body.innerHTML);
        fs.writeFileSync("debug_iframe.html", frameHtml);
        console.error("❌ No se pudo scrapear la factura. HTML guardado en debug_iframe.html");
      } catch (e2) {
        console.error("❌ No se pudo scrapear la factura ni obtener HTML del iframe.");
      }
      console.error("Error:", err.message);
    }
  }
})();
