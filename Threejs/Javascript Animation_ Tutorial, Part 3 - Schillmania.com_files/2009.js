(function(){
	if (self.location != top.location) {
	  var r = document.referrer;
	  if (!r.match(/google\.com/i) && !r.match(/yahoo\.com/i)) {
		top.location = self.location;
	  }	
	};
})();

var Y = {
 // shortcuts
 A: YAHOO.util.Anim,
 D: YAHOO.util.Dom,
 E: YAHOO.util.Event,
 UE: YAHOO.util.Easing,
 CA: YAHOO.util.ColorAnim,
 BG: YAHOO.util.BgPosAnim
}

// Content Manager - reused from 2004 edition onward

var nAV = navigator.appVersion.toLowerCase();
var nUA = navigator.userAgent.toLowerCase();
var nP = navigator.platform.toLowerCase();
var isIE = nAV.match(/msie/i);
var isOldIE = nAV.match(/msie [5,6]/i);
var isNewerIE = (isIE && !isOldIE);
var isSafari = nUA.match(/safari/i);

// vintage Arkanoid data
var lN = [];
var lnOffset = 0;

_uacct = "UA-3081630-1";

var _re = null;
var _IS_DEV = (!document.domain.match(/schillmania.com/i));

if (!_IS_DEV && typeof urchinTracker != 'undefined') {
  try {
    urchinTracker();
  } catch(e) {
    // oh well
  }
}

function $(sID) { return document.getElementById(sID); }

function removeChildNodes(o) {
  // remove children from bottom up
  var nodes = o.childNodes;
  if (!nodes || !o) {
    return false;
  }
  for (var i=nodes.length-1; i>=0; i--) {
    o.removeChild(nodes[i]);
  }
}

function counterLoad() {
  runCounter();
}

function counterReadyState() {
  if (this.readyState == 'loaded' || this.readyState == 'complete') runCounter();
}

function runCounter() {
  if (_re) {
    _re.onload = null;
    _re.onreadystatechange = null;
  }
  if (typeof urchinTracker != 'undefined') urchinTracker();
  setTimeout(function(){if (typeof window.re_ != 'undefined') {window.re_('47064-bd3p5901pd');}},500);
}

function doCounter() {
  if (_IS_DEV) return false;
  if (APP_XHTML && isSafari) {
    // can't get this crap working. Throws "undefined value, line 249" error when served as application/xhtml+xml to Safari 3.
    // return false;
  }
 /*
  try {
    _re = document.createElement('script');
    _re.onload = counterLoad;
    _re.onreadystatechange = counterReadyState;
    _re.onReadyStateChange = counterReadyState;
    _re.src = 'http://include.reinvigorate.net/re_.js';
    document.getElementsByTagName('head')[0].appendChild(_re);
  } catch(e) {
    // oh well
  }
  */
  // if (isSafari) setTimeout(runCounter,1500);
}

function getXHR() {
  var xhr = null;
  if (typeof window.XMLHttpRequest != 'undefined') {
    try {
      xhr = new XMLHttpRequest();
    } catch(e) {
      // d'oh
    }
  }
  if (!xhr) {
    try {
      xhr = new ActiveXObject('Msxml2.XMLHTTP');
    } catch(e) {
      try {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
      } catch(E) {
        xhr = null;
      }
    }
  }
  return xhr;
}

function ContentManager() {
  var self = this;
  this.xmlhttp = getXHR();
  this.oLast = null;
  this.url = null;

  this.readystatechangeHandler = function() {
    if (self.xmlhttp.readyState == 4) {
      if (self.onloadHandler) {
        self.onloadHandler();
      }
    }
  }

  this.load = function(url) {

    url = (url.href||url.toString());
    self.url = url;
    if (url.indexOf('.xml')>=0 || (url.indexOf('webpad')>=0) || (url.indexOf('theme=')!=-1)) return true;
    if (url.indexOf('react/contact')+1 && APP_XHTML) return true; // script here will fail otherwise
    if (url.indexOf('?')!=-1) return true;
    if (url.indexOf('#')>=0) {
      return false;
    }
    if (url.match(/what-i-did/i) || url.match(/yahoo-photos-frontend/i)) {
      // special case, uses SM2 + video - needs full page load
      return true;
    }
    // haaaack
    url = url.replace('../','');
    // url = url.replace('schillmania-dev/','');
    if (self.xmlhttp) {
      try {
        target = $('entry-content');
        url = url.toString();
        if (APP_XHTML||(window.location.href.indexOf('test')>=0)) {
          file = '?xml=true&r='+parseInt(Math.random()*1048576);
        } else {
          file = 'content.html';
        }
        self.xmlhttp.open('GET',url+file,true);
        self.xmlhttp.onreadystatechange = self.readystatechangeHandler;
        self.xmlhttp.setRequestHeader('Content-Type', 'text/xml');
        self.xmlhttp.send(null); // xmlDoc
      } catch(e) {
        // something blew up - d'oh!
        // console.log('contentManager.load(): error @ '+e.lineNumber+','+e.message);
        return true;
      }
    } else {
      // no XMLHTTP support.
      return true;
    }
    return false;
  }

  this.onloadHandler = function() {
    // if (soundManager) soundManager.play('b4');
    var _title = null;
    c = $('entry-content');
    if (APP_XHTML==true && self.xmlhttp.responseXML) { // safety net: ensure valid XML response.. otherwise, try dirty innerHTML method (may fail)
      removeChildNodes(c);
      c.appendChild(document.importNode(self.xmlhttp.responseXML.documentElement.getElementsByTagName('div')[0],true));
      // _title = self.getInnerText(self.xmlhttp.responseXML.documentElement.getElementsByTagName('h1')[0]);
    } else {
      // Internet explorer etc. get to do it the non-standards way
      try {
        var sData = self.xmlhttp.responseText;
        c.innerHTML = '';
        c.innerHTML = sData;
      } catch(e) {
        window.location = self.url;
        return false;
      }
    }
    try {
      if (_title) document.title = _title+ ' - Schillmania.com';
    } catch(e) {
      // oh well
    }
    runCounter();
  }

  this.getInnerText = function(o) {
    if (o.nodeType == 3 || o.nodeType == 4) return o.data;
    var sText = [];
    for (var i=0; i<o.childNodes.length; i++) {
      sText[sText.length] = self.getInnerText(o.childNodes[i]);
    }
    return sText.join('');
  }

  this.assignHandlers = function() {
    // intercept onclick and load via XMLHTTP where supported
    var o = $('nav-list');
    o.onclick = function(e) {
      var oEl = e?e.target:event.srcElement;
      if (oEl.nodeName.toLowerCase() == 'a') return self.clickHandler.apply(oEl);
    }
  }

  this.lastNavItem = null;

  this.clickHandler = function() {
    var o = this;
    if (o.href.indexOf('#'+o._class)==-1) {
      o.parentNode.className = 'selected';
      if (self.lastSelected && self.lastSelected != o.parentNode) {
        self.lastSelected.className = '';
      }
      self.lastSelected = o.parentNode;
    }
    try {
      // ensure focus..
      o.focus();
    } catch(e) {
      // just in case
    }
    if (o.toString().indexOf('#')==-1) {
      try {
        document.title = self.getInnerText(this.parentNode)+' - Schillmania.com';
      } catch(e) {
        // oh well
      }
    }
    return self.load(o);
  }

}

var contentManager = new ContentManager();

/** @license
 *
 * SoundManager 2: JavaScript Sound for the Web
 * ----------------------------------------------
 * http://schillmania.com/projects/soundmanager2/
 *
 * Copyright (c) 2007, Scott Schiller. All rights reserved.
 * Code provided under the BSD License:
 * http://schillmania.com/projects/soundmanager2/license.txt
 *
 * V2.97a.20111220
 */

/*global window, SM2_DEFER, sm2Debugger, console, document, navigator, setTimeout, setInterval, clearInterval, Audio */
/* jslint regexp: true, sloppy: true, white: true, nomen: true, plusplus: true */

/**
 * About this file
 * ---------------
 * This is the fully-commented source version of the SoundManager 2 API,
 * recommended for use during development and testing.
 *
 * See soundmanager2-nodebug-jsmin.js for an optimized build (~10KB with gzip.)
 * http://schillmania.com/projects/soundmanager2/doc/getstarted/#basic-inclusion
 * Alternately, serve this file with gzip for 75% compression savings (~30KB over HTTP.)
 *
 * You may notice <d> and </d> comments in this source; these are delimiters for
 * debug blocks which are removed in the -nodebug builds, further optimizing code size.
 *
 * Also, as you may note: Whoa, reliable cross-platform/device audio support is hard! ;)
 */

