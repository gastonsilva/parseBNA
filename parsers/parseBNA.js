const puppeteer = require('puppeteer');

async function parser(username, password, accountNumber) {
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
  var movements = await page.evaluate((accountNumber) => {
    return fetch(
      grillaMovimientos.config.url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: new URLSearchParams({
          'numero': accountNumber,
          'tipoTandem': '11',
          'fechaDesde': '01/01/2021',
          'fechaHasta': '08/03/2021',
          'tipoMovimiento': 'DEBITOS_CREDITOS',
          'referencia': '',
          'codTransaccion': '',
          'mnemotecnico': '',
          'tipoMonto': 'TODOS_LOS_MONTOS',
          'monto': '',
          'desdeMonto': '',
          'hastaMonto': '',
          'comentario': '',
          'linesPerPage': '1000',
          'pageNumber': '1',
          'orderingField': 'fechaMovimiento',
          'sortOrder': 'desc'
        })
      }).then(res => res.json());
  }, accountNumber);

  await page.waitForSelector('#salir', { visible: true });
  await page.click('#salir');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await browser.close();

  return movements;

};

module.exports = parser;
