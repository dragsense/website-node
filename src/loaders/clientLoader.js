const React = require('react');
const ReactDOMServer = require('react-dom/server');
import AutocodeCustom from '../components/Custom';

//import Autocode from '../../autocode';
import { PageComponent } from '../components'
const { Page, Collection, Document } = require('../apis/models');
import { collectionService, pageService, settingService, themeService, layoutService } from '../apis/services'


module.exports = (app) => {



  app.get('*', async (req, res) => {
    // Extract the dynamic segments from the URL
    const dynamicSlugs = req.params[0];
    const updatedSlug = dynamicSlugs.replace(/^\//, '');

    const slugParts = updatedSlug.split('/');


    const projection = {
      components: 1,
      name: 1,
      creator: 1,
      forms: 1,
      createdAt: 1,
      setting: 1,
      states: 1,
      url: 1,
      _id: 1,
      type: 1,
      slug: 1,
    };

    let page = null;

    const setting = await settingService.getSettings();
    console.log(page, slugParts, slugParts.slice(0, 1).join('/'))

    if (setting.maintenancePage)
      page = await Page.findOne({ _id: setting.maintenancePage._id, 'setting.status': "PUBLIC" }).select(projection).populate('setting.image');
    else {
      page = await Page.findOne({ slug: updatedSlug, 'setting.status': "PUBLIC" }).select(projection).populate('setting.image');

      if (!page)
        for (let i = 0; i < slugParts.length; i++) {
          const currentSlug = slugParts.slice(0, i+1).join('/');
          page = await Collection.findOne({ slug: currentSlug, 'setting.status': 'PUBLIC' }).select(projection).populate('setting.image');
          if (page) {

            const modelName = page.slug;

            const DocumentModel = Document(modelName);
            const remainingSlug = slugParts.slice(i).join('/');


            const document = await DocumentModel.findOne({ slug: remainingSlug, 'setting.status': 'PUBLIC' }).select(projection).populate('setting.image');
            if (document) {
              page.states = document.states; 
              page.setting = document.setting;
            }


            break;
          }
        }
    }

    if (!page) {
      if (setting.errorPage) {
        page = await Page.findOne({ _id: setting.errorPage._id, 'setting.status': "PUBLIC" }).select(projection).populate('setting.image');
      }

    }

    if (!page) {

      res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>404</title>
            </head>
            <body>
              <div id="root">Page Not Found.</div>
            </body>
          </html>
        `);
      return
    }


    const pagesResults = page.type === 'collection' ? await collectionService.getPageData(page._id, true) :
      await pageService.getPageData(page._id, true)


    const pageSetting = page.setting || {}

    const settingData = {
      name: page.name,
      creator: page.creator,
      title: pageSetting.title,
      desc: pageSetting.desc,
      desc: pageSetting.desc,

      desc: pageSetting.desc,
      image: pageSetting.image,
      status: pageSetting.status,
      createdAt: page.createdAt,
      content: pageSetting.content,
      excerpt: pageSetting.excerpt,
      url: page.url,
      global: {
        title: setting.webtitle, tagline:
          setting.tagLine,
        desc: setting.desc,
        author: setting.author,
        images: setting.images
      }
    };


    const htmlString = ReactDOMServer.renderToString(<PageComponent
      _id={page._id}
      pages={pagesResults.pages}
      top={pagesResults.layout?.top}
      bottom={pagesResults.layout?.bottom}
      setting={settingData} states={pagesResults.states}
      type={page.type || 'page'}
      AutocodeCustom={AutocodeCustom}
    />);

    // let style = page.type === 'collection' ? await collectionService.getCss(page._id) :
    //   await pageService.getCss(page._id);


    const pageData = {
      type: page.type || 'page',
      _id: page._id,
      setting: settingData,
      states: pagesResults.states

    }


    const filter = {};
    const options = { limit: 100 };
    //const fonts = await themeService.getFonts();
    const colors = await themeService.getColors(filter, options);
    const variables = await themeService.getVariables(filter, options);

    const globalCss = await themeService.getCss();
    const rootCss = `html {
      ${colors.data.reduce((cssString, color) => {
      return cssString + color.variable + ':' + color.color + ";";
    }, '')}
    ${variables.data.reduce((cssString, variable) => {
      return cssString + variable.variable + ':' + variable.value + ";";
    }, '')}
  }`;

    // Send the rendered HTML back to the client
    res.send(`
          <!DOCTYPE html>
          <html>
            <head>
            <title>${page.setting?.title ?
        page.setting.title :
        setting.webtitle ?
          setting.webtitle : 'Page'}</title>
      <meta name="description" content="${page.setting.desc ?
        page.setting.desc :
        setting.desc ?
          setting.desc :
          ''}" />

            <meta name="author" content="${setting.author}" />
            <meta name="keywords" content="${setting.keywords}" />
            <link rel="icon" href="${setting.images?.favicon?.src}" />
            <meta httpEquiv="Content-Language" content="${setting.lang}" />

              ${setting.scripts?.head}
              <style>
              ${rootCss}
              ${globalCss.css}
              </style>
              <style>${pagesResults.css.join(" ")}</style>
            </head>
            <body>
              <div id="root">${htmlString}</div>
              <script id="ac-data-script-${page._id}">
              window.__INITIAL_DATA__ = ${JSON.stringify(pageData)};
              </script>
              ${setting.scripts ? setting.scripts.foot || '' : ''}
              ${page.setting ? page.setting.scripts?.foot || '' : ''}
              <script src="custom.bundle.js"></script>
              <script src="client.bundle.js"></script>
            </body>
          </html>
        `);
  });

}