/* 
 * Name: Stats Model
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Stats Model is used to fetch all stats from db,eg pendingCount, SentCount, clickCount etc.
 * 
 */
define(['backbone', 'app'], function (Backbone, app) {
	'use strict';
	return Backbone.Model.extend({
		idAttribute: "_id",
                initialize:function(){
                    
                },
                urlRoot: '/pms/io/campaign/getCampaignData/',
		url: function () {
                    return Backbone.Model.prototype.url.call(this) + '?BMS_REQ_TK=' + app.get('bms_token')
		}
	       ,
               parse: function(response,res) {
                var result;
                console.log(response);
                if(response["messageId.checksum"]){
                        //result._id =  parseInt(response["campNum.encode"]);
                        result = response;
                }else{
                
                      if(!app.checkError(response) && response.count!=="0"){
                            _.each(response.campaigns[0],function(val,key){

                                val[0]._id =  parseInt(key.substring(4));
                                result = val[0];
                            })                    
                        }
                }
                return result;
                
            }
             
	});
});

