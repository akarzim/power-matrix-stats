# requires
fs = require('fs')
utils = require('utils')
Casper = require('casper')

# variables
url = 'http://www.powermatrixgame.com'

# functions
login = ->
  @echo 'login'
  @fillSelectors 'form#toplogin',
    '#e_mail': 'Doctor'
    '#password': 'whoami'

  @thenClick 'input[name="submit_login"]', waitForLoading

waitForLoading = ->
  @echo 'wait for loading…'
  @waitWhileSelector '#app_loading_screen', displayHighscore, null, 50000

displayHighscore = ->
  @echo 'display highscore'
  @thenClick 'a#highscore_info', ->
    @waitUntilVisible 'div#highscore_info a.page.first', goToFirstPage

goToFirstPage = ->
  @echo 'go to first page'
  @thenClick 'div#highscore_info a.page.first', parseProfiles

parseProfiles = ->
  @echo 'parse profiles'
  @then ->
    @evaluate ->

      ###
      Get world_id from element attributes.

      @param {Element} element with world_id attribute
      ###
      getWorldId = (element) ->
        attribute = undefined
        attributes = element.attributes
        i = 0

        while i < attributes.length
          attribute = attributes[i]
          return attribute['value'] if attribute['name'] in ['user', 'worldid']
          i++

      world_id = undefined
      profile_links = Array::slice.call(document.querySelectorAll('td.profile_btn a'), 0)
      p = 0

      while p < profile_links.length
        world_id = getWorldId.call(this, profile_links[p])
        console.log world_id
        p++

    @echo 'Fin.'

process = ->
  login.call this




casper = Casper.create(
  verbose: true
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/28.0.1500.71 Chrome/28.0.1500.71 Safari/537.36'
  viewportSize:
    width: 1600
    height: 900

  pageSettings:
    loadImages: false
    loadPlugins: false
)


casper.on 'remote.message', (msg) ->
  @echo msg

casper.on 'page.error', (msg, trace) ->
  @echo 'Page Error: ' + msg, 'ERROR'



casper.start url, ->
  @echo 'Starting'

casper.then process
casper.run()
