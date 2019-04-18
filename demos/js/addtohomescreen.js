/* Add to Homescreen v4.0.0 ~ (c) 2019 Chris Love ~ @license: https://love2dev.com/pwa/add-to-homescreen/ */


// TODO: bind install button handler method
// TODO: bind cancel button handler method
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

	window.addEventListener( "beforeInstallPrompt", beforeInstallPrompt );

	window.addEventListener( "appinstalled", function ( evt ) {
		console.log( "a2hs", "installed" );
	} );


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
		onPrivate: null // executed if user is in private mode
	};

	// browser info and capability
	var _ua = window.navigator.userAgent;

	ath.inPrivate = !( "localStorage" in window );
	ath.isRetina = window.devicePixelRatio && window.devicePixelRatio > 1;
	ath.isIDevice = ( /iphone|ipod|ipad/i ).test( _ua );
	ath.isSamsung = /Samsung/i.test( _ua );
	ath.isFireFox = /Firefox/i.test( _ua );
	ath.isOpera = /opr/i.test( _ua );

	if ( ath.isFireFox ) {
		ath.isFireFox = /android/i.test( _ua );
	}

	if ( ath.isOpera ) {
		ath.isOpera = /android/i.test( _ua );
	}

	ath.isChromium = ( "onbeforeinstallprompt" in window );
	ath.isMobileIE = _ua.indexOf( 'Windows Phone' ) > -1;
	ath.isInWebAppiOS = ( window.navigator.standalone === true );
	ath.isInWebAppChrome = ( window.matchMedia( '(display-mode: standalone)' ).matches );

	ath.isMobileSafari = ath.isIDevice && _ua.indexOf( 'Safari' ) > -1 && _ua.indexOf( 'CriOS' ) < 0;
	ath.OS = ath.isIDevice ? 'ios' : ath.isMobileChrome ? 'android' : ath.isMobileIE ? 'windows' : 'unsupported';

	ath.OSVersion = _ua.match( /(OS|Android) (\d+[_\.]\d+)/ );
	ath.OSVersion = ath.OSVersion && ath.OSVersion[ 2 ] ? +ath.OSVersion[ 2 ].replace( '_', '.' ) : 0;

	ath.isStandalone = ath.isInWebAppiOS || ath.isInWebAppChrome;
	//'standalone' in window.navigator && window.navigator.standalone;
	ath.isTablet = ( ath.isMobileSafari && _ua.indexOf( 'iPad' ) > -1 ) || ( ath.isMobileChrome && _ua.indexOf( 'Mobile' ) < 0 );

	ath.isCompatible = ( ath.isMobileSafari && ath.OSVersion >= 6 ) ||
		( ath.isSamsung || ath.isFireFox || ath.isChromium || ath.isOpera );

	var _defaultSession = {
		lastDisplayTime: 0, // last time we displayed the message
		returningVisitor: false, // is this the first time you visit
		displayCount: 0, // number of times the message has been shown
		optedout: false, // has the user opted out
		added: false, // has been actually added to the homescreen
		sessions: 0
	};

	session = session ? JSON.parse( session ) : _defaultSession;

	var _beforeInstallPrompt;

	function beforeInstallPrompt( evt ) {

		evt.preventDefault();

		_beforeInstallPrompt = evt;

		console.log( "grabbed beforeInstallPrompt object" );

		return;

	}

	ath.removeSession = function ( appID ) {

		localStorage.removeItem( appID || ath.defaults.appID );

	};

	ath.doLog = function ( logStr ) {

		if ( this.options.logging ) {
			console.log( logStr );
		}

	};

	// TODO refactor long class method into smaller, more manageable functions
	ath.Class = function ( options ) {

		// class methods
		this.doLog = ath.doLog;

		// merge default options with user config
		this.options = Object.assign( {}, ath.defaults, options );

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
			ath.OS = typeof this.options.debug === 'string' ? this.options.debug : ath.OS === 'unsupported' ? 'android' : ath.OS;
			ath.OSVersion = ath.OS === 'ios' ? '8' : '4';

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

	};

	ath.Class.prototype = {
		// event type to method conversion
		events: {
			load: '_delayedShow',
			error: '_delayedShow',
			click: 'remove',
			touchmove: '_preventDefault',
			transitionend: '_removeElements'
		},

		handleEvent: function ( e ) {

			var type = this.events[ e.type ];

			if ( type ) {
				this[ type ]( e );
			}

		},

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

			// // this is needed if autostart is disabled and you programmatically call the show() method
			// if ( !this.ready ) {
			// 	this.doLog( "Add to homescreen: not displaying callout because not ready" );
			// 	return false;
			// }

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

			// TODO: lean on Chromium beforeInstallPrompt if available

			if ( !ath.isChromium ) {

				this._delayedShow();

			} else {

				this.doLog( "using beforeInstallPrompt" );

				// TODO: create polling mechanism to keep checking the state

				if ( _beforeInstallPrompt ) {

					// TODO: only prompt if we meet criteria, like a delay, may also need to be a triggering method
					_beforeInstallPrompt.prompt()
						.then( function () {

							// Wait for the user to respond to the prompt
							return deferredPrompt.userChoice;

						} )
						.then( function ( choiceResult ) {

							session.added = ( choiceResult.outcome === "accepted" );
							this.updateSession();

							if ( session.added ) {
								this.doLog( "User accepted the A2HS prompt" );
							} else {
								this.doLog( "User dismissed the A2HS prompt" );
							}

							deferredPrompt = null;

						} );

				}

			}

		},

		_delayedShow: function ( e ) {
			setTimeout( this._show.bind( this ), this.options.startDelay * 1000 + 500 );
		},

		_show: function () {
			var that = this;

			// TODO: investigate this as these may not be needed any longer
			if ( this.options.modal ) {
				// lock any other interaction
				document.addEventListener( 'touchmove', this, true );
			}

			// set the destroy timer
			if ( this.options.lifespan ) {
				this.removeTimer = setTimeout( this.remove.bind( this ), this.options.lifespan * 1000 );
			}

			// TODO: change selector to be based on the configuration object and browser/device needs
			var ath_wrapper = document.querySelector( ".ath-viewport" );

			if ( ath_wrapper ) {
				// TODO: change classes to display prompt to be based on the configuration object
				ath_wrapper.classList.add( "animated", "fadeInUp", "d-block" );

			}

			// fire the cus	tom onShow event
			if ( this.options.onShow ) {
				this.options.onShow.call( this );
			}
		},

		remove: function () {

			clearTimeout( this.removeTimer );

			this.element.removeEventListener( 'click', this, true );

		},

		_removeElements: function () {

			this.shown = false;

			// fire the custom onRemove event
			if ( this.options.onRemove ) {
				this.options.onRemove.call( this );
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
		},

		_preventDefault: function ( e ) {
			e.preventDefault();
			e.stopPropagation();
		}

	};

	// expose to the world
	window.addToHomescreen = ath;


} )( window, document );