/* 
 * Name: Links Collection
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: this collection is used for fetching the links collection. using some parameters when fetching at links views.
 * Dependency: link model
 */

define(['listupload/models/recipient_list','app','backbone'], function (ModelRecipient,app,Backbone) {
	'use strict';
	return Backbone.Collection.extend({
	   urlRoot: '/pms/io/list/getListData/',
           initialize: function(models,options) {
                options || (options = {});
                if (options.total) {
                    this.total = options.count;
                };
            },
            model:ModelRecipient,
            url: function () {
                return '/pms/io/list/getListData/?BMS_REQ_TK=' + app.get('bms_token');
            },
            parse: function(response,res) {
                var result = [];
                if(!app.checkError(response) && response.totalCount!=="0"){
                    _.each(response.lists[0],function(val,key){
                        val[0]._id = val[0]['listNumber.encode'];
                        result.push(val[0]);
                    })                    
                }
                this.total = response.count;
                return result;
            }
             
	});
});