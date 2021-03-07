const puppeteer = require('puppeteer');

const username = '';
const password = '';
const accountNumber = '';

(async () => {
  console.log('Initializing...');
  console.log('Launching browser');

  const browser = await puppeteer.launch({
    headless: true,
    //ignoreHTTPSErrors: true,
    args: [
      '--log-level=3',
      '--no-default-browser-check',
      '--disable-infobars',
      '--disable-web-security',
      '--disable-site-isolation-trials',
      '--no-experiments',
      '--ignore-gpu-blacklist',
      '--ignore-certificate-errors',
      '--ignore-certificate-errors-spki-list',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-default-apps',
      '--enable-features=NetworkService',
      '--disable-setuid-sandbox',
      '--no-sandbox'
    ]
  });

  const [page] = await browser.pages();

  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36');
  await page.setBypassCSP(true);

  console.log('Goto: https://hb.redlink.com.ar/bna/home.htm');
  await page.goto('https://hb.redlink.com.ar/bna/home.htm', {
    waitUntil: 'networkidle2',
    timeout: 0
  });
  console.log("Logging in");
  await page.waitForSelector('#usuario', { visible: true });
  await page.type('#usuario', username);
  await page.click('#loginBox > a');
  await page.waitForResponse(response => response.status() === 200)
  await page.waitForSelector('#clave', { visible: true });
  await page.type('#clave', password);
  await page.click('#loginBox > a');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log('Goto: https://hb.redlink.com.ar/bna/home.htm#movimientosHistoricos');
  await page.goto('https://hb.redlink.com.ar/bna/home.htm#movimientosHistoricos', {
    waitUntil: 'networkidle2',
    timeout: 0
  });
  console.log("Selecting account");
  await page.waitForSelector('#seleccionarCuentaGrid > tbody tr:not(#firstrow)', { visible: true });
  const rowNum = await page.evaluate((accountNumber) => {
    var cuentasRows = document.querySelectorAll('#seleccionarCuentaGrid > tbody tr:not(#firstrow)');
    for (var i = 0; i < cuentasRows.length; i++) {
      if (cuentasRows[i].querySelector('td:nth-child(5)').innerText === accountNumber) {
        return i;
      }
    }
  }, accountNumber);
  console.log(`Account is in row: ${rowNum}`);
  await page.click(`#seleccionarCuentaGrid > tbody tr:nth-child(${rowNum+2})`);
  await page.waitForSelector("#botonRealizarConsultaMovimientos", { visible: true });
  await page.click('#botonRealizarConsultaMovimientos');
  await page.waitForSelector("#movimientos > tbody tr:not(#firstrow)");
  console.log('Parsing movements');
  const movimientos = await page.evaluate(() => {
    var movimientosRows = Array.from(document.querySelectorAll('#movimientos > tbody tr:not(#firstrow)'));
    return movimientosRows.map((r) => {
      return {
        "fecha": r.querySelector('td:nth-child(2)').innerText,
        "concepto": r.querySelector('td:nth-child(4)').innerText,
        "importe": r.querySelector('td:nth-child(5)').innerText
      } 
    });
  });
  console.log(movimientos);
  await browser.close();
})();