/* 
 * Name: Common Contacts Collection
 * Date: 02 April 2014
 * Author: Umair & Abdullah
 * Description: This Collection is used to fetch all contacts wether its opened, clicked, converted, page views or clickers.
 * Dependency: Common Contacts Model
 */
define(['backbone', 'app','common/models/ccontacts'], function (Backbone, app,ModelContact) {
            'use strict';
	return Backbone.Collection.extend({
		model: ModelContact,
		url: function () {
                    return '/pms/io/subscriber/getData/?BMS_REQ_TK=' + app.get('bms_token') + '&type=getSAMSubscriberList';
		},
                parse: function(response,sent) {
                    var result = []
                    if(response.totalCount!=="0"){
                        _.each(response.subscriberList[0],function(val,key){
                            val[0]._id = sent.data.offset + parseInt(key.substring(10));
                            result.push(val[0]);
                        });                  
                    }
                    this.total = response.totalCount;
                    return result;
                }
	});
});