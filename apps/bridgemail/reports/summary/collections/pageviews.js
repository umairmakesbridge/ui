/* 
 * Name: Page Views Collection
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: This collection is used to fetch all page views when click on clicke page views.
 * Dependency: page view
 */
define(['backbone', 'app','reports/summary/models/pageview'], function (Backbone, app,ModelPageView) {
	'use strict';
	return Backbone.Collection.extend({
	   urlRoot: '/pms/io/campaign/getResponders/',
           initialize: function(models,options) {
                options || (options = {});
                if (options.total) {
                    this.total = options.count;
                };
            },
            model:ModelPageView,
            url: function () {
                return '/pms/io/campaign/getResponders/?BMS_REQ_TK=' + app.get('bms_token');
            },
            parse: function(response,res) {
                var result = [];
                if(!app.checkError(response) && response.totalCount!=="0"){
                    _.each(response.visits[0],function(val,key){
                        val[0]._id =  parseInt(key.substring(5));;
                         result.push(val[0]);
                    })                    
                }
                this.total = response.totalCount;
                return result;
            } 
	});
});