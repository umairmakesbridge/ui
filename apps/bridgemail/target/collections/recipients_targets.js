/* 
 * Name: Links Collection
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: this collection is used for fetching the links collection. using some parameters when fetching at links views.
 * Dependency: link model
 */

define(['target/models/recipients_target','app','backbone'], function (ModelTarget,app,Backbone) {
	'use strict';
	return Backbone.Collection.extend({
	   urlRoot: '/pms/io/filters/getTargetInfo/',
           initialize: function(models,options) {
                options || (options = {});
                if (options.total) {
                    this.total = options.count;
                };
            },
            model:ModelTarget,
            url: function () {
                return '/pms/io/filters/getTargetInfo/?BMS_REQ_TK=' + app.get('bms_token');
            },
            parse: function(response,res) {
                var result = [];
                if(!app.checkError(response) && response.totalCount!=="0"){
                    _.each(response.filters[0],function(val,key){
                        val[0]._id = val[0]['filterNumber.encode'];
                        result.push(val[0]);
                    })                    
                }
                this.total = response.count;
                return result;
            }
             
	});
});