define(['jquery', 'backbone', 'underscore', 'app', 'text!templates/common/footer.html'],
	function ($, Backbone, _, app, template) {
		'use strict';
		return Backbone.View.extend({
			id: 'footer',
                        tagName: 'footer',
                        className:"clearfix",
                        events: {
                            "click #change_font_global":function(){
                                $("*").css("font-family",$("#font-family-name").val());
                            }
                         },

			initialize: function () {
				this.template = _.template(template);				
				this.render();
				var today = new Date();
				var year = today.getFullYear();
				this.$('#curYear').html(year);				
			},

			render: function () {
				this.$el.html(this.template({}));
				
			}
		});
	});