(function(window) {

var soundManager = null;

/**
 * The SoundManager constructor.
 *
 * @constructor
 * @param {string} smURL Optional: Path to SWF files
 * @param {string} smID Optional: The ID to use for the SWF container element
 * @this {SoundManager}
 * @return {SoundManager} The new SoundManager instance
 */

function SoundManager(smURL, smID) {

  // Top-level configuration options

  this.flashVersion = 8;             // flash build to use (8 or 9.) Some API features require 9.
  this.debugMode = true;             // enable debugging output (console.log() with HTML fallback)
  this.debugFlash = false;           // enable debugging output inside SWF, troubleshoot Flash/browser issues
  this.useConsole = true;            // use console.log() if available (otherwise, writes to #soundmanager-debug element)
  this.consoleOnly = true;           // if console is being used, do not create/write to #soundmanager-debug
  this.waitForWindowLoad = false;    // force SM2 to wait for window.onload() before trying to call soundManager.onload()
  this.bgColor = '#ffffff';          // SWF background color. N/A when wmode = 'transparent'
  this.useHighPerformance = false;   // position:fixed flash movie can help increase js/flash speed, minimize lag
  this.flashPollingInterval = null;  // msec affecting whileplaying/loading callback frequency. If null, default of 50 msec is used.
  this.html5PollingInterval = null;  // msec affecting whileplaying() for HTML5 audio, excluding mobile devices. If null, native HTML5 update events are used.
  this.flashLoadTimeout = 1000;      // msec to wait for flash movie to load before failing (0 = infinity)
  this.wmode = null;                 // flash rendering mode - null, 'transparent', or 'opaque' (last two allow z-index to work)
  this.allowScriptAccess = 'always'; // for scripting the SWF (object/embed property), 'always' or 'sameDomain'
  this.useFlashBlock = false;        // *requires flashblock.css, see demos* - allow recovery from flash blockers. Wait indefinitely and apply timeout CSS to SWF, if applicable.
  this.useHTML5Audio = true;         // use HTML5 Audio() where API is supported (most Safari, Chrome versions), Firefox (no MP3/MP4.) Ideally, transparent vs. Flash API where possible.
  this.html5Test = /^(probably|maybe)$/i; // HTML5 Audio() format support test. Use /^probably$/i; if you want to be more conservative.
  this.preferFlash = true;           // overrides useHTML5audio. if true and flash support present, will try to use flash for MP3/MP4 as needed since HTML5 audio support is still quirky in browsers.
  this.noSWFCache = false;           // if true, appends ?ts={date} to break aggressive SWF caching.

  this.audioFormats = {

    /**
     * determines HTML5 support + flash requirements.
     * if no support (via flash and/or HTML5) for a "required" format, SM2 will fail to start.
     * flash fallback is used for MP3 or MP4 if HTML5 can't play it (or if preferFlash = true)
     * multiple MIME types may be tested while trying to get a positive canPlayType() response.
     */

    'mp3': {
      'type': ['audio/mpeg; codecs="mp3"', 'audio/mpeg', 'audio/mp3', 'audio/MPA', 'audio/mpa-robust'],
      'required': true
    },

    'mp4': {
      'related': ['aac','m4a'], // additional formats under the MP4 container
      'type': ['audio/mp4; codecs="mp4a.40.2"', 'audio/aac', 'audio/x-m4a', 'audio/MP4A-LATM', 'audio/mpeg4-generic'],
      'required': false
    },

    'ogg': {
      'type': ['audio/ogg; codecs=vorbis'],
      'required': false
    },

    'wav': {
      'type': ['audio/wav; codecs="1"', 'audio/wav', 'audio/wave', 'audio/x-wav'],
      'required': false
    }

  };

  this.defaultOptions = {

    /**
     * the default configuration for sound objects made with createSound() and related methods
     * eg., volume, auto-load behaviour and so forth
     */

    'autoLoad': false,        // enable automatic loading (otherwise .load() will be called on demand with .play(), the latter being nicer on bandwidth - if you want to .load yourself, you also can)
    'autoPlay': false,        // enable playing of file as soon as possible (much faster if "stream" is true)
    'from': null,             // position to start playback within a sound (msec), default = beginning
    'loops': 1,               // how many times to repeat the sound (position will wrap around to 0, setPosition() will break out of loop when >0)
    'onid3': null,            // callback function for "ID3 data is added/available"
    'onload': null,           // callback function for "load finished"
    'whileloading': null,     // callback function for "download progress update" (X of Y bytes received)
    'onplay': null,           // callback for "play" start
    'onpause': null,          // callback for "pause"
    'onresume': null,         // callback for "resume" (pause toggle)
    'whileplaying': null,     // callback during play (position update)
    'onposition': null,       // object containing times and function callbacks for positions of interest
    'onstop': null,           // callback for "user stop"
    'onfailure': null,        // callback function for when playing fails
    'onfinish': null,         // callback function for "sound finished playing"
    'multiShot': true,        // let sounds "restart" or layer on top of each other when played multiple times, rather than one-shot/one at a time
    'multiShotEvents': false, // fire multiple sound events (currently onfinish() only) when multiShot is enabled
    'position': null,         // offset (milliseconds) to seek to within loaded sound data.
    'pan': 0,                 // "pan" settings, left-to-right, -100 to 100
    'stream': true,           // allows playing before entire file has loaded (recommended)
    'to': null,               // position to end playback within a sound (msec), default = end
    'type': null,             // MIME-like hint for file pattern / canPlay() tests, eg. audio/mp3
    'usePolicyFile': false,   // enable crossdomain.xml request for audio on remote domains (for ID3/waveform access)
    'volume': 100             // self-explanatory. 0-100, the latter being the max.

  };

  this.flash9Options = {

    /**
     * flash 9-only options,
     * merged into defaultOptions if flash 9 is being used
     */

    'isMovieStar': null,      // "MovieStar" MPEG4 audio mode. Null (default) = auto detect MP4, AAC etc. based on URL. true = force on, ignore URL
    'usePeakData': false,     // enable left/right channel peak (level) data
    'useWaveformData': false, // enable sound spectrum (raw waveform data) - NOTE: May increase CPU load.
    'useEQData': false,       // enable sound EQ (frequency spectrum data) - NOTE: May increase CPU load.
    'onbufferchange': null,   // callback for "isBuffering" property change
    'ondataerror': null       // callback for waveform/eq data access error (flash playing audio in other tabs/domains)

  };

  this.movieStarOptions = {

    /**
     * flash 9.0r115+ MPEG4 audio options,
     * merged into defaultOptions if flash 9+movieStar mode is enabled
     */

    'bufferTime': 3,          // seconds of data to buffer before playback begins (null = flash default of 0.1 seconds - if AAC playback is gappy, try increasing.)
    'serverURL': null,        // rtmp: FMS or FMIS server to connect to, required when requesting media via RTMP or one of its variants
    'onconnect': null,        // rtmp: callback for connection to flash media server
    'duration': null          // rtmp: song duration (msec)

  };

  // HTML attributes (id + class names) for the SWF container

  this.movieID = 'sm2-container';
  this.id = (smID || 'sm2movie');

  this.debugID = 'soundmanager-debug';
  this.debugURLParam = /([#?&])debug=1/i;

  // dynamic attributes

  this.versionNumber = 'V2.97a.20111220';
  this.version = null;
  this.movieURL = null;
  this.url = (smURL || null);
  this.altURL = null;
  this.swfLoaded = false;
  this.enabled = false;
  this.oMC = null;
  this.sounds = {};
  this.soundIDs = [];
  this.muted = false;
  this.didFlashBlock = false;
  this.filePattern = null;

  this.filePatterns = {

    'flash8': /\.mp3(\?.*)?$/i,
    'flash9': /\.mp3(\?.*)?$/i

  };

  // support indicators, set at init

  this.features = {

    'buffering': false,
    'peakData': false,
    'waveformData': false,
    'eqData': false,
    'movieStar': false

  };

  // flash sandbox info, used primarily in troubleshooting

  this.sandbox = {

    // <d>
    'type': null,
    'types': {
      'remote': 'remote (domain-based) rules',
      'localWithFile': 'local with file access (no internet access)',
      'localWithNetwork': 'local with network (internet access only, no local access)',
      'localTrusted': 'local, trusted (local+internet access)'
    },
    'description': null,
    'noRemote': null,
    'noLocal': null
    // </d>

  };

  /**
   * basic HTML5 Audio() support test
   * try...catch because of IE 9 "not implemented" nonsense
   * https://github.com/Modernizr/Modernizr/issues/224
   */

  this.hasHTML5 = (function() {
    try {
      return (typeof Audio !== 'undefined' && typeof new Audio().canPlayType !== 'undefined');
    } catch(e) {
      return false;
    }
  }());

  /**
   * format support (html5/flash)
   * stores canPlayType() results based on audioFormats.
   * eg. { mp3: boolean, mp4: boolean }
   * treat as read-only.
   */

  this.html5 = {
    'usingFlash': null // set if/when flash fallback is needed
  };

  this.flash = {}; // file type support hash

  this.html5Only = false;   // determined at init time
  this.ignoreFlash = false; // used for special cases (eg. iPad/iPhone/palm OS?)

  /**
   * a few private internals (OK, a lot. :D)
   */

  var SMSound,
  _s = this, _flash = null, _sm = 'soundManager', _smc = _sm+'::', _h5 = 'HTML5::', _id, _ua = navigator.userAgent, _win = window, _wl = _win.location.href.toString(), _doc = document, _doNothing, _init, _fV, _on_queue = [], _debugOpen = true, _debugTS, _didAppend = false, _appendSuccess = false, _didInit = false, _disabled = false, _windowLoaded = false, _wDS, _wdCount = 0, _initComplete, _mixin, _addOnEvent, _processOnEvents, _initUserOnload, _delayWaitForEI, _waitForEI, _setVersionInfo, _handleFocus, _strings, _initMovie, _domContentLoaded, _winOnLoad, _didDCLoaded, _getDocument, _createMovie, _catchError, _setPolling, _initDebug, _debugLevels = ['log', 'info', 'warn', 'error'], _defaultFlashVersion = 8, _disableObject, _failSafely, _normalizeMovieURL, _oRemoved = null, _oRemovedHTML = null, _str, _flashBlockHandler, _getSWFCSS, _swfCSS, _toggleDebug, _loopFix, _policyFix, _complain, _idCheck, _waitingForEI = false, _initPending = false, _smTimer, _onTimer, _startTimer, _stopTimer, _timerExecute, _h5TimerCount = 0, _h5IntervalTimer = null, _parseURL,
  _needsFlash = null, _featureCheck, _html5OK, _html5CanPlay, _html5Ext, _html5Unload, _domContentLoadedIE, _testHTML5, _event, _slice = Array.prototype.slice, _useGlobalHTML5Audio = false, _hasFlash, _detectFlash, _badSafariFix, _html5_events, _showSupport,
  _is_iDevice = _ua.match(/(ipad|iphone|ipod)/i), _is_firefox = _ua.match(/firefox/i), _is_android = _ua.match(/droid/i), _isIE = _ua.match(/msie/i), _isWebkit = _ua.match(/webkit/i), _isSafari = (_ua.match(/safari/i) && !_ua.match(/chrome/i)), _isOpera = (_ua.match(/opera/i)), 
  _likesHTML5 = (_ua.match(/(mobile|pre\/|xoom)/i) || _is_iDevice),
  _isBadSafari = (!_wl.match(/usehtml5audio/i) && !_wl.match(/sm2\-ignorebadua/i) && _isSafari && !_ua.match(/silk/i) && _ua.match(/OS X 10_6_([3-7])/i)), // Safari 4 and 5 (excluding Kindle Fire, "Silk") occasionally fail to load/play HTML5 audio on Snow Leopard 10.6.3 through 10.6.7 due to bug(s) in QuickTime X and/or other underlying frameworks. :/ Confirmed bug. https://bugs.webkit.org/show_bug.cgi?id=32159
  _hasConsole = (typeof console !== 'undefined' && typeof console.log !== 'undefined'), _isFocused = (typeof _doc.hasFocus !== 'undefined'?_doc.hasFocus():null), _tryInitOnFocus = (_isSafari && typeof _doc.hasFocus === 'undefined'), _okToDisable = !_tryInitOnFocus, _flashMIME = /(mp3|mp4|mpa)/i,
  _emptyURL = 'about:blank', // safe URL to unload, or load nothing from (flash 8 + most HTML5 UAs)
  _overHTTP = (_doc.location?_doc.location.protocol.match(/http/i):null),
  _http = (!_overHTTP ? 'http:/'+'/' : ''),
  // mp3, mp4, aac etc.
  _netStreamMimeTypes = /^\s*audio\/(?:x-)?(?:mpeg4|aac|flv|mov|mp4||m4v|m4a|mp4v|3gp|3g2)\s*(?:$|;)/i,
  // Flash v9.0r115+ "moviestar" formats
  _netStreamTypes = ['mpeg4', 'aac', 'flv', 'mov', 'mp4', 'm4v', 'f4v', 'm4a', 'mp4v', '3gp', '3g2'],
  _netStreamPattern = new RegExp('\\.(' + _netStreamTypes.join('|') + ')(\\?.*)?$', 'i');

  this.mimePattern = /^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i; // default mp3 set

  // use altURL if not "online"
  this.useAltURL = !_overHTTP;
  this._global_a = null;

  _swfCSS = {

    'swfBox': 'sm2-object-box',
    'swfDefault': 'movieContainer',
    'swfError': 'swf_error', // SWF loaded, but SM2 couldn't start (other error)
    'swfTimedout': 'swf_timedout',
    'swfLoaded': 'swf_loaded',
    'swfUnblocked': 'swf_unblocked', // or loaded OK
    'sm2Debug': 'sm2_debug',
    'highPerf': 'high_performance',
    'flashDebug': 'flash_debug'

  };

  if (_likesHTML5) {

    // prefer HTML5 for mobile + tablet-like devices, probably more reliable vs. flash at this point.
    _s.useHTML5Audio = true;
    _s.preferFlash = false;

    if (_is_iDevice) {
      // by default, use global feature. iOS onfinish() -> next may fail otherwise.
      _s.ignoreFlash = true;
      _useGlobalHTML5Audio = true;
    }

  }

  /**
   * Public SoundManager API
   * -----------------------
   */

  this.ok = function() {

    return (_needsFlash?(_didInit && !_disabled):(_s.useHTML5Audio && _s.hasHTML5));

  };

  this.supported = this.ok; // legacy

  this.getMovie = function(smID) {

    // safety net: some old browsers differ on SWF references, possibly related to ExternalInterface / flash version
    return _id(smID) || _doc[smID] || _win[smID];

  };

  /**
   * Creates a SMSound sound object instance.
   *
   * @param {object} oOptions Sound options (at minimum, id and url are required.)
   * @return {object} SMSound The new SMSound object.
   */

  this.createSound = function(oOptions) {

    var _cs, _cs_string,
    thisOptions = null, oSound = null, _tO = null;

    // <d>
    _cs = _sm+'.createSound(): ';
    _cs_string = _cs + _str(!_didInit?'notReady':'notOK');
    // </d>

    if (!_didInit || !_s.ok()) {
      _complain(_cs_string);
      return false;
    }

    if (arguments.length === 2) {
      // function overloading in JS! :) ..assume simple createSound(id,url) use case
      oOptions = {
        'id': arguments[0],
        'url': arguments[1]
      };
    }

    // inherit from defaultOptions
    thisOptions = _mixin(oOptions);

    thisOptions.url = _parseURL(thisOptions.url);

    // local shortcut
    _tO = thisOptions;

    // <d>
    if (_tO.id.toString().charAt(0).match(/^[0-9]$/)) {
      _s._wD(_cs + _str('badID', _tO.id), 2);
    }

    _s._wD(_cs + _tO.id + ' (' + _tO.url + ')', 1);
    // </d>

    if (_idCheck(_tO.id, true)) {
      _s._wD(_cs + _tO.id + ' exists', 1);
      return _s.sounds[_tO.id];
    }

    function make() {

      thisOptions = _loopFix(thisOptions);
      _s.sounds[_tO.id] = new SMSound(_tO);
      _s.soundIDs.push(_tO.id);
      return _s.sounds[_tO.id];

    }

    if (_html5OK(_tO)) {

      oSound = make();
      _s._wD('Loading sound '+_tO.id+' via HTML5');
      oSound._setup_html5(_tO);

    } else {

      if (_fV > 8) {
        if (_tO.isMovieStar === null) {
          // attempt to detect MPEG-4 formats
          _tO.isMovieStar = (_tO.serverURL || (_tO.type ? _tO.type.match(_netStreamMimeTypes) : false) || _tO.url.match(_netStreamPattern));
        }
        // <d>
        if (_tO.isMovieStar) {
          _s._wD(_cs + 'using MovieStar handling');
        }
        // </d>
        if (_tO.isMovieStar) {
          if (_tO.usePeakData) {
            _wDS('noPeak');
            _tO.usePeakData = false;
          }
          // <d>
          if (_tO.loops > 1) {
            _wDS('noNSLoop');
          }
          // </d>
        }
      }

      _tO = _policyFix(_tO, _cs);
      oSound = make();

      if (_fV === 8) {
        _flash._createSound(_tO.id, _tO.loops||1, _tO.usePolicyFile);
      } else {
        _flash._createSound(_tO.id, _tO.url, _tO.usePeakData, _tO.useWaveformData, _tO.useEQData, _tO.isMovieStar, (_tO.isMovieStar?_tO.bufferTime:false), _tO.loops||1, _tO.serverURL, _tO.duration||null, _tO.autoPlay, true, _tO.autoLoad, _tO.usePolicyFile);
        if (!_tO.serverURL) {
          // We are connected immediately
          oSound.connected = true;
          if (_tO.onconnect) {
            _tO.onconnect.apply(oSound);
          }
        }
      }

      if (!_tO.serverURL && (_tO.autoLoad || _tO.autoPlay)) {
        // call load for non-rtmp streams
        oSound.load(_tO);
      }

    }

    // rtmp will play in onconnect
    if (!_tO.serverURL && _tO.autoPlay) {
      oSound.play();
    }

    return oSound;

  };

  /**
   * Destroys a SMSound sound object instance.
   *
   * @param {string} sID The ID of the sound to destroy
   */

  this.destroySound = function(sID, _bFromSound) {

    // explicitly destroy a sound before normal page unload, etc.

    if (!_idCheck(sID)) {
      return false;
    }

    var oS = _s.sounds[sID], i;

    // Disable all callbacks while the sound is being destroyed
    oS._iO = {};

    oS.stop();
    oS.unload();

    for (i = 0; i < _s.soundIDs.length; i++) {
      if (_s.soundIDs[i] === sID) {
        _s.soundIDs.splice(i, 1);
        break;
      }
    }

    if (!_bFromSound) {
      // ignore if being called from SMSound instance
      oS.destruct(true);
    }

    oS = null;
    delete _s.sounds[sID];

    return true;

  };

  /**
   * Calls the load() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {object} oOptions Optional: Sound options
   */

  this.load = function(sID, oOptions) {

    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].load(oOptions);

  };

  /**
   * Calls the unload() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   */

  this.unload = function(sID) {

    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].unload();

  };

  /**
   * Calls the onPosition() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nPosition The position to watch for
   * @param {function} oMethod The relevant callback to fire
   * @param {object} oScope Optional: The scope to apply the callback to
   * @return {SMSound} The SMSound object
   */

  this.onPosition = function(sID, nPosition, oMethod, oScope) {

    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].onposition(nPosition, oMethod, oScope);

  };

  // legacy/backwards-compability: lower-case method name
  this.onposition = this.onPosition;

  /**
   * Calls the clearOnPosition() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nPosition The position to watch for
   * @param {function} oMethod Optional: The relevant callback to fire
   * @return {SMSound} The SMSound object
   */

  this.clearOnPosition = function(sID, nPosition, oMethod) {

    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].clearOnPosition(nPosition, oMethod);

  };

  /**
   * Calls the play() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {object} oOptions Optional: Sound options
   * @return {SMSound} The SMSound object
   */

  this.play = function(sID, oOptions) {

    if (!_didInit || !_s.ok()) {
      _complain(_sm+'.play(): ' + _str(!_didInit?'notReady':'notOK'));
      return false;
    }

    if (!_idCheck(sID)) {
      if (!(oOptions instanceof Object)) {
        // overloading use case: play('mySound','/path/to/some.mp3');
        oOptions = {
          url: oOptions
        };
      }
      if (oOptions && oOptions.url) {
        // overloading use case, create+play: .play('someID',{url:'/path/to.mp3'});
        _s._wD(_sm+'.play(): attempting to create "' + sID + '"', 1);
        oOptions.id = sID;
        return _s.createSound(oOptions).play();
      } else {
        return false;
      }
    }

    return _s.sounds[sID].play(oOptions);

  };

  this.start = this.play; // just for convenience

  /**
   * Calls the setPosition() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nMsecOffset Position (milliseconds)
   * @return {SMSound} The SMSound object
   */

  this.setPosition = function(sID, nMsecOffset) {

    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].setPosition(nMsecOffset);

  };

  /**
   * Calls the stop() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.stop = function(sID) {

    if (!_idCheck(sID)) {
      return false;
    }

    _s._wD(_sm+'.stop(' + sID + ')', 1);
    return _s.sounds[sID].stop();

  };

  /**
   * Stops all currently-playing sounds.
   */

  this.stopAll = function() {

    var oSound;
    _s._wD(_sm+'.stopAll()', 1);

    for (oSound in _s.sounds) {
      if (_s.sounds.hasOwnProperty(oSound)) {
        // apply only to sound objects
        _s.sounds[oSound].stop();
      }
    }

  };

  /**
   * Calls the pause() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.pause = function(sID) {

    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].pause();

  };

  /**
   * Pauses all currently-playing sounds.
   */

  this.pauseAll = function() {

    var i;
    for (i = _s.soundIDs.length; i--;) {
      _s.sounds[_s.soundIDs[i]].pause();
    }

  };

  /**
   * Calls the resume() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.resume = function(sID) {

    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].resume();

  };

  /**
   * Resumes all currently-paused sounds.
   */

  this.resumeAll = function() {

    var i;
    for (i = _s.soundIDs.length; i--;) {
      _s.sounds[_s.soundIDs[i]].resume();
    }

  };

  /**
   * Calls the togglePause() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.togglePause = function(sID) {

    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].togglePause();

  };

  /**
   * Calls the setPan() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nPan The pan value (-100 to 100)
   * @return {SMSound} The SMSound object
   */

  this.setPan = function(sID, nPan) {

    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].setPan(nPan);

  };

  /**
   * Calls the setVolume() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nVol The volume value (0 to 100)
   * @return {SMSound} The SMSound object
   */

  this.setVolume = function(sID, nVol) {

    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].setVolume(nVol);

  };

  /**
   * Calls the mute() method of either a single SMSound object by ID, or all sound objects.
   *
   * @param {string} sID Optional: The ID of the sound (if omitted, all sounds will be used.)
   */

  this.mute = function(sID) {

    var i = 0;

    if (typeof sID !== 'string') {
      sID = null;
    }

    if (!sID) {
      _s._wD(_sm+'.mute(): Muting all sounds');
      for (i = _s.soundIDs.length; i--;) {
        _s.sounds[_s.soundIDs[i]].mute();
      }
      _s.muted = true;
    } else {
      if (!_idCheck(sID)) {
        return false;
      }
      _s._wD(_sm+'.mute(): Muting "' + sID + '"');
      return _s.sounds[sID].mute();
    }

    return true;

  };

  /**
   * Mutes all sounds.
   */

  this.muteAll = function() {

    _s.mute();

  };

  /**
   * Calls the unmute() method of either a single SMSound object by ID, or all sound objects.
   *
   * @param {string} sID Optional: The ID of the sound (if omitted, all sounds will be used.)
   */

  this.unmute = function(sID) {

    var i;

    if (typeof sID !== 'string') {
      sID = null;
    }

    if (!sID) {

      _s._wD(_sm+'.unmute(): Unmuting all sounds');
      for (i = _s.soundIDs.length; i--;) {
        _s.sounds[_s.soundIDs[i]].unmute();
      }
      _s.muted = false;

    } else {

      if (!_idCheck(sID)) {
        return false;
      }
      _s._wD(_sm+'.unmute(): Unmuting "' + sID + '"');
      return _s.sounds[sID].unmute();

    }

    return true;

  };

  /**
   * Unmutes all sounds.
   */

  this.unmuteAll = function() {

    _s.unmute();

  };

  /**
   * Calls the toggleMute() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.toggleMute = function(sID) {

    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].toggleMute();

  };

  /**
   * Retrieves the memory used by the flash plugin.
   *
   * @return {number} The amount of memory in use
   */

  this.getMemoryUse = function() {

    // flash-only
    var ram = 0;

    if (_flash && _fV !== 8) {
      ram = parseInt(_flash._getMemoryUse(), 10);
    }

    return ram;

  };

  /**
   * Undocumented: NOPs soundManager and all SMSound objects.
   */

  this.disable = function(bNoDisable) {

    // destroy all functions
    var i;

    if (typeof bNoDisable === 'undefined') {
      bNoDisable = false;
    }

    if (_disabled) {
      return false;
    }

    _disabled = true;
    _wDS('shutdown', 1);

    for (i = _s.soundIDs.length; i--;) {
      _disableObject(_s.sounds[_s.soundIDs[i]]);
    }

    // fire "complete", despite fail
    _initComplete(bNoDisable);
    _event.remove(_win, 'load', _initUserOnload);

    return true;

  };

  /**
   * Determines playability of a MIME type, eg. 'audio/mp3'.
   */

  this.canPlayMIME = function(sMIME) {

    var result;

    if (_s.hasHTML5) {
      result = _html5CanPlay({type:sMIME});
    }

    if (!_needsFlash || result) {
      // no flash, or OK
      return result;
    } else {
      // if flash 9, test netStream (movieStar) types as well.
      return (sMIME ? !!((_fV > 8 ? sMIME.match(_netStreamMimeTypes) : null) || sMIME.match(_s.mimePattern)) : null);
    }

  };

  /**
   * Determines playability of a URL based on audio support.
   *
   * @param {string} sURL The URL to test
   * @return {boolean} URL playability
   */

  this.canPlayURL = function(sURL) {

    var result;

    if (_s.hasHTML5) {
      result = _html5CanPlay({url: sURL});
    }

    if (!_needsFlash || result) {
      // no flash, or OK
      return result;
    } else {
      return (sURL ? !!(sURL.match(_s.filePattern)) : null);
    }

  };

  /**
   * Determines playability of an HTML DOM &lt;a&gt; object (or similar object literal) based on audio support.
   *
   * @param {object} oLink an HTML DOM &lt;a&gt; object or object literal including href and/or type attributes
   * @return {boolean} URL playability
   */

  this.canPlayLink = function(oLink) {

    if (typeof oLink.type !== 'undefined' && oLink.type) {
      if (_s.canPlayMIME(oLink.type)) {
        return true;
      }
    }

    return _s.canPlayURL(oLink.href);

  };

  /**
   * Retrieves a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.getSoundById = function(sID, _suppressDebug) {

    if (!sID) {
      throw new Error(_sm+'.getSoundById(): sID is null/undefined');
    }

    var result = _s.sounds[sID];

    // <d>
    if (!result && !_suppressDebug) {
      _s._wD('"' + sID + '" is an invalid sound ID.', 2);
    }
    // </d>

    return result;

  };

  /**
   * Queues a callback for execution when SoundManager has successfully initialized.
   *
   * @param {function} oMethod The callback method to fire
   * @param {object} oScope Optional: The scope to apply to the callback
   */

  this.onready = function(oMethod, oScope) {

    var sType = 'onready';

    if (oMethod && oMethod instanceof Function) {

      // <d>
      if (_didInit) {
        _s._wD(_str('queue', sType));
      }
      // </d>

      if (!oScope) {
        oScope = _win;
      }

      _addOnEvent(sType, oMethod, oScope);
      _processOnEvents();

      return true;

    } else {

      throw _str('needFunction', sType);

    }

  };

  /**
   * Queues a callback for execution when SoundManager has failed to initialize.
   *
   * @param {function} oMethod The callback method to fire
   * @param {object} oScope Optional: The scope to apply to the callback
   */

  this.ontimeout = function(oMethod, oScope) {

    var sType = 'ontimeout';

    if (oMethod && oMethod instanceof Function) {

      // <d>
      if (_didInit) {
        _s._wD(_str('queue', sType));
      }
      // </d>

      if (!oScope) {
        oScope = _win;
      }

      _addOnEvent(sType, oMethod, oScope);
      _processOnEvents({type:sType});

      return true;

    } else {

      throw _str('needFunction', sType);

    }

  };

  /**
   * Writes console.log()-style debug output to a console or in-browser element.
   * Applies when SoundManager.debugMode = true
   *
   * @param {string} sText The console message
   * @param {string} sType Optional: Log type of 'info', 'warn' or 'error'
   * @param {object} Optional: The scope to apply to the callback
   */

  this._writeDebug = function(sText, sType, _bTimestamp) {

    // pseudo-private console.log()-style output
    // <d>

    var sDID = 'soundmanager-debug', o, oItem, sMethod;

    if (!_s.debugMode) {
      return false;
    }

    if (typeof _bTimestamp !== 'undefined' && _bTimestamp) {
      sText = sText + ' | ' + new Date().getTime();
    }

    if (_hasConsole && _s.useConsole) {
      sMethod = _debugLevels[sType];
      if (typeof console[sMethod] !== 'undefined') {
        console[sMethod](sText);
      } else {
        console.log(sText);
      }
      if (_s.consoleOnly) {
        return true;
      }
    }

    try {

      o = _id(sDID);

      if (!o) {
        return false;
      }

      oItem = _doc.createElement('div');

      if (++_wdCount % 2 === 0) {
        oItem.className = 'sm2-alt';
      }

      if (typeof sType === 'undefined') {
        sType = 0;
      } else {
        sType = parseInt(sType, 10);
      }

      oItem.appendChild(_doc.createTextNode(sText));

      if (sType) {
        if (sType >= 2) {
          oItem.style.fontWeight = 'bold';
        }
        if (sType === 3) {
          oItem.style.color = '#ff3333';
        }
      }

      // top-to-bottom
      // o.appendChild(oItem);

      // bottom-to-top
      o.insertBefore(oItem, o.firstChild);

    } catch(e) {
      // oh well
    }

    o = null;
    // </d>

    return true;

  };

  // alias
  this._wD = this._writeDebug;

  /**
   * Provides debug / state information on all SMSound objects.
   */

  this._debug = function() {

    // <d>
    var i, j;
    _wDS('currentObj', 1);

    for (i = 0, j = _s.soundIDs.length; i < j; i++) {
      _s.sounds[_s.soundIDs[i]]._debug();
    }
    // </d>

  };

  /**
   * Restarts and re-initializes the SoundManager instance.
   */

  this.reboot = function() {

    // attempt to reset and init SM2
    _s._wD(_sm+'.reboot()');

    // <d>
    if (_s.soundIDs.length) {
      _s._wD('Destroying ' + _s.soundIDs.length + ' SMSound objects...');
    }
    // </d>

    var i, j;

    for (i = _s.soundIDs.length; i--;) {
      _s.sounds[_s.soundIDs[i]].destruct();
    }

    // trash ze flash

    try {
      if (_isIE) {
        _oRemovedHTML = _flash.innerHTML;
      }
      _oRemoved = _flash.parentNode.removeChild(_flash);
      _s._wD('Flash movie removed.');
    } catch(e) {
      // uh-oh.
      _wDS('badRemove', 2);
    }

    // actually, force recreate of movie.
    _oRemovedHTML = _oRemoved = _needsFlash = null;

    _s.enabled = _didDCLoaded = _didInit = _waitingForEI = _initPending = _didAppend = _appendSuccess = _disabled = _s.swfLoaded = false;
    _s.soundIDs = _s.sounds = [];
    _flash = null;

    for (i in _on_queue) {
      if (_on_queue.hasOwnProperty(i)) {
        for (j = _on_queue[i].length; j--;) {
          _on_queue[i][j].fired = false;
        }
      }
    }

    _s._wD(_sm + ': Rebooting...');
    _win.setTimeout(_s.beginDelayedInit, 20);

  };

  /**
   * Undocumented: Determines the SM2 flash movie's load progress.
   *
   * @return {number or null} Percent loaded, or if invalid/unsupported, null.
   */

  this.getMoviePercent = function() {

    return (_flash && typeof _flash.PercentLoaded !== 'undefined' ? _flash.PercentLoaded() : null);

  };

  /**
   * Additional helper for manually invoking SM2's init process after DOM Ready / window.onload().
   */

  this.beginDelayedInit = function() {

    _windowLoaded = true;
    _domContentLoaded();

    setTimeout(function() {

      if (_initPending) {
        return false;
      }

      _createMovie();
      _initMovie();
      _initPending = true;

      return true;

    }, 20);

    _delayWaitForEI();

  };

  /**
   * Destroys the SoundManager instance and all SMSound instances.
   */

  this.destruct = function() {

    _s._wD(_sm+'.destruct()');
    _s.disable(true);

  };

  /**
   * SMSound() (sound object) constructor
   * ------------------------------------
   *
   * @param {object} oOptions Sound options (id and url are required attributes)
   * @return {SMSound} The new SMSound object
   */

  SMSound = function(oOptions) {

    var _t = this, _resetProperties, _add_html5_events, _remove_html5_events, _stop_html5_timer, _start_html5_timer, _attachOnPosition, _onplay_called = false, _onPositionItems = [], _onPositionFired = 0, _detachOnPosition, _applyFromTo, _lastURL = null;

    var _lastHTML5State = {
      // tracks duration + position (time)
      duration: null,
      time: null
    };

    this.sID = oOptions.id;
    this.url = oOptions.url;
    this.options = _mixin(oOptions);

    // per-play-instance-specific options
    this.instanceOptions = this.options;

    // short alias
    this._iO = this.instanceOptions;

    // assign property defaults
    this.pan = this.options.pan;
    this.volume = this.options.volume;
    this.isHTML5 = false;
    this._a = null;

    /**
     * SMSound() public methods
     * ------------------------
     */

    this.id3 = {};

    /**
     * Writes SMSound object parameters to debug console
     */

    this._debug = function() {

      // <d>
      // pseudo-private console.log()-style output

      if (_s.debugMode) {

        var stuff = null, msg = [], sF, sfBracket, maxLength = 64;

        for (stuff in _t.options) {
          if (_t.options[stuff] !== null) {
            if (_t.options[stuff] instanceof Function) {
              // handle functions specially
              sF = _t.options[stuff].toString();
              // normalize spaces
              sF = sF.replace(/\s\s+/g, ' ');
              sfBracket = sF.indexOf('{');
              msg.push(' ' + stuff + ': {' + sF.substr(sfBracket + 1, (Math.min(Math.max(sF.indexOf('\n') - 1, maxLength), maxLength))).replace(/\n/g, '') + '... }');
            } else {
              msg.push(' ' + stuff + ': ' + _t.options[stuff]);
            }
          }
        }

        _s._wD('SMSound() merged options: {\n' + msg.join(', \n') + '\n}');

      }
      // </d>

    };

    // <d>
    this._debug();
    // </d>

    /**
     * Begins loading a sound per its *url*.
     *
     * @param {object} oOptions Optional: Sound options
     * @return {SMSound} The SMSound object
     */

    this.load = function(oOptions) {

      var oS = null, _iO;

      if (typeof oOptions !== 'undefined') {
        _t._iO = _mixin(oOptions, _t.options);
        _t.instanceOptions = _t._iO;
      } else {
        oOptions = _t.options;
        _t._iO = oOptions;
        _t.instanceOptions = _t._iO;
        if (_lastURL && _lastURL !== _t.url) {
          _wDS('manURL');
          _t._iO.url = _t.url;
          _t.url = null;
        }
      }

      if (!_t._iO.url) {
        _t._iO.url = _t.url;
      }

      _t._iO.url = _parseURL(_t._iO.url);

      _s._wD('SMSound.load(): ' + _t._iO.url, 1);

      if (_t._iO.url === _t.url && _t.readyState !== 0 && _t.readyState !== 2) {
        _wDS('onURL', 1);
        // if loaded and an onload() exists, fire immediately.
        if (_t.readyState === 3 && _t._iO.onload) {
          // assume success based on truthy duration.
          _t._iO.onload.apply(_t, [(!!_t.duration)]);
        }
        return _t;
      }

      // local shortcut
      _iO = _t._iO;

      _lastURL = _t.url;
      _t.loaded = false;
      _t.readyState = 1;
      _t.playState = 0;

      // TODO: If switching from HTML5 -> flash (or vice versa), stop currently-playing audio.

      if (_html5OK(_iO)) {

        oS = _t._setup_html5(_iO);

        if (!oS._called_load) {

          _s._wD(_h5+'load: '+_t.sID);
          _t._html5_canplay = false;

          // given explicit load call, try to get whole file.
          // early HTML5 implementation (non-standard)
          _t._a.autobuffer = 'auto';
          // standard
          _t._a.preload = 'auto';

          oS.load();
          oS._called_load = true;

          if (_iO.autoPlay) {
            _t.play();
          }

        } else {
          _s._wD(_h5+'ignoring request to load again: '+_t.sID);
        }

      } else {

        try {
          _t.isHTML5 = false;
          _t._iO = _policyFix(_loopFix(_iO));
          // re-assign local shortcut
          _iO = _t._iO;
          if (_fV === 8) {
            _flash._load(_t.sID, _iO.url, _iO.stream, _iO.autoPlay, (_iO.whileloading?1:0), _iO.loops||1, _iO.usePolicyFile);
          } else {
            _flash._load(_t.sID, _iO.url, !!(_iO.stream), !!(_iO.autoPlay), _iO.loops||1, !!(_iO.autoLoad), _iO.usePolicyFile);
          }
        } catch(e) {
          _wDS('smError', 2);
          _debugTS('onload', false);
          _catchError({type:'SMSOUND_LOAD_JS_EXCEPTION', fatal:true});

        }

      }

      return _t;

    };

    /**
     * Unloads a sound, canceling any open HTTP requests.
     *
     * @return {SMSound} The SMSound object
     */

    this.unload = function() {

      // Flash 8/AS2 can't "close" a stream - fake it by loading an empty URL
      // Flash 9/AS3: Close stream, preventing further load
      // HTML5: Most UAs will use empty URL

      if (_t.readyState !== 0) {

        _s._wD('SMSound.unload(): "' + _t.sID + '"');

        if (!_t.isHTML5) {
          if (_fV === 8) {
            _flash._unload(_t.sID, _emptyURL);
          } else {
            _flash._unload(_t.sID);
          }
        } else {
          _stop_html5_timer();
          if (_t._a) {
            _t._a.pause();
            _html5Unload(_t._a);
          }
        }

        // reset load/status flags
        _resetProperties();

      }

      return _t;

    };

    /**
     * Unloads and destroys a sound.
     */

    this.destruct = function(_bFromSM) {

      _s._wD('SMSound.destruct(): "' + _t.sID + '"');

      if (!_t.isHTML5) {

        // kill sound within Flash
        // Disable the onfailure handler
        _t._iO.onfailure = null;
        _flash._destroySound(_t.sID);

      } else {

        _stop_html5_timer();

        if (_t._a) {
          _t._a.pause();
          _html5Unload(_t._a);
          if (!_useGlobalHTML5Audio) {
            _remove_html5_events();
          }
          // break obvious circular reference
          _t._a._t = null;
          _t._a = null;
        }

      }

      if (!_bFromSM) {
        // ensure deletion from controller
        _s.destroySound(_t.sID, true);

      }

    };

    /**
     * Begins playing a sound.
     *
     * @param {object} oOptions Optional: Sound options
     * @return {SMSound} The SMSound object
     */

    this.play = function(oOptions, _updatePlayState) {

      var fN, allowMulti, a, onready;

      // <d>
      fN = 'SMSound.play(): ';
      // </d>

      _updatePlayState = _updatePlayState === undefined ? true : _updatePlayState; // default to true

      if (!oOptions) {
        oOptions = {};
      }

      _t._iO = _mixin(oOptions, _t._iO);
      _t._iO = _mixin(_t._iO, _t.options);
      _t._iO.url = _parseURL(_t._iO.url);
      _t.instanceOptions = _t._iO;

      // RTMP-only
      if (_t._iO.serverURL && !_t.connected) {
        if (!_t.getAutoPlay()) {
          _s._wD(fN+' Netstream not connected yet - setting autoPlay');
          _t.setAutoPlay(true);
        }
        // play will be called in _onconnect()
        return _t;
      }

      if (_html5OK(_t._iO)) {
        _t._setup_html5(_t._iO);
        _start_html5_timer();
      }

      if (_t.playState === 1 && !_t.paused) {
        allowMulti = _t._iO.multiShot;
        if (!allowMulti) {
          _s._wD(fN + '"' + _t.sID + '" already playing (one-shot)', 1);
          return _t;
        } else {
          _s._wD(fN + '"' + _t.sID + '" already playing (multi-shot)', 1);
        }
      }

      if (!_t.loaded) {

        if (_t.readyState === 0) {

          _s._wD(fN + 'Attempting to load "' + _t.sID + '"', 1);

          // try to get this sound playing ASAP
          if (!_t.isHTML5) {
            // assign directly because setAutoPlay() increments the instanceCount
            _t._iO.autoPlay = true;
          }

          _t.load(_t._iO);

        } else if (_t.readyState === 2) {

          _s._wD(fN + 'Could not load "' + _t.sID + '" - exiting', 2);
          return _t;

        } else {

          _s._wD(fN + '"' + _t.sID + '" is loading - attempting to play..', 1);

        }

      } else {

        _s._wD(fN + '"' + _t.sID + '"');

      }

      if (!_t.isHTML5 && _fV === 9 && _t.position > 0 && _t.position === _t.duration) {
        // flash 9 needs a position reset if play() is called while at the end of a sound.
        _s._wD(fN + '"' + _t.sID + '": Sound at end, resetting to position:0');
        oOptions.position = 0;
      }

      /**
       * Streams will pause when their buffer is full if they are being loaded.
       * In this case paused is true, but the song hasn't started playing yet.
       * If we just call resume() the onplay() callback will never be called.
       * So only call resume() if the position is > 0.
       * Another reason is because options like volume won't have been applied yet.
       */

      if (_t.paused && _t.position && _t.position > 0) {

        // https://gist.github.com/37b17df75cc4d7a90bf6
        _s._wD(fN + '"' + _t.sID + '" is resuming from paused state',1);
        _t.resume();

      } else {

        _t._iO = _mixin(oOptions, _t._iO);

        // apply from/to parameters, if they exist (and not using RTMP)
        if (_t._iO.from !== null && _t._iO.to !== null && _t.instanceCount === 0 && _t.playState === 0 && !_t._iO.serverURL) {

          onready = function() {
            // sound "canplay" or onload()
            // re-apply from/to to instance options, and start playback
            _t._iO = _mixin(oOptions, _t._iO);
            _t.play(_t._iO);
          };

          // HTML5 needs to at least have "canplay" fired before seeking.
          if (_t.isHTML5 && !_t._html5_canplay) {

            // this hasn't been loaded yet. load it first, and then do this again.
            _s._wD(fN+'Beginning load of "'+ _t.sID+'" for from/to case');

            _t.load({
              _oncanplay: onready
            });

            return false;

          } else if (!_t.isHTML5 && !_t.loaded && (!_t.readyState || _t.readyState !== 2)) {

            // to be safe, preload the whole thing in Flash.

            _s._wD(fN+'Preloading "'+ _t.sID+'" for from/to case');

            _t.load({
              onload: onready
            });

            return false;

          }

          // otherwise, we're ready to go. re-apply local options, and continue

          _t._iO = _applyFromTo();

        }

        _s._wD(fN+'"'+ _t.sID+'" is starting to play');

        if (!_t.instanceCount || _t._iO.multiShotEvents || (!_t.isHTML5 && _fV > 8 && !_t.getAutoPlay())) {
          _t.instanceCount++;
        }

        // if first play and onposition parameters exist, apply them now
        if (_t.playState === 0 && _t._iO.onposition) {
          _attachOnPosition(_t);
        }

        _t.playState = 1;
        _t.paused = false;

        _t.position = (typeof _t._iO.position !== 'undefined' && !isNaN(_t._iO.position) ? _t._iO.position : 0);

        if (!_t.isHTML5) {
          _t._iO = _policyFix(_loopFix(_t._iO));
        }

        if (_t._iO.onplay && _updatePlayState) {
          _t._iO.onplay.apply(_t);
          _onplay_called = true;
        }

        _t.setVolume(_t._iO.volume, true);
        _t.setPan(_t._iO.pan, true);

        if (!_t.isHTML5) {

          _flash._start(_t.sID, _t._iO.loops || 1, (_fV === 9?_t._iO.position:_t._iO.position / 1000));

        } else {

          _start_html5_timer();
          a = _t._setup_html5();
          _t.setPosition(_t._iO.position);
          a.play();

        }

      }

      return _t;

    };

    // just for convenience
    this.start = this.play;

    /**
     * Stops playing a sound (and optionally, all sounds)
     *
     * @param {boolean} bAll Optional: Whether to stop all sounds
     * @return {SMSound} The SMSound object
     */

    this.stop = function(bAll) {

      var _iO = _t._iO, _oP;

      if (_t.playState === 1) {

        _t._onbufferchange(0);
        _t._resetOnPosition(0);
        _t.paused = false;

        if (!_t.isHTML5) {
          _t.playState = 0;
        }

        // remove onPosition listeners, if any
        _detachOnPosition();

        // and "to" position, if set
        if (_iO.to) {
          _t.clearOnPosition(_iO.to);
        }

        if (!_t.isHTML5) {

          _flash._stop(_t.sID, bAll);

          // hack for netStream: just unload
          if (_iO.serverURL) {
            _t.unload();
          }

        } else {

          if (_t._a) {

            _oP = _t.position;

            // act like Flash, though
            _t.setPosition(0);

            // hack: reflect old position for onstop() (also like Flash)
            _t.position = _oP;

            // html5 has no stop()
            // NOTE: pausing means iOS requires interaction to resume.
            _t._a.pause();

            _t.playState = 0;

            // and update UI
            _t._onTimer();

            _stop_html5_timer();

          }

        }

        _t.instanceCount = 0;
        _t._iO = {};

        if (_iO.onstop) {
          _iO.onstop.apply(_t);
        }

      }

      return _t;

    };

    /**
     * Undocumented/internal: Sets autoPlay for RTMP.
     *
     * @param {boolean} autoPlay state
     */

    this.setAutoPlay = function(autoPlay) {

      _s._wD('sound '+_t.sID+' turned autoplay ' + (autoPlay ? 'on' : 'off'));
      _t._iO.autoPlay = autoPlay;

      if (!_t.isHTML5) {
        _flash._setAutoPlay(_t.sID, autoPlay);
        if (autoPlay) {
          // only increment the instanceCount if the sound isn't loaded (TODO: verify RTMP)
          if (!_t.instanceCount && _t.readyState === 1) {
            _t.instanceCount++;
            _s._wD('sound '+_t.sID+' incremented instance count to '+_t.instanceCount);
          }
        }
      }

    };

    /**
     * Undocumented/internal: Returns the autoPlay boolean.
     *
     * @return {boolean} The current autoPlay value
     */

    this.getAutoPlay = function() {

      return _t._iO.autoPlay;

    };

    /**
     * Sets the position of a sound.
     *
     * @param {number} nMsecOffset Position (milliseconds)
     * @return {SMSound} The SMSound object
     */

    this.setPosition = function(nMsecOffset) {

      if (nMsecOffset === undefined) {
        nMsecOffset = 0;
      }

      var original_pos,
          position, position1K,
          // Use the duration from the instance options, if we don't have a track duration yet.
          // position >= 0 and <= current available (loaded) duration
          offset = (_t.isHTML5 ? Math.max(nMsecOffset,0) : Math.min(_t.duration || _t._iO.duration, Math.max(nMsecOffset, 0)));

      original_pos = _t.position;
      _t.position = offset;
      position1K = _t.position/1000;
      _t._resetOnPosition(_t.position);
      _t._iO.position = offset;

      if (!_t.isHTML5) {

        position = (_fV === 9 ? _t.position : position1K);
        if (_t.readyState && _t.readyState !== 2) {
          // if paused or not playing, will not resume (by playing)
          _flash._setPosition(_t.sID, position, (_t.paused || !_t.playState));
        }

      } else if (_t._a) {

        // Set the position in the canplay handler if the sound is not ready yet
        if (_t._html5_canplay) {
          if (_t._a.currentTime !== position1K) {
            /**
             * DOM/JS errors/exceptions to watch out for:
             * if seek is beyond (loaded?) position, "DOM exception 11"
             * "INDEX_SIZE_ERR": DOM exception 1
             */
            _s._wD('setPosition('+position1K+'): setting position');
            try {
              _t._a.currentTime = position1K;
              if (_t.playState === 0 || _t.paused) {
                // allow seek without auto-play/resume
                _t._a.pause();
              }
            } catch(e) {
              _s._wD('setPosition('+position1K+'): setting position failed: '+e.message, 2);
            }
          }
        } else {
          _s._wD('setPosition('+position1K+'): delaying, sound not ready');
        }

      }

      if (_t.isHTML5) {
        if (_t.paused) {
          // if paused, refresh UI right away
          // force update
          _t._onTimer(true);
        }
      }

      return _t;

    };

    /**
     * Pauses sound playback.
     *
     * @return {SMSound} The SMSound object
     */

    this.pause = function(_bCallFlash) {

      if (_t.paused || (_t.playState === 0 && _t.readyState !== 1)) {
        return _t;
      }

      _s._wD('SMSound.pause()');
      _t.paused = true;

      if (!_t.isHTML5) {
        if (_bCallFlash || _bCallFlash === undefined) {
          _flash._pause(_t.sID);
        }
      } else {
        _t._setup_html5().pause();
        _stop_html5_timer();
      }

      if (_t._iO.onpause) {
        _t._iO.onpause.apply(_t);
      }

      return _t;

    };

    /**
     * Resumes sound playback.
     *
     * @return {SMSound} The SMSound object
     */

    /**
     * When auto-loaded streams pause on buffer full they have a playState of 0.
     * We need to make sure that the playState is set to 1 when these streams "resume".
     * When a paused stream is resumed, we need to trigger the onplay() callback if it
     * hasn't been called already. In this case since the sound is being played for the
     * first time, I think it's more appropriate to call onplay() rather than onresume().
     */

    this.resume = function() {

      var _iO = _t._iO;

      if (!_t.paused) {
        return _t;
      }

      _s._wD('SMSound.resume()');
      _t.paused = false;
      _t.playState = 1;

      if (!_t.isHTML5) {
        if (_iO.isMovieStar && !_iO.serverURL) {
          // Bizarre Webkit bug (Chrome reported via 8tracks.com dudes): AAC content paused for 30+ seconds(?) will not resume without a reposition.
          _t.setPosition(_t.position);
        }
        // flash method is toggle-based (pause/resume)
        _flash._pause(_t.sID);
      } else {
        _t._setup_html5().play();
        _start_html5_timer();
      }

      if (_onplay_called && _iO.onplay) {
        _iO.onplay.apply(_t);
        _onplay_called = true;
      } else if (_iO.onresume) {
        _iO.onresume.apply(_t);
      }

      return _t;

    };

    /**
     * Toggles sound playback.
     *
     * @return {SMSound} The SMSound object
     */

    this.togglePause = function() {

      _s._wD('SMSound.togglePause()');

      if (_t.playState === 0) {
        _t.play({
          position: (_fV === 9 && !_t.isHTML5 ? _t.position : _t.position / 1000)
        });
        return _t;
      }

      if (_t.paused) {
        _t.resume();
      } else {
        _t.pause();
      }

      return _t;

    };

    /**
     * Sets the panning (L-R) effect.
     *
     * @param {number} nPan The pan value (-100 to 100)
     * @return {SMSound} The SMSound object
     */

    this.setPan = function(nPan, bInstanceOnly) {

      if (typeof nPan === 'undefined') {
        nPan = 0;
      }

      if (typeof bInstanceOnly === 'undefined') {
        bInstanceOnly = false;
      }

      if (!_t.isHTML5) {
        _flash._setPan(_t.sID, nPan);
      } // else { no HTML5 pan? }

      _t._iO.pan = nPan;

      if (!bInstanceOnly) {
        _t.pan = nPan;
        _t.options.pan = nPan;
      }

      return _t;

    };

    /**
     * Sets the volume.
     *
     * @param {number} nVol The volume value (0 to 100)
     * @return {SMSound} The SMSound object
     */

    this.setVolume = function(nVol, _bInstanceOnly) {

      /**
       * Note: Setting volume has no effect on iOS "special snowflake" devices.
       * Hardware volume control overrides software, and volume
       * will always return 1 per Apple docs. (iOS 4 + 5.)
       * http://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/HTML-canvas-guide/AddingSoundtoCanvasAnimations/AddingSoundtoCanvasAnimations.html
       */

      if (typeof nVol === 'undefined') {
        nVol = 100;
      }

      if (typeof _bInstanceOnly === 'undefined') {
        _bInstanceOnly = false;
      }

      if (!_t.isHTML5) {
        _flash._setVolume(_t.sID, (_s.muted && !_t.muted) || _t.muted?0:nVol);
      } else if (_t._a) {
        // valid range: 0-1
        _t._a.volume = Math.max(0, Math.min(1, nVol/100));
      }

      _t._iO.volume = nVol;

      if (!_bInstanceOnly) {
        _t.volume = nVol;
        _t.options.volume = nVol;
      }

      return _t;

    };

    /**
     * Mutes the sound.
     *
     * @return {SMSound} The SMSound object
     */

    this.mute = function() {

      _t.muted = true;

      if (!_t.isHTML5) {
        _flash._setVolume(_t.sID, 0);
      } else if (_t._a) {
        _t._a.muted = true;
      }

      return _t;

    };

    /**
     * Unmutes the sound.
     *
     * @return {SMSound} The SMSound object
     */

    this.unmute = function() {

      _t.muted = false;
      var hasIO = typeof _t._iO.volume !== 'undefined';

      if (!_t.isHTML5) {
        _flash._setVolume(_t.sID, hasIO?_t._iO.volume:_t.options.volume);
      } else if (_t._a) {
        _t._a.muted = false;
      }

      return _t;

    };

    /**
     * Toggles the muted state of a sound.
     *
     * @return {SMSound} The SMSound object
     */

    this.toggleMute = function() {

      return (_t.muted?_t.unmute():_t.mute());

    };

    /**
     * Registers a callback to be fired when a sound reaches a given position during playback.
     *
     * @param {number} nPosition The position to watch for
     * @param {function} oMethod The relevant callback to fire
     * @param {object} oScope Optional: The scope to apply the callback to
     * @return {SMSound} The SMSound object
     */

    this.onPosition = function(nPosition, oMethod, oScope) {

      // TODO: basic dupe checking?

      _onPositionItems.push({
        position: nPosition,
        method: oMethod,
        scope: (typeof oScope !== 'undefined' ? oScope : _t),
        fired: false
      });

      return _t;

    };

    // legacy/backwards-compability: lower-case method name
    this.onposition = this.onPosition;

    /**
     * Removes registered callback(s) from a sound, by position and/or callback.
     *
     * @param {number} nPosition The position to clear callback(s) for
     * @param {function} oMethod Optional: Identify one callback to be removed when multiple listeners exist for one position
     * @return {SMSound} The SMSound object
     */

    this.clearOnPosition = function(nPosition, oMethod) {

      var i;

      nPosition = parseInt(nPosition, 10);

      if (isNaN(nPosition)) {
        // safety check
        return false;
      }

      for (i=0; i < _onPositionItems.length; i++) {

        if (nPosition === _onPositionItems[i].position) {
          // remove this item if no method was specified, or, if the method matches
          if (!oMethod || (oMethod === _onPositionItems[i].method)) {
            if (_onPositionItems[i].fired) {
              // decrement "fired" counter, too
              _onPositionFired--;
            }
            _onPositionItems.splice(i, 1);
          }
        }

      }

    };

    this._processOnPosition = function() {

      var i, item, j = _onPositionItems.length;

      if (!j || !_t.playState || _onPositionFired >= j) {
        return false;
      }

      for (i=j; i--;) {
        item = _onPositionItems[i];
        if (!item.fired && _t.position >= item.position) {
          item.fired = true;
          _onPositionFired++;
          item.method.apply(item.scope, [item.position]);
        }
      }

      return true;

    };

    this._resetOnPosition = function(nPosition) {

      // reset "fired" for items interested in this position
      var i, item, j = _onPositionItems.length;

      if (!j) {
        return false;
      }

      for (i=j; i--;) {
        item = _onPositionItems[i];
        if (item.fired && nPosition <= item.position) {
          item.fired = false;
          _onPositionFired--;
        }
      }

      return true;

    };

    /**
     * SMSound() private internals
     * --------------------------------
     */

    _applyFromTo = function() {

      var _iO = _t._iO,
          f = _iO.from,
          t = _iO.to,
          start, end;

      end = function() {

        // end has been reached.
        _s._wD(_t.sID + ': "to" time of ' + t + ' reached.');

        // detach listener
        _t.clearOnPosition(t, end);

        // stop should clear this, too
        _t.stop();

      };

      start = function() {

        _s._wD(_t.sID + ': playing "from" ' + f);

        // add listener for end
        if (t !== null && !isNaN(t)) {
          _t.onPosition(t, end);
        }

      };

      if (f !== null && !isNaN(f)) {

        // apply to instance options, guaranteeing correct start position.
        _iO.position = f;

        // multiShot timing can't be tracked, so prevent that.
        _iO.multiShot = false;

        start();

      }

      // return updated instanceOptions including starting position
      return _iO;

    };

    _attachOnPosition = function() {

      var op = _t._iO.onposition;

      // attach onposition things, if any, now.

      if (op) {

        var item;

        for (item in op) {
          if (op.hasOwnProperty(item)) {
            _t.onPosition(parseInt(item, 10), op[item]); 
          }
        }

      }

    };

    _detachOnPosition = function() {

      var op = _t._iO.onposition;

      // detach any onposition()-style listeners.

      if (op) {

        var item;

        for (item in op) {
          if (op.hasOwnProperty(item)) {
            _t.clearOnPosition(parseInt(item, 10));
          }
        }

      }

    };

    _start_html5_timer = function() {

      if (_t.isHTML5) {
        _startTimer(_t);
      }

    };

    _stop_html5_timer = function() {

      if (_t.isHTML5) {
        _stopTimer(_t);
      }

    };

    _resetProperties = function() {

      _onPositionItems = [];
      _onPositionFired = 0;
      _onplay_called = false;

      _t._hasTimer = null;
      _t._a = null;
      _t._html5_canplay = false;
      _t.bytesLoaded = null;
      _t.bytesTotal = null;
      _t.duration = (_t._iO && _t._iO.duration ? _t._iO.duration : null);
      _t.durationEstimate = null;

      // legacy: 1D array
      _t.eqData = [];

      _t.eqData.left = [];
      _t.eqData.right = [];

      _t.failures = 0;
      _t.isBuffering = false;
      _t.instanceOptions = {};
      _t.instanceCount = 0;
      _t.loaded = false;
      _t.metadata = {};

      // 0 = uninitialised, 1 = loading, 2 = failed/error, 3 = loaded/success
      _t.readyState = 0;

      _t.muted = false;
      _t.paused = false;

      _t.peakData = {
        left: 0,
        right: 0
      };

      _t.waveformData = {
        left: [],
        right: []
      };

      _t.playState = 0;
      _t.position = null;

    };

    _resetProperties();

    /**
     * Pseudo-private SMSound internals
     * --------------------------------
     */

    this._onTimer = function(bForce) {

      /**
       * HTML5-only _whileplaying() etc.
       * called from both HTML5 native events, and polling/interval-based timers
       * mimics flash and fires only when time/duration change, so as to be polling-friendly
       */

      var duration, isNew = false, time, x = {};

      if (_t._hasTimer || bForce) {

        // TODO: May not need to track readyState (1 = loading)

        if (_t._a && (bForce || ((_t.playState > 0 || _t.readyState === 1) && !_t.paused))) {

          duration = _t._get_html5_duration();

          if (duration !== _lastHTML5State.duration) {

            _lastHTML5State.duration = duration;
            _t.duration = duration;
            isNew = true;

          }

          // TODO: investigate why this goes wack if not set/re-set each time.
          _t.durationEstimate = _t.duration;

          time = (_t._a.currentTime * 1000 || 0);

          if (time !== _lastHTML5State.time) {

            _lastHTML5State.time = time;
            isNew = true;

          }

          if (isNew || bForce) {

            _t._whileplaying(time,x,x,x,x);

          }

          return isNew;

        } else {

          // _s._wD('_onTimer: Warn for "'+_t.sID+'": '+(!_t._a?'Could not find element. ':'')+(_t.playState === 0?'playState bad, 0?':'playState = '+_t.playState+', OK'));

          return false;

        }

      }

    };

    this._get_html5_duration = function() {

      var _iO = _t._iO,
          d = (_t._a ? _t._a.duration*1000 : (_iO ? _iO.duration : undefined)),
          result = (d && !isNaN(d) && d !== Infinity ? d : (_iO ? _iO.duration : null));

      return result;

    };

    this._setup_html5 = function(oOptions) {

      var _iO = _mixin(_t._iO, oOptions), d = decodeURI,
          _a = _useGlobalHTML5Audio ? _s._global_a : _t._a,
          _dURL = d(_iO.url),
          _oldIO = (_a && _a._t ? _a._t.instanceOptions : null);

      if (_a) {

        if (_a._t) {

          if (!_useGlobalHTML5Audio && _dURL === d(_lastURL)) {
            // same url, ignore request
            return _a; 
          } else if (_useGlobalHTML5Audio && _oldIO.url === _iO.url && (!_lastURL || (_lastURL === _oldIO.url))) {
            // iOS-type reuse case
            return _a;
          }

        }

        _s._wD('setting new URL on existing object: ' + _dURL + (_lastURL ? ', old URL: ' + _lastURL : ''));

        /**
         * "First things first, I, Poppa.." (reset the previous state of the old sound, if playing)
         * Fixes case with devices that can only play one sound at a time
         * Otherwise, other sounds in mid-play will be terminated without warning and in a stuck state
         */

        if (_useGlobalHTML5Audio && _a._t && _a._t.playState && _iO.url !== _oldIO.url) {
          _a._t.stop();
        }

        // new URL, so reset load/playstate and so on
        _resetProperties();

        _a.src = _iO.url;
        _t.url = _iO.url;
        _lastURL = _iO.url;
        _a._called_load = false;

      } else {

        _s._wD('creating HTML5 Audio() element with URL: '+_dURL);
        _a = new Audio(_iO.url);

        _a._called_load = false;

        // android (seen in 2.3/Honeycomb) sometimes fails first .load() -> .play(), results in playback failure and ended() events?
        if (_is_android) {
          _a._called_load = true;
        }

        if (_useGlobalHTML5Audio) {
          _s._global_a = _a;
        }

      }

      _t.isHTML5 = true;

      // store a ref on the track
      _t._a = _a;

      // store a ref on the audio
      _a._t = _t;

      _add_html5_events();
      _a.loop = (_iO.loops>1?'loop':'');

      if (_iO.autoLoad || _iO.autoPlay) {

        _t.load();

      } else {

        // early HTML5 implementation (non-standard)
        _a.autobuffer = false;

        // standard
        _a.preload = 'none';

      }

      // boolean instead of "loop", for webkit? - spec says string. http://www.w3.org/TR/html-markup/audio.html#audio.attrs.loop
      _a.loop = (_iO.loops > 1 ? 'loop' : '');

      return _a;

    };

    _add_html5_events = function() {

      if (_t._a._added_events) {
        return false;
      }

      var f;

      function add(oEvt, oFn, bCapture) {
        return _t._a ? _t._a.addEventListener(oEvt, oFn, bCapture||false) : null;
      }

      _s._wD(_h5+'adding event listeners: '+_t.sID);
      _t._a._added_events = true;

      for (f in _html5_events) {
        if (_html5_events.hasOwnProperty(f)) {
          add(f, _html5_events[f]);
        }
      }

      return true;

    };

    _remove_html5_events = function() {

      // Remove event listeners

      var f;

      function remove(oEvt, oFn, bCapture) {
        return (_t._a ? _t._a.removeEventListener(oEvt, oFn, bCapture||false) : null);
      }

      _s._wD(_h5+'removing event listeners: '+_t.sID);
      _t._a._added_events = false;

      for (f in _html5_events) {
        if (_html5_events.hasOwnProperty(f)) {
          remove(f, _html5_events[f]);
        }
      }

    };

    /**
     * Pseudo-private event internals
     * ------------------------------
     */

    this._onload = function(nSuccess) {


      var fN, loadOK = !!(nSuccess);
      _s._wD(fN + '"' + _t.sID + '"' + (loadOK?' loaded.':' failed to load? - ' + _t.url), (loadOK?1:2));

      // <d>
      fN = 'SMSound._onload(): ';
      if (!loadOK && !_t.isHTML5) {
        if (_s.sandbox.noRemote === true) {
          _s._wD(fN + _str('noNet'), 1);
        }
        if (_s.sandbox.noLocal === true) {
          _s._wD(fN + _str('noLocal'), 1);
        }
      }
      // </d>

      _t.loaded = loadOK;
      _t.readyState = loadOK?3:2;
      _t._onbufferchange(0);

      if (_t._iO.onload) {
        _t._iO.onload.apply(_t, [loadOK]);
      }

      return true;

    };

    this._onbufferchange = function(nIsBuffering) {

      if (_t.playState === 0) {
        // ignore if not playing
        return false;
      }

      if ((nIsBuffering && _t.isBuffering) || (!nIsBuffering && !_t.isBuffering)) {
        return false;
      }

      _t.isBuffering = (nIsBuffering === 1);
      if (_t._iO.onbufferchange) {
        _s._wD('SMSound._onbufferchange(): ' + nIsBuffering);
        _t._iO.onbufferchange.apply(_t);
      }

      return true;

    };

    /**
     * Notify Mobile Safari that user action is required
     * to continue playing / loading the audio file.
     */

    this._onsuspend = function() {

      if (_t._iO.onsuspend) {
        _s._wD('SMSound._onsuspend()');
        _t._iO.onsuspend.apply(_t);
      }

      return true;

    };

    /**
     * flash 9/movieStar + RTMP-only method, should fire only once at most
     * at this point we just recreate failed sounds rather than trying to reconnect
     */

    this._onfailure = function(msg, level, code) {

      _t.failures++;
      _s._wD('SMSound._onfailure(): "'+_t.sID+'" count '+_t.failures);

      if (_t._iO.onfailure && _t.failures === 1) {
        _t._iO.onfailure(_t, msg, level, code);
      } else {
        _s._wD('SMSound._onfailure(): ignoring');
      }

    };

    this._onfinish = function() {

      // store local copy before it gets trashed..
      var _io_onfinish = _t._iO.onfinish;

      _t._onbufferchange(0);
      _t._resetOnPosition(0);

      // reset some state items
      if (_t.instanceCount) {

        _t.instanceCount--;

        if (!_t.instanceCount) {

          // remove onPosition listeners, if any
          _detachOnPosition();

          // reset instance options
          _t.playState = 0;
          _t.paused = false;
          _t.instanceCount = 0;
          _t.instanceOptions = {};
          _t._iO = {};
          _stop_html5_timer();

        }

        if (!_t.instanceCount || _t._iO.multiShotEvents) {
          // fire onfinish for last, or every instance
          if (_io_onfinish) {
            _s._wD('SMSound._onfinish(): "' + _t.sID + '"');
            _io_onfinish.apply(_t);
          }
        }

      }

    };

    this._whileloading = function(nBytesLoaded, nBytesTotal, nDuration, nBufferLength) {

      var _iO = _t._iO;

      _t.bytesLoaded = nBytesLoaded;
      _t.bytesTotal = nBytesTotal;
      _t.duration = Math.floor(nDuration);
      _t.bufferLength = nBufferLength;

      if (!_iO.isMovieStar) {

        if (_iO.duration) {
          // use options, if specified and larger
          _t.durationEstimate = (_t.duration > _iO.duration) ? _t.duration : _iO.duration;
        } else {
          _t.durationEstimate = parseInt((_t.bytesTotal / _t.bytesLoaded) * _t.duration, 10);

        }

        if (_t.durationEstimate === undefined) {
          _t.durationEstimate = _t.duration;
        }

        if (_t.readyState !== 3 && _iO.whileloading) {
          _iO.whileloading.apply(_t);
        }

      } else {

        _t.durationEstimate = _t.duration;
        if (_t.readyState !== 3 && _iO.whileloading) {
          _iO.whileloading.apply(_t);
        }

      }

    };

    this._whileplaying = function(nPosition, oPeakData, oWaveformDataLeft, oWaveformDataRight, oEQData) {

      var _iO = _t._iO;

      if (isNaN(nPosition) || nPosition === null) {
        // flash safety net
        return false;
      }

      _t.position = nPosition;
      _t._processOnPosition();

      if (!_t.isHTML5 && _fV > 8) {

        if (_iO.usePeakData && typeof oPeakData !== 'undefined' && oPeakData) {
          _t.peakData = {
            left: oPeakData.leftPeak,
            right: oPeakData.rightPeak
          };
        }

        if (_iO.useWaveformData && typeof oWaveformDataLeft !== 'undefined' && oWaveformDataLeft) {
          _t.waveformData = {
            left: oWaveformDataLeft.split(','),
            right: oWaveformDataRight.split(',')
          };
        }

        if (_iO.useEQData) {
          if (typeof oEQData !== 'undefined' && oEQData && oEQData.leftEQ) {
            var eqLeft = oEQData.leftEQ.split(',');
            _t.eqData = eqLeft;
            _t.eqData.left = eqLeft;
            if (typeof oEQData.rightEQ !== 'undefined' && oEQData.rightEQ) {
              _t.eqData.right = oEQData.rightEQ.split(',');
            }
          }
        }

      }

      if (_t.playState === 1) {

        // special case/hack: ensure buffering is false if loading from cache (and not yet started)
        if (!_t.isHTML5 && _fV === 8 && !_t.position && _t.isBuffering) {
          _t._onbufferchange(0);
        }

        if (_iO.whileplaying) {
          // flash may call after actual finish
          _iO.whileplaying.apply(_t);
        }

      }

      return true;

    };

    this._onmetadata = function(oMDProps, oMDData) {

      /**
       * internal: flash 9 + NetStream (MovieStar/RTMP-only) feature
       * RTMP may include song title, MovieStar content may include encoding info
       * 
       * @param {array} oMDProps (names)
       * @param {array} oMDData (values)
       */

      _s._wD('SMSound._onmetadata(): "' + this.sID + '" metadata received.');

      var oData = {}, i, j;

      for (i = 0, j = oMDProps.length; i < j; i++) {
        oData[oMDProps[i]] = oMDData[i];
      }
      _t.metadata = oData;

      if (_t._iO.onmetadata) {
        _t._iO.onmetadata.apply(_t);
      }

	};

    this._onid3 = function(oID3Props, oID3Data) {

      /**
       * internal: flash 8 + flash 9 ID3 feature
       * may include artist, song title etc.
       * 
       * @param {array} oID3Props (names)
       * @param {array} oID3Data (values)
       */

      _s._wD('SMSound._onid3(): "' + this.sID + '" ID3 data received.');

      var oData = [], i, j;

      for (i = 0, j = oID3Props.length; i < j; i++) {
        oData[oID3Props[i]] = oID3Data[i];
      }
      _t.id3 = _mixin(_t.id3, oData);

      if (_t._iO.onid3) {
        _t._iO.onid3.apply(_t);
      }

    };

    // flash/RTMP-only

    this._onconnect = function(bSuccess) {

      bSuccess = (bSuccess === 1);
      _s._wD('SMSound._onconnect(): "'+_t.sID+'"'+(bSuccess?' connected.':' failed to connect? - '+_t.url), (bSuccess?1:2));
      _t.connected = bSuccess;

      if (bSuccess) {

        _t.failures = 0;

        if (_idCheck(_t.sID)) {
          if (_t.getAutoPlay()) {
            // only update the play state if auto playing
            _t.play(undefined, _t.getAutoPlay());
          } else if (_t._iO.autoLoad) {
            _t.load();
          }
        }

        if (_t._iO.onconnect) {
          _t._iO.onconnect.apply(_t, [bSuccess]);
        }

      }

    };

    this._ondataerror = function(sError) {

      // flash 9 wave/eq data handler
      // hack: called at start, and end from flash at/after onfinish()
      if (_t.playState > 0) {
        _s._wD('SMSound._ondataerror(): ' + sError);
        if (_t._iO.ondataerror) {
          _t._iO.ondataerror.apply(_t);
        }
      }

    };

  }; // SMSound()

  /**
   * Private SoundManager internals
   * ------------------------------
   */

  _getDocument = function() {

    return (_doc.body || _doc._docElement || _doc.getElementsByTagName('div')[0]);

  };

  _id = function(sID) {

    return _doc.getElementById(sID);

  };

  _mixin = function(oMain, oAdd) {

    // non-destructive merge
    var o1 = {}, i, o2, o;

    // clone c1
    for (i in oMain) {
      if (oMain.hasOwnProperty(i)) {
        o1[i] = oMain[i];
      }
    }

    o2 = (typeof oAdd === 'undefined'?_s.defaultOptions:oAdd);
    for (o in o2) {
      if (o2.hasOwnProperty(o) && typeof o1[o] === 'undefined') {
        o1[o] = o2[o];
      }
    }
    return o1;

  };

  _event = (function() {

    var old = (_win.attachEvent),
    evt = {
      add: (old?'attachEvent':'addEventListener'),
      remove: (old?'detachEvent':'removeEventListener')
    };

    function getArgs(oArgs) {

      var args = _slice.call(oArgs), len = args.length;

      if (old) {
        // prefix
        args[1] = 'on' + args[1];
        if (len > 3) {
          // no capture
          args.pop();
        }
      } else if (len === 3) {
        args.push(false);
      }

      return args;

    }

    function apply(args, sType) {

      var element = args.shift(),
          method = [evt[sType]];

      if (old) {
        element[method](args[0], args[1]);
      } else {
        element[method].apply(element, args);
      }

    }

    function add() {

      apply(getArgs(arguments), 'add');

    }

    function remove() {

      apply(getArgs(arguments), 'remove');

    }

    return {
      'add': add,
      'remove': remove
    };

  }());

  /**
   * Internal HTML5 event handling
   * -----------------------------
   */

  function _html5_event(oFn) {

    // wrap html5 event handlers so we don't call them on destroyed sounds

    return function(e) {

      var t = this._t;

      if (!t || !t._a) {
        // <d>
        if (t && t.sID) {
          _s._wD(_h5+'ignoring '+e.type+': '+t.sID);
        } else {
          _s._wD(_h5+'ignoring '+e.type);
        }
        // </d>
        return null;
      } else {
        return oFn.call(this, e);
      }

    };

  }

  _html5_events = {

    // HTML5 event-name-to-handler map

    abort: _html5_event(function(e) {

      _s._wD(_h5+'abort: '+this._t.sID);

    }),

    // enough has loaded to play

    canplay: _html5_event(function(e) {

      var t = this._t;

      if (t._html5_canplay) {
        // this event has already fired. ignore.
        return true;
      }

      t._html5_canplay = true;
      _s._wD(_h5+'canplay: '+t.sID+', '+t.url);
      t._onbufferchange(0);
      var position1K = (!isNaN(t.position)?t.position/1000:null);

      // set the position if position was set before the sound loaded
      if (t.position && this.currentTime !== position1K) {
        _s._wD(_h5+'canplay: setting position to '+position1K);
        try {
          this.currentTime = position1K;
        } catch(ee) {
          _s._wD(_h5+'setting position failed: '+ee.message, 2);
        }
      }

      // hack for HTML5 from/to case
      if (t._iO._oncanplay) {
        t._iO._oncanplay();
      }

    }),

    load: _html5_event(function(e) {

      var t = this._t;

      if (!t.loaded) {
        t._onbufferchange(0);
        // should be 1, and the same
        t._whileloading(t.bytesTotal, t.bytesTotal, t._get_html5_duration());
        t._onload(true);
      }

    }),

    emptied: _html5_event(function(e) {

      _s._wD(_h5+'emptied: '+this._t.sID);

    }),

    ended: _html5_event(function(e) {

      var t = this._t;

      _s._wD(_h5+'ended: '+t.sID);
      t._onfinish();

    }),

    error: _html5_event(function(e) {

      _s._wD(_h5+'error: '+this.error.code);
      // call load with error state?
      this._t._onload(false);

    }),

    loadeddata: _html5_event(function(e) {

      var t = this._t,
          // at least 1 byte, so math works
          bytesTotal = t.bytesTotal || 1;

      _s._wD(_h5+'loadeddata: '+this._t.sID);

      // safari seems to nicely report progress events, eventually totalling 100%
      if (!t._loaded && !_isSafari) {
        t.duration = t._get_html5_duration();
        // fire whileloading() with 100% values
        t._whileloading(bytesTotal, bytesTotal, t._get_html5_duration());
        t._onload(true);
      }

    }),

    loadedmetadata: _html5_event(function(e) {

      _s._wD(_h5+'loadedmetadata: '+this._t.sID);

    }),

    loadstart: _html5_event(function(e) {

      _s._wD(_h5+'loadstart: '+this._t.sID);
      // assume buffering at first
      this._t._onbufferchange(1);

    }),

    play: _html5_event(function(e) {

      _s._wD(_h5+'play: '+this._t.sID+', '+this._t.url);
      // once play starts, no buffering
      this._t._onbufferchange(0);

    }),

    playing: _html5_event(function(e) {

      _s._wD(_h5+'playing: '+this._t.sID);

      // once play starts, no buffering
      this._t._onbufferchange(0);

    }),

    progress: _html5_event(function(e) {

      var t = this._t;

      if (t.loaded) {
        return false;
      }

      var i, j, str, buffered = 0,
          isProgress = (e.type === 'progress'),
          ranges = e.target.buffered,

          // firefox 3.6 implements e.loaded/total (bytes)
          loaded = (e.loaded||0),

          total = (e.total||1);

      if (ranges && ranges.length) {

        // if loaded is 0, try TimeRanges implementation as % of load
        // https://developer.mozilla.org/en/DOM/TimeRanges

        for (i=ranges.length; i--;) {
          buffered = (ranges.end(i) - ranges.start(i));
        }

        // linear case, buffer sum; does not account for seeking and HTTP partials / byte ranges
        loaded = buffered/e.target.duration;

        // <d>
        if (isProgress && ranges.length > 1) {
          str = [];
          j = ranges.length;
          for (i=0; i<j; i++) {
            str.push(e.target.buffered.start(i) +'-'+ e.target.buffered.end(i));
          }
          _s._wD(_h5+'progress: timeRanges: '+str.join(', '));
        }

        if (isProgress && !isNaN(loaded)) {
          _s._wD(_h5+'progress: '+t.sID+': ' + Math.floor(loaded*100)+'% loaded');
        }
        // </d>

      }

      if (!isNaN(loaded)) {

        // if progress, likely not buffering
        t._onbufferchange(0);
        t._whileloading(loaded, total, t._get_html5_duration());
        if (loaded && total && loaded === total) {
          // in case "onload" doesn't fire (eg. gecko 1.9.2)
          _html5_events.load.call(this, e);
        }

      }

    }),

    ratechange: _html5_event(function(e) {

      _s._wD(_h5+'ratechange: '+this._t.sID);

    }),

    suspend: _html5_event(function(e) {

      // download paused/stopped, may have finished (eg. onload)
      var t = this._t;

      _s._wD(_h5+'suspend: '+t.sID);
      _html5_events.progress.call(this, e);
      t._onsuspend();

    }),

    stalled: _html5_event(function(e) {

      _s._wD(_h5+'stalled: '+this._t.sID);

    }),

    timeupdate: _html5_event(function(e) {

      this._t._onTimer();

    }),

    waiting: _html5_event(function(e) {

      var t = this._t;

      // see also: seeking
      _s._wD(_h5+'waiting: '+t.sID);

      // playback faster than download rate, etc.
      t._onbufferchange(1);

    })

  };

  _html5OK = function(iO) {

    // Use type, if specified. If HTML5-only mode, no other options, so just give 'er
    return (!iO.serverURL && (iO.type?_html5CanPlay({type:iO.type}):_html5CanPlay({url:iO.url})||_s.html5Only));

  };

  _html5Unload = function(oAudio) {

    /**
     * Internal method: Unload media, and cancel any current/pending network requests.
     * Firefox can load an empty URL, which allegedly destroys the decoder and stops the download.
     * https://developer.mozilla.org/En/Using_audio_and_video_in_Firefox#Stopping_the_download_of_media
     * Other UA behaviour is unclear, so everyone else gets an about:blank-style URL.
     */

    if (oAudio) {
      // Firefox likes '' for unload, most other UAs don't and fail to unload.
      oAudio.src = (_is_firefox ? '' : _emptyURL);
    }

  };

  _html5CanPlay = function(o) {

    /**
     * Try to find MIME, test and return truthiness
     * o = {
     *  url: '/path/to/an.mp3',
     *  type: 'audio/mp3'
     * }
     */

    if (!_s.useHTML5Audio || !_s.hasHTML5) {
      return false;
    }

    var url = (o.url || null),
        mime = (o.type || null),
        aF = _s.audioFormats,
        result,
        offset,
        fileExt,
        item;

    function preferFlashCheck(kind) {

      // whether flash should play a given type
      return (_s.preferFlash && _hasFlash && !_s.ignoreFlash && (typeof _s.flash[kind] !== 'undefined' && _s.flash[kind]));

    }

    // account for known cases like audio/mp3

    if (mime && _s.html5[mime] !== 'undefined') {
      return (_s.html5[mime] && !preferFlashCheck(mime));
    }

    if (!_html5Ext) {
      _html5Ext = [];
      for (item in aF) {
        if (aF.hasOwnProperty(item)) {
          _html5Ext.push(item);
          if (aF[item].related) {
            _html5Ext = _html5Ext.concat(aF[item].related);
          }
        }
      }
      _html5Ext = new RegExp('\\.('+_html5Ext.join('|')+')(\\?.*)?$','i');
    }

    // TODO: Strip URL queries, etc.
    fileExt = (url ? url.toLowerCase().match(_html5Ext) : null);

    if (!fileExt || !fileExt.length) {
      if (!mime) {
        return false;
      } else {
        // audio/mp3 -> mp3, result should be known
        offset = mime.indexOf(';');
        // strip "audio/X; codecs.."
        fileExt = (offset !== -1?mime.substr(0,offset):mime).substr(6);
      }
    } else {
      // match the raw extension name - "mp3", for example
      fileExt = fileExt[1];
    }

    if (fileExt && typeof _s.html5[fileExt] !== 'undefined') {
      // result known
      return (_s.html5[fileExt] && !preferFlashCheck(fileExt));
    } else {
      mime = 'audio/'+fileExt;
      result = _s.html5.canPlayType({type:mime});
      _s.html5[fileExt] = result;
      // _s._wD('canPlayType, found result: '+result);
      return (result && _s.html5[mime] && !preferFlashCheck(mime));
    }

  };

  _testHTML5 = function() {

    if (!_s.useHTML5Audio || typeof Audio === 'undefined') {
      return false;
    }

    // double-whammy: Opera 9.64 throws WRONG_ARGUMENTS_ERR if no parameter passed to Audio(), and Webkit + iOS happily tries to load "null" as a URL. :/
    var a = (typeof Audio !== 'undefined' ? (_isOpera ? new Audio(null) : new Audio()) : null),
        item, support = {}, aF, i;

    function _cp(m) {

      var canPlay, i, j, isOK = false;

      if (!a || typeof a.canPlayType !== 'function') {
        return false;
      }

      if (m instanceof Array) {
        // iterate through all mime types, return any successes
        for (i=0, j=m.length; i<j && !isOK; i++) {
          if (_s.html5[m[i]] || a.canPlayType(m[i]).match(_s.html5Test)) {
            isOK = true;
            _s.html5[m[i]] = true;

            // if flash can play and preferred, also mark it for use.
            _s.flash[m[i]] = !!(_s.preferFlash && _hasFlash && m[i].match(_flashMIME));

          }
        }
        return isOK;
      } else {
        canPlay = (a && typeof a.canPlayType === 'function' ? a.canPlayType(m) : false);
        return !!(canPlay && (canPlay.match(_s.html5Test)));
      }

    }

    // test all registered formats + codecs

    aF = _s.audioFormats;

    for (item in aF) {
      if (aF.hasOwnProperty(item)) {
        support[item] = _cp(aF[item].type);

        // write back generic type too, eg. audio/mp3
        support['audio/'+item] = support[item];

        // assign flash
        if (_s.preferFlash && !_s.ignoreFlash && item.match(_flashMIME)) {
          _s.flash[item] = true;
        } else {
          _s.flash[item] = false;
        }

        // assign result to related formats, too
        if (aF[item] && aF[item].related) {
          for (i=aF[item].related.length; i--;) {
            // eg. audio/m4a
            support['audio/'+aF[item].related[i]] = support[item];
            _s.html5[aF[item].related[i]] = support[item];
            _s.flash[aF[item].related[i]] = support[item];
          }
        }
      }
    }

    support.canPlayType = (a?_cp:null);
    _s.html5 = _mixin(_s.html5, support);

    return true;

  };

  _strings = {

    // <d>
    notReady: 'Not loaded yet - wait for soundManager.onload()/onready()',
    notOK: 'Audio support is not available.',
    domError: _smc + 'createMovie(): appendChild/innerHTML call failed. DOM not ready or other error.',
    spcWmode: _smc + 'createMovie(): Removing wmode, preventing known SWF loading issue(s)',
    swf404: _sm + ': Verify that %s is a valid path.',
    tryDebug: 'Try ' + _sm + '.debugFlash = true for more security details (output goes to SWF.)',
    checkSWF: 'See SWF output for more debug info.',
    localFail: _sm + ': Non-HTTP page (' + _doc.location.protocol + ' URL?) Review Flash player security settings for this special case:\nhttp://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html\nMay need to add/allow path, eg. c:/sm2/ or /users/me/sm2/',
    waitFocus: _sm + ': Special case: Waiting for focus-related event..',
    waitImpatient: _sm + ': Getting impatient, still waiting for Flash%s...',
    waitForever: _sm + ': Waiting indefinitely for Flash (will recover if unblocked)...',
    needFunction: _sm + ': Function object expected for %s',
    badID: 'Warning: Sound ID "%s" should be a string, starting with a non-numeric character',
    currentObj: '--- ' + _sm + '._debug(): Current sound objects ---',
    waitEI: _smc + 'initMovie(): Waiting for ExternalInterface call from Flash..',
    waitOnload: _sm + ': Waiting for window.onload()',
    docLoaded: _sm + ': Document already loaded',
    onload: _smc + 'initComplete(): calling soundManager.onload()',
    onloadOK: _sm + '.onload() complete',
    init: _smc + 'init()',
    didInit: _smc + 'init(): Already called?',
    flashJS: _sm + ': Attempting to call Flash from JS..',
    secNote: 'Flash security note: Network/internet URLs will not load due to security restrictions. Access can be configured via Flash Player Global Security Settings Page: http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html',
    badRemove: 'Warning: Failed to remove flash movie.',
    noPeak: 'Warning: peakData features unsupported for movieStar formats',
    shutdown: _sm + '.disable(): Shutting down',
    queue: _sm + ': Queueing %s handler',
    smFail: _sm + ': Failed to initialise.',
    smError: 'SMSound.load(): Exception: JS-Flash communication failed, or JS error.',
    fbTimeout: 'No flash response, applying .'+_swfCSS.swfTimedout+' CSS..',
    fbLoaded: 'Flash loaded',
    fbHandler: _smc+'flashBlockHandler()',
    manURL: 'SMSound.load(): Using manually-assigned URL',
    onURL: _sm + '.load(): current URL already assigned.',
    badFV: _sm + '.flashVersion must be 8 or 9. "%s" is invalid. Reverting to %s.',
    as2loop: 'Note: Setting stream:false so looping can work (flash 8 limitation)',
    noNSLoop: 'Note: Looping not implemented for MovieStar formats',
    needfl9: 'Note: Switching to flash 9, required for MP4 formats.',
    mfTimeout: 'Setting flashLoadTimeout = 0 (infinite) for off-screen, mobile flash case',
    mfOn: 'mobileFlash::enabling on-screen flash repositioning',
    policy: 'Enabling usePolicyFile for data access'
    // </d>

  };

  _str = function() {

    // internal string replace helper.
    // arguments: o [,items to replace]
    // <d>

    // real array, please
    var args = _slice.call(arguments),

    // first arg
    o = args.shift(),

    str = (_strings && _strings[o]?_strings[o]:''), i, j;
    if (str && args && args.length) {
      for (i = 0, j = args.length; i < j; i++) {
        str = str.replace('%s', args[i]);
      }
    }

    return str;
    // </d>

  };

  _loopFix = function(sOpt) {

    // flash 8 requires stream = false for looping to work
    if (_fV === 8 && sOpt.loops > 1 && sOpt.stream) {
      _wDS('as2loop');
      sOpt.stream = false;
    }

    return sOpt;

  };

  _policyFix = function(sOpt, sPre) {

    if (sOpt && !sOpt.usePolicyFile && (sOpt.onid3 || sOpt.usePeakData || sOpt.useWaveformData || sOpt.useEQData)) {
      _s._wD((sPre || '') + _str('policy'));
      sOpt.usePolicyFile = true;
    }

    return sOpt;

  };

  _complain = function(sMsg) {

    // <d>
    if (typeof console !== 'undefined' && typeof console.warn !== 'undefined') {
      console.warn(sMsg);
    } else {
      _s._wD(sMsg);
    }
    // </d>

  };

  _doNothing = function() {

    return false;

  };

  _disableObject = function(o) {

    var oProp;

    for (oProp in o) {
      if (o.hasOwnProperty(oProp) && typeof o[oProp] === 'function') {
        o[oProp] = _doNothing;
      }
    }

    oProp = null;

  };

  _failSafely = function(bNoDisable) {

    // general failure exception handler

    if (typeof bNoDisable === 'undefined') {
      bNoDisable = false;
    }

    if (_disabled || bNoDisable) {
      _wDS('smFail', 2);
      _s.disable(bNoDisable);
    }

  };

  _normalizeMovieURL = function(smURL) {

    var urlParams = null, url;

    if (smURL) {
      if (smURL.match(/\.swf(\?.*)?$/i)) {
        urlParams = smURL.substr(smURL.toLowerCase().lastIndexOf('.swf?') + 4);
        if (urlParams) {
          // assume user knows what they're doing
          return smURL;
        }
      } else if (smURL.lastIndexOf('/') !== smURL.length - 1) {
        // append trailing slash, if needed
        smURL += '/';
      }
    }

    url = (smURL && smURL.lastIndexOf('/') !== - 1 ? smURL.substr(0, smURL.lastIndexOf('/') + 1) : './') + _s.movieURL;

    if (_s.noSWFCache) {
      url += ('?ts=' + new Date().getTime());
    }

    return url;

  };

  _setVersionInfo = function() {

    // short-hand for internal use

    _fV = parseInt(_s.flashVersion, 10);

    if (_fV !== 8 && _fV !== 9) {
      _s._wD(_str('badFV', _fV, _defaultFlashVersion));
      _s.flashVersion = _fV = _defaultFlashVersion;
    }

    // debug flash movie, if applicable

    var isDebug = (_s.debugMode || _s.debugFlash?'_debug.swf':'.swf');

    if (_s.useHTML5Audio && !_s.html5Only && _s.audioFormats.mp4.required && _fV < 9) {
      _s._wD(_str('needfl9'));
      _s.flashVersion = _fV = 9;
    }

    _s.version = _s.versionNumber + (_s.html5Only?' (HTML5-only mode)':(_fV === 9?' (AS3/Flash 9)':' (AS2/Flash 8)'));

    // set up default options
    if (_fV > 8) {
      // +flash 9 base options
      _s.defaultOptions = _mixin(_s.defaultOptions, _s.flash9Options);
      _s.features.buffering = true;
      // +moviestar support
      _s.defaultOptions = _mixin(_s.defaultOptions, _s.movieStarOptions);
      _s.filePatterns.flash9 = new RegExp('\\.(mp3|' + _netStreamTypes.join('|') + ')(\\?.*)?$', 'i');
      _s.features.movieStar = true;
    } else {
      _s.features.movieStar = false;
    }

    // regExp for flash canPlay(), etc.
    _s.filePattern = _s.filePatterns[(_fV !== 8?'flash9':'flash8')];

    // if applicable, use _debug versions of SWFs
    _s.movieURL = (_fV === 8?'soundmanager2.swf':'soundmanager2_flash9.swf').replace('.swf', isDebug);

    _s.features.peakData = _s.features.waveformData = _s.features.eqData = (_fV > 8);

  };

  _setPolling = function(bPolling, bHighPerformance) {

    if (!_flash) {
      return false;
    }

    _flash._setPolling(bPolling, bHighPerformance);

  };

  _initDebug = function() {

    // starts debug mode, creating output <div> for UAs without console object

    // allow force of debug mode via URL
    if (_s.debugURLParam.test(_wl)) {
      _s.debugMode = true;
    }

    // <d>
    if (_id(_s.debugID)) {
      return false;
    }

    var oD, oDebug, oTarget, oToggle, tmp;

    if (_s.debugMode && !_id(_s.debugID) && (!_hasConsole || !_s.useConsole || !_s.consoleOnly)) {

      oD = _doc.createElement('div');
      oD.id = _s.debugID + '-toggle';

      oToggle = {
        'position': 'fixed',
        'bottom': '0px',
        'right': '0px',
        'width': '1.2em',
        'height': '1.2em',
        'lineHeight': '1.2em',
        'margin': '2px',
        'textAlign': 'center',
        'border': '1px solid #999',
        'cursor': 'pointer',
        'background': '#fff',
        'color': '#333',
        'zIndex': 10001
      };

      oD.appendChild(_doc.createTextNode('-'));
      oD.onclick = _toggleDebug;
      oD.title = 'Toggle SM2 debug console';

      if (_ua.match(/msie 6/i)) {
        oD.style.position = 'absolute';
        oD.style.cursor = 'hand';
      }

      for (tmp in oToggle) {
        if (oToggle.hasOwnProperty(tmp)) {
          oD.style[tmp] = oToggle[tmp];
        }
      }

      oDebug = _doc.createElement('div');
      oDebug.id = _s.debugID;
      oDebug.style.display = (_s.debugMode?'block':'none');

      if (_s.debugMode && !_id(oD.id)) {
        try {
          oTarget = _getDocument();
          oTarget.appendChild(oD);
        } catch(e2) {
          throw new Error(_str('domError')+' \n'+e2.toString());
        }
        oTarget.appendChild(oDebug);
      }

    }

    oTarget = null;
    // </d>

  };

  _idCheck = this.getSoundById;

  // <d>
  _wDS = function(o, errorLevel) {

    if (!o) {
      return '';
    } else {
      return _s._wD(_str(o), errorLevel);
    }

  };

  // last-resort debugging option

  if (_wl.indexOf('sm2-debug=alert') + 1 && _s.debugMode) {
    _s._wD = function(sText) {window.alert(sText);};
  }

  _toggleDebug = function() {

    var o = _id(_s.debugID),
    oT = _id(_s.debugID + '-toggle');

    if (!o) {
      return false;
    }

    if (_debugOpen) {
      // minimize
      oT.innerHTML = '+';
      o.style.display = 'none';
    } else {
      oT.innerHTML = '-';
      o.style.display = 'block';
    }

    _debugOpen = !_debugOpen;

  };

  _debugTS = function(sEventType, bSuccess, sMessage) {

    // troubleshooter debug hooks

    if (typeof sm2Debugger !== 'undefined') {
      try {
        sm2Debugger.handleEvent(sEventType, bSuccess, sMessage);
      } catch(e) {
        // oh well
      }
    }

    return true;

  };
  // </d>

  _getSWFCSS = function() {

    var css = [];

    if (_s.debugMode) {
      css.push(_swfCSS.sm2Debug);
    }

    if (_s.debugFlash) {
      css.push(_swfCSS.flashDebug);
    }

    if (_s.useHighPerformance) {
      css.push(_swfCSS.highPerf);
    }

    return css.join(' ');

  };

  _flashBlockHandler = function() {

    // *possible* flash block situation.

    var name = _str('fbHandler'),
        p = _s.getMoviePercent(),
        css = _swfCSS,
        error = {type:'FLASHBLOCK'};

    if (_s.html5Only) {
      return false;
    }

    if (!_s.ok()) {

      if (_needsFlash) {
        // make the movie more visible, so user can fix
        _s.oMC.className = _getSWFCSS() + ' ' + css.swfDefault + ' ' + (p === null?css.swfTimedout:css.swfError);
        _s._wD(name+': '+_str('fbTimeout')+(p?' ('+_str('fbLoaded')+')':''));
      }

      _s.didFlashBlock = true;

      // fire onready(), complain lightly
      _processOnEvents({type:'ontimeout', ignoreInit:true, error:error});
      _catchError(error);

    } else {

      // SM2 loaded OK (or recovered)

      // <d>
      if (_s.didFlashBlock) {
        _s._wD(name+': Unblocked');
      }
      // </d>

      if (_s.oMC) {
        _s.oMC.className = [_getSWFCSS(), css.swfDefault, css.swfLoaded + (_s.didFlashBlock?' '+css.swfUnblocked:'')].join(' ');
      }

    }

  };

  _addOnEvent = function(sType, oMethod, oScope) {

    if (typeof _on_queue[sType] === 'undefined') {
      _on_queue[sType] = [];
    }

    _on_queue[sType].push({
      'method': oMethod,
      'scope': (oScope || null),
      'fired': false
    });

  };

  _processOnEvents = function(oOptions) {

    // assume onready, if unspecified

    if (!oOptions) {
      oOptions = {
        type: 'onready'
      };
    }

    if (!_didInit && oOptions && !oOptions.ignoreInit) {
      // not ready yet.
      return false;
    }

    if (oOptions.type === 'ontimeout' && _s.ok()) {
      // invalid case
      return false;
    }

    var status = {
          success: (oOptions && oOptions.ignoreInit?_s.ok():!_disabled)
        },

        // queue specified by type, or none
        srcQueue = (oOptions && oOptions.type?_on_queue[oOptions.type]||[]:[]),

        queue = [], i, j,
        args = [status],
        canRetry = (_needsFlash && _s.useFlashBlock && !_s.ok());

    if (oOptions.error) {
      args[0].error = oOptions.error;
    }

    for (i = 0, j = srcQueue.length; i < j; i++) {
      if (srcQueue[i].fired !== true) {
        queue.push(srcQueue[i]);
      }
    }

    if (queue.length) {
      _s._wD(_sm + ': Firing ' + queue.length + ' '+oOptions.type+'() item' + (queue.length === 1?'':'s'));
      for (i = 0, j = queue.length; i < j; i++) {
        if (queue[i].scope) {
          queue[i].method.apply(queue[i].scope, args);
        } else {
          queue[i].method.apply(this, args);
        }
        if (!canRetry) {
          // flashblock case doesn't count here
          queue[i].fired = true;
        }
      }
    }

    return true;

  };

  _initUserOnload = function() {

    _win.setTimeout(function() {

      if (_s.useFlashBlock) {
        _flashBlockHandler();
      }

      _processOnEvents();

      // call user-defined "onload", scoped to window

      if (_s.onload instanceof Function) {
        _wDS('onload', 1);
        _s.onload.apply(_win);
        _wDS('onloadOK', 1);
      }

      if (_s.waitForWindowLoad) {
        _event.add(_win, 'load', _initUserOnload);
      }

    },1);

  };

  _detectFlash = function() {

    // hat tip: Flash Detect library (BSD, (C) 2007) by Carl "DocYes" S. Yestrau - http://featureblend.com/javascript-flash-detection-library.html / http://featureblend.com/license.txt

    if (_hasFlash !== undefined) {
      // this work has already been done.
      return _hasFlash;
    }

    var hasPlugin = false, n = navigator, nP = n.plugins, obj, type, types, AX = _win.ActiveXObject;

    if (nP && nP.length) {
      type = 'application/x-shockwave-flash';
      types = n.mimeTypes;
      if (types && types[type] && types[type].enabledPlugin && types[type].enabledPlugin.description) {
        hasPlugin = true;
      }
    } else if (typeof AX !== 'undefined') {
      try {
        obj = new AX('ShockwaveFlash.ShockwaveFlash');
      } catch(e) {
        // oh well
      }
      hasPlugin = (!!obj);
    }

    _hasFlash = hasPlugin;

    return hasPlugin;

  };

  _featureCheck = function() {

    var needsFlash, item,

        // iPhone <= 3.1 has broken HTML5 audio(), but firmware 3.2 (iPad) + iOS4 works.
        isSpecial = (_is_iDevice && !!(_ua.match(/os (1|2|3_0|3_1)/i)));

    if (isSpecial) {

      // has Audio(), but is broken; let it load links directly.
      _s.hasHTML5 = false;

      // ignore flash case, however
      _s.html5Only = true;

      if (_s.oMC) {
        _s.oMC.style.display = 'none';
      }

      return false;

    }

    if (_s.useHTML5Audio) {

      if (!_s.html5 || !_s.html5.canPlayType) {
        _s._wD('SoundManager: No HTML5 Audio() support detected.');
        _s.hasHTML5 = false;
        return true;
      } else {
        _s.hasHTML5 = true;
      }
      if (_isBadSafari) {
        _s._wD(_smc+'Note: Buggy HTML5 Audio in Safari on this OS X release, see https://bugs.webkit.org/show_bug.cgi?id=32159 - '+(!_hasFlash?' would use flash fallback for MP3/MP4, but none detected.':'will use flash fallback for MP3/MP4, if available'),1);
        if (_detectFlash()) {
          return true;
        }
      }
    } else {

      // flash needed (or, HTML5 needs enabling.)
      return true;

    }

    for (item in _s.audioFormats) {
      if (_s.audioFormats.hasOwnProperty(item)) {
        if ((_s.audioFormats[item].required && !_s.html5.canPlayType(_s.audioFormats[item].type)) || _s.flash[item] || _s.flash[_s.audioFormats[item].type]) {
          // flash may be required, or preferred for this format
          needsFlash = true;
        }
      }
    }

    // sanity check..
    if (_s.ignoreFlash) {
      needsFlash = false;
    }

    _s.html5Only = (_s.hasHTML5 && _s.useHTML5Audio && !needsFlash);

    return (!_s.html5Only);

  };

  _parseURL = function(url) {

    /**
     * Internal: Finds and returns the first playable URL (or failing that, the first URL.)
     * @param {string or array} url A single URL string, OR, an array of URL strings or {url:'/path/to/resource', type:'audio/mp3'} objects.
     */

    var i, j, result = 0;

    if (url instanceof Array) {

      // find the first good one
      for (i=0, j=url.length; i<j; i++) {

        if (url[i] instanceof Object) {
          // MIME check
          if (_s.canPlayMIME(url[i].type)) {
            result = i;
            break;
          }

        } else if (_s.canPlayURL(url[i])) {
          // URL string check
          result = i;
          break;
        }

      }

      // normalize to string
      if (url[result].url) {
        url[result] = url[result].url;
      }

      return url[result];

    } else {

      // single URL case
      return url;

    }

  };


  _startTimer = function(oSound) {

    /**
     * attach a timer to this sound, and start an interval if needed
     */

    if (!oSound._hasTimer) {

      oSound._hasTimer = true;

      if (!_likesHTML5 && _s.html5PollingInterval) {

        if (_h5IntervalTimer === null && _h5TimerCount === 0) {

          _h5IntervalTimer = window.setInterval(_timerExecute, _s.html5PollingInterval);
   
        }

        _h5TimerCount++;

      }

    }

  };

  _stopTimer = function(oSound) {

    /**
     * detach a timer
     */

    if (oSound._hasTimer) {

      oSound._hasTimer = false;

      if (!_likesHTML5 && _s.html5PollingInterval) {

        // interval will stop itself at next execution.

        _h5TimerCount--;

      }

    }

  };

  _timerExecute = function() {

    /**
     * manual polling for HTML5 progress events, ie., whileplaying() (can achieve greater precision than conservative default HTML5 interval)
     */

    var i, j;

    if (_h5IntervalTimer !== null && !_h5TimerCount) {

      // no active timers, stop polling interval.

      window.clearInterval(_h5IntervalTimer);

      _h5IntervalTimer = null;

      return false;

    }

    // check all HTML5 sounds with timers

    for (i = _s.soundIDs.length; i--;) {

      if (_s.sounds[_s.soundIDs[i]].isHTML5 && _s.sounds[_s.soundIDs[i]]._hasTimer) {

        _s.sounds[_s.soundIDs[i]]._onTimer();

      }

    }

  };

  _catchError = function(options) {

    options = (typeof options !== 'undefined' ? options : {});

    if (_s.onerror instanceof Function) {
      _s.onerror.apply(_win, [{type:(typeof options.type !== 'undefined' ? options.type : null)}]);
    }

    if (typeof options.fatal !== 'undefined' && options.fatal) {
      _s.disable();
    }

  };

  _badSafariFix = function() {

    // special case: "bad" Safari (OS X 10.3 - 10.7) must fall back to flash for MP3/MP4
    if (!_isBadSafari || !_detectFlash()) {
      // doesn't apply
      return false;
    }

    var aF = _s.audioFormats, i, item;

    for (item in aF) {
      if (aF.hasOwnProperty(item)) {
        if (item === 'mp3' || item === 'mp4') {
          _s._wD(_sm+': Using flash fallback for '+item+' format');
          _s.html5[item] = false;
          // assign result to related formats, too
          if (aF[item] && aF[item].related) {
            for (i = aF[item].related.length; i--;) {
              _s.html5[aF[item].related[i]] = false;
            }
          }
        }
      }
    }

  };

  /**
   * Pseudo-private flash/ExternalInterface methods
   * ----------------------------------------------
   */

  this._setSandboxType = function(sandboxType) {

    // <d>
    var sb = _s.sandbox;

    sb.type = sandboxType;
    sb.description = sb.types[(typeof sb.types[sandboxType] !== 'undefined'?sandboxType:'unknown')];

    _s._wD('Flash security sandbox type: ' + sb.type);

    if (sb.type === 'localWithFile') {

      sb.noRemote = true;
      sb.noLocal = false;
      _wDS('secNote', 2);

    } else if (sb.type === 'localWithNetwork') {

      sb.noRemote = false;
      sb.noLocal = true;

    } else if (sb.type === 'localTrusted') {

      sb.noRemote = false;
      sb.noLocal = false;

    }
    // </d>

  };

  this._externalInterfaceOK = function(flashDate, swfVersion) {

    // flash callback confirming flash loaded, EI working etc.
    // flashDate = approx. timing/delay info for JS/flash bridge
    // swfVersion: SWF build string

    if (_s.swfLoaded) {
      return false;
    }

    var e, eiTime = new Date().getTime();

    _s._wD(_smc+'externalInterfaceOK()' + (flashDate?' (~' + (eiTime - flashDate) + ' ms)':''));
    _debugTS('swf', true);
    _debugTS('flashtojs', true);
    _s.swfLoaded = true;
    _tryInitOnFocus = false;

    if (_isBadSafari) {
      _badSafariFix();
    }

    // complain if JS + SWF build/version strings don't match, excluding +DEV builds
    // <d>
    if (!swfVersion || swfVersion.replace(/\+dev/i,'') !== _s.versionNumber.replace(/\+dev/i, '')) {

      e = _sm + ': Fatal: JavaScript file build "' + _s.versionNumber + '" does not match Flash SWF build "' + swfVersion + '" at ' + _s.url + '. Ensure both are up-to-date.';

      // escape flash -> JS stack so this error fires in window.
      setTimeout(function versionMismatch() {
        throw new Error(e);
      }, 0);

      // exit, init will fail with timeout
      return false;

    }
    // </d>

    if (_isIE) {
      // IE needs a timeout OR delay until window.onload - may need TODO: investigating
      setTimeout(_init, 100);
    } else {
      _init();
    }

  };

  /**
   * Private initialization helpers
   * ------------------------------
   */

  _createMovie = function(smID, smURL) {

    if (_didAppend && _appendSuccess) {
      // ignore if already succeeded
      return false;
    }

    function _initMsg() {
      _s._wD('-- SoundManager 2 ' + _s.version + (!_s.html5Only && _s.useHTML5Audio?(_s.hasHTML5?' + HTML5 audio':', no HTML5 audio support'):'') + (!_s.html5Only ? (_s.useHighPerformance?', high performance mode, ':', ') + (( _s.flashPollingInterval ? 'custom (' + _s.flashPollingInterval + 'ms)' : 'normal') + ' polling') + (_s.wmode?', wmode: ' + _s.wmode:'') + (_s.debugFlash?', flash debug mode':'') + (_s.useFlashBlock?', flashBlock mode':'') : '') + ' --', 1);
    }

    if (_s.html5Only) {

      // 100% HTML5 mode
      _setVersionInfo();

      _initMsg();
      _s.oMC = _id(_s.movieID);
      _init();

      // prevent multiple init attempts
      _didAppend = true;

      _appendSuccess = true;

      return false;

    }

    // flash path
    var remoteURL = (smURL || _s.url),
    localURL = (_s.altURL || remoteURL),
    swfTitle = 'JS/Flash audio component (SoundManager 2)',
    oEmbed, oMovie, oTarget = _getDocument(), tmp, movieHTML, oEl, extraClass = _getSWFCSS(),
    s, x, sClass, side = 'auto', isRTL = null,
    html = _doc.getElementsByTagName('html')[0];

    isRTL = (html && html.dir && html.dir.match(/rtl/i));
    smID = (typeof smID === 'undefined'?_s.id:smID);

    function param(name, value) {
      return '<param name="'+name+'" value="'+value+'" />';
    }

    // safety check for legacy (change to Flash 9 URL)
    _setVersionInfo();
    _s.url = _normalizeMovieURL(_overHTTP?remoteURL:localURL);
    smURL = _s.url;

    _s.wmode = (!_s.wmode && _s.useHighPerformance ? 'transparent' : _s.wmode);

    if (_s.wmode !== null && (_ua.match(/msie 8/i) || (!_isIE && !_s.useHighPerformance)) && navigator.platform.match(/win32|win64/i)) {
      /**
       * extra-special case: movie doesn't load until scrolled into view when using wmode = anything but 'window' here
       * does not apply when using high performance (position:fixed means on-screen), OR infinite flash load timeout
       * wmode breaks IE 8 on Vista + Win7 too in some cases, as of January 2011 (?)
       */
      _wDS('spcWmode');
      _s.wmode = null;
    }

    oEmbed = {
      'name': smID,
      'id': smID,
      'src': smURL,
      'width': side,
      'height': side,
      'quality': 'high',
      'allowScriptAccess': _s.allowScriptAccess,
      'bgcolor': _s.bgColor,
      'pluginspage': _http+'www.macromedia.com/go/getflashplayer',
      'title': swfTitle,
      'type': 'application/x-shockwave-flash',
      'wmode': _s.wmode,
      // http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
      'hasPriority': 'true'
    };

    if (_s.debugFlash) {
      oEmbed.FlashVars = 'debug=1';
    }

    if (!_s.wmode) {
      // don't write empty attribute
      delete oEmbed.wmode;
    }

    if (_isIE) {

      // IE is "special".
      oMovie = _doc.createElement('div');
      movieHTML = [
        '<object id="' + smID + '" data="' + smURL + '" type="' + oEmbed.type + '" title="' + oEmbed.title +'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="' + _http+'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0" width="' + oEmbed.width + '" height="' + oEmbed.height + '">',
        param('movie', smURL),
        param('AllowScriptAccess', _s.allowScriptAccess),
        param('quality', oEmbed.quality),
        (_s.wmode? param('wmode', _s.wmode): ''),
        param('bgcolor', _s.bgColor),
        param('hasPriority', 'true'),
        (_s.debugFlash ? param('FlashVars', oEmbed.FlashVars) : ''),
        '</object>'
      ].join('');

    } else {

      oMovie = _doc.createElement('embed');
      for (tmp in oEmbed) {
        if (oEmbed.hasOwnProperty(tmp)) {
          oMovie.setAttribute(tmp, oEmbed[tmp]);
        }
      }

    }

    _initDebug();
    extraClass = _getSWFCSS();
    oTarget = _getDocument();

    if (oTarget) {

      _s.oMC = (_id(_s.movieID) || _doc.createElement('div'));

      if (!_s.oMC.id) {

        _s.oMC.id = _s.movieID;
        _s.oMC.className = _swfCSS.swfDefault + ' ' + extraClass;
        s = null;
        oEl = null;

        if (!_s.useFlashBlock) {
          if (_s.useHighPerformance) {
            // on-screen at all times
            s = {
              'position': 'fixed',
              'width': '8px',
              'height': '8px',
              // >= 6px for flash to run fast, >= 8px to start up under Firefox/win32 in some cases. odd? yes.
              'bottom': '0px',
              'left': '0px',
              'overflow': 'hidden'
            };
          } else {
            // hide off-screen, lower priority
            s = {
              'position': 'absolute',
              'width': '6px',
              'height': '6px',
              'top': '-9999px',
              'left': '-9999px'
            };
            if (isRTL) {
              s.left = Math.abs(parseInt(s.left,10))+'px';
            }
          }
        }

        if (_isWebkit) {
          // soundcloud-reported render/crash fix, safari 5
          _s.oMC.style.zIndex = 10000;
        }

        if (!_s.debugFlash) {
          for (x in s) {
            if (s.hasOwnProperty(x)) {
              _s.oMC.style[x] = s[x];
            }
          }
        }

        try {
          if (!_isIE) {
            _s.oMC.appendChild(oMovie);
          }
          oTarget.appendChild(_s.oMC);
          if (_isIE) {
            oEl = _s.oMC.appendChild(_doc.createElement('div'));
            oEl.className = _swfCSS.swfBox;
            oEl.innerHTML = movieHTML;
          }
          _appendSuccess = true;
        } catch(e) {
          throw new Error(_str('domError')+' \n'+e.toString());
        }

      } else {

        // SM2 container is already in the document (eg. flashblock use case)
        sClass = _s.oMC.className;
        _s.oMC.className = (sClass?sClass+' ':_swfCSS.swfDefault) + (extraClass?' '+extraClass:'');
        _s.oMC.appendChild(oMovie);
        if (_isIE) {
          oEl = _s.oMC.appendChild(_doc.createElement('div'));
          oEl.className = _swfCSS.swfBox;
          oEl.innerHTML = movieHTML;
        }
        _appendSuccess = true;

      }

    }

    _didAppend = true;
    _initMsg();
    _s._wD(_smc+'createMovie(): Trying to load ' + smURL + (!_overHTTP && _s.altURL?' (alternate URL)':''), 1);

    return true;

  };

  _initMovie = function() {

    if (_s.html5Only) {
      _createMovie();
      return false;
    }

    // attempt to get, or create, movie
    // may already exist
    if (_flash) {
      return false;
    }

    // inline markup case
    _flash = _s.getMovie(_s.id);

    if (!_flash) {
      if (!_oRemoved) {
        // try to create
        _createMovie(_s.id, _s.url);
      } else {
        // try to re-append removed movie after reboot()
        if (!_isIE) {
          _s.oMC.appendChild(_oRemoved);
        } else {
          _s.oMC.innerHTML = _oRemovedHTML;
        }
        _oRemoved = null;
        _didAppend = true;
      }
      _flash = _s.getMovie(_s.id);
    }

    // <d>
    if (_flash) {
      _wDS('waitEI');
    }
    // </d>

    if (_s.oninitmovie instanceof Function) {
      setTimeout(_s.oninitmovie, 1);
    }

    return true;

  };

  _delayWaitForEI = function() {

    setTimeout(_waitForEI, 1000);

  };

  _waitForEI = function() {

    if (_waitingForEI) {
      return false;
    }

    _waitingForEI = true;
    _event.remove(_win, 'load', _delayWaitForEI);

    if (_tryInitOnFocus && !_isFocused) {
      // giant Safari 3.1 hack - assume mousemove = focus given lack of focus event
      _wDS('waitFocus');
      return false;
    }

    var p;
    if (!_didInit) {
      p = _s.getMoviePercent();
      _s._wD(_str('waitImpatient', (p === 100?' (SWF loaded)':(p > 0?' (SWF ' + p + '% loaded)':''))));
    }

    setTimeout(function() {

      p = _s.getMoviePercent();

      // <d>
      if (!_didInit) {
        _s._wD(_sm + ': No Flash response within expected time.\nLikely causes: ' + (p === 0?'Loading ' + _s.movieURL + ' may have failed (and/or Flash ' + _fV + '+ not present?), ':'') + 'Flash blocked or JS-Flash security error.' + (_s.debugFlash?' ' + _str('checkSWF'):''), 2);
        if (!_overHTTP && p) {
          _wDS('localFail', 2);
          if (!_s.debugFlash) {
            _wDS('tryDebug', 2);
          }
        }
        if (p === 0) {
          // if 0 (not null), probably a 404.
          _s._wD(_str('swf404', _s.url));
        }
        _debugTS('flashtojs', false, ': Timed out' + _overHTTP?' (Check flash security or flash blockers)':' (No plugin/missing SWF?)');
      }
      // </d>

      // give up / time-out, depending

      if (!_didInit && _okToDisable) {
        if (p === null) {
          // SWF failed. Maybe blocked.
          if (_s.useFlashBlock || _s.flashLoadTimeout === 0) {
            if (_s.useFlashBlock) {
              _flashBlockHandler();
            }
            _wDS('waitForever');
          } else {
            // old SM2 behaviour, simply fail
            _failSafely(true);
          }
        } else {
          // flash loaded? Shouldn't be a blocking issue, then.
          if (_s.flashLoadTimeout === 0) {
             _wDS('waitForever');
          } else {
            _failSafely(true);
          }
        }
      }

    }, _s.flashLoadTimeout);

  };

  _handleFocus = function() {

    function cleanup() {
      _event.remove(_win, 'focus', _handleFocus);
      _event.remove(_win, 'load', _handleFocus);
    }

    if (_isFocused || !_tryInitOnFocus) {
      cleanup();
      return true;
    }

    _okToDisable = true;
    _isFocused = true;
    _s._wD(_smc+'handleFocus()');

    if (_isSafari && _tryInitOnFocus) {
      _event.remove(_win, 'mousemove', _handleFocus);
    }

    // allow init to restart
    _waitingForEI = false;

    cleanup();
    return true;

  };

  _showSupport = function() {

    var item, tests = [];

    if (_s.useHTML5Audio && _s.hasHTML5) {
      for (item in _s.audioFormats) {
        if (_s.audioFormats.hasOwnProperty(item)) {
          tests.push(item + ': ' + _s.html5[item] + (!_s.html5[item] && _hasFlash && _s.flash[item] ? ' (using flash)' : (_s.preferFlash && _s.flash[item] && _hasFlash ? ' (preferring flash)': (!_s.html5[item] ? ' (' + (_s.audioFormats[item].required ? 'required, ':'') + 'and no flash support)' : ''))));
        }
      }
      _s._wD('-- SoundManager 2: HTML5 support tests ('+_s.html5Test+'): '+tests.join(', ')+' --',1);
    }

  };

  _initComplete = function(bNoDisable) {

    if (_didInit) {
      return false;
    }

    if (_s.html5Only) {
      // all good.
      _s._wD('-- SoundManager 2: loaded --');
      _didInit = true;
      _initUserOnload();
      _debugTS('onload', true);
      return true;
    }

    var wasTimeout = (_s.useFlashBlock && _s.flashLoadTimeout && !_s.getMoviePercent()),
        error;

    if (!wasTimeout) {
      _didInit = true;
      if (_disabled) {
        error = {type: (!_hasFlash && _needsFlash ? 'NO_FLASH' : 'INIT_TIMEOUT')};
      }
    }

    _s._wD('-- SoundManager 2 ' + (_disabled?'failed to load':'loaded') + ' (' + (_disabled?'security/load error':'OK') + ') --', 1);

    if (_disabled || bNoDisable) {
      if (_s.useFlashBlock && _s.oMC) {
        _s.oMC.className = _getSWFCSS() + ' ' + (_s.getMoviePercent() === null?_swfCSS.swfTimedout:_swfCSS.swfError);
      }
      _processOnEvents({type:'ontimeout', error:error});
      _debugTS('onload', false);
      _catchError(error);
      return false;
    } else {
      _debugTS('onload', true);
    }

    if (_s.waitForWindowLoad && !_windowLoaded) {
      _wDS('waitOnload');
      _event.add(_win, 'load', _initUserOnload);
      return false;
    } else {
      // <d>
      if (_s.waitForWindowLoad && _windowLoaded) {
        _wDS('docLoaded');
      }
      // </d>
      _initUserOnload();
    }

    return true;

  };

  _init = function() {

    _wDS('init');

    // called after onload()

    if (_didInit) {
      _wDS('didInit');
      return false;
    }

    function _cleanup() {
      _event.remove(_win, 'load', _s.beginDelayedInit);
    }

    if (_s.html5Only) {
      if (!_didInit) {
        // we don't need no steenking flash!
        _cleanup();
        _s.enabled = true;
        _initComplete();
      }
      return true;
    }

    // flash path
    _initMovie();

    try {

      _wDS('flashJS');

      // attempt to talk to Flash
      _flash._externalInterfaceTest(false);

      // apply user-specified polling interval, OR, if "high performance" set, faster vs. default polling
      // (determines frequency of whileloading/whileplaying callbacks, effectively driving UI framerates)
      _setPolling(true, (_s.flashPollingInterval || (_s.useHighPerformance ? 10 : 50)));

      if (!_s.debugMode) {
        // stop the SWF from making debug output calls to JS
        _flash._disableDebug();
      }

      _s.enabled = true;
      _debugTS('jstoflash', true);

      if (!_s.html5Only) {
        // prevent browser from showing cached page state (or rather, restoring "suspended" page state) via back button, because flash may be dead
        // http://www.webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/
        _event.add(_win, 'unload', _doNothing);
      }

    } catch(e) {

      _s._wD('js/flash exception: ' + e.toString());
      _debugTS('jstoflash', false);
      _catchError({type:'JS_TO_FLASH_EXCEPTION', fatal:true});
      // don't disable, for reboot()
      _failSafely(true);
      _initComplete();

      return false;

    }

    _initComplete();

    // disconnect events
    _cleanup();

    return true;

  };

  _domContentLoaded = function() {

    if (_didDCLoaded) {
      return false;
    }

    _didDCLoaded = true;
    _initDebug();

    /**
     * Temporary feature: allow force of HTML5 via URL params: sm2-usehtml5audio=0 or 1
     * Ditto for sm2-preferFlash, too.
     */
    // <d>
    (function(){

      var a = 'sm2-usehtml5audio=', l = _wl.toLowerCase(), b = null,
      a2 = 'sm2-preferflash=', b2 = null, hasCon = (typeof console !== 'undefined' && typeof console.log !== 'undefined');

      if (l.indexOf(a) !== -1) {
        b = (l.charAt(l.indexOf(a)+a.length) === '1');
        if (hasCon) {
          console.log((b?'Enabling ':'Disabling ')+'useHTML5Audio via URL parameter');
        }
        _s.useHTML5Audio = b;
      }

      if (l.indexOf(a2) !== -1) {
        b2 = (l.charAt(l.indexOf(a2)+a2.length) === '1');
        if (hasCon) {
          console.log((b2?'Enabling ':'Disabling ')+'preferFlash via URL parameter');
        }
        _s.preferFlash = b2;
      }

    }());
    // </d>

    if (!_hasFlash && _s.hasHTML5) {
      _s._wD('SoundManager: No Flash detected'+(!_s.useHTML5Audio?', enabling HTML5.':'. Trying HTML5-only mode.'));
      _s.useHTML5Audio = true;
      // make sure we aren't preferring flash, either
      // TODO: preferFlash should not matter if flash is not installed. Currently, stuff breaks without the below tweak.
      _s.preferFlash = false;
    }

    _testHTML5();
    _s.html5.usingFlash = _featureCheck();
    _needsFlash = _s.html5.usingFlash;
    _showSupport();

    if (!_hasFlash && _needsFlash) {
      _s._wD('SoundManager: Fatal error: Flash is needed to play some required formats, but is not available.');
      // TODO: Fatal here vs. timeout approach, etc.
      // hack: fail sooner.
      _s.flashLoadTimeout = 1;
    }

    if (_doc.removeEventListener) {
      _doc.removeEventListener('DOMContentLoaded', _domContentLoaded, false);
    }

    _initMovie();
    return true;

  };

  _domContentLoadedIE = function() {

    if (_doc.readyState === 'complete') {
      _domContentLoaded();
      _doc.detachEvent('onreadystatechange', _domContentLoadedIE);
    }

    return true;

  };

  _winOnLoad = function() {
    // catch edge case of _initComplete() firing after window.load()
    _windowLoaded = true;
    _event.remove(_win, 'load', _winOnLoad);
  };

  // sniff up-front
  _detectFlash();

  // focus and window load, init (primarily flash-driven)
  _event.add(_win, 'focus', _handleFocus);
  _event.add(_win, 'load', _handleFocus);
  _event.add(_win, 'load', _delayWaitForEI);
  _event.add(_win, 'load', _winOnLoad);


  if (_isSafari && _tryInitOnFocus) {
    // massive Safari 3.1 focus detection hack
    _event.add(_win, 'mousemove', _handleFocus);
  }

  if (_doc.addEventListener) {

    _doc.addEventListener('DOMContentLoaded', _domContentLoaded, false);

  } else if (_doc.attachEvent) {

    _doc.attachEvent('onreadystatechange', _domContentLoadedIE);

  } else {

    // no add/attachevent support - safe to assume no JS -> Flash either
    _debugTS('onload', false);
    _catchError({type:'NO_DOM2_EVENTS', fatal:true});

  }

  if (_doc.readyState === 'complete') {
    // DOMReady has already happened.
    setTimeout(_domContentLoaded,100);
  }

} // SoundManager()

