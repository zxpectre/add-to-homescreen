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

		session.added = true;

		_instance.updateSession();

	} );

	var platform = {},
		defaultPrompt = {
			title: "Install this PWA?",
			src: "imgs/pwa-logo-50x50.png",
			cancelMsg: "Not Now",
			installMsg: "Install"
		};

	function checkPlatform() {

		// browser info and capability
		var _ua = window.navigator.userAgent;

		platform.inPrivate = !( "localStorage" in window );
		platform.isIDevice = ( /iphone|ipod|ipad/i ).test( _ua );
		platform.isSamsung = /Samsung/i.test( _ua );
		platform.isFireFox = /Firefox/i.test( _ua );
		platform.isOpera = /opr/i.test( _ua );
		platform.isEdge = /edg/i.test( _ua );

		// Opera & FireFox only Trigger on Android
		if ( platform.isFireFox ) {
			platform.isFireFox = /android/i.test( _ua );
		}

		if ( platform.isOpera ) {
			platform.isOpera = /android/i.test( _ua );
		}

		platform.isChromium = ( "onbeforeinstallprompt" in window );
		platform.isInWebAppiOS = ( window.navigator.standalone === true );
		platform.isInWebAppChrome = ( window.matchMedia( '(display-mode: standalone)' ).matches );
		platform.isMobileSafari = platform.isIDevice && _ua.indexOf( 'Safari' ) > -1 && _ua.indexOf( 'CriOS' ) < 0;
		platform.isStandalone = platform.isInWebAppiOS || platform.isInWebAppChrome;
		platform.isiPad = ( platform.isMobileSafari && _ua.indexOf( 'iPad' ) > -1 );
		platform.isiPhone = ( platform.isMobileSafari && _ua.indexOf( 'iPad' ) === -1 );
		platform.isCompatible = platform.isChromium || platform.isMobileSafari ||
			platform.isSamsung || platform.isFireFox || platform.isOpera;

	}

	/* displays native A2HS prompt & stores results */
	function triggerNativePrompt() {

		return _beforeInstallPrompt.prompt()
			.then( function ( evt ) {

				// Wait for the user to respond to the prompt
				return _beforeInstallPrompt.userChoice;

			} )
			.then( function ( choiceResult ) {

				session.added = ( choiceResult.outcome === "accepted" );

				if ( session.added ) {
					_instance.doLog( "User accepted the A2HS prompt" );
				} else {
					session.optedout = true;
					_instance.doLog( "User dismissed the A2HS prompt" );
				}

				_instance.updateSession();

				_beforeInstallPrompt = null;

			} )
			.catch( function ( err ) {

				_instance.doLog( err );

				showPlatformGuidance( true );

			} );
	}

	function getPlatform( native ) {

		if ( platform.isChromium && ( native === undefined && !native ) ) {
			return "native";
		} else if ( platform.isFireFox ) {
			return "firefox";
		} else if ( platform.isiPad ) {
			return "ipad";
		} else if ( platform.isiPhone ) {
			return "iphone";
		} else if ( platform.isOpera ) {
			return "opera";
		} else if ( platform.isSamsung ) {
			return "samsung";
		} else if ( platform.isEdge ) {
			return "edge";
		} else if ( platform.isChromium ) {
			return "chromium";
		} else {
			return "";
		}

	}

	//show hint images for browsers without native prompt
	/*
		Currently: iOS Safari
			FireFox Android
			Samsung Android
			Opera Android
	*/
	function showPlatformGuidance( skipNative ) {

		var target = getPlatform( skipNative ),
			ath_wrapper = document.querySelector( _instance.options.athWrapper );

		if ( ath_wrapper ) {

			if ( !skipNative && target === "native" && _beforeInstallPrompt ) {

				platform.closePrompt();
				triggerNativePrompt();

			} else {

				var promptTarget = Object.assign( {}, defaultPrompt, _instance.options.customPrompt, _instance.options.prompt[ target ] );

				var ath_body = ath_wrapper.querySelector( _instance.options.promptDlg.body );

				if ( promptTarget.imgs && promptTarget.imgs.length > 0 ) {

					ath_body.innerHTML = "";
					ath_body.classList.add( _instance.options.athGuidance );

					for ( var index = 0; index < promptTarget.imgs.length; index++ ) {

						var img = new Image();

						img.src = promptTarget.imgs[ index ].src;
						img.alt = promptTarget.imgs[ index ].alt;

						if ( promptTarget.imgs[ index ].classes ) {

							img.classList.add( ...promptTarget.imgs[ index ].classes );

						}

						img.classList.add( _instance.options.showClass );

						ath_body.appendChild( img );

					}

				}

			}

		}

	}

	//can be used to calculate the next prime number, a possible way to calculate when to next prompt
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
		appName: "Progressive Web App",
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
		displayNextPrime: false,
		maxDisplayCount: 0, // absolute maximum number of times the message will be shown to the user (0: no limit)
		validLocation: [], // list of pages where the message will be shown (array of regexes)
		onInit: null, // executed on instance creation
		onShow: null, // executed when the message is shown
		onRemove: null, // executed when the message is removed
		onAdd: null, // when the application is launched the first time from the homescreen (guesstimate)
		onPrivate: null, // executed if user is in private mode,
		autoHide: 10,
		customPrompt: {}, //allow customization of prompt content
		athWrapper: ".ath-container",
		athGuidance: "ath-guidance",
		showClasses: [ "animated", "d-flex" ],
		showClass: "d-flex",
		hideClass: "d-none",
		promptDlg: {
			title: ".ath-banner-title",
			body: ".ath-banner",
			logo: ".ath-prompt-logo",
			cancel: ".btn-cancel",
			install: ".btn-install",
			action: {
				"ok": "Install",
				"cancel": "Not Now"
			}
		},
		prompt: {
			"native": {
				showClasses: [ "fadeInUp", "right-banner" ],
				action: {
					"ok": "Install",
					"cancel": "Not Now"
				}
			},
			"edge": {
				showClasses: [ "edge-wrapper",
					"animated", "fadeIn", "d-block", "right-banner"
				],
				imgs: [ {
					src: "imgs/edge-a2hs-icon.png",
					alt: "Tap the Add to Homescreen Icon"
				} ]
			},
			"chromium": {
				showClasses: [ "chromium-wrapper",
					"animated", "fadeIn", "d-block", "right-banner"
				],
				imgs: [ {
					src: "imgs/chromium-guidance.png",
					alt: "Tap the Add to Homescreen Icon"
				} ]
			},
			"iphone": {
				showClasses: [ "iphone-wrapper",
					"animated", "fadeIn", "d-block"
				],
				imgs: [ {
						src: "imgs/ios-safari-share-button-highlight.jpg",
						alt: "Tap the Share Icon"
					},
					{
						src: "imgs/iphone-a2hs-swipe-to-right.jpg",
						classes: [ "animated", "fadeIn", "overlay-1",
							"delay-2s"
						],
						alt: "Swipe to the right"
					},
					{
						src: "imgs/iphone-a2hs-icon-highlight.jpg",
						classes: [ "animated", "fadeIn", "overlay-2",
							"delay-4s"
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
					"animated", "fadeIn", "d-block"
				],
				imgs: [ {
					src: "imgs/firefox-a2hs-icon.png",
					alt: "Tap the Add to Homescreen Icon"
				} ]
			},
			"samsung": {
				showClasses: [ "samsung-wrapper",
					"animated", "fadeIn", "d-block"
				],
				imgs: [ {
					src: "imgs/samsung-internet-a2hs-icon.png",
					alt: "Tap the Add to Homescreen Icon"
				} ]
			},
			"opera": {
				showClasses: [ "opera-home-screen-wrapper",
					"animated", "fadeIn", "d-block"
				],
				imgs: [ {
					src: "imgs/opera-add-to-homescreen.png",
					alt: "Tap the Add to Homescreen Icon"
				} ]
			}
		}
	};

	checkPlatform();

	var _defaultSession = {
		lastDisplayTime: 0, // last time we displayed the message
		returningVisitor: false, // is this the first time you visit
		displayCount: 0, // number of times the message has been shown
		optedout: false, // has the user opted out
		added: false, // has been actually added to the homescreen
		sessions: 0,
		nextSession: 0 //tie this to nextPrime Counter
	};

	session = session ? JSON.parse( session ) : _defaultSession;

	var _beforeInstallPrompt;

	function beforeInstallPrompt( evt ) {

		evt.preventDefault();

		_beforeInstallPrompt = evt;

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

	platform.closePrompt = function () {

		var ath_wrapper = document.querySelector( _instance.options.athWrapper );

		if ( ath_wrapper ) {

			ath_wrapper.classList.remove( ..._instance.options.showClasses );

		}

	};

	platform.handleInstall = function ( evt ) {

		if ( _beforeInstallPrompt ) {

			platform.closePrompt();
			triggerNativePrompt();

		} else {

			showPlatformGuidance( true );

		}

		return false;
	};

	// TODO refactor long class method into smaller, more manageable functions
	ath.Class = function ( options ) {

		// class methods
		this.doLog = ath.doLog;

		// merge default options with user config
		this.options = Object.assign( {}, ath.defaults, options );

		var manifestEle = document.querySelector( "[rel='manifest']" );

		if ( !manifestEle ) {
			platform.isCompatible = false;
		}

		navigator.serviceWorker.getRegistration().then( afterSWCheck );

	};

	function afterSWCheck( sw ) {

		_instance.sw = sw;

		if ( !_instance.sw ) {
			platform.isCompatible = false;
		}

		session.sessions += 1;
		_instance.updateSession();

		// override defaults that are dependent on each other
		if ( _instance.options && _instance.options.debug && ( typeof _instance.options.logging === "undefined" ) ) {
			_instance.options.logging = true;
		}

		// normalize some options
		_instance.options.mandatory = _instance.options.mandatory && ( 'standalone' in window.navigator ||
			_instance.options.debug );

		_instance.options.modal = _instance.options.modal || _instance.options.mandatory;

		if ( _instance.options.mandatory ) {
			_instance.options.startDelay = -0.5; // make the popup hasty
		}

		// setup the debug environment
		if ( _instance.options.debug ) {

			platform.isCompatible = true;

		}

		if ( _instance.options.onInit ) {
			_instance.options.onInit.call( _instance );
		}

		if ( _instance.options.autostart ) {

			_instance.doLog( "Add to homescreen: autostart displaying callout" );

			if ( _instance.canPrompt() ) {

				_instance.show();

			}

		}

	}

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

			if ( platform.inPrivate ) {

				this.doLog( "Add to homescreen: not displaying callout because using Private browsing" );
				return false;
			}

			// the device is not supported
			if ( !platform.isCompatible ) {
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
				this.doLog( "Add to homescreen: not displaying callout because not a valid location" );
				return false;
			}

			if ( session.sessions < this.options.minSessions ) {
				this.doLog( "Add to homescreen: not displaying callout because not enough visits" );
				return false;
			}

			if ( ( this.options.nextSession && this.options.nextSession > 0 ) &&
				session.sessions >= this.options.nextSession ) {
				this.doLog( "Add to homescreen: not displaying callout because waiting on session " + this.options.nextSession );
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

			// check if the app is in stand alone mode
			if ( platform.isStandalone ) {

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

			if ( _instance.options.displayNextPrime ) {

				session.nextSession = nextPrime( session.session );

			}

			this.updateSession();

			if ( document.readyState === "interactive" || document.readyState === "complete" ) {

				this._delayedShow();

			} else {

				document.onreadystatechange = function () {

					if ( document.readyState === 'complete' ) {

						this._delayedShow();

					}

				};

			}

		},

		_delayedShow: function ( e ) {
			setTimeout( this._show.bind( this ), this.options.startDelay * 1000 + 500 );
		},

		_show: function () {

			if ( _beforeInstallPrompt ) {

				triggerNativePrompt();

			} else {

				var target = getPlatform(),
					ath_wrapper = document.querySelector( _instance.options.athWrapper );

				if ( ath_wrapper && !session.optedout ) {

					ath_wrapper.classList.remove( _instance.options.hideClass );

					var promptTarget = Object.assign( {}, defaultPrompt, _instance.options.customPrompt, _instance.options.prompt[ target ] );

					if ( promptTarget.showClasses ) {

						promptTarget.showClasses = promptTarget.showClasses.concat( _instance.options.showClasses );

					} else {

						promptTarget.showClasses = _instance.options.showClasses;

					}

					ath_wrapper.classList.add( ...promptTarget.showClasses );

					var ath_title = ath_wrapper.querySelector( _instance.options.promptDlg.title ),
						ath_logo = ath_wrapper.querySelector( _instance.options.promptDlg.logo ),
						ath_cancel = ath_wrapper.querySelector( _instance.options.promptDlg.cancel ),
						ath_install = ath_wrapper.querySelector( _instance.options.promptDlg.install );

					if ( ath_title && promptTarget.title ) {
						ath_title.innerText = promptTarget.title;
					}

					if ( ath_logo && promptTarget.src ) {
						ath_logo.src = promptTarget.src;
						ath_logo.alt = promptTarget.title || "Install PWA";
					}

					if ( ath_install ) {
						ath_install.addEventListener( "click", platform.handleInstall );
						ath_install.classList.remove( _instance.options.hideClass );
						ath_install.innerText = promptTarget.installMsg ? promptTarget.installMsg :
							( ( promptTarget.action && promptTarget.action.ok ) ? promptTarget.action.ok : _instance.options.promptDlg.action.ok );
					}

					if ( ath_cancel ) {
						ath_cancel.addEventListener( "click", platform.closePrompt );
						ath_cancel.classList.remove( _instance.options.hideClass );
						ath_cancel.innerText = promptTarget.cancelMsg ? promptTarget.cancelMsg :
							( ( promptTarget.action && promptTarget.action.cancel ) ? promptTarget.action.cancel : _instance.options.promptDlg.action.cancel );
					}

				}

				if ( this.options.autoHide && this.options.autoHide > 0 ) {

					setTimeout( this.autoHide, this.options.autoHide * 1000 );

				}

			}

			// fire the custom onShow event
			if ( this.options.onShow ) {
				this.options.onShow.call( this );
			}

		},

		trigger: function () {

			this._show.bind( this );

		},

		autoHide: function () {

			var target = getPlatform(),
				ath_wrapper = document.querySelector( _instance.options.athWrapper );

			if ( ath_wrapper ) {

				var promptTarget = _instance.options.prompt[ target ];
				promptTarget.showClasses = promptTarget.showClasses.concat( _instance.options.showClasses );

				ath_wrapper.classList.remove( ...promptTarget.showClasses );
				ath_wrapper.classList.add( _instance.options.hideClass );

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