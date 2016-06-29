/* 
 * Name: Clicks Dialog on open
 * Date: 30 May 2014
 * Author: Pir Abdul Wakeel
 * Description: this collection is used for fetching the links collection. using some parameters when fetching at links views.
 * Dependency: click model
 */

define(['backbone', 'app','reports/summary/models/click'], function (Backbone, app,ModelClick) {
	'use strict';
	return Backbone.Collection.extend({
	   urlRoot: '/pms/io/campaign/getResponders/',
           initialize: function(models,options) {
                options || (options = {});
                if (options.total) {
                    this.total = options.count;
                };
},
            model:ModelClick,
            url: function () {
                return '/pms/io/campaign/getResponders/?BMS_REQ_TK=' + app.get('bms_token');
            },
            parse: function(response,res) {
                var result = [];
                if(!app.checkError(response) && response.totalCount!=="0"){
                    _.each(response.clicks[0],function(val,key){
                        val[0]._id = val[0]['articleNum.encode'];
                        result.push(val[0]);
                    })                    
                }
                this.total = response.totalCount;
                return result;
            }
             
	});
});