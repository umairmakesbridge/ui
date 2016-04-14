
 /////////////////////////////////////////////////////////////////////////////////////////////////////////
 //
//         Templates Gallery Collection
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////
define([
	'backbone', 'app', 'bmstemplates/models/templates'
], function (Backbone, app, template) {
        'use strict';
	return Backbone.Collection.extend({
		model: template,
		url: function () {
                    return  "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK="+app.get('bms_token')
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) &&  response.count !=="0" ){
                        _.each(response.templates[0],function(val,key){
                            val[0]._id = sent.data.offset + parseInt(key.substring(8));
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});
