// requires
var fs = require('fs');
var utils = require('utils');

// initialize casper
var casper = require('casper').create({
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

// variables
var url = 'http://www.powermatrixgame.com';


// print out all the messages in the headless browser context
casper.on('remote.message', function(msg) {
    this.echo(msg);
});

// print out all the messages in the headless browser context
casper.on('page.error', function(msg, trace) {
    this.echo('Page Error: ' + msg, 'ERROR');
});


function login() {
    console.log('login');
    this.fillSelectors('form#toplogin', { '#e_mail': 'Doctor', '#password': 'whoami' });

    return this.thenClick('input[name="submit_login"]', function() {
        return waitForLoading.call(this)
    });
}

function waitForLoading() {
    console.log('wait for loading…');
    return this.waitWhileSelector('#app_loading_screen', function() {
        console.log("app loaded");
        return displayHighscore.call(this);
    }, null, 50000);
}

function displayHighscore() {
    console.log('display highscore');
    return this.thenClick('a#highscore_info', function() {
        return this.waitUntilVisible('div#highscore_info a.page.first', function() {
            return goToFirstPage.call(this);
        });
    });
}

function goToFirstPage() {
    console.log('go to first page');
    return this.thenClick('div#highscore_info a.page.first', function() {
        return parseProfiles.call(this);
    });

}

function parseProfiles() {
    console.log('parse profiles');
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

casper.start(url, function() {
    this.echo("Starting");
})

casper.then(process);

casper.run();



// casper.then(function() {

//     // console.log(profile_link.user);
//     // this.thenClick('a[user=' + profile_link.user + ']', function() {
//     //     console.log(this.getHTML('h1#user_name'));
//     // });
// });


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

casper.run();
