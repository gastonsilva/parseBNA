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

  await page.waitForFunction(() => typeof grillaMovimientos === 'object');
  var movimientos = await page.evaluate((accountNumber) => {
    return fetch(
      grillaMovimientos.config.url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'numero': accountNumber,
          'tipoTandem': '11',
          'fechaDesde': '28%2F02%2F2021',
          'fechaHasta': '07%2F03%2F2021',
          'tipoMovimiento': 'DEBITOS_CREDITOS',
          'referencia': null,
          'codTransaccion': null,
          'mnemotecnico': null,
          'tipoMonto': 'TODOS_LOS_MONTOS',
          'monto': null,
          'desdeMonto': null,
          'hastaMonto': null,
          'comentario': null,
          'linesPerPage': '1000',
          'pageNumber': '1',
          'orderingField': 'fechaMovimiento',
          'sortOrder': 'desc'
        })
      }).then(res => res.json());
  }, accountNumber);

  console.log(JSON.stringify(movimientos));

  // Add exit
  await browser.close();

})();