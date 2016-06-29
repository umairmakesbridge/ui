/* 
 * Name: Contacts Collection
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: This Collection is used to fetch all contacts wether its opened, clicked, converted, page views or clickers.
 * Dependency: Contact Model
 */
define(['backbone', 'app','reports/summary/models/scontact'], function (Backbone, app,ModelContact) {
	'use strict';
	return Backbone.Collection.extend({
	    urlRoot: '/pms/io/campaign/getResponders/',
           initialize: function(models,options) {
                options || (options = {});
                if (options.total) {
                    this.total = options.count;
                };
            },
            model:ModelContact,
            url: function () {
                return '/pms/io/campaign/getResponders/?BMS_REQ_TK=' + app.get('bms_token');
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