// SM2_DEFER details: http://www.schillmania.com/projects/soundmanager2/doc/getstarted/#lazy-loading

if (typeof SM2_DEFER === 'undefined' || !SM2_DEFER) {
  soundManager = new SoundManager();
}

/**
 * SoundManager public interfaces
 * ------------------------------
 */

window.SoundManager = SoundManager; // constructor
window.soundManager = soundManager; // public API, flash callbacks etc.

}(window));

soundManager.url = '/2009/';
soundManager.flashVersion = 9;
soundManager.useMovieStar = true;
soundManager.debugMode = (window.location.href.match(/debug/i));

function playMovie(oLink,sURL,thumbURL,e) {
  // screw this, just load the damn URL.
  window.location.href = sURL;
/*
  var isIE6 = navigator.userAgent.match(/msie 6/i);
  if (soundManager._disabled || isIE6) {
	// No SM2 support - OR, IE 6 just doesn't render video nicely (fluid min/max-width type scale, anyway)
	if (isIE6) {
      // IE 6 doesn't seem to follow the link despite return true, either. WTF.
	  window.location.href = sURL;
	}
    return true;	
  }
  var sID = 'theMovie';
  try {
	if (!thumbURL) {
	  // assume JPG thumbnail URL matches movie URL
	  thumbURL = sURL.replace(/(mov|flv|mp4)/i,'jpg');
	}
	if (thumbURL) {
	  $('videoThumb').src = thumbURL;
	  // alert($('videoThumb').src);
	}
    var oImg = oLink.getElementsByTagName('img');
    $('sm2-container').style.background = '#000';
    if (oImg.length) {
	  // thumbnail - hide, but keep the element there to retain video scale
	  oImg[0].style.visibility = 'hidden';
    }
    if ($('videoLink')) {
	  $('videoLink').style.visibility = 'hidden';
	}
	if (soundManager.sounds[sID]) {
	  soundManager.destroySound(sID);	
	}
    soundManager.createVideo(sID,sURL);
    soundManager.play(sID,{
	  onmetadata:function() {
		// show movie overtop of image
		$('sm2movie').style.marginLeft = '0px';
	  }
    });
    if (typeof e.stopPropagation != 'undefined') {
	  e.stopPropagation();
    } else {
	  e.cancelBubble = true;
    }
    return false;
  } catch(e) {
    // oh well
    if (window.location.href.match(/debug/i)) {
	  alert('video error: '+e.toString());
	}
    return true;
  }
*/
}

/**
 * SoundManager 2 Demo: Play MP3 links via button
 * ----------------------------------------------
 *
 * http://schillmania.com/projects/soundmanager2/
 *
 * A simple demo making MP3s playable "inline"
 * and easily styled/customizable via CSS.
 *
 * A variation of the "play mp3 links" demo.
 *
 * Requires SoundManager 2 Javascript API.
 */

/*jslint white: false, onevar: true, undef: true, nomen: false, eqeqeq: true, plusplus: false, bitwise: true, regexp: false, newcap: true, immed: true */
/*global document, window, soundManager, navigator */

function BasicMP3Player() {
  var self = this,
      pl = this,
      sm = soundManager, // soundManager instance
      isTouchDevice = (navigator.userAgent.match(/ipad|iphone/i)),
      isIE = (navigator.userAgent.match(/msie/i));
  this.excludeClass = 'button-exclude'; // CSS class for ignoring MP3 links
  this.links = [];
  this.sounds = [];
  this.soundsByURL = [];
  this.indexByURL = [];
  this.lastSound = null;
  this.soundCount = 0;

  this.config = {
    // configuration options
    playNext: false, // stop after one sound, or play through list until end
    autoPlay: false  // start playing the first sound right away
  };

  this.css = {
    // CSS class names appended to link during various states
    sDefault: 'sm2_button', // default state
    sLoading: 'sm2_loading',
    sPlaying: 'sm2_playing',
    sPaused: 'sm2_paused'
  };

  // event + DOM utils

  this.includeClass = this.css.sDefault;

  this.addEventHandler = (typeof window.addEventListener !== 'undefined' ? function(o, evtName, evtHandler) {
    return o.addEventListener(evtName,evtHandler,false);
  } : function(o, evtName, evtHandler) {
    o.attachEvent('on'+evtName,evtHandler);
  });

  this.removeEventHandler = (typeof window.removeEventListener !== 'undefined' ? function(o, evtName, evtHandler) {
    return o.removeEventListener(evtName,evtHandler,false);
  } : function(o, evtName, evtHandler) {
    return o.detachEvent('on'+evtName,evtHandler);
  });

  this.classContains = function(o,cStr) {
    return (typeof(o.className)!=='undefined'?o.className.match(new RegExp('(\\s|^)'+cStr+'(\\s|$)')):false);
  };

  this.addClass = function(o,cStr) {
    if (!o || !cStr || self.classContains(o,cStr)) {
      return false;
    }
    o.className = (o.className?o.className+' ':'')+cStr;
  };

  this.removeClass = function(o,cStr) {
    if (!o || !cStr || !self.classContains(o,cStr)) {
      return false;
    }
    o.className = o.className.replace(new RegExp('( '+cStr+')|('+cStr+')','g'),'');
  };

  this.getSoundByURL = function(sURL) {
    return (typeof self.soundsByURL[sURL] !== 'undefined' ? self.soundsByURL[sURL] : null);
  };

  this.isChildOfNode = function(o,sNodeName) {
    if (!o || !o.parentNode) {
      return false;
    }
    sNodeName = sNodeName.toLowerCase();
    do {
      o = o.parentNode;
    } while (o && o.parentNode && o.nodeName.toLowerCase() !== sNodeName);
    return (o.nodeName.toLowerCase() === sNodeName ? o : null);
  };

  this.events = {

    // handlers for sound events as they're started/stopped/played

    play: function() {
      pl.removeClass(this._data.oLink,this._data.className);
      this._data.className = pl.css.sPlaying;
      pl.addClass(this._data.oLink,this._data.className);
    },

    stop: function() {
      pl.removeClass(this._data.oLink,this._data.className);
      this._data.className = '';
    },

    pause: function() {
      pl.removeClass(this._data.oLink,this._data.className);
      this._data.className = pl.css.sPaused;
      pl.addClass(this._data.oLink,this._data.className);
    },

    resume: function() {
      pl.removeClass(this._data.oLink,this._data.className);
      this._data.className = pl.css.sPlaying;
      pl.addClass(this._data.oLink,this._data.className);      
    },

    finish: function() {
      pl.removeClass(this._data.oLink,this._data.className);
      this._data.className = '';
      if (pl.config.playNext) {
        var nextLink = (pl.indexByURL[this._data.oLink.href]+1);
        if (nextLink<pl.links.length) {
          pl.handleClick({'target':pl.links[nextLink]});
        }
      }
    }

  };

  this.stopEvent = function(e) {
   if (typeof e !== 'undefined' && typeof e.preventDefault !== 'undefined') {
      e.preventDefault();
    } else if (typeof window.event !== 'undefined') {
      window.event.returnValue = false;
    }
    return false;
  };

  this.getTheDamnLink = (isIE) ? function(e) {
    // I really didn't want to have to do this.
    return (e && e.target ? e.target : window.event.srcElement);
  } : function(e) {
    return e.target;
  };

  this.handleClick = function(e) {
    // a sound link was clicked
    if (typeof e.button !== 'undefined' && e.button>1) {
      // ignore right-click
      return true;
    }
    var o = self.getTheDamnLink(e),
        sURL,
        soundURL,
        thisSound;
    if (o.nodeName.toLowerCase() !== 'a') {
      o = self.isChildOfNode(o,'a');
      if (!o) {
        return true;
      }
    }
    sURL = o.getAttribute('href');
    if (!o.href || !soundManager.canPlayLink(o) || self.classContains(o,self.excludeClass)) {
      return true; // pass-thru for non-MP3/non-links
    }
    if (!self.classContains(o,self.includeClass)) {
      return true;
    }
    sm._writeDebug('handleClick()');
    soundURL = (o.href);
    thisSound = self.getSoundByURL(soundURL);
    if (thisSound) {
      // already exists
      if (thisSound === self.lastSound) {
        // and was playing (or paused)
        thisSound.togglePause();
      } else {
        // different sound
        thisSound.togglePause(); // start playing current
        sm._writeDebug('sound different than last sound: '+self.lastSound.sID);
        if (self.lastSound) {
          self.stopSound(self.lastSound);
        }
      }
    } else {
      // create sound
      thisSound = sm.createSound({
       id:'basicMP3Sound'+(self.soundCount++),
       url:soundURL,
       onplay:self.events.play,
       onstop:self.events.stop,
       onpause:self.events.pause,
       onresume:self.events.resume,
       onfinish:self.events.finish
      });
      // tack on some custom data
      thisSound._data = {
        oLink: o, // DOM node for reference within SM2 object event handlers
        className: self.css.sPlaying
      };
      self.soundsByURL[soundURL] = thisSound;
      self.sounds.push(thisSound);
      if (self.lastSound) {
        // stop last sound
        self.stopSound(self.lastSound);
      }
      thisSound.play();
    }
    self.lastSound = thisSound; // reference for next call
    return self.stopEvent(e);
  };

  this.stopSound = function(oSound) {
    soundManager.stop(oSound.sID);
    if (!isTouchDevice) { // iOS 4.2+ security blocks onfinish() -> playNext() if we set a .src in-between(?)
      soundManager.unload(oSound.sID);
    }
  };

  this.init = function() {
    sm._writeDebug('basicMP3Player.init()');
    var i, j,
        foundItems = 0,
        oLinks = document.getElementsByTagName('a');
    // grab all links, look for .mp3
    for (i=0, j=oLinks.length; i<j; i++) {
      if (self.classContains(oLinks[i],self.css.sDefault) && !self.classContains(oLinks[i],self.excludeClass)) {
        // self.addClass(oLinks[i],self.css.sDefault); // add default CSS decoration - good if you're lazy and want ALL MP3/playable links to do this
        self.links[foundItems] = (oLinks[i]);
        self.indexByURL[oLinks[i].href] = foundItems; // hack for indexing
        foundItems++;
      }
    }
    if (foundItems>0) {
      self.addEventHandler(document,'click',self.handleClick);
      if (self.config.autoPlay) {
        self.handleClick({target:self.links[0],preventDefault:function(){}});
      }
    }
    sm._writeDebug('basicMP3Player.init(): Found '+foundItems+' relevant items.');
  };

  this.init();

}

var basicMP3Player = null;

// use HTML5 audio for MP3/MP4, if available
soundManager.preferFlash = false;

soundManager.onready(function() {
  // soundManager.createSound() etc. may now be called
  var basicMP3Player = new BasicMP3Player();
  soundManager.createSound({
    id: 'beep',
    url: '/audio/b6.mp3',
    volume: 10,
    autoLoad: (!soundManager.isIE?true:false),
	multiShot: true
  });
  if (!soundManager.isIE) {
    $('right').onmouseover = function(e) {
      // so dirty.
      var o = (e && e.target ? e.target : event.srcElement);
      if (o.tagName && o.tagName.toLowerCase() == 'a' || (o.parentNode && o.parentNode.tagName.toLowerCase() == 'a') || (o.className && Y.D.hasClass(o,'noisy'))) {
		soundManager.play('beep');	
      }
    }
  }
  // a little humour, why not.
  var extraSounds = [
   'http://freshly-ground.com/data/audio/binaural/Mak.mp3',
   '/audio/chicken0.mp3',
   '/audio/chicken1.mp3',
   '/audio/chicken2.mp3',
   '/audio/chicken3.mp3',
   '/audio/chicken4.mp3',
   '/audio/chicken5.mp3'
  ];
  extraSounds.on = false;
  var clickCount = 0;
 /*
  document.oncontextmenu = function(e) {
	if (!extraSounds.on) {
	  extraSounds.on = true;
	  for (var i=0; i<extraSounds.length; i++) {
	    soundManager.createSound({
		  id:'ex'+i,
		  url:extraSounds[i],
		  volume:i==0?100:50,
		  autoLoad:true
		});
	  }
	}
    if (Math.random() >= 0.75 || (clickCount == 0 && Math.random() > 0.5)) {
      soundManager.play('ex'+parseInt(Math.random()*extraSounds.length));
    }
    clickCount++;
  }
  */
  // 04.01.09
  function aprilFools(override) {
    var d = new Date();
    if (!isOldIE && ((d.getMonth() == 3 && d.getDate() == 1) || window.location.href.toString().match(/\?chicken/i) || override == true)) {
	  window.chickenRoot = '/common/chicken/';
	  loadScript('/common/chicken/chicken.js?rnd='+Math.random()*1048576,function() {
	    getTheChicken();
	  });
    }
  }
  setTimeout(aprilFools,2000);
  // Is some poor soul coming from Digg via the toolbar? Let's give them a hard time.
  // (PS: I <3 Digg, but I think the toolbar is a bit much.)
  if (window.location.href.match(/diggtoolbar/i) || (window.location != top.location && document.referrer && document.referrer.match(/digg.com/i))) {
    // ah-ha!
    if (isOldIE) {
	  return false;
    }
    var oC = document.createElement('img');
    var o = document.createElement('div');
    var imgSrc = '2009/image/rubber-chicken-vs-digg.png?rnd='+parseInt(Math.random()*1048576);
    o.style.position = 'fixed';
    o.style.opacity = 0.5;
    o.style.background = '#000';
    o.style.left = '0px';
    o.style.top = '0px';
    o.style.width = '100%';
    o.style.height = '100%';
	o.style.zIndex = 999;
    oC.src = imgSrc;
    oC.style.position = 'fixed';
    oC.style.left = parseInt(Math.random()*50)+'%';
    oC.style.top = '0px';
    oC.style.zIndex = 1000;
    o.onclick = oC.onclick = function() {
	  o.style.display = 'none';
	  oC.style.display = 'none';
      aprilFools(true);
    }
    oC.onload = oC.oncomplete = function() {
	  try {
		  var s = soundManager.createSound({
			id: 'toolbar',
			url: extraSounds[Math.max(1,parseInt(Math.random()*extraSounds.length))],
			onload: function() {
			  var oPage = $('body');
			  oPage.insertBefore(o,oPage.firstChild);
			  oPage.insertBefore(oC,oPage.firstChild);
			  this.play();
			}
	 	  });
		  setTimeout(function(){s.load()},Math.random()*5000);
	  } catch(e) {
	    // oh well	
	  }
      this.onload = this.oncomplete = function() {}
    }
  }
  if (!isOldIE && new Date().getMonth() == 11) {
    // happy holidays.
    loadScript('/2009/christmaslights.js',function() {
	  smashInit();
	});
  } else {
    document.getElementById('lights').style.display = 'none';
  }
});

var FLICKR = {
 json: null,
 data: null
}

window.jsonFlickrFeed = function(oJSON) {
  FLICKR.json = oJSON;
  doFlickrStuff();
}

var sFlickr = null;

function getFlickrStuff() {
  sFlickr = document.createElement('script');
  sFlickr.src = 'http://api.flickr.com/services/feeds/photos_public.gne?id=12289718@N00&lang=en-us&format=json';
  document.getElementsByTagName('head')[0].appendChild(sFlickr);
}

function doFlickrStuff() {
  var data = FLICKR.json;
  var item = null;
  var photo = null;
  var oFrag = document.createElement('ul');
  oFrag.className = 'thumbs';
  var oItem = null;
  var i = 0;
  var limit = 4;
  var oTmpl = document.createElement('li');
  oTmpl.innerHTML = '<a href="#"><img src="2007/image/white-15.png" alt="" /></a>';
  for (item in data.items) {
    if (i++<limit) {
      oItem = oTmpl.cloneNode(true);
      oItem.id = '';
      oItem.childNodes[0].href = data.items[item].link;
      oItem.childNodes[0].title = data.items[item].title;
      oItem.childNodes[0].childNodes[0].style.background = 'transparent url('+data.items[item].media.m.replace('_m','_s')+') 50% 50% no-repeat';
      oFrag.appendChild(oItem);
    }
  }
  var oC = document.createElement('div');
  oC.className = 'clear';
  oFrag.appendChild(oC);
  $('flickr-stub').appendChild(oFrag);
}

