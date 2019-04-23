/* Add to Homescreen v4.0.0 ~ (c) 2019 Chris Love ~ @license: https://love2dev.com/pwa/add-to-homescreen/ */


( function ( window, document, undefined ) {
	/*
	       _   _ _____     _____
	 ___ _| |_| |_   _|___|  |  |___ _____ ___ ___ ___ ___ ___ ___ ___
	| .'| . | . | | | | . |     | . |     | -_|_ -|  _|  _| -_| -_|   |
	|__,|___|___| |_| |___|__|__|___|_|_|_|___|___|___|_| |___|___|_|_|
		by Matteo Spinelli ~ http://cubiq.org <-- No longer there :<
		Upgraded for PWA Support by Chris Love ~ https://love2dev.com/
	*/

	// load session
	var appID = "com.love2dev.addtohome",
		session = localStorage.getItem( appID );

	if ( session && session.added ) {
		return;
	}

	window.addEventListener( "beforeinstallprompt", beforeInstallPrompt );

	window.addEventListener( "appinstalled", function ( evt ) {

		// TODO: update session object to reflect the PWA has been installed
		_instance.doLog( "a2hs", "installed" );
	} );

	function triggerNativePrompt() {

		return _beforeInstallPrompt.prompt()
			.then( function ( evt ) {

				// Wait for the user to respond to the prompt
				return _beforeInstallPrompt.userChoice;

			} )
			.then( function ( choiceResult ) {

				session.added = ( choiceResult.outcome === "accepted" );
				_instance.updateSession();

				if ( session.added ) {
					_instance.doLog( "User accepted the A2HS prompt" );
				} else {
					_instance.doLog( "User dismissed the A2HS prompt" );
				}

				_beforeInstallPrompt = null;

			} )
			.catch( function ( err ) {

				_instance.doLog( err );

				showNativeFallback();

			} );
	}

	function getPlatform() {

		if ( _instance.firefox ) {
			return "firefox";
		} else if ( _instance.ipad ) {
			return "ipad";
		} else if ( _instance.iphone ) {
			return "iphone";
		} else if ( _instance.opera ) {
			return "opera";
		} else if ( _instance.samsung ) {
			return "samsung";
		} else if ( _instance.edge ) {
			return "edge";
		}


	}

	function showPlatformGuideance() {

		var target = getPlatform(),
			ath_wrapper = document.querySelector( _instance.options.nativeWrapper );

		if ( ath_wrapper ) {

			ath_wrapper.classList.remove( _instance.hideClass );
			ath_wrapper.classList.add( ..._instance.options.prompt[ target ].showClasses );

			var imgs = ath_wrapper.querySelectorAll( "img" );

			for ( var index = 0; index < _instance.options.prompt[ target ].imgs.length; index++ ) {

				imgs[ index ].src = _instance.options.prompt[ target ].imgs[ index ].src;
				imgs[ index ].alt = _instance.options.prompt[ target ].imgs[ index ].alt;

				if ( _instance.options.prompt[ target ].imgs[ index ].classes ) {

					imgs[ index ].classList.add( ..._instance.options.prompt[ target ].imgs[ index ].classes );

				}

			}

		}

	}

	function showPreNative() {

		showPlatformGuideance();

	}

	function displayPrompt( target ) {

		var ath_wrapper = document.querySelector( _instance.options.browserWrappers[ target ] );

		if ( ath_wrapper ) {

			ath_wrapper.classList.remove( _instance.hideClass );
			ath_wrapper.classList.add( ..._instance.options.showClasses[ target ] );

		}

	}

	function showNativeFallback() {

		console.log( "display install menu prompt" );
		showPlatformGuideance();
	}

	function nextPrime( value ) {

		while ( true ) {

			var isPrime = true;
			//increment the number by 1 each time
			value += 1;

			var squaredNumber = Math.sqrt( value );

			//start at 2 and increment by 1 until it gets to the squared number
			for ( var i = 2; i <= squaredNumber; i++ ) {

				//how do I check all i's?
				if ( value % i == 0 ) {
					isPrime = false;
					break;
				}

			}

			if ( isPrime ) {
				return value;
			}

		}
	}

	// singleton
	var _instance;

	function ath( options ) {

		_instance = _instance || new ath.Class( options );

		return _instance;
	}

	// default options
	ath.defaults = {
		appID: appID, // local storage name (no need to change)
		debug: false, // override browser checks
		logging: false, // log reasons for showing or not showing to js console; defaults to true when debug is true
		modal: false, // prevent further actions until the message is closed
		mandatory: false, // you can't proceed if you don't add the app to the homescreen
		autostart: true, // show the message automatically
		skipFirstVisit: false, // show only to returning visitors (ie: skip the first time you visit)
		minSessions: 0, //show only after minimum number of page views
		startDelay: 1, // display the message after that many seconds from page load
		lifespan: 15, // life of the message in seconds
		displayPace: 1440, // minutes before the message is shown again (0: display every time, default 24 hours)
		maxDisplayCount: 0, // absolute maximum number of times the message will be shown to the user (0: no limit)
		validLocation: [], // list of pages where the message will be shown (array of regexes)
		onInit: null, // executed on instance creation
		onShow: null, // executed when the message is shown
		onRemove: null, // executed when the message is removed
		onAdd: null, // when the application is launched the first time from the homescreen (guesstimate)
		onPrivate: null, // executed if user is in private mode,
		athWrapper: ".ath-viewport",
		nativeWrapper: ".native-prompt-wrapper",
		showClasses: {
			"default": [ "animated", "fadeInUp", "d-block" ]
		},
		hideClass: "d-none",
		prompt: {
			"edge": {
				showClasses: [ "edge-wrapper",
					"animated", "fadeInUp", "d-block"
				],
				imgs: [ {
					src: "imgs/firefox-a2hs-icon.png",
					alt: "Tap the Add to Homescreen Icon"
				} ]
			},
			"iphone": {
				showClasses: [ "iphone-wrapper",
					"animated", "fadeInUp", "d-block"
				],
				imgs: [ {
						src: "imgs/ios-safari-share-button-highlight.jpg",
						alt: "Tap the Share Icon"
					},
					{
						src: "imgs/iphone-a2hs-swipe-to-right.jpg",
						classes: [ "animated", "fadeIn", "overlay-1",
							"delay-4s"
						],
						alt: "Swipe to the right"
					},
					{
						src: "imgs/iphone-a2hs-icon-highlight.jpg",
						classes: [ "animated", "fadeIn", "overlay-2",
							"delay-7s"
						],
						alt: "Tap the Add to Homescreen Icon"
					}
				]
			},
			"ipad": {
				showClasses: [ "ipad-wrapper", "animated", "fadeInUp", "d-block" ],
				imgs: [ {
					src: "imgs/safari-ipad-share-a2hs-right.jpg",
					alt: "Tap the Add to Homescreen Icon"
				} ]
			},
			"firefox": {
				showClasses: [ "firefox-wrapper",
					"animated", "fadeInUp", "d-block"
				],
				imgs: [ {
					src: "imgs/firefox-a2hs-icon.png",
					alt: "Tap the Add to Homescreen Icon"
				} ]
			},
			"samsung": {
				showClasses: [ "samsung-wrapper",
					"animated", "fadeInUp", "d-block"
				],
				imgs: [ {
					src: "imgs/samsung-internet-a2hs-icon.png",
					alt: "Tap the Add to Homescreen Icon"
				} ]
			},
			"opera": {
				showClasses: [ "opera-home-screen-wrapper",
					"animated", "fadeInUp", "d-block"
				],
				imgs: [ {
					src: "imgs/opera-add-to-homescreen.png",
					alt: "Tap the Add to Homescreen Icon"
				} ]
			}
		}
	};

	// browser info and capability
	var _ua = window.navigator.userAgent;

	ath.inPrivate = !( "localStorage" in window );
	ath.isIDevice = ( /iphone|ipod|ipad/i ).test( _ua );
	ath.isSamsung = /Samsung/i.test( _ua );
	ath.isFireFox = /Firefox/i.test( _ua );
	ath.isOpera = /opr/i.test( _ua );
	ath.edge = /edg/i.test( _ua );

	if ( ath.isFireFox ) {
		ath.isFireFox = /android/i.test( _ua );
	}

	if ( ath.isOpera ) {
		ath.isOpera = /android/i.test( _ua );
	}

	ath.isChromium = ( "onbeforeinstallprompt" in window );
	ath.isInWebAppiOS = ( window.navigator.standalone === true );
	ath.isInWebAppChrome = ( window.matchMedia( '(display-mode: standalone)' ).matches );
	ath.isMobileSafari = ath.isIDevice && _ua.indexOf( 'Safari' ) > -1 && _ua.indexOf( 'CriOS' ) < 0;
	ath.isStandalone = ath.isInWebAppiOS || ath.isInWebAppChrome;
	ath.isTablet = ( ath.isMobileSafari && _ua.indexOf( 'iPad' ) > -1 );
	ath.isCompatible = ath.isChromium || ath.isMobileSafari || ath.isSamsung || ath.isFireFox || ath.isOpera;

	var _defaultSession = {
		lastDisplayTime: 0, // last time we displayed the message
		returningVisitor: false, // is this the first time you visit
		displayCount: 0, // number of times the message has been shown
		optedout: false, // has the user opted out
		added: false, // has been actually added to the homescreen
		requireActiveSW: true,
		sessions: 0
	};

	session = session ? JSON.parse( session ) : _defaultSession;

	var _beforeInstallPrompt;

	function beforeInstallPrompt( evt ) {

		_beforeInstallPrompt = evt;

		_instance.doLog( "grabbed beforeInstallPrompt object" );

	}

	ath.removeSession = function ( appID ) {

		localStorage.removeItem( appID || ath.defaults.appID );

	};

	ath.doLog = function ( logStr ) {

		if ( this.options.logging ) {
			console.log( logStr );

			var logOutput = document.querySelector( ".log-target" );

			logOutput.innerText += logStr + "\r\n";
		}

	};

	ath.closePrompt = function () {

		var ath_wrapper = document.querySelector( ".ath-viewport" );

		if ( ath_wrapper ) {
			// TODO: change classes to display prompt to be based on the configuration object
			ath_wrapper.classList.remove( "d-block" );

		}

	};

	ath._handleInstall = function ( evt ) {

		//		evt.preventDefault();

		ath.closePrompt();

		if ( !ath.isChromium ) {

			// TODO: beforeInstallPrompt not available, so guide user to A2HS
			ath.doLog( "not chromium, guide user" );

		} else {

			var bipCounter = 0;

			//			var refreshId = setInterval( function () {

			if ( _beforeInstallPrompt ) {

				// clearInterval( refreshId );
				// refreshId = 0;

				//				_instance.doLog( "prompting" );

				showPlatformGuideance();
				//				triggerNativePrompt();

			} else {

				_instance.doLog( "display browser/plaform specific guidance here" );
				showPlatformGuideance();

			}

			bipCounter += 1;

			if ( bipCounter > 60 ) {

				clearInterval( refreshId );
				refreshId = 0;

			}

			//			}, 1000 );

		}

		return false;
	};

	var installBtn = document.querySelector( ".btn-install" ),
		cancelBtn = document.querySelector( ".btn-cancel" );

	if ( installBtn ) {

		installBtn.addEventListener( "click", ath._handleInstall );

	}

	if ( cancelBtn ) {

		cancelBtn.addEventListener( "click", ath.closePrompt );

	}

	// TODO refactor long class method into smaller, more manageable functions
	ath.Class = function ( options ) {

		// class methods
		this.doLog = ath.doLog;

		// merge default options with user config
		this.options = Object.assign( {}, ath.defaults, options );

		var manifestEle = document.querySelector( "[rel='manifest']" );

		if ( !manifestEle ) {
			ath.isCompatible = false;
		}

		navigator.serviceWorker.getRegistration().then( function ( sw ) {

			this.sw = sw;

			if ( !this.sw ) {
				ath.isCompatible = false;
			}

			session.sessions += 1;
			this.updateSession();

			// override defaults that are dependent on each other
			if ( this.options && this.options.debug && ( typeof this.options.logging === "undefined" ) ) {
				this.options.logging = true;
			}

			// normalize some options
			this.options.mandatory = this.options.mandatory && ( 'standalone' in window.navigator || this.options.debug );

			this.options.modal = this.options.modal || this.options.mandatory;

			if ( this.options.mandatory ) {
				this.options.startDelay = -0.5; // make the popup hasty
			}

			// setup the debug environment
			if ( this.options.debug ) {

				ath.isCompatible = true;

			}

			if ( this.options.onInit ) {
				this.options.onInit.call( this );
			}

			if ( this.options.autostart ) {

				this.doLog( "Add to homescreen: autostart displaying callout" );

				if ( this.canPrompt() ) {

					this.show();

				}

			}

		} );

	};

	ath.Class.prototype = {

		_canPrompt: undefined,

		canPrompt: function () {

			//already evaluated the situation, so don't do it again
			if ( this._canPrompt !== undefined ) {
				return this._canPrompt;
			}

			this._canPrompt = false;

			//using a double negative here to detect if service workers are not supported
			//if not then don't bother asking to add to install the PWA
			if ( !( "serviceWorker" in navigator ) ) {

				this.doLog( "Add to homescreen: not displaying callout because service workers are not supported" );
				return false;

			}

			if ( ath.inPrivate ) {

				this.doLog( "Add to homescreen: not displaying callout because using Private browsing" );
				return false;
			}

			// the device is not supported
			if ( !ath.isCompatible ) {
				this.doLog( "Add to homescreen: not displaying callout because device not supported" );
				return false;
			}

			if ( this.options.onPrivate ) {
				this.options.onPrivate.call( this );
			}

			var now = Date.now(),
				lastDisplayTime = session.lastDisplayTime;

			// we obey the display pace (prevent the message to popup too often)
			if ( now - lastDisplayTime < this.options.displayPace * 60000 ) {
				this.doLog( "Add to homescreen: not displaying callout because displayed recently" );
				return false;
			}

			// obey the maximum number of display count
			if ( this.options.maxDisplayCount && session.displayCount >= this.options.maxDisplayCount ) {
				this.doLog( "Add to homescreen: not displaying callout because displayed too many times already" );
				return false;
			}

			// check if this is a valid location
			// TODO: should include at least the home page here
			// by default all pages are valid, which can cause issues on iOS
			// TODO: maybe trigger a redirect back to the home page for iOS
			var isValidLocation = !this.options.validLocation.length;

			for ( var i = this.options.validLocation.length; i--; ) {

				if ( this.options.validLocation[ i ].test( document.location.href ) ) {
					isValidLocation = true;
					break;
				}

			}

			if ( !isValidLocation ) {
				return false;
			}

			this.doLog( "this.options: " + JSON.stringify( this.options ) );

			if ( session.sessions < this.options.minSessions ) {
				this.doLog( "Add to homescreen: not displaying callout because not enough visits" );
				return false;
			}

			// critical errors:
			if ( session.optedout ) {
				this.doLog( "Add to homescreen: not displaying callout because user opted out" );
				return false;
			}

			if ( session.added ) {
				this.doLog( "Add to homescreen: not displaying callout because already added to the homescreen" );
				return false;
			}

			if ( !isValidLocation ) {
				this.doLog( "Add to homescreen: not displaying callout because not a valid location" );
				return false;
			}

			// check if the app is in stand alone mode
			if ( ath.isStandalone ) {

				// execute the onAdd event if we haven't already
				if ( !session.added ) {

					session.added = true;
					this.updateSession();

					if ( this.options.onAdd ) {
						this.options.onAdd.call( this );
					}

				}

				this.doLog( "Add to homescreen: not displaying callout because in standalone mode" );
				return false;
			}

			// check if this is a returning visitor
			if ( !session.returningVisitor ) {

				session.returningVisitor = true;
				this.updateSession();

				// we do not show the message if this is your first visit
				if ( this.options.skipFirstVisit ) {
					this.doLog( "Add to homescreen: not displaying callout because skipping first visit" );
					return false;
				}

			}

			this._canPrompt = true;

			// all checks passed, ready to display
			this.ready = true;

			return true;

		},

		show: function ( force ) {

			// message already on screen
			if ( this.shown ) {
				this.doLog( "Add to homescreen: not displaying callout because already shown on screen" );
				return;
			}

			this.shown = true;

			// increment the display count
			session.lastDisplayTime = Date.now();
			session.displayCount++;

			this.updateSession();

			this._delayedShow();

		},

		_delayedShow: function ( e ) {
			setTimeout( this._show.bind( this ), this.options.startDelay * 1000 + 500 );
		},

		_show: function () {

			if ( ( ath.isChromium && _beforeInstallPrompt ) ) {

				showPreNative();

			} else {

				showPlatformGuideance();

			}


			// fire the custom onShow event
			if ( this.options.onShow ) {
				this.options.onShow.call( this );
			}

		},

		updateSession: function () {

			localStorage.setItem( this.options.appID, JSON.stringify( session ) );

		},

		clearSession: function () {
			session = _defaultSession;
			this.updateSession();
		},

		optOut: function () {
			session.optedout = true;
			this.updateSession();
		},

		optIn: function () {
			session.optedout = false;
			this.updateSession();
		},

		clearDisplayCount: function () {
			session.displayCount = 0;
			this.updateSession();
		}

	};

	// expose to the world
	window.addToHomescreen = ath;

} )( window, document );