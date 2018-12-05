function launchWebkitApproach (url, fallback, isDebug) {
  document.location = url
  setTimeout(function () {
    if (isDebug) {
      alert('DEBUG: Webkit approach failed, redirecting to fallback url.')
    }
    document.location = fallback
  }, 5000)
}
function launchIntentApproach (urls, isDebug) {
  document.location = urls.android_intent
  setTimeout(function () {
    if (isDebug) {
      alert('DEBUG: Intent approach failed, redirecting to fallback url.')
    }
    window.location = urls.fallback
  }, 5000)
}
function launchIframeApproach (url, fallback, isDebug) {
  var iframe = document.createElement('iframe')
  iframe.style.border = 'none'
  iframe.style.width = '1px'
  iframe.style.height = '1px'
  iframe.onload = function () {
    document.location = url
  }
  iframe.src = url

  window.onload = function () {
    document.body.appendChild(iframe)

    setTimeout(function () {
      if (isDebug) {
        alert('DEBUG: Iframe approach failed, redirecting to fallback url.')
      }
      window.location = fallback
    }, 5000)
  }
}
function iosLaunch (urls, isDebug) {
  if (checkUa.isChromeOrSafari9Plus()) {
    if (isDebug) {
      alert('DEBUG: Chrome or new Safari browser detected, trying webkit approach.')
    }
    launchWebkitApproach(urls.deepLink, urls.iosStoreLink || urls.fallback, isDebug)
    return
  }
  if (isDebug) {
    alert('DEBUG: No Chrome or old Safari browser detected, trying iframe approach.')
  }
  launchIframeApproach(urls.deepLink, urls.iosStoreLink || urls.fallback, isDebug)
}
function androidLaunch (urls, isDebug) {
  if (checkUa.isChrome()) {
    if (isDebug) {
      alert('DEBUG: Detected Chrome browser, trying intent approach.')
    }
    launchIntentApproach(urls, isDebug)
    return
  }
  if (checkUa.isFirefox()) {
    if (isDebug) {
      alert('DEBUG: Detected Firefox browser, trying webkit approach.')
    }
    launchWebkitApproach(urls.deepLink, urls.playStoreLink || urls.fallback, isDebug)
    return
  }
  if (isDebug) {
    alert('DEBUG: No Chrome or Firefox browser detected, trying iframe approach.')
  }
  launchIframeApproach(urls.deepLink, urls.playStoreLink || urls.fallback, isDebug)
}
var checkUa = {
  isAndroid: function () {
    return /Android/i.test(window.navigator.userAgent)
  },
  isIos: function () {
    return /iPhone|iPad|iPod/i.test(window.navigator.userAgent)
  },
  isChromeOs: function () {
    return /CrOS/i.test(window.navigator.userAgent)
  },
  isChrome: function () {
    return window.navigator.userAgent.match(/Chrome/)
  },
  isFirefox: function () {
    return window.navigator.userAgent.match(/Firefox/)
  },
  isChromeOrSafari9Plus: function () {
    var ua = window.navigator.userAgent

    return ua.match(/CriOS/) ||
      (ua.match(/Safari/) && ua.match(/Version\/(9|10|11|12|13|14|15|16|17|18|19)/))
  }
}
function createIntentLink (url, androidPackageName) {
  var split = url.split(/:\/\/(.+)/)
  var scheme = split[0]
  var path = split[1] || ''

  return 'intent://' + path + '#Intent;scheme=' + scheme + ';package=' + androidPackageName + ';end;'
}
function deepLink (options) {
  var fallback = options.fallback || ''
  var url = options.url || ''
  var iosStoreLink = options.ios_store_link
  var androidPackageName = options.android_package_name
  var playStoreLink = 'https://market.android.com/details?id=' + androidPackageName
  var isDebug = url.indexOf('mfg.test.08') >= 0

  var urls = {
    deepLink: url,
    iosStoreLink: iosStoreLink,
    android_intent: createIntentLink(url, androidPackageName),
    playStoreLink: playStoreLink,
    fallback: fallback
  }
  if (isDebug) {
    alert('DEBUG: checking if iOS or Android.')
  }
  // fallback to the application store on mobile devices
  if (checkUa.isIos()) {
    if (isDebug) {
      alert('DEBUG: iOS platform detected.')
    }
    return iosLaunch(urls, isDebug)
  }
  if (checkUa.isAndroid() || checkUa.isChromeOs()) {
    if (isDebug) {
      alert('DEBUG: Android or ChromeOS platform detected.')
    }
    return androidLaunch(urls, isDebug)
  }
  if (isDebug) {
    alert('DEBUG: iOS or Android not detected. Redirecting to fallback url.')
  }
  window.location = urls.fallback
}
// expose module so it can be required later in tests
if (typeof module !== 'undefined') {
  module.exports = deepLink
}
