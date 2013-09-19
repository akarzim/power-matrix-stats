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
  @thenClick 'div#highscore_info a.page.first', waitForFirstRank

waitForFirstRank = ->
  @echo 'wait for first rank…'
  @waitFor checkFirstRank, parseProfiles

checkFirstRank = ->
  @evaluate ->
    !!~ (rank.innerText for rank in document.querySelectorAll('td.rank span')).indexOf '1'

parseProfiles = ->
  @echo 'parse profiles'
  users = []
  @then ->
    users = @evaluate ->
      flatten = (a) ->
        if a.length is 0 then return []
        a.reduce (lhs, rhs) -> lhs.concat rhs

      getAttributeByName = (names) ->
        attrs = flatten [names]

        for attribute in @attributes
          return attribute['value'] if !!~ attrs.indexOf(attribute['name'])

      getWorldId = ->
        getAttributeByName.call(@, ['user', 'worldid'])

      getToken = ->
        getAttributeByName.call(@, 'token')

      profile_links = Array::slice.call(document.querySelectorAll('td.profile_btn a'), 0)
      ({
        world_id: getWorldId.call(profile_link),
        token: getToken.call(profile_link)
      } for profile_link in profile_links)

    @eachThen users, (user) ->
      getProfile.call(@, user.data)

    @eachThen users, (user) ->
      getWorldAchievement.call(@, user.data)

  @then ->
    @echo 'Fin.'

parseAjaxJSON = (_wsurl, _verb, _params) ->
  @evaluate (wsurl, verb, params) ->
    verb ?= 'POST'

    try
      JSON.parse __utils__.sendAJAX(wsurl, verb, params, false)
    catch error
      console.log error, 'ERROR'
      null
  , _wsurl, _verb, _params

getProfile = (user) ->
  wsurl =  url + '/their/get_profile'
  data = parseAjaxJSON.call(@, wsurl, 'POST', user)
  @echo 'got profile data ' + utils.serialize(data)

getWorldAchievement = (user) ->
  wsurl =  url + '/worldachievement/list_all'
  data = parseAjaxJSON.call(@, wsurl, 'POST', user)
  @echo 'got world achievement data ' + utils.serialize(data)

process = ->
  login.call @




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
