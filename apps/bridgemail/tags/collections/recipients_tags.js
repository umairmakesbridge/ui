/* 
 * Name: Page Views Collection
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: This collection is used to fetch all page views when click on clicke page views.
 * Dependency: page view
 */https://test.bridgemailsystem.com/pms/io/user/getData/?BMS_REQ_TK=FUyyp88dF1jx5Xku3CIerPNwY8Dr1b&type=subscriberTagCountList
define(['backbone', 'app','tags/models/recipients_tag'], function (Backbone, app,ModelRecipientTag) {
	'use strict';
	return Backbone.Collection.extend({
	   urlRoot: '/pms/io/user/getData/',
           initialize: function(models,options) {
                options || (options = {});
                if (options.total) {
                    this.total = options.count;
                };
            },
            model:ModelRecipientTag,
            url: function () {
                return '/pms/io/user/getData/?BMS_REQ_TK=' + app.get('bms_token');
            },
            parse: function(response,res) {
                var result = [];
                if(!app.checkError(response) && response.count!=="0"){
                    var counter = 1;
                    _.each(response.tagList[0],function(val,key){
                        val[0]._id =  counter;
                        counter = counter + 1;
                         result.push(val[0]);
                    })                    
                }
                this.total = response.count;
                return result;
            } 
	});
});