function getArkanoidStuff() {
  // http://www.schillmania.com/arkanoid/leveldata/user/last_five.js
  var xhr = getXHR();
  if (!xhr) return false;
  function loadHandler() {
    if (!xhr) return false;
    if (xhr.readyState == 4) {
      try {
        eval(xhr.responseText);
      } catch(e) {
        // oh well
      }
      doArkanoidStuff();
    }
  }
  xhr.open('GET','/arkanoid/leveldata/user/last_five.js?rnd='+Math.random(),true);
  xhr.onreadystatechange = loadHandler;
  xhr.setRequestHeader('Content-Type','text/javascript');
  xhr.send(null);
}

function doArkanoidStuff() {
  var nLevels = 6;
  var nOffset = lnOffset+5-nLevels;
  if (nOffset<0) {
    // Y.D.getElementsByClassName('arkanoid','div',$('col2-content'))[0].style.display = 'none';
    return false; // something broke - bail.
  }
  var oItem = null;
  var oFrag = document.createElement('ul');
  oFrag.className = 'thumbs';
  var oTmpl = document.createElement('li');
  oTmpl.innerHTML = '<a href="#"><img src="2007/image/white-15.png" alt="" /></a>';
  for (var i=nOffset; i<nOffset+nLevels; i++) {
    oItem = oTmpl.cloneNode(true);
    oItem.id = '';
    oItem.childNodes[0].href = ('http://www.schillmania.com/arkanoid/#level'+(i+1));
    oItem.childNodes[0].childNodes[0].src = ('http://www.schillmania.com/arkanoid/preview.php?level='+i+'.png');
    oFrag.appendChild(oItem);
/*
    oItem.childNodes[0].childNodes[0].style.width = '48px';
    oItem.childNodes[0].childNodes[0].style.height = '40px';
*/
  }
  var oC = document.createElement('div');
  oC.className = 'clear';
  oFrag.appendChild(oC);
  $('arkanoid-stub').appendChild(oFrag);
}

