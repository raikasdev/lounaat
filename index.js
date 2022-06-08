const puppeteer = require('puppeteer');

const isMoreAvailable = async (page) => {
  let isMore = false;
  await page
    .waitForSelector('body > div.wrapper.content-wrapper > div > div.more.content', { hidden: true, timeout: 999 })
    .catch(() => {
      isMore = true;
    });
  return isMore;
};

const openMore = async (page) => {
  await page.waitForSelector('#loader', { hidden: true });
  await page.click('body > div.wrapper.content-wrapper > div > div.more.content > a');
  await page.waitForSelector('#loader', { hidden: true });
  if (await isMoreAvailable(page)) {
    await openMore(page);
  }
};

exports.getRestaurants = async (location) => {
  const browser = await puppeteer.launch({ });
  const page = await browser.newPage();
  await page.goto(`https://www.lounaat.info/haku?etsi=${encodeURI(location)}`);
  const element = await page.waitForSelector('#filter > ul > li:nth-child(4) > a');
  await element.click();
  await page.waitForSelector('#loader', { hidden: true });
  if (await isMoreAvailable(page)) {
    await openMore(page);
  }
  await page.waitForTimeout(50); // Make sure they have been added
  const restaurants = await page.evaluate(() => Array.from(document.querySelectorAll('div.menu.item'), (element) => {
    const name = element.querySelector('h3 a').textContent;
    const openTimes = element.querySelector('p.lunch.closed').textContent;
    const dishes = Array.from(element.querySelectorAll('li.menu-item'), (el) => {
      const info = el.querySelector('p.info');
      if (!info) {
        const dishname = el.querySelector('p.dish').textContent;
        const price = el.querySelector('p.price');
        return { name: dishname, price: price ? price.textContent : null };
      }
      return { info: info.textContent };
    });
    return { name, openTimes, dishes };
  }));
  browser.close();
  return restaurants;
};
