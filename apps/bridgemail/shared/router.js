define(['backbone'], function (Backbone) {
	'use strict';

	return Backbone.Router.extend({

		routes: {
			'': 'index',
			'_=_': 'index',
			'pages': 'index',
			'pages/:page': 'page',
			'pages/:page/': 'page',
			'pages/:page/:subpage': 'page',
			'pages/:page/:subpage/': 'page'
		},

		initialize: function (defaultPage) {
			this.defaultPage = defaultPage;
		},

		index: function () {
			this.navigate('/pages/' + this.defaultPage, {trigger: true});
		},
		page: function (page, subPage) {
			//app.mainContainer.activatePage(page || this.defaultPage, subPage);
		}
	});
});
