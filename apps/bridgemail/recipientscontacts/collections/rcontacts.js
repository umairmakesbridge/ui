/* 
 * Name: Links Collection
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: this collection is used for fetching the links collection. using some parameters when fetching at links views.
 * Dependency: link model
 */

define(['recipientscontacts/models/rcontact','app','backbone'], function (ModelrContact,app,Backbone) {
	'use strict';
	return Backbone.Collection.extend({
	   urlRoot: '/pms/io/list/getListPopulation/',
           initialize: function(models,options) {
               console.log(this.options);
                options || (options = {});
                if (options.total) {
                    this.total = options.count;
                };
            },
            model:ModelrContact,
            url: function () {
                return '/pms/io/list/getListPopulation/?BMS_REQ_TK=' + app.get('bms_token');
            },
            parse: function(response,res) {
                var result = [];
                if(!app.checkError(response) && response.totalCount!=="0"){
                    _.each(response.subscribers[0],function(val,key){
                        val[0]._id = val[0]['subNum.encode'];
                        result.push(val[0]);
                    })                    
                }
                this.total = response.totalCount;
                return result;
            }
             
	});
});