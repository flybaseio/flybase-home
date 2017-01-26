(function($) {

	skel.breakpoints({
		wide: '(max-width: 1680px)',
		normal: '(max-width: 1280px)',
		narrow: '(max-width: 980px)',
		narrower: '(max-width: 840px)',
		mobile: '(max-width: 736px)',
		mobilep: '(max-width: 480px)'
	});

	$(function() {

		var	$window = $(window),
			$body = $('body'),
			$header = $('#header'),
			$banner = $('#banner');

		// Fix: Placeholder polyfill.
			$('form').placeholder();

		// Prioritize "important" elements on narrower.
			skel.on('+narrower -narrower', function() {
				$.prioritize(
					'.important\\28 narrower\\29',
					skel.breakpoint('narrower').active
				);
			});

		// Dropdowns.
			$('#nav > ul').dropotron({
				alignment: 'right'
			});

		// Off-Canvas Navigation.

			// Navigation Button.
				$(
					'<div id="navButton">' +
						'<a href="#navPanel" class="toggle"></a>' +
					'</div>'
				)
					.appendTo($body);

			// Navigation Panel.
				$(
					'<div id="navPanel">' +
						'<nav>' +
							$('#nav').navList() +
						'</nav>' +
					'</div>'
				)
					.appendTo($body)
					.panel({
						delay: 500,
						hideOnClick: true,
						hideOnSwipe: true,
						resetScroll: true,
						resetForms: true,
						side: 'left',
						target: $body,
						visibleClass: 'navPanel-visible'
					});

			// Fix: Remove navPanel transitions on WP<10 (poor/buggy performance).
				if (skel.vars.os == 'wp' && skel.vars.osVersion < 10)
					$('#navButton, #navPanel, #page-wrapper')
						.css('transition', 'none');

		// Header.
		// If the header is using "alt" styling and #banner is present, use scrollwatch
		// to revert it back to normal styling once the user scrolls past the banner.
		// Note: This is disabled on mobile devices.
			if (!skel.vars.mobile
			&&	$header.hasClass('alt')
			&&	$banner.length > 0) {

				$window.on('load', function() {

					$banner.scrollwatch({
						delay:		0,
						range:		0.5,
						anchor:		'top',
						on:			function() { $header.addClass('alt reveal'); },
						off:		function() { $header.removeClass('alt'); }
					});

				});

			}

		$('[data-toggle="tooltip"]').tooltip({ 
			container: 'body',
			template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner" style="padding:10px;"></div></div>'
		})
	
	    /* ======= FAQ accordion ======= */
	    function toggleIcon(e) {
	    $(e.target)
	        .prev('.panel-heading')
	        .find('.panel-title a')
	        .toggleClass('active')
	        .find("i.fa")
	        .toggleClass('fa-plus-square fa-minus-square');
	    }
	    $('.panel').on('hidden.bs.collapse', toggleIcon);
	    $('.panel').on('shown.bs.collapse', toggleIcon);    
    

	});

})(jQuery);

$( document ).ready(function() {
	var dm = new dmSite();
	dm.start();
});

var dmSite = function(){	
	this.size = window.getComputedStyle(document.body,':after').getPropertyValue('content').replace(/\W/g, '');
	this.url = document.location.pathname;
	return this;
}

dmSite.prototype.start = function(){
//	if ( this.url === "/" || this.url === "/books" || this.url === "/books/" ) {
	if ( this.url === "/books" || this.url === "/books/" ) {
		var popular = new mostPopular().getPages( $("#postlist") );
	}
	return this;
};

var mostPopular = function(){
	this.api_key = "74c8064f-cd6f-4c07-8baf-b1d241496eec";
	this.db = "dmblog";
	this.collection = "mostpopular";
	this.pages = [];
	this.flybaseRef = new Flybase( this.api_key, this.db, this.collection );
	return this;
};

mostPopular.prototype.getPages = function( div_id ){
	var _this = this;	
	var r={
		headline:"Check Out Recently Popular Blog Posts&hellip;",
		clickhere:"(click to load)",
		loading:"(loading&hellip;)"
	};
	$('<aside id="popular"><header><h1>'+r.headline+"</h1></header></aside>").prependTo( div_id );
	this.flybaseRef.orderBy({"views":-1}).limit(8).on('value',function( data ){
		if( data.count() ){
			var pages = [];
			data.forEach( function(snapshot) {
				var item = snapshot.value();
				pages[item._id] = item;
			});

			var aside = $("#popular");
			var header = $("header",aside);

			var ul = $("<ul />").attr("style","display:none");
			for( var i in pages ){
				var item = pages[i];
				$('<li/>').attr("id",item._id).prepend(
					$("<a>")
						.attr("href","http://blog.flybase.io" + item.url)
						.attr("title",item.title)
						.attr("data-count",item.views)						
						.html('<i class="fa fa-rocket"></i> ' + item.title)
				).appendTo( ul );
			}
			aside.append( ul );
			ul.slideDown(400);
			header.removeClass("loading").addClass("loaded");
			header.find("h1").html(r.headline);
		}
	});
	return this;
};