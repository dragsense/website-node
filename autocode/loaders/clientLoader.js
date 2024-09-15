const React = require('react')
const ReactDOMServer = require('react-dom/server')
const dotenv = require('dotenv')
dotenv.config()
const { loadService } = require('./servicesLoader')

const path = require('path')
const fs = require('fs')

const publicDir = path.resolve(process.cwd(), 'public')

const { Download } = require('../apis/controllers/setting.controller')
const autocodeAPIAuth = require('../middlewares/autocode-api-auth')

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
  `)
    return
}

// Function to fetch page data
const fetchPageData = async (page, host, remainingSlug, settingService) => {
    return await settingService.getPageData(page._id, page.type, host, true, remainingSlug)
}

module.exports = (app, AutoCode, AutocodeCustom, headCode = '', footCode = '') => {
    app.get(`/autocode-project/download`, autocodeAPIAuth, (req, res) => Download(req, res, AutoCode, AutocodeCustom))

    app.get('*', async (req, res) => {
        try {
            const dynamicSlugs = req.params[0].replace(/^\//, '')
            const slugParts = dynamicSlugs.split('/')

            const settingService = await loadService('settingService')
            const setting = await settingService.getSettings()
            let page = null
            let remainingSlug = ''

            // Check if maintenance page is set
            if (setting.maintenancePage) {
                page = await settingService.getPage('_id', setting.maintenancePage._id)
            } else {
                // Check if home page is set
                if (setting.homePage && (slugParts.length <= 0 || dynamicSlugs === '')) {
                    page = await settingService.getPage(setting.homePage._id)
                } else page = await settingService.getPage('slug', dynamicSlugs)

                // If page not found, check in collections
                if (!page)
                    for (let i = 0; i < slugParts.length; i++) {
                        const currentSlug = slugParts.slice(0, i + 1).join('/')

                        page = await settingService.getPage('slug', currentSlug, 'collection')
                        if (page) {
                            remainingSlug = slugParts.slice(i + 1).join('/')
                            break
                        }
                    }
            }

            // If page not found, check if error page is set
            if (!page && setting.errorPage) {
                page = await settingService.getPage(setting.errorPage._id)
            }

            // If page not found, handle page not found
            if (!page) {
                handlePageNotFound(res)
                return
            }

            const protocol = 'https'
            const host = `${protocol}://${req.headers.host}`

            const pagesResults = await fetchPageData(page, host, remainingSlug, settingService)

            const settingData = {
                global: {
                    webTitle: setting.webTitle,
                    tagLine: setting.tagLine,
                    desc: setting.desc,
                    author: setting.author,
                    images: setting.images,
                },
                host,
            }

            const htmlString =
                AutoCode === undefined
                    ? ''
                    : ReactDOMServer.renderToString(
                          <AutoCode
                              _id={page._id}
                              pages={pagesResults.pages}
                              setting={settingData}
                              type={page.type || 'page'}
                              AutocodeCustom={AutocodeCustom}
                          />
                      )

            const pageData = {
                type: page.type || 'page',
                _id: page._id,
                remainingSlug: remainingSlug,
                setting: settingData,
            }

            const themeService = await loadService('themeService')

            const filter = {}
            const options = { limit: 100 }
            const fonts = await themeService.getFonts(filter, options)
            const colors = await themeService.getColors(filter, options)
            const variables = await themeService.getVariables(filter, options)

            const globalCss = await themeService.getCss()
            const rootCss = `html {
        ${fonts.data.reduce((cssString, variable) => {
            return cssString + variable.variable + ':' + variable.fontFamily + ';'
        }, '')}
        ${colors.data.reduce((cssString, color) => {
            return cssString + color.variable + ':' + color.color + ';'
        }, '')}
      ${variables.data.reduce((cssString, variable) => {
          return cssString + variable.variable + ':' + variable.value + ';'
      }, '')}
    }`

            const fontCssString = fonts.data.reduce((cssString, font) => {
                if (font.isGoogleFont && font.src) {
                    // Google Fonts
                    return cssString + `${font.src}`
                } else if (Array.isArray(font.fontSrc) && font.fontSrc?.length > 0) {
                    // Custom Fonts
                    const fontSrcString = font.fontSrc.map((src) => `url("${src.src}")`).join(',')

                    return (
                        cssString +
                        `
          <style>
            @font-face {
              font-family: "${font.fontFamily}";
              src: ${fontSrcString};
            }
          </style>
        `
                    )
                }
                return cssString
            }, '')

            const globalJs = await themeService.getJs()

            // Write CSS to temp file
            fs.writeFileSync(
                path.join(publicDir, 'autocode-custom-style.css'),
                `${rootCss}\n${globalCss.css}\n${pagesResults.css.join(' ')}`
            )

            // Write JS to temp file
            fs.writeFileSync(path.join(publicDir, 'autocode-custom-index.js'), `${globalJs.code}`)

            res.send(`
        <!DOCTYPE html>
        <html>
          <head>
          <title>${page.setting?.title ? page.setting.title : setting.webTitle ? setting.webTitle : 'Page'}${
                setting.tagLine ? ' - ' + setting.tagLine : ''
            }</title>
          <meta name="description" content="${page.setting?.desc ? page.setting.desc : setting.desc ? setting.desc : ''}" />
          <meta name="author" content="${setting.author}" />
          <meta name="keywords" content="${setting.keywords}" />
          <link rel="icon" href="${host}${setting.images?.favicon?.src || `/images/default/favicon.ico`}" type="${
                setting.images?.favicon?.mimetype || `image/x-icon`
            }" />
          <meta httpEquiv="Content-Language" content="${setting.lang}" />
          <link rel="stylesheet" type="text/css" href="/autocode-custom-style.css">
          ${fontCssString}
          ${setting.scripts?.head}
          ${page.scripts ? page.scripts?.head || '' : ''}
          ${headCode}
          </head>
          <body>
            <div id="root">${htmlString}</div>
            <script id="ac-data-script-${page._id}">
            window.__INITIAL_DATA__ = ${JSON.stringify(pageData)};
            </script>
            <script src="/autocode-custom-index.js"></script>
            ${setting.scripts ? setting.scripts.footer || '' : ''}
            ${page.scripts ? page.scripts?.footer || '' : ''}
         <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
         <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
         <script>
            window.react = window.React;
            window.AUTOCODE_API_PREFIX = '${process.env.AUTOCODE_API_PREFIX || 'autocode-api'}'
        </script>
           ${footCode}
            <script src="/autocode-client.js"></script> 
          </body>
        </html>
      `)
        } catch (error) {
            console.error(`Error in fetchData: ${error}`)
            handlePageNotFound(res)
        }
    })
}
