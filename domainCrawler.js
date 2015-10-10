/**
 * Source:
 *      https://github.com/cgiffard/node-simplecrawler
 * 
 * Description:
 *      Crawls single domain
 *
 * Usage:
 *      node simple.js http://www.moonshadowmobile.com/ http://www.l2political.com/
 */


var Crawler = require("simplecrawler");

var args = process.argv.slice(2);

var crawlers = {};

function objDetails(obj){
    for (var i in obj){
        console.log(i);
    }
}


completed = 0;

for (var i = 0; i < args.length; i++) {
    crawlers[args[i]] = Crawler.crawl(args[i]);
    crawlers[args[i]].interval = 500;		// 0.5 sec
    crawlers[args[i]].maxConcurrency = 1;
    crawlers[args[i]].maxDepth = 2;
    crawlers[args[i]].on("fetchcomplete", function(queueItem, responseBuffer, response) {
        console.log(this.host, "I just received %s (%d bytes)", queueItem.url, responseBuffer.length);
        console.log(this.host, "It was a resource of type %s", response.headers['content-type']);
        // Do something with the data in responseBuffer
        //console.log(this.host, "The maximum request latency was %dms.", crawler.queue.max("requestLatency"));
    });
    crawlers[args[i]].on("crawlstart", function() {console.log("crawling...");});
    crawlers[args[i]].on("complete", function() {
        completed += 1;
        if (completed == crawlers.length) {
            process.exit();
        }
    });
}





// Freeze queue
function freeze(){
    crawler.queue.freeze("mysavedqueue.json", function() {
        process.exit();
    });
}
// Defrost queue
function defrost(){
    crawler.queue.defrost("mysavedqueue.json");
}


