// requires
var fs = require('fs');
var utils = require('utils');
var Casper = require('casper');

// variables
var url = 'http://www.powermatrixgame.com';

// functions
function login() {
    this.echo('login');
    this.fillSelectors('form#toplogin', { '#e_mail': 'Doctor', '#password': 'whoami' });

    return this.thenClick('input[name="submit_login"]', waitForLoading);
}

function waitForLoading() {
    this.echo('wait for loading…');
    return this.waitWhileSelector('#app_loading_screen', displayHighscore, null, 50000);
}

function displayHighscore() {
    this.echo('display highscore');
    this.thenClick('a#highscore_info');
    return this.waitUntilVisible('div#highscore_info a.page.first', goToFirstPage);
}

function goToFirstPage() {
    this.echo('go to first page');
    return this.thenClick('div#highscore_info a.page.first', parseProfiles);

}

function parseProfiles() {
    this.echo('parse profiles');
    return this.then(function() {
        this.evaluate(function() {
            var world_id,
                profile_links = Array.prototype.slice.call(document.querySelectorAll('td.profile_btn a'), 0);

            /**
             * Get world_id from element attributes.
             *
             * @param {Element} element with world_id attribute
             */
            function getWorldId(element) {
                var attribute,
                   attributes = element.attributes;

                for(var i=0 ; i < attributes.length ; i++) {
                    attribute = attributes[i];
                    if (attribute['name'] === 'user' || attribute['name'] === 'worldid') {
                        return attribute['value'];
                    }
                }
            }

            for(var p=0 ; p < profile_links.length ; p++) {
                world_id = getWorldId.call(this, profile_links[p]);
                console.log(world_id);
            }
        });

        return this.echo('Fin.');
    });
}

function process() {
    login.call(this);
}




// initialize casper
var casper = Casper.create({
    verbose: true,
    // waitTimeout: 50000,
    // logLevel: 'debug',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/28.0.1500.71 Chrome/28.0.1500.71 Safari/537.36',
    viewportSize: {width: 1600, height: 900},
    pageSettings: {
        loadImages:  false,         // The WebPage instance used by Casper will
        loadPlugins: false,         // use these settings
    }
});

casper.on('remote.message', function(msg) {
    this.echo(msg);
});

casper.on('page.error', function(msg, trace) {
    this.echo('Page Error: ' + msg, 'ERROR');
});

casper.start(url, function() {
    this.echo("Starting");
})

casper.then(process);

casper.run();



// var wsurl = url + '/my/last_updated'
// var data;

// casper.then(function() {
//     data = this.evaluate(function(wsurl) {
//         try {
//             return JSON.parse(__utils__.sendAJAX(wsurl, 'POST', null, false));
//         } catch (e) {
//         }
//     }, {wsurl: wsurl});
// });

// casper.then(function() {
//     if (!data) {
//         this.die('unable to retrieve data');
//     }
//     this.echo('got data ' + utils.serialize(data));
// });
