define([
	'jquery', 'underscore', 'backbone','jquery.isotope','bootstrap','views/common/dialog'
], function ($, _, Backbone, isotope, bootstrap,bmsDialog) {
	'use strict';
	var App = Backbone.Model.extend({
		messages:[{'CAMP_subject_empty_error':'Subject can not be empty',
                            'CAMP_subject_length_error':'Subject can be 100 characters long',
                            'CAMP_fromname_empty_error':'From name can not be empty',
                            'CAMP_replyto_empty_error':'Reply to field can not be empty',
                            'CAMP_replyto_format_error':'Please supply correct format',
                            'CAMP_defaultreplyto_format_error':'Please supply correct email',
                            'CAMP_defaultreplyto_empty_error':'Reply to email can not be empty',
                            'CAMP_defaultfromname_empty_error': 'Default From Name cann\'t be empty',
                            'SF_userid_empty_error':'User id can not be empty',
                            'SF_userid_format_error':'Please supply correct user id',
                            'SF_pwd_empty_error':'Password can not be empty',				   
                            'SF_email_format_error':'Please supply correct email',
                            'NS_userid_empty_error':'User id can not be empty',
                            'NS_userid_format_error':'Please supply correct user id',
                            'NS_pwd_empty_error':'Password can not be empty',
                            'NS_accid_empty_error':'Account id can not be empty',
                            'NS_email_format_error':'Please supply correct email',
                            'CT_copyname_empty_error':'Copy name can not be empty',
                            'MAPDATA_newlist_empty_error':'List can not be empty',
                            'MAPDATA_extlist_empty_error':'Please select some list',
                            'MAPDATA_email_format_error':'Please select correct email',
                            'TRG_basic_no_field':'Please select a field to make filter',
                            'TRG_basic_no_matchvalue':'Please provide match field value',
                            'TRG_score_novalue' : 'Please provide score value',
                            'TRG_form_noform' : 'Please select a form.',
							'CRT_tarname_empty_error' : 'Target name can not be empty',
							'CAMPS_campname_empty_error' : 'Campaign name can not be empty'
		}],
		initialize: function () {
			//Load config or use defaults
			this.set(_.extend({
				env: 'developement',
				bms_token: $.getUrlVar(false,'BMS_REQ_TK'),
				host: window.location.hostname,
				session: null,
                                app_data : {}
			}, window.sz_config || {}));
					
			//Convenience for accessing the app object in the console
			if (this.get('env') != 'production') {
                            window.BRIDGEMAIL = this;
			}
		},

		start: function (Router, MainContainer, callback) {
			//Create the router
			this.router = new Router('landing');    
			//Wait for DOM to be ready
			$(_.bind(function () {
                                //Create the main container
				this.mainContainer = new MainContainer();				              
                                
                                //attaching main container in body                                
                                $('body').append(this.mainContainer.$el);
                                this.initScript();                                
				//call the callback
				(callback || $.noop)();
			}, this));
		},
                initScript:function(){
                    
                    this.autoLoadImages();
                    var $tiles = $('#tiles');            
                    // add randomish size classes
                    $tiles.find('.box').each(function(){
                      var $this = $(this),
                          number = parseInt( $this.find('.number').text(), 10 );
                      if ( number % 7 % 2 === 1 ) {
                        $this.addClass('width2');
                      }
                      if ( number % 3 === 0 ) {
                        $this.addClass('height2');
                      }
                    });

                    $tiles.isotope({
                      itemSelector: '.box',
                      masonry : {
                        columnWidth : 120
                      }
                    });
                    // change size of clicked box
                    $tiles.delegate( '.box', 'click', function(){
                      var expanded = $("#tiles .box.expand");  
                      if(!$(this).hasClass("expand")){
                        $(expanded).removeClass('expand');
                        $(this).addClass('expand');
                       
                      }
                      else{
                         $(this).removeClass('expand'); 
                      }
                      $tiles.isotope('reLayout');                      
                    });
                    // toggle variable sizes of all boxs
                    $('#toggle-sizes').find('a').click(function(){
                      $tiles
                        .toggleClass('variable-sizes')
                        .isotope('reLayout');
                      return false;
                    });
                    
                    $("body").click(function(){
                       $(".custom_popup").hide(); 
                       $("#camp_tags").removeClass("active");
                       $(".tooltip-inner").parents(".tooltip").remove();
                       var getCmpField = $(".ws-content.active #header_wp_field");
                       if(getCmpField.attr("process-id")){
                            $(".ws-content.active").find(".camp_header .c-name .edited").hide();                        
                            $(".ws-content.active").find(".camp_header .c-name h2,#campaign_tags").show();                                                    
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
                            messageObj["login"] = "<a class='btn-gray' href='/pms/'>Login</a>";
                            _app.showAlertDetail(messageObj,$("body"));
                            return false;
                           }
                       }
                   });
                   
                   //Cache Clear time set
                   this.clearCache();
                 
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
             showAlert:function(message, container,option){       
                 if(message){                    
                    var inlineStyle = (option && option.top) ? ('top:'+option.top) : '';
                    var fixed_position = (option && option.fixed)?"fixed":"";
                    $(container).append('<div class="overlay '+fixed_position+'"> <div class="messagebox caution" style='+inlineStyle+'><h3>Caution</h3><p>'+message+'</p><a class="closebtn"></a></div> </div>');
                    $(".overlay .closebtn").click(function(){
                       $(".overlay").fadeOut("fast",function(){
                           $(this).remove();
                       }) 
                    });
                 }
             },
             showAlertDetail:function(message,container){
                 if(message){                                        
                    var dialogHTML = '<div class="overlay"> <div class="tag_msg1"><span class="caution"></span>'+message.heading;                    
                    var btn = message.login ? message.login :'<a class="btn-gray">Close</a>';
                    dialogHTML += '<p>'+message.detail+'</p>'+btn+'</div></div>';
                    $(container).append(dialogHTML);
                    $(".overlay .btn-gray").click(function(){
                       $(".overlay").fadeOut("fast",function(){
                           $(this).remove();
                       })
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
                     setTimeout('$(".global_messages").hide()',2000);
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
                  status='Completed'
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
                    return email_patt.test(emailVal);
            },
            showError:function(params){
                if(params.control){
                    params.control.find(".inputcont").addClass("error")
                    params.control.find(".error-mark").attr('data-content',params.message);
                    params.control.find(".error-mark").popover({'placement':'right','trigger':'hover',delay: { show: 0, hide:0 },animation:false});	
                }
            },
            hideError:function(params){
                if(params.control){
                    params.control.find(".inputcont").removeClass("error")                    
                }
            }
	});

	return new App();

});
