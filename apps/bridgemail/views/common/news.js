define(['jquery', 'backbone', 'underscore', 'app', 'text!templates/common/news.html'],
	function ($, Backbone, _, app, template) {
		'use strict';
		return Backbone.View.extend({
			id: 'updates-bar',
                        events: {
                            'click .thumb':function(){              
                                    if(this.$el.css("bottom")=="-80px"){
                                        this.$el.animate({bottom:0});
                                    }
                                    else{
                                        this.$el.animate({bottom:-80});
                                    }
                            }
                         },

			initialize: function () {
				this.template = _.template(template);				
				this.render();
			},

			render: function () {
				this.$el.html(this.template({}));
				
			}
		});
	});
