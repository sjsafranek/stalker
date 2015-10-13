/**
 * Source:
 *      https://www.npmjs.com/package/js-crawler
 * 
 * Description:
 *      Preforms google search and crawls to a depth of 2. 
 *      Collects websites, social media accounts, etc.
 *
 * Usage:
 *      node stalker.js steven hawking
 */


var fs = require('fs');
var URL = require('url');
var Crawler = require('js-crawler');
var cheerio = require('cheerio');
var bunyan = require('bunyan');
var log = bunyan.createLogger({
    name: "stalker search",
    streams: [
        {
            level: "info",
            path: "crawler.log"//,
            //stream: process.stdout
        },
        {
            level: "error",
            path: "crawler.log"//,
            //stream: process.stdout
        },
        {
            level: "warn",
            path: "crawler.log"//,
            //stream: process.stdout
        },
    ]
});


/**
 * Replace all instances of character in string
 */
String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,'\\$&'),(ignore?'gi':'g')),(typeof(str2)=='string')?str2.replace(/\$/g,'$$$$'):str2);
} 


/**
 * Get Search Term from Command Line Arguments
 */
var searchTerm = '';
process.argv.forEach(function (val, index, array) {
    if (index > 1) {
        searchTerm += val + '+';
    }
});
searchTerm = searchTerm.substring(0, searchTerm.length - 1);


/**
 * harvests relevant data from html page
 * 
 * @method  harvest
 * @param   {Page} page object for js-crawler
 */
function harvest(content) {
    log.info('harvest page',{search: searchTerm});
    var words = searchTerm.split('+');
    for (var i = 0; i < words.length; i++){
        if (content.indexOf(words[i]) == -1){
            return false
        }
    }
    var $ = cheerio.load(content);
    //$('div.row.candidate-row').each(function(i,e){
    //    console.log($(e).text());
    //});
    return true;
}


/**
 * Checks URL for social media services and key words
 * 
 * @method  isMatchedURL
 * @param   {String} url of website
 * @return  {Boolean} true/false of matching domain/url
 */
function isMatchedURL(url) {
    var hostname = URL.parse(url,true).hostname;
    if (url.indexOf('related:http') != -1){
        return false;
    }
    else if (url.indexOf('http://webcache.googleusercontent.com/') != -1){
        return false;
    }
    var socialMediaServices = [
        'https://www.facebook.com/',
        'https://twitter.com/',
        'https://www.linkedin.com/',
        'https://instagram.com/',
        'https://www.tumblr.com/',
        'https://www.pinterest.com/',
        'https://plus.google.com/'

    ];
    for (var i = 0; i < socialMediaServices.length; i++){
        if (url.indexOf(socialMediaServices[i]) != -1){
            return true;
        }
    }
    var words = searchTerm.split('+');
    for (var i = 0; i < words.length; i++){
        if (url.indexOf(words[i]) != -1){
            return true;
        }
    }
    return false;
}


/**
 * Store search results
 */
var searchResultUrls = [];


/**
 * Web Crawler
 * Preforms Google Search to retrieve urls and crawls to a depth of 2
 * 
 * @class Crawler
 */
new Crawler()
    .configure({
        shouldCrawl: function(url) {
            var p = url.indexOf('http://play.google.com/');
            var y = url.indexOf('://youtube.com/');
            return p == -1 || y == -1;
        },
        depth: 2, 
        //maxRequestsPerSecond: 100,
        //maxConcurrentRequests: 10
        maxRequestsPerSecond: 10,
        maxConcurrentRequests: 4,
        userAgent: 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; en-US; rv:1.9.2) Gecko/20100115 Firefox/3.6',
    })
    .crawl({
        url: 'https://www.google.com/search?q=' + searchTerm,
        success: function(page) {
            if(harvest(page.content)){
                if (page.url.indexOf('related:http') == -1 && 
                    page.url.indexOf('http://webcache.googleusercontent.com/') == -1 &&
                    page.url.indexOf('google.com/') == -1 &&
                    page.url.indexOf('://www.youtube.com/') == -1
                    ){
                    searchResultUrls.push(page.url);
                }
                //searchResultUrls.push(page.url);
            };
            try {
                var query = URL.parse(page.url, true).query;
                if ('q' in query){
                    if (query.q.indexOf('http') != -1){
                        if (isMatchedURL(query.q)){
                            log.info('valid url found', {url:query.q, search:searchTerm});
                            searchResultUrls.push(query.q);
                        }
                    }
                }
            }
            catch(err){
                log.error('error with url parsing',{error: err, search:searchTerm});
            }
            log.info('success',{url: page.url, status: page.status, content: page.content.length, search: searchTerm});
        },
        failure: function(page) {
            log.warn('error with request', {url: page.url, status: page.status, content: page.error, search: searchTerm});
        },
        finished: function(crawledUrls) {
            console.log('Completed');
            console.log(searchResultUrls);
            searchTerm = searchTerm.replaceAll('+', ' ');
            results = {
                search: searchTerm,
                websites: searchResultUrls
            };
            fs.appendFile('valid_urls.json', JSON.stringify(results) + '\n');
        }
    });





/*
var log_file = 'crawl.log';
var stream = fs.createWriteStream(log_file);
stream.once('open', function(fd) {
    stream.write('url,length,status\n');
    stream.end();
});
*/

