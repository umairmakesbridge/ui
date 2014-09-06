(function () {

	var $;

	var json = function(obj){
		// Prototype.js overrides Object's toJSON property and breaks JSON.stringify
		// Temporarily suspend that broken functionality
		var crapBackup = {};
		if(window.Prototype) {
			crapBackup._object = Object.prototype.toJSON;
			crapBackup._array = Array.prototype.toJSON;
			crapBackup._string = String.prototype.toJSON;

			delete Object.prototype.toJSON;
			delete Array.prototype.toJSON;
			delete String.prototype.toJSON;

			if(window.Hash && Hash.prototype) {
				crapBackup._hash = Hash.prototype.toJSON;
				delete Hash.prototype.toJSON;
			}
		}

		// Now encode json using either a native function or our stub
		var jsonString = (window.JSON && typeof window.JSON.stringify == 'function' ? window.JSON.stringify : function (obj) {
			var t = typeof (obj);
			if (t != "object" || obj === null) {
				// simple data type
				if (t == "string") {
					obj = '"' + obj + '"';
				}
				return String(obj);
			} else {
				// recurse array or object
				var n, v, jsonArr = [], arr = (obj && obj.constructor == Array);
				for (n in obj) {
					if(obj.hasOwnProperty(n)) {
						v = obj[n];
						t = typeof(v);
						if (t == "string") {
							v = '"' + v + '"';
						} else if (t == "object" && v !== null) {
							v = json(v);
						}
						jsonArr.push((arr ? "" : '"' + n + '":') + String(v));
					}
				}
				return (arr ? "[" : "{") + String(jsonArr) + (arr ? "]" : "}");
			}
		})(obj);

		// Now put that broken Prototype stuff back
		if(window.Prototype) {
			if(crapBackup._object) {
				Object.prototype.toJSON = crapBackup._object;
			}
			if(crapBackup._array) {
				Array.prototype.toJSON = crapBackup._array;
			}
			if(crapBackup._string) {
				String.prototype.toJSON = crapBackup._string;
			}
			if(crapBackup._hash) {
				Hash.prototype.toJSON = crapBackup._hash;
			}
		}

		// Now return encoded json string
		return jsonString;
	};

	// Keep track of all running apps, used for routing messages to correct apps
	var runningApps = {};

	// Keeps track of host names that we are accepting messages from.
	var listenedHosts = {};

	// Main listening function that calls $.recieveMessage. Does message routing and calls the right handlers.
	// Only accepts messages from 'listenedHosts' and routes them to 'runningApps'.
	// Called every time iframedApp.load() is called, but becomes a no-op after being called once, because we only
	// want to call $.postMessage once and then do message routing on our own.
	var listen = function () {
		listen = $.noop;

		$.receiveMessage(function (e) {
			var data = $.parseJSON(e.data);

			if (!data || !data.cmd) {
				return;
			}

			if (!data.appId) {
				return;
			}

			var targetApp = runningApps[data.appId];

			if (!targetApp || targetApp.destroyed) {
				return;
			}

			if ($.isArray(targetApp.listeners[data.cmd])) {
				for (var i = 0; i < targetApp.listeners[data.cmd].length; i++) {
					targetApp.listeners[data.cmd][i](data.params);
				}
			}

			if ($.isArray(targetApp.listeners['*'])) {
				for (var ai = 0; ai < targetApp.listeners['*'].length; ai++) {
					targetApp.listeners['*'][ai](data.params);
				}
			}
		}, function (url) {
			// Validate message origin
			for (var hostName in listenedHosts) {
				if (listenedHosts.hasOwnProperty(hostName) && !!listenedHosts[hostName]) {
					if ((new RegExp('^https?:\/\/' + $.trim(hostName) + '$')).test(url)) {
						return true;
					}
				}
			}
			return false;
		});
	};

	/**
	 * Constructor for iframed app instances
	 * @param options
	 * @constructor
	 */
	function IframedApp(options) {
		this.options = $.extend({}, {
			host: window.location.href, // Hostname to accept messages from
			iframeUrl: '', // Url of the app to load in iframe
			currentUrl: window.location.href, // Current page URL (iframed apps need to know it to respond)
			appId: +new Date(), // Application ID, unique for every app, used to route messages
			appName: +new Date(), // General app name, used for selectors & element ids
			hideOnEscape: true, // Binds a listener for Esc key to body?
			preventBodyScroll: true, // When iframed app is visible, should hosting body scrolling be prevented
			container: null, // A custom container to use instead of <body>
			containerCss: null // Additional style for iframe container div
		}, options);


		// Keep track of message listeners
		this.listeners = {};

		// Save a reference to iframe window
		this.iframeWindow = null;

		// Add "callback" information to the URL, so that iframed apps know their ID and where to respond
		this.iframeUrl = this.options.iframeUrl;
		this.iframeUrl += (this.iframeUrl.indexOf('?') === -1 ? '?' : '&') + 'appId=' + this.options.appId +
						  '&parentHref=' + encodeURIComponent(this.options.currentUrl);

		this.defaultContainerCss = {
			position: 'fixed',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 10000,
			backgroundColor: 'transparent',
			boxShadow: 'none',
			width: 'auto',
			height: 'auto'
		};

		// Create a div to hold the iframe container
		this.$appContainer = $('<div/>', {
			id: 'pingage-' + this.options.appName + '-container'
		}).css(this.defaultContainerCss).css(options.containerCss || {}).hide();

		// One-time listener for the Escape key
		this.escapeListener = $.proxy(function (e) {
			if (e.which == 27) {
				$('body').off('keyup.pingageApp' + this.options.appName, this.escapeListener);
				this.trigger('handleEscape');
			}
		}, this);
	}

	/**
	 * Shows or hides iframe contaner using css visibility
	 */
	IframedApp.prototype.visibility = function (visible) {
		this.$appContainer.css({
			visibility: visible ? 'visible' : 'hidden'
		});
	};

	/**
	 * Hides the iframe container and suspends Esc key listener
	 */
	IframedApp.prototype.hide = function () {
		this.$appContainer.hide();

		// Revert body scrolling to initial
		this.preventScrolling(false);

		// Unbind escape key listener
		if (this.options.hideOnEscape) {
			this.unbindEscapeListener();
		}
	};

	/**
	 * Shows the iframe container and binds Esc key listener
	 */
	IframedApp.prototype.show = function () {
		// Prevent body scrolling
		this.preventScrolling();

		// Show our container
		this.$appContainer.show();

		// Bind escape key listener
		if (this.options.hideOnEscape) {
			this.bindEscapeListener();
		}
	};

	/**
	 * Destroys the iframe container, suspends Esc key listener, removes the app from message recipients
	 */
	IframedApp.prototype.destroy = function () {
		this.hide();
		this.$appContainer.remove();
		this.$scrollPreventer.remove();
		this.destroyed = true;
		delete(runningApps[this.options.appId]);
	};

	/**
	 * Prevents or allows scrolling the body of the hosting page
	 * @param prevent true to prevent scrolling (default), false to enable scrolling
	 */
	IframedApp.prototype.preventScrolling = function(prevent) {
		if (this.options.preventBodyScroll) {
			if(prevent === false) {
				// Revert body scrolling to initial
				this.$scrollPreventer.detach();
			} else {
				// Prevent body scrolling
				this.$scrollPreventer.insertBefore($('base')[0] || $('script')[0]);
			}
		}
	};

	/**
	 * Adjusts/resets viewport of the hosting page
	 */
	IframedApp.prototype.adjustViewport = function(content) {
		var $currentMeta = $('meta[name="viewport"]');

		if(content) {
			if($currentMeta.size()) {
				//alert('Adjusting viewport: ' + content);
				//alert('Original Content: ' + $currentMeta.attr('content'));
				$currentMeta.data('originalContent', $currentMeta.attr('content'));
				$currentMeta.attr('content', content);
			} else {
				//alert('Adjusting viewport: ' + content);
				//alert('No Original Content');
				$currentMeta = $('<meta name="viewport" content="' + content + '">');
				$currentMeta.data('originalContent', 'width=auto, initial-scale=auto, maximum-scale=auto');
				$('head').append($currentMeta);
			}
		} else {
			if($currentMeta.size() && $currentMeta.data('originalContent') !== undefined) {
				//alert('Resetting viewport');
				//alert('Original Content: ' + $currentMeta.data('originalContent'));
				$currentMeta.attr('content', $currentMeta.data('originalContent'));
				$currentMeta.removeData('originalContent');
			}
		}
	};

	IframedApp.prototype.adjustToViewport = function(constraints){
		if(this.resizeListener) {
			$(window).off('resize', this.resizeListener);
			$(window).off('scroll', this.resizeListener);
		}

		if(constraints === null) {
			this.$appContainer.css(this.defaultContainerCss);
			return;
		}

		this.resizeListener = $.proxy(function(){
			var innerW = window.innerWidth;
			var innerH = window.innerHeight;
			var percentHeight = (innerW < innerH ? constraints.portrait : constraints.landscape) / 100;

			//Occupy n% of the viewport
			this.$appContainer.css({
				position: 'absolute',
				width: innerW,
				height: innerH * percentHeight,
				top: window.scrollY + (innerH * (1-percentHeight)),
				left: window.scrollX
			});
		}, this);

		$(window).on('resize', this.resizeListener);
		$(window).on('scroll', this.resizeListener);
		this.resizeListener();
	};

	/**
	 * Binds the Escape key listener
	 */
	IframedApp.prototype.bindEscapeListener = function () {
		$('body').on('keyup.pingageListener_' + this.options.appId, this.escapeListener);
	};

	/**
	 * Unbinds the Escape key listener
	 */
	IframedApp.prototype.unbindEscapeListener = function () {
		$('body').off('keyup.pingageListener_' + this.options.appId, this.escapeListener);
	};

	/**
	 * Starts loading the iframed app
	 * @return {*}
	 */
	IframedApp.prototype.load = function () {
		// Choose the target to insert our $appContainer to
		this.$body = this.options.container ? $(this.options.container) : $('body');

		// Check that body is there (may be a frameset instead)
		if (!this.$body.size()) {
			this.$body = $(document.body); // If not, grab it from document.body
		}

		// Allow messages from the target hostname, so that iframed app can respond and messages get through
		listenedHosts[this.options.host] = true;

		// Add ourselves to message recipients list so that messages get routed to our handlers
		runningApps[this.options.appId] = this;

		// Start listening for messages
		listen();

		if (!this.$iframe || !this.$iframe.size()) {
			// Inject CSS to make iframe invisible and prevent it's blinking
			this.$styleDiv = $('<div/>', {
				html: '&shy;<style> iframe#pingage-' + this.options.appName + '-iframe { visibility: hidden; } </style>'
			}).insertBefore($('base')[0] || $('script')[0]);

			// Prepare a style to prevent body from scrolling (but don't insert it yet)
			this.$scrollPreventer = $('<div/>', {
				html: '&shy;<style> body, frameset { overflow:hidden !important; overflow-x: hidden !important; overflow-y: hidden !important } </style>'
			});

			// Create the iframe to hold our iframed app
			this.$iframe = $('<iframe/>', {
				id: 'pingage-' + this.options.appName + '-iframe',
				frameBorder: 0,
				allowtransparency: 'true',
				src: this.iframeUrl,
				width: '100%',
				height: '100%'
			});

			// Remove anti-blinking CSS and make iframe visible
			this.$iframe.load($.proxy(function () {
				this.iframeWindow = this.$iframe[0].contentWindow;
				this.$styleDiv.remove();
			}, this));

			// Automate most common commands
			this.bind({
				show: $.proxy(this.show, this),
				hide: $.proxy(this.hide, this),
				destroy: $.proxy(this.destroy, this),
				redirect: $.proxy(function (data) {
					window.location.href = data.href;
				}, this),
				containerAnimate: $.proxy(function(rules){
					this.$appContainer.animate(rules);
				}, this),
				containerCss: $.proxy(function(rules){
					this.$appContainer.css(rules);
				}, this),
				containerReset: $.proxy(function(){
					this.$appContainer.css(this.defaultContainerCss);
				}, this),
				preventScrolling: $.proxy(function(prevent){
					this.preventScrolling(prevent);
				}, this),
				listenEscape: $.proxy(function(listen){
					if(listen) {
						this.bindEscapeListener();
					} else {
						this.unbindEscapeListener();
					}
				}, this),
				adjustViewport: $.proxy(this.adjustViewport, this),
				resizeToViewport: $.proxy(this.adjustToViewport, this)
			});

			// Append iframe to container div
			this.$appContainer.append(this.$iframe);

			// Append container div to <body> (or after <frameset>)
			if (this.$body.is('frameset')) {
				this.$body.after(this.$appContainer);
			} else {
				this.$body.append(this.$appContainer);
			}
		}

		return this;
	};

	/**
	 * Sends a message to iframed app
	 * @return {*}
	 */
	IframedApp.prototype.trigger = function (cmd, params) {
		$.postMessage(json({ appId: this.options.appId, cmd: cmd, params: params }), this.iframeUrl, this.iframeWindow);
		return this;
	};

	/**
	 * Binds a handler to iframed app messages
	 * @param cmd Command name, or *
	 * @return {*}
	 */
	IframedApp.prototype.bind = function (cmd, callback, context) {
		if (typeof cmd == 'object') {
			for (var en in cmd) {
				if (cmd.hasOwnProperty(en)) {
					this.bind(en, cmd[en], context);
				}
			}
		} else {
			if (!this.listeners[cmd]) {
				this.listeners[cmd] = [];
			}
			this.listeners[cmd].push($.proxy(callback, context));
		}

		return this;
	};

	/** Scales the iframed app to a certain ratio, but needs a fixed width & height for layout reasons */
	IframedApp.prototype.scale = function (width, height, ratio) {
		this.$iframe.css({
			width: width,
			height: height,
			transform: 'scale(' + ratio.toString(10) + ')',
			transformOrigin: '0 0'
		});
	};

	if (typeof(define) == 'function' && define.amd) {
		// Export our Iframed app as an AMD module
		define(['jquery', 'jquery.postmessage'], function (jQuery, $PM) {
			$ = jQuery;
			return IframedApp;
		});
	} else {
		if (typeof(jQuery) === 'undefined') {
			throw new Error('jQuery is not defined');
		}

		$ = jQuery;

		if (!$.postMessage || !$.receiveMessage) {
			throw new Error('jQuery.postMessage or jQuery.receiveMessage is not defined');
		}

		// Export our Iframed app to the global namespace
		window.MakesbridgeIframedApp = IframedApp;
	}
})();
