const puppeteer = require('puppeteer');
const fs = require('fs');
const delay = +fs.readFileSync('config.txt', { encoding: 'utf-8' });
const websites = fs
    .readFileSync('websites.csv', { encoding: 'utf-8' })
    .trim()
    .split('\n');
for (let i = 0; i < websites.length; i++) {
    websites[i] = websites[i].replace('\r', '');
}

async function configureBrowser() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    fs.writeFileSync('data.csv', `Website,Property,Value\n`);

    let i = 0;
    scrape();
    async function scrape() {
        if (i == websites.length) {
            await browser.close();
            return;
        }
        await page.goto(websites[i]);
        const {
            appleMobileWebAppCapable,
            description,
            keywords,
            ogDescription,
            ogImage,
            ogTitle,
            ogType,
            ogUrl,
            twitterCard,
            twitterDescription,
            twitterTitle,
            viewport,
            title,
        } = await page.evaluate(() => {
            const metaTags = document.getElementsByTagName('meta');
            const title = document.getElementsByTagName('title')[0].innerText;

            let appleMobileWebAppCapable = '';
            let description = '';
            let keywords = '';
            let ogDescription = '';
            let ogImage = '';
            let ogTitle = '';
            let ogType = '';
            let ogUrl = '';
            let twitterCard = '';
            let twitterDescription = '';
            let twitterTitle = '';
            let viewport = '';

            for (let i = 0; i < metaTags.length; i++) {
                const name = metaTags[i].getAttribute('name');
                const property = metaTags[i].getAttribute('property');

                if (name === 'apple-mobile-web-app-capable') {
                    appleMobileWebAppCapable =
                        metaTags[i].getAttribute('content');
                } else if (name === 'description') {
                    description = metaTags[i].getAttribute('content');
                } else if (name === 'keywords') {
                    keywords = metaTags[i].getAttribute('content');
                } else if (property === 'og:description') {
                    ogDescription = metaTags[i].getAttribute('content');
                } else if (property === 'og:image') {
                    ogImage = metaTags[i].getAttribute('content');
                } else if (property === 'og:title') {
                    ogTitle = metaTags[i].getAttribute('content');
                } else if (property === 'og:type') {
                    ogType = metaTags[i].getAttribute('content');
                } else if (property === 'og:url') {
                    ogUrl = metaTags[i].getAttribute('content');
                } else if (property === 'twitter:card') {
                    twitterCard = metaTags[i].getAttribute('content');
                } else if (property === 'twitter:description') {
                    twitterDescription = metaTags[i].getAttribute('content');
                } else if (property === 'twitter:title') {
                    twitterTitle = metaTags[i].getAttribute('content');
                } else if (name === 'viewport') {
                    viewport = metaTags[i].getAttribute('content');
                }
            }

            return {
                appleMobileWebAppCapable,
                description,
                keywords,
                ogDescription,
                ogImage,
                ogTitle,
                ogType,
                ogUrl,
                twitterCard,
                twitterDescription,
                twitterTitle,
                viewport,
                title,
            };
        });

        fs.appendFileSync(
            'data.csv',
            `${websites[i]},apple-mobile-web-app-capable,"${appleMobileWebAppCapable}"
            ,description,"${description}"
            ,keywords,"${keywords}"
            ,ogDescription,"${ogDescription}"
            ,ogImage,"${ogImage}"
            ,ogTitle,"${ogTitle}"
            ,ogType,"${ogType}"
            ,ogUrl,"${ogUrl}"
            ,twitterCard,"${twitterCard}"
            ,twitterDescription,"${twitterDescription}"
            ,twitterTitle,"${twitterTitle}"
            ,viewport,"${viewport}"
            ,title,"${title}"\n`
        );
        i++;
        setTimeout(() => {
            scrape();
        }, delay * 1000);
    }
}

configureBrowser();
