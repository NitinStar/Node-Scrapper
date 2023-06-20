const cheerio = require('cheerio');
const axios = require('axios');
const Helpers = require('./helpers');
const getColors = require('get-image-colors')



//const response = await HtmlLoader.getHTML(url);
exports.getScrappedData = function(request, response){
    let url = request.body.url;
    if(url){
        axios.get(url).then((res) =>{
            let resObj = {};
            let showAllImages = false;
            let $ = cheerio.load(res.data);
            const logos = [
                { type: 'og:logo', url: $('meta[property="og:logo"]').attr('content') },
                { type: 'meta-itemprop/logo', url: $('meta[itemprop="logo"]').attr('content') },
                ...$('link[rel*="icon"]')
                    .map((i, el) => {
                        return { type: 'link-rel/icon', url: $(el).attr('href'), size: $(el).attr('sizes') };
                    })
                    .get(),
                { type: 'img-itemprop/logo', url: $('img[itemprop="logo"]').attr('src') },
                {
                    type: 'meta-name/msapplication-TileImage',
                    url: $('meta[name*="msapplication-TileImage"]').attr('content'),
                },
                { type: 'meta-content/logo', url: $('meta[content*="logo"]').attr('content') },
                { type: 'meta-content/image', url: $('meta[itemprop*="image"]').attr('content') },
                ...$('script[type*="application/ld+json"]')
                    .map((i, el) => {
                        return { type: 'json-ld-logo', url: Helpers.findJsonLdImages($(el).html()) };
                    })
                    .get(),
                { type: 'img-alt/logo', url: $('img[alt*="logo"]').attr('src') },
                { type: 'img-alt/logo-class', url: $('img[class*="logo"]').attr('src') },
                { type: 'img-src/logo', url: $('img[src*="logo"]').attr('src') },
                { type: 'og:image', url: $('meta[property="og:image"]').attr('content') },
                { type: 'svg:image', data: true, url: Helpers.svgToDataURL($('a[class*="logo"]').html()) },
            ].filter(e => e.url);
            
            let correctLogos = logos.map((image) => {
                return !Helpers.validUrl(image.url) && image.url.indexOf('data:') === -1
                    ? {
                          ...image,
                          url: res.request.host  + image.url,
                      }
                    : image;
            });
            
            //console.log(" correctLogos arr === ", correctLogos);
            if (showAllImages) {
                resObj.logos = correctLogos;
            } else {
                let logo = correctLogos.filter(cls => cls.type && cls.type.includes('logo'));
                if(!logo || logo.length == 0){
                    logo =  [correctLogos[0]]; 
                }
                
                resObj.logos = logo;
                console.log(" correctLogos logo === ", resObj.logos);
            }
            let siteTitle = $('title').text() || $('meta[property=og:title]').attr("content");
            let siteDescription =  $('meta[name=description]').attr("content");
            let siteKeywords =  $('meta[name=keywords]').attr("content");
            /*let fontsArr = [];
            var category = $('div').filter(function() {
                return $(this).text().trim();
              });
            console.log("Category ===", category);
            category.each((idx,elm) => {
                console.log("Element == ", elm);
                fontsArr.push(detectFont(elm));
            });
            console.log("fontsArr == ", fontsArr);*/
            resObj.title = siteTitle;
            resObj.description = siteDescription;
            resObj.keywords = siteKeywords;
            let src = (resObj.logos && resObj.logos.length > 0) ? resObj.logos[0].url : null;
            if(src && !src.includes('https://')){
                src = 'https://'+ src;
            }
            
            getColorsOfLogo(src, function(res){
                if(res === 'NO_LOGO'){
                    resObj.logo_colors = [];
                }
                else if(res !== 'ERROR'){
                    resObj.logo_colors = res;
                }
                response.send(resObj);
            })
        })
        .catch(function(err){
            console.log("=== axios error ===", err);
            response.send(" Error in axios === ");
        });
    } else{
        response.status(500).send({status: "FAILURE", message: "Invalid Request"})
    }
    
    
}

async function getColorsOfLogo(src, callback){
    if(src){
        try{
            const request = await axios.get(src, {
                responseType: "arraybuffer",
            });
            let data = Buffer.from(request.data);
            getColors(src).then((clrs)=>{
                //console.log("New Colors == ", clrs.map(color => color.hex()));
                let colData = clrs.map(color => color.hex());
                callback(colData);
            })
            .catch(function(errC){
                console.log("Error == ", errC);
                callback("ERROR");
            })
            
        } catch(ex){
            callback("ERROR");
        }
        
    } else{
        console.log("No logo src == ", src);
        callback("NO_LOGO");
    }
    
}



