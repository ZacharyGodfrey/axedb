import puppeteer from 'puppeteer';

export const headless = async () => {
  const instance = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  return instance;
};