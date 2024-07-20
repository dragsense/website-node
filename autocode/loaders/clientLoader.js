const React = require('react');
const ReactDOMServer = require('react-dom/server');

const { Page, Collection, Document } = require('../apis/models');
const {
  settingService,
  themeService,
}
  = require('../apis/services');

const path = require('path');
const fs = require('fs');

const publicDir = path.resolve(process.cwd(), 'public');

const { Download } = require('../apis/controllers/setting.controller');

// Function to handle page not found
const handleError = (res) => {
  res.status(500).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Error</title>
      </head>
      <body>
        <div id="root">Something went wrong.</div>
      </body>
    </html>
  `);
  return;
}

// Function to handle page not found
const handlePageNotFound = (res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>404</title>
      </head>
      <body>
        <div id="root">Page not found.</div>
      </body>
    </html>
  `);
  return;
}

// Function to fetch page data
const fetchPageData = async (page, host, document) => {
  return await settingService.getPageData(page._id, page.type, host, true, document);
}

module.exports = (app, AutoCode, AutocodeCustom, libraryName) => {

  app.get("/api/v1/project/download", (req, res) => Download(req, res, AutoCode, AutocodeCustom))

  app.get('*', async (req, res) => {
    try {



      const dynamicSlugs = req.params[0].replace(/^\//, '');
      const slugParts = dynamicSlugs.split('/');


      const projection = {
        _id: 1,
        type: 1,
        setting: 1,
        slug: 1,
      };

      const setting = await settingService.getSettings();
      let page = null;
      let document = null;
      let DocumentModel;

      // Check if maintenance page is set
      if (setting.maintenancePage) {
        page = await Page.findOne({
          _id: setting.maintenancePage._id,
          'setting.status': "PUBLIC"
        }).select(projection);
      }
      else {

        // Check if home page is set
        if (setting.homePage && (slugParts.length <= 0 || dynamicSlugs === '')) {
          page = await Page.findOne({ _id: setting.homePage._id, 'setting.status': "PUBLIC" }
          ).select(projection);
        } else
          page = await Page.findOne({ slug: dynamicSlugs, 'setting.status': "PUBLIC" }
          ).select(projection);

        // If page not found, check in collections
        if (!page)
          for (let i = 0; i < slugParts.length; i++) {
            const currentSlug = slugParts.slice(0, i + 1).join('/');

            page = await Collection.findOne({
              slug: currentSlug,
              'setting.status': 'PUBLIC'
            },
            ).select(projection);



            if (page) {
              const modelName = page.slug;
              DocumentModel = Document(modelName);
              const remainingSlug = slugParts.slice(i + 1).join('/');
              document = await DocumentModel.findOne(
                { slug: remainingSlug, 'setting.status': 'PUBLIC' }
              ).select({ _id: 1, slug: 1 })

              break;
            }
          }
      }


      // If page not found, check if error page is set
      if (!page && setting.errorPage) {
        page = await Page.findOne({ _id: setting.errorPage._id, 'setting.status': "PUBLIC" },
        ).select(projection);
      }

      // If page not found, handle page not found
      if (!page) {
        handlePageNotFound(res);
        return;
      }


      const protocol = req.protocol || 'http';
      const host = `${protocol}://${req.headers.host}`;

      const pagesResults = await fetchPageData(page, host, document);

      const settingData = {
        global: {
          webTitle: setting.webtitle,
          tagLine: setting.tagLine,
          desc: setting.desc,
          author: setting.author,
          images: setting.images
        }
      };

      const htmlString = AutoCode === undefined ? '' :
        ReactDOMServer.renderToString(<AutoCode
          _id={page._id}
          pages={pagesResults.pages}
          top={pagesResults.layout?.top}
          bottom={pagesResults.layout?.bottom}
          setting={settingData}
          type={page.type || 'page'}
          AutocodeCustom={AutocodeCustom}
        />);


      const pageData = {
        type: page.type || 'page',
        _id: page._id,
        setting: settingData,
      };

      const filter = {};
      const options = { limit: 100 };
      const fonts = await themeService.getFonts(filter, options);
      const colors = await themeService.getColors(filter, options);
      const variables = await themeService.getVariables(filter, options);


      const globalCss = await themeService.getCss();
      const rootCss = `html {
        ${fonts.data.reduce((cssString, variable) => {
        return cssString + variable.variable + ':' + variable.fontFamily + ";";
      }, '')}
        ${colors.data.reduce((cssString, color) => {
        return cssString + color.variable + ':' + color.color + ";";
      }, '')}
      ${variables.data.reduce((cssString, variable) => {
        return cssString + variable.variable + ':' + variable.value + ";";
      }, '')}
    }`;

      const fontCssString = fonts.data.reduce((cssString, font) => {
        if (font.isGoogleFont && font.src) {
          // Google Fonts
          return cssString + `${font.src}`;
        } else if (Array.isArray(font.fontSrc) && font.fontSrc?.length > 0) {
          // Custom Fonts
          const fontSrcString = font.fontSrc
            .map((src) => `url("${src.src}")`)
            .join(',');

          return cssString + `
          <style>
            @font-face {
              font-family: "${font.fontFamily}";
              src: ${fontSrcString};
            }
          </style>
        `;
        }
        return cssString;
      }, '');

      const globalJs = await themeService.getJs();


      // Write CSS to temp file
      fs.writeFileSync(path.join(publicDir, 'style.css'), `${rootCss}\n${fontCssString}\n${globalCss.css}\n${pagesResults.css.join(" ")}`);

      // Write JS to temp file
      fs.writeFileSync(path.join(publicDir, 'index.js'), `${globalJs.code}`);

      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
          <title>${page.setting?.title ? page.setting.title : setting.webTitle ? setting.webTitle : 'Page'}${setting.tagLine ? " - " + setting.tagLine : ''}</title>
          <meta name="description" content="${page.setting?.desc ?  page.setting.desc : setting.desc ?  setting.desc : ''}" />
          <meta name="author" content="${setting.author}" />
          <meta name="keywords" content="${setting.keywords}" />
          <link rel="icon" href="${host}${setting.images?.favicon?.src || `/images/default/favicon.ico`}" />
          <meta httpEquiv="Content-Language" content="${setting.lang}" />
          <link rel="stylesheet" type="text/css" href="/style.css">
          ${setting.scripts?.head}
          </head>
          <body>
            <div id="root">${htmlString}</div>
            <script id="ac-data-script-${page._id}">
            window.__INITIAL_DATA__ = ${JSON.stringify(pageData)};
            </script>
            <script src="/index.js"></script>
            ${setting.scripts ? setting.scripts.foot || '' : ''}
            ${page.setting ? page.setting.scripts?.foot || '' : ''}
           <script src="/${libraryName}.js"></script>
            <script src="/autocode-client.js"></script> 
          </body>
        </html>
      `);


    } catch (error) {
      console.error(`Error in fetchData: ${error}`);
      handlePageNotFound(res);
    }
  });

}
