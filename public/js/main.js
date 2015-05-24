(function () {

// Flow:
// -------------
// 1. AJAX to retrieve Navbar data
// 2. Auto Generate Navbar from data
// 3. Attach events to Navbar
//    Events: PrimNav, SecondNav, hamburger/close/Esc ,key/click outside

/* Populate navbar
================================================== */
	function getData(callback) {

		var request = new XMLHttpRequest();

		request.open('GET', '/api/nav.json', true);

		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {
				// Success! lets build Navbar
				var data = JSON.parse(request.responseText);
				return callback(null, data);

			} else {
				// We reached our target server, but it returned an error
				console.log('Could not load data');
			}
		};

		request.onerror = function(err) {
		  // There was a connection error of some sort
			console.log('Connection error');
			return callback(err);
		};

		request.send();
	}

	function generateNavbar(html, data) {
		for (var i = 0; i < data.length; i++) {

			var hasItems = data[i].items && data[i].items.length > 0;

			html += '<li>';
			html += '<a href="' + data[i].url + '">' + data[i].label + ((hasItems)? '<i class="icon-chevron-down"></i>' : '') + '</a>';

			if (hasItems) {
				html += '<ul class="sub-item">';
				html += generateNavbar('', data[i].items);
				html += '</ul>';
			}

			html += '</li>';
		}

		return html;
	}

	function init() {
		// Get data from JSON file
		getData(function(err, data) {

			if (err) {
				throw err;
			}

			// Generate Navbar from data object
			var html = generateNavbar('', data.items);

			// Set Navbar's HTML content
			document.getElementById('nav-menu').innerHTML = html;

			// Bind Events
			bindEvents("click", '#nav-menu > li > a', evToggleSecondNav);
			bindEvents("click", 'body', evToggleTranslucentMask);
			bindEvents("click", '#toggle-open', evToggleMobileMenu);
			bindEvents("keyup", 'body', evToggleTranslucentMaskEsc);

			window.onresize = (function () {
				if (window.innerWidth >= 768 ) {
					resetPrimaryNav();
					toggleContentWrap();
				}
			});
		});
	}

	init();

/* Events
================================================== */
	function bindEvents(event, element, evFunction) {

		var el = document.querySelectorAll(element);

		for (var i = 0; i < el.length; i++) {
			el[i].addEventListener(event, evFunction);
		};
	}

	function toggleContentWrap(status) {
		el = document.querySelector('.content-wrap');
		if (status === 'active') {
			el.classList.add('active');
		} else {
			el.classList.remove('active');
		}
	}

	function resetPrimaryNav() {
		var elements = document.querySelectorAll('#nav-menu > li');
		for (var i = 0; i < elements.length; i++) {
			elements[i].classList.remove('active');
		}
	}

	function resetMobileNav() {
		var navbar = document.querySelector('.navbar');
		navbar.classList.remove('active');
	}

	function evToggleTranslucentMask(e) {
		var el = e.target;
		if (el.classList.contains('content-wrap') || el.classList.contains('navbar') || el.id === 'toggle-close') {
			toggleContentWrap('');
			resetPrimaryNav();
			resetMobileNav();
		}
	}

	function evToggleTranslucentMaskEsc(e) {
		if (e.keyCode === 27) {
			toggleContentWrap();
			resetPrimaryNav();
			resetMobileNav();
		}
	}

	function evToggleSecondNav(e) {
		var el     = e.target;
		var parent = el.parentNode;

		if (window.innerWidth >= 768 ) {
			resetPrimaryNav();
		}

		parent.classList.toggle('active');
		toggleContentWrap('active');
	}

	function evToggleMobileMenu(e) {
		var navbar = document.querySelector('.navbar');
		navbar.classList.toggle('active');
		toggleContentWrap('active');
	}

})();