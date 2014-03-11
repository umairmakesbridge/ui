/* 
 * Author: Abdul Wakel
 * Date:  3 March 2014
 * Title: Graphics Collections
 * Description: Graphics Collections, used for manage graphics and graphics library.
 * 
 */
define([
	'backbone', 'app', 'userimages/models/userimage'
], function (Backbone, app, UserImage) {
        'use strict';
	return Backbone.Collection.extend({
           initialize: function(models, options) {
                options || (options = {});
                if (options.total) {
                    this.total = options.total;
                };
            },
            model: UserImage,
            url: function () {
                return '/pms/io/publish/getImagesData/?BMS_REQ_TK=' + app.get('bms_token');
            },
            parse: function(response,res) {
                var result = []
                if(response.totalCount!=="0"){
                    _.each(response.images[0],function(val,key){
                        val[0]._id = val[0]['imageId.encode'];
                        result.push(val[0]);
                    })                    
                }
                this.total = response.totalCount;
                //this.meta("totalcount", response.totalCount);
                return result;
            }
	});
});


