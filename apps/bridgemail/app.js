define([
	'jquery', 'underscore', 'backbone','bootstrap','views/common/dialog','jquery.bmsgrid','jquery.calendario','jquery.icheck','jquery.chosen','jquery.highlight','jquery.searchcontrol','jquery-ui','fileuploader','bms-filters','bms-crm_filters','bms-tags','bms-mapping','moment','_date','daterangepicker','bms-dragfile','bms-addbox','propertyParser','goog','async'
], function ($, _, Backbone,  bootstrap,bmsDialog) {
	'use strict';
	var App = Backbone.Model.extend({
		messages:[{'CAMP_subject_empty_error':'Subject cannot be empty',
                            'CAMP_subject_length_error':'Subject limit is 100 characters',
                            'CAMP_fromname_empty_error':'From name cannot be empty',
                            'CAMP_replyto_empty_error':'Reply field cannot be empty',
                            'CAMP_replyto_format_error':'Please enter correct email address format',
                            'CAMP_defaultreplyto_format_error':'Please enter correct email address format',
                            'CAMP_defaultreplyto_empty_error':'Reply field cannot be empty',
                            'CAMP_defaultfromname_empty_error': 'From name cannot be empty',
                            'CAMP_draft_success_msg': 'Campaign status is Draft',
                            'CAMP_copy_success_msg': 'Campaign copy is complete',
                            'CAMP_subject_info' : 'Subject of the email',
                            'CAMP_femail_info' : 'From email of the email',
                            'CAMP_fname_info' : 'From name of the email',
                            'CAMP_replyto_info' : 'Reply to email of the email',
                            'SF_userid_empty_error':'User ID cannot be empty',
                            'SF_userid_format_error':'Invalid User ID. Hint: IDs are in an email format',
                            'SF_pwd_empty_error':'Enter password',
                            'SF_email_format_error':'Please enter correct email address format',
                            'NS_userid_empty_error':'User ID cannot be empty',
                            'NS_userid_format_error':'Invalid User ID. Hint: IDs are in an email format',
                            'NS_pwd_empty_error':'Enter password',
                            'NS_accid_empty_error':'Account id cannot be empty',
                            'NS_email_format_error':'Please enter correct email format',
                            'CT_copyname_empty_error':'Name cannot be empty',
                            'CSVUpload_wrong_filetype_error':'CSV format only. Watch video on how to save an excel file to CSV.',
                            'CSVUpload_cancel_msg':'Your CSV upload has been cancelled',
                            'MAPDATA_newlist_empty_error':'Enter a list name',
                            'MAPDATA_newlist_exists_error':'List name already exists',
                            'MAPDATA_extlist_empty_error':'Choose a list',
                            'MAPDATA_email_format_error':'Please enter correct email address format',
                            'MAPDATA_bmsfields_empty_error':'Match your CSV columns to fields. Columns that you do not match will not be uploaded',
                            'MAPDATA_bmsfields_duplicate_error':'Your have duplicate field names. Field names must be unique',
                            'MAPDATA_customfield_placeholder':'New custom field',
                            'TRG_basic_no_field':'Select a field',
                            'TRG_basic_no_matchvalue':'Please provide match field value',
                            'TRG_score_novalue' : 'Enter a score value',
                            'TRG_form_noform' : 'Choose a form',
                            'CRT_tarname_empty_error' : 'Target name cannot be empty',							
                            'CAMPS_campname_empty_error' : 'Campaign name cannot be empty',
                            'CAMPS_delete_confirm_error' : 'Are you sure you want to delete?',
                            'CAMPS_name_empty_error' : 'No campaign found',							
                            'CAMPS_html_empty_error' : 'Campaign has not content',
                            'CAMPS_delete_success_msg' : 'Campaign deleted',
                            'SUB_updated': 'Subscriber updated successfully',
		}],
		initialize: function () {
			//Load config or use defaults
			this.set(_.extend({
				env: 'developement',
				bms_token: $.getUrlVar(false,'BMS_REQ_TK'),
                                preview_domain : previewDomain,
                                images_CDN : imagesCDN,
                                static_CDN : staticCDN,
				host: window.location.hostname,
				session: null,
                                app_data : {}
			}, window.sz_config || {}));
					
			//Convenience for accessing the app object in the console
			if (this.get('env') != 'production') {
                            window.BRIDGEMAIL = this;
			}
                        this.getUser();
		},
		start: function (Router, MainContainer, callback) {
			//Create the router
			this.router = new Router('landing');    
			//Wait for DOM to be ready
			$(_.bind(function () {
                                //Create the main container
				this.mainContainer = new MainContainer({app:this});				              
                                
                                //attaching main container in body                                
                                $('body').append(this.mainContainer.$el);
                                this.mainContainer.dashBoardScripts();
                                this.initScript();                                
				//call the callback
				(callback || $.noop)();
			}, this));
		},
                initScript:function(){
                    
                    this.autoLoadImages();      
                    this.setInfo();
                    var app = this;
                    $("body").click(function(){
                       $(".custom_popup").hide(); 
                       $(".tagbox-addbox").remove(); 
                       $("#camp_tags").removeClass("active");
                       $(".tooltip-inner").parents(".tooltip").remove();
                       var getCmpField = $(".ws-content.active #header_wp_field");
                       if(getCmpField.attr("process-id")){
                            $(".ws-content.active").find(".camp_header .c-name .edited").hide();                        
                            $(".ws-content.active").find(".camp_header .c-name h2,#campaign_tags").show();                                                    
                        }
                        if(app.mainContainer.$(".icon-menu").hasClass("active")){
                            app.mainContainer.$(".icon-menu").removeClass( "active" );
                            app.mainContainer.$(".slideoverlay").fadeOut("slow");
                            app.mainContainer.$( ".slidenav" ).animate({left: "-300px"}, 500 );
                        }
                    });
                    
                   var self = this;                                                                         
                   var content_height = ($('body').height()-90);                   
                   
                   this.set("wp_height",(content_height-100));
                   $(window).resize(function(){
                       self.resizeWorkSpace();
                   });
                   var _app = this;
                   $(document).ajaxComplete(function(event,request, settings) {
                       if(request.responseText){
                           var result = jQuery.parseJSON(request.responseText);
                           if(result[0]=="err" && result[1]=="SESSION_EXPIRED"){
                            var messageObj = {};
                            messageObj["heading"] = "Session Expired" 
                            messageObj["detail"] = "1. Your login session has expired.<br/>2. You are trying to access the page without logging-in.<br/>3. You did not follow the provided link to access this page and are trying to reach here by invalid means.";
                            _app.showLoginExpireAlert(messageObj,$("body"));							
                            return false;
                           }
                       }
                   });
                   
                   //Ajax Error handling
                   $( document ).ajaxError(function( event, jqxhr, settings, exception ) {
                        console.log(event + "\n-Jxhr Object=" + jqxhr + "\n-Setttings=" + settings + -"\n-Exception="+exception);
                   });
                   //Cache Clear time set
                   this.clearCache();
                 
             },
             getUser:function(){
                 var URL = "/pms/io/user/getData/?BMS_REQ_TK="+this.get("bms_token")+"&type=get";
                 jQuery.getJSON(URL,_.bind(function(tsv, state, xhr){
                    var _json = jQuery.parseJSON(xhr.responseText);
                    if(this.checkError(_json)){
                          return false;
                    }
                    this.set("user",_json)
                
                },this));
            },
             clearCache:function(){
                window.setTimeout(_.bind(this.removeAllCache,this),1000*60*30);
             },
             checkError:function(result){
                 var isError = false;
                 if(result && result[0] && result[0]=="err"){
                     isError = true;
                 }
                 return isError; 
             },
             autoLoadImages:function(){
                 var preLoadArray = ['img/trans_gray.png','img/recurring.gif','img/loading.gif','img/spinner-medium.gif','img/greenloader.gif','img/loader.gif']
                 $(preLoadArray).each(function() {
                    var image = $('<img />').attr('src', this);                    
                 });
             },
             resizeWorkSpace:function(){
                var body_size =  $('body').height()-90;                
                $(".workspace .ws-content").css("min-height",(body_size-100)); 
                $(".bDiv").css("height",body_size-397);          
				$("#campaigns_list .bDiv").css("height",body_size-300);      
                this.set("wp_height",(body_size-100));
				
				var subj_w = $('#campaign_subject').width();
				var fegb_w = $('#fecol3').width();
				$('#campaign_from_email_chosen').width(parseInt(subj_w-40));
             },
             openModule:function(obj){
                 alert($(obj.target).attr("id"));
             },
             showLoading:function(message, container){                 
                 if(message){
                    message = message!==true?message:'Loading...';
                    $(container).find('.loading').remove();
                    $(container).append('<div class="loading"><p>'+message+'</p></div>');
                 }
                 else{
                     $(container).find(' > .loading').remove();
                 }
             },
             showAlert:function(message, container, option){       
                 if(message){                    
                    var inlineStyle = (option && option.top) ? ('top:'+option.top) : '';
                    var fixed_position = (option && option.fixed)?"fixed":"";
                    var cl = 'error';
                    var title = 'Error';
                    if(option && option.type == 'caution')
                    {
                            cl = 'caution';
                            title = 'Caution';
                    }
                    var message_box = $('<div class="messagebox messagebox_ '+ cl +'" style='+inlineStyle+'><h3>'+ title +'</h3><p>'+message+'</p><a class="closebtn"></a></div> ');
                    $(container).append(message_box);
                    message_box.find(".closebtn").click(function(){
                      message_box.fadeOut("fast",function(){
                           $(this).remove();
                       }) 
                    });
                 }
             },
             showAlertDetail:function(message,container){
                 if(message){                                        
                    var dialogHTML = '<div class="overlay"></div><div class="messagebox messagebox_ delete"><h3>'+message.heading+'</h3>';                    
                    var btn = '<div class="btns"><a class="btn-red btn-ok"><span>Yes, Delete</span><i class="icon delete"></i></a><a class="btn-gray btn-cancel"><span>No, Cancel</span><i class="icon cross"></i></a></div><div class="clearfix"></div>';
                    dialogHTML += '<p>'+message.detail+'</p>'+btn+'</div>';
                    var dialog = $(dialogHTML);
                    $(container).append(dialog);
                    dialog.find(".btn-ok").click(function(){
                        dialog.fadeOut("fast",function(){
                           $(this).remove();
                        });
                        if(message.callback)
                                message.callback();
                    });		
                    
                    dialog.find(".btn-gray").click(function(){
                       dialog.fadeOut("fast",function(){
                           $(this).remove();
                       })
                    });
                 }
             },
             showLoginExpireAlert:function(message,container){
                 if(message){                                        
                    var dialogHTML = '<div class="overlay"><div class="messagebox caution"><h3>'+message.heading+'</h3>';                    
                    var btn = '<div class="btns"><a href="/pms/" class="btn-green btn-ok"><span>Login</span><i class="icon next"></i></a></div><div class="clearfix"></div>';
                    dialogHTML += '<p>'+message.detail+'</p>'+btn+'</div></div>';
                    $(container).append(dialogHTML);
                    $(".overlay .btn-ok").click(function(){
                            if(message.callback)
                                    message.callback();
                    });                    
                 }
             },
             showMessge:function(msg){
                 $(".global_messages p").html(msg);
                 $(".global_messages").show();
                 var marginLeft = $(".global_messages").width()/2;
                 $(".global_messages").css("margin-left", (-1*marginLeft)+"px");
                 $(".global_messages").hide();
                 $(".global_messages").slideDown("medium",function(){
                     setTimeout('$(".global_messages").hide()',4000);
                 });
                $(".global_messages .closebtn").click(function(){
                        $(".global_messages").fadeOut("fast",function(){
                                $(this).remove();						 
                        }) 
                 });
             },
             encodeHTML:function(str){
                str = str.replace(/:/g,"&#58;");
                str = str.replace(/\'/g,"&#39;");                
                str = str.replace(/=/g,"&#61;");
                str = str.replace(/\(/g,"&#40;");
                str = str.replace(/\)/g,"&#41;");
                str = str.replace(/</g,"&lt;");
                str = str.replace(/>/g,"&gt;");
                str = str.replace(/\"/g,"&quot;");
                return str;
             }
             ,
             decodeHTML:function(str,lineFeed){
                //decoding HTML entites to show in textfield and text area 				
                str = str.replace(/&#58;/g,":");
                str = str.replace(/&#39;/g,"\'");                
                str = str.replace(/&#61;/g,"=");
                str = str.replace(/&#40;/g,"(");
                str = str.replace(/&#41;/g,")");
                str = str.replace(/&lt;/g,"<");
                str = str.replace(/&gt;/g,">");
                str = str.replace(/&gt;/g,">"); 
                str = str.replace(/&#9;/g,"\t");
                str = str.replace(/&nbsp;/g," ");                 
                str = str.replace(/&quot;/g,"\"");
                if(lineFeed){
                    str = str.replace(/&line;/g,"\n");
                }
                return str;
            },
            getMMM:function(month){
              var monthNames = [
                "Jan", "Feb", "Mar",
                "Apr", "May", "Jun",
                "Jul", "Aug", "Sep",
                "Oct", "Nov", "Dec"
                ];  
                return monthNames[month];
            },
            getCampStatus:function(flag){
              // A=all, D=draft, S=scheduled, P=pending, C=completed  
              var status = 'Draf';
              if(flag=='A'){
                  status= 'All'
              }
              else if(flag=='D'){
                  status= 'Draft'
              }
              else if(flag=='P'){
                  status='Pending'
              }
              else if(flag=='C'){
                  status='Sent'
              }
			  else if(flag=='S'){
                  status='Scheduled'
              }
              return status;
            },
            showTags: function(tags){
				//alert(searchInputControl);
                var tag_array = tags.split(",");
                var tag_html ="<ul>";
                $.each(tag_array,function(key,val){
                    tag_html +="<li><a class='taglink'>"+val+"</a></li>";					
                });
                tag_html +="</ul>";
                return tag_html;
            },
			initSearch: function(obj,searchInput)
			{
				var target = $.getObj(obj,"a");
				searchInput.val(target.text());				
				searchInput.keyup();
			},
            setAppData:function(appVar,data){
                var _data = this.get("app_data");
                _data[appVar]= data;
            },
            getAppData:function(appVar){
               return this.get("app_data")[appVar];   
            },
            removeAllCache:function(){
                var cache = this.get("app_data");
                $.each(cache,function(k,v){
                    cache[k] = null;
                    delete cache[k];
                })                
                this.clearCache();
                console.log("Cache is cleared now time=" + (new Date()));
            },
            removeCache:function(key){
                var cache = this.get("app_data");
                cache[key] = null;
                delete cache[key];
            },
            getData:function(data){
              var app = this;                                
              jQuery.getJSON(data.URL,  function(tsv, state, xhr){
                    if(xhr && xhr.responseText){
                         var salesforce = jQuery.parseJSON(xhr.responseText);                                
                         if(app.checkError(salesforce)){
                             return false;
                         }                        
                        app.setAppData(data.key,salesforce);
						if(data.callback)
                        	data.callback();
                    }
                }).fail(function() { console.log( "error in "+data.key+" fields" ); });                  
            },
            showDialog:function(options){
                var dialog = new bmsDialog(options);                                
                $("body").append(dialog.$el);
                dialog.show();
               
                return dialog;
            },
            enableValidation:function(options)
            {
                if(options.controlcss)
                   options.control.attr('style',options.controlcss);				
                if(options.customfield)
                   options.customfield.attr('style',options.customfieldcss);				
                options.valid_icon.show();
                options.valid_icon.attr('data-content',options.message);
                options.valid_icon.popover({'placement':'right','trigger':'hover',delay: { show: 0, hide:0 },animation:false});								
            },
            disableValidation:function(options)
            {				
                    options.valid_icon.hide();
                    options.control.removeAttr('style');
                    if(options.customfield)
                            options.customfield.removeAttr('style');
            },
            validateEmail:function(emailVal)
            {
                    var email_patt = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
					//var email_patt = new RegExp("[A-Za-z0-9'_`-]+(?:\\.[A-Za-z0-9'_`-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])");
                    return email_patt.test(emailVal);
            },
            showError:function(params){
                if(params.control){
                    params.control.find(".inputcont").addClass("error");
                    params.control.find(".inputcont").append('<span class="errortext"><i class="erroricon"></i><em>'+ params.message +'</em></span>');					                    
                }
            },
            hideError:function(params){
                if(params.control){
                    params.control.find(".inputcont").removeClass("error");
                    params.control.find(".inputcont span.errortext").remove();					
                }
            },
            addCommas :function(nStr){
                    nStr += '';
                    var x = nStr.split('.');
                    var x1 = x[0];
                    var x2 = x.length > 1 ? '.' + x[1] : '';
                    var rgx = /(\d+)(\d{3})/;
                    while (rgx.test(x1)) {
                            x1 = x1.replace(rgx, '$1' + ',' + '$2');
                    }
                    return x1 + x2;
            },
            showInfo: function(control,message)
            {
                    control.append('<span class="fieldinfo"><i class="icon"></i><em>'+ message +'</em></span>');
            },
            setInfo:function(){
                if(this.get("user")){
                    var _user = this.get("user");
                    this.mainContainer.$(".user-name").html(_user.firstName +" "+ _user.lastName);
                    if(!_user.firstName && !_user.lastName){
                        this.mainContainer.$(".user-name").html(_user.firstName);
                    }
                }
                else{
                   window.setTimeout(_.bind(this.setInfo,this),200); 
                }
            }
	});

	return new App();

});