function LastFM() {
  var self = this;
  this.xmlhttp = getXHR();

  // http://sedition.com/perl/javascript-fy.html
  function fisherYates(myArray) {
    var i = myArray.length;
    if (i==0) return false;
    var j,tempi,tempj;
    while (--i) {
      j = Math.floor(Math.random()*(i+1));
      tempi = myArray[i];
      tempj = myArray[j];
      myArray[i] = tempj;
      myArray[j] = tempi;
    }
  }

  this.readystatechangeHandler = function() {
    if (self.xmlhttp.readyState == 4) {
      if (self.onloadHandler) {
        self.onloadHandler();
      }
    }
  }

  this.onloadHandler = function() {
    try {
      var xml = self.xmlhttp.responseXML.documentElement;
      // self.parseTopArtistsList(xml);
      self.parseTopTracksList(xml);
    } catch(e) {
      // oh well
      if (typeof console != 'undefined' && typeof console.log != 'undefined') console.log('LastFM.onloadHandler(): Warning: invalid XML or parse error');
      // Y.D.getElementsByClassName('lastfm','div',$('col2-content'))[0].style.display = 'none';
      return false;
    }
  }

  this.load = function() {
    if (!self.xmlhttp) return false;
    self.xmlhttp.open('GET',urlRoot+'content/lastfm/top-artists-v2/',true);
    self.xmlhttp.onreadystatechange = self.readystatechangeHandler;
    self.xmlhttp.setRequestHeader('Content-Type','text/xml');
    self.xmlhttp.send(null);
  }

  this.parseTopArtistsList = function(xml) {
    var items = xml.getElementsByTagName('artist');
    var data = [];
    var oFrag = document.createElement('ul');
    oFrag.className = 'thumbs';
    var oItem = null;

    for (var i=0; i<items.length; i++) {
      data[i] = {
        name: items[i].getElementsByTagName('name')[0].childNodes[0].data.replace('&','&amp;'),
        thumb: items[i].getElementsByTagName('image')[1].childNodes[0].data,
        playcount: items[i].getElementsByTagName('playcount')[0].childNodes[0].data
      }
    }

    // fisherYates(data);

    var limit = Math.min(5,items.length);
    var oTmplArtist = document.createElement('li');
    oTmplArtist.className = 'top-artist';
    oTmplArtist.innerHTML = '<img src="image/none.gif" style="width:100%;height:100%" alt="" class="noisy" /><span class="playcount">%playcount</span><span class="opt"> - </span><span class="artist">%artist</span>';
    for (var i=0; i<limit; i++) {
      oItem = oTmplArtist.cloneNode(true);
      // oItem.id = '';
      oItem.getElementsByTagName('img')[0].style.background = 'transparent url('+data[i].thumb+') no-repeat 50% 0px';
      oItem.getElementsByTagName('img')[0].title =  data[i].name;
      oItem.innerHTML = (oItem.innerHTML.replace('%playcount',data[i].playcount).replace('%artist',data[i].name));
      oFrag.appendChild(oItem);
    }
    $('lastfm-stub').appendChild(oFrag);
  }


  this.parseTopTracksList = function(xml) {
    var tracks = xml.getElementsByTagName('track');
    var data = [];
    var oFrag = document.createElement('ul');
    oFrag.className = 'list';
    var oTmplTrack = document.createDocumentFragment();
    oTmplTrack.innerHTML = '<span class="track">%track</span><span class="opt"> - </span><span class="artist">%artist</span>';
    var oItem = null;

    for (var i=0; i<tracks.length; i++) {
      data[i] = {
        track: tracks[i].getElementsByTagName('name')[0].textContent.replace('&','&amp;'),
        artist: tracks[i].getElementsByTagName('artist')[0].textContent
      }
    }

    // fisherYates(data);

    var limit = Math.min(5,tracks.length);
    var html;
    for (var i=0; i<limit; i++) {
      oItem = document.createElement('li');
      oItem.className = 'top-track';
      oItem.appendChild(oTmplTrack.cloneNode(true));
      // oItem.id = '';
      // oItem.innerHTML = (oItem.innerHTML.replace('%track',tracks[i].getElementsByTagName('name')[0].childNodes[0].data).replace('%artist',tracks[i].getElementsByTagName('artist')[0].childNodes[0].data));
      // playing with fire: &amp; -> & -> &amp;
      html = oTmplTrack.innerHTML.replace('%track',data[i].track).replace('%artist',data[i].artist);
      oItem.innerHTML = html;
      oFrag.appendChild(oItem);
    }
    $('lastfm-stub').appendChild(oFrag);
  }
  
}

var lastFM = new LastFM();

function loadScript(sURL,onLoad) {
  try {
  var loadScriptHandler = function() {
    var rs = this.readyState;
    if (rs == 'loaded' || rs == 'complete') {
      this.onreadystatechange = null;
      this.onload = null;
      if (onLoad) {
        window.setTimeout(onLoad,20);
      }
    }
  }
  function scriptOnload() {
    this.onreadystatechange = null;
    this.onload = null;
    window.setTimeout(onLoad,20);
  }
  var oS = document.createElement('script');
  oS.type = 'text/javascript';
  if (onLoad) {
    oS.onreadystatechange = loadScriptHandler;
    oS.onload = scriptOnload;
  }
  oS.src = sURL;
  document.getElementsByTagName('head')[0].appendChild(oS);
  } catch(e) {
    // oh well
  }
}

function preInit() {
/*
  try {
    if (window.location.href.match(/schillmania.com\/$/) && nUA.match(/(firefox|webkit|opera)/i)) {
      document.body.className = 'tilt';
    }
  } catch(e) {
  }
*/
  if (nUA.match(/webkit/i)) {
	var oHTML = document.getElementsByTagName('html')[0];
    if (nUA.match(/Version\/3/i)) {
      oHTML.className = 'isSafari isSafari3';
    } else {
	  // oHTML.className = 'isSafari';
	}
  }
  // $('theme-archive').appendChild($('site-archives'));
  if (navigator.userAgent.match(/msie/i)) {
    try {
      $('theme-archive').style.zoom = 1;
    } catch(e) {
      // oh well
    }
  }
  doCounter();
  var animTime = 2;
  var oDTs = $('nav-list').getElementsByTagName('dt');
  var oWedge = document.createElement('div');
  oWedge.className = 'r-wedge';
  for (var i=oDTs.length; i--;) {
    oDTs[i].appendChild(oWedge.cloneNode(true));
  }

  if (soundManager.isOldIE) {
	return false;
  }

  var oEl = $('logo').getElementsByTagName('a')[0];
  oEl.style.background = '#111 url(/2009/image/header-jaggies.png) repeat-x 0px 0px';
  // var oA = new YAHOO.util.ColorAnim(oEl,{backgroundColor:{from:'#000',to:'#FFF'}},animTime,YAHOO.util.Easing.easeBothStrong);
  var oElA = new YAHOO.util.BgPosAnim(oEl,{backgroundPosition:{from:[-5,oEl.offsetHeight],to:[parseInt(Math.random()*32*plusMinus()),-23],unit:['px','px']}},animTime,YAHOO.util.Easing.easeBothStrong);
  var oElA2 = new YAHOO.util.ColorAnim(oEl,{color:{from:'#fff',to:'#000'}},animTime,YAHOO.util.Easing.easeBothStrong);
  oElA.onComplete.subscribe(function(){this.getEl().style.backgroundColor='#fff'});
  oElA.animate();
  oElA2.animate();

  function plusMinus() {
    return Math.random()>0.5?1:-1;	
  }

  if (window.location.pathname == '/') {
	// don't animate everything unless on homepage

  function animItem(oEl) {
	oEl.style.background = '#fff url(/2009/image/header-jaggies-black.png) repeat-x 0px '+oEl.offsetHeight+'px';
    oEl.style.color = '#000';
    oA.push(new YAHOO.util.BgPosAnim(oEl,{backgroundPosition:{from:[0,oEl.offsetHeight],to:[parseInt(Math.random()*32*plusMinus()),-23],unit:['px','px']}},animTime,YAHOO.util.Easing.easeBothStrong));
    oA[oA.length-1].onComplete.subscribe(function(){this.getEl().style.backgroundImage='none';this.getEl().style.backgroundColor='#000'});
    oA2.push(new YAHOO.util.ColorAnim(oEl,{color:{from:'#000',to:'#fff'}},animTime,YAHOO.util.Easing.easeBothStrong));
    oA2[oA2.length-1].onComplete.subscribe(function(){if (this && this.style) this.style.color='auto'});
    oA[oA.length-1].animate();
    oA2[oA2.length-1].animate();
  }

  var oEls = $('entry-content').getElementsByTagName('h1');
  var oA = [];
  var oA2 = [];
  for (i=0, j=oEls.length; i<j; i++) {
	animItem(oEls[i]);
  }

  var oEls2 = $('right').getElementsByTagName('h2');
  for (var j=0, k=oEls2.length; j<k; j++) {
	animItem(oEls2[j]);
  }

  }

  if (!isIE || (isIE && !isOldIE)) {
    getArkanoidStuff();
    getFlickrStuff();
    lastFM.load();
  } else {
    $('external').style.display = 'none';	
  }

}

/*
window.onload = function() {
  // document.body.className = 'dark';
  contentManager.assignHandlers();
  doCounter();
  window.onload = null;
}
*/
