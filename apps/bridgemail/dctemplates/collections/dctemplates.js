 /////////////////////////////////////////////////////////////////////////////////////////////////////////
 //
//         Templates Gallery Collection
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////
define([
	'backbone', 'app', 'dctemplates/models/dctemplates'
], function (Backbone, app, dctemplate) {
        'use strict';
	return Backbone.Collection.extend({
		model: dctemplate,
		url: function () {
                    return  "/pms/io/publish/getDynamicVariation/?BMS_REQ_TK="+app.get('bms_token')+"&type=list&isSort=Y"
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) &&  response.count !=="0" ){
                        _.each(response.variations[0],function(val,key){
                            val[0]._id = sent.data.offset + parseInt(key.substring(9));
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});
