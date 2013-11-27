define([
	'jquery', 'underscore', 'backbone','jquery.isotope','bootstrap','views/common/dialog'
], function ($, _, Backbone, isotope, bootstrap,bmsDialog) {
	'use strict';
	var App = Backbone.Model.extend({                
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
                            $(".ws-content.active").find(".camp_header .c-name h2").show();                        
                        }
                    });
                    
                   var self = this;                                                                         
                   var content_height = ($('body').height()-90);                   
                   //$('#container .content').css("min-height",content_height);
                   //$(".workspace .ws-content").css("height",(content_height-100));
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
                 //this.mainContainer.bmseditor.initEditor();
                 //this.loadAppData();                   
             },
             checkError:function(result){
                 var isError = false;
                 if(result && result[0] && result[0]=="err"){
                     isError = true;
                 }
                 return isError; 
             },
             autoLoadImages:function(){
                 var preLoadArray = ['img/trans_gray.png','img/recurring.gif','img/loading.gif','img/spinner-medium.gif','img/greenloader.gif']
                 $(preLoadArray).each(function() {
                    var image = $('<img />').attr('src', this);                    
                 });
             },
             resizeWorkSpace:function(){
                var body_size =  $('body').height()-90;
                /*if(body_size>=500){
                    $('#container .content').css("min-height",body_size);
                    $(".workspace .ws-content").css("height",(body_size-100));
                }*/
                $(".workspace .ws-content").css("min-height",(body_size-100)); 
                $(".bDiv").css("height",body_size-397);                
                this.set("wp_height",(body_size-100));
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
                     $(container).find('.loading').remove();
                 }
             },
             showAlert:function(message, container,option){       
                 if(message){                    
                    var inlineStyle = (option && option.top) ? ('top:'+option.top) : '';
                    var fixed_position = (option && option.fixed)?"fixed":"";
                    $(container).append('<div class="loading '+fixed_position+'"> <div class="tag_msg1" style='+inlineStyle+'><span class="caution"></span>'+message+'<a class="close-btn">X</a></div> </div>');
                    $(".loading .close-btn").click(function(){
                       $(".loading").fadeOut("fast",function(){
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
                 $(".global_message").html(msg);
                 $(".global_message").show();
                 var marginLeft = $(".global_message").width()/2;
                 $(".global_message").css("margin-left", (-1*marginLeft)+"px");
                 $(".global_message").hide();
                 $(".global_message").slideDown("medium",function(){
                     setTimeout('$(".global_message").hide()',2000);
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
            showTags: function(tags){
                var tag_array = tags.split(",");
                var tag_html ="";
                $.each(tag_array,function(key,val){
                    tag_html +="<a>"+val+"</a>";
                    if(key<tag_array.length-1){
                        tag_html +=", ";
                    }
                });
                return tag_html;
            },
            setAppData:function(appVar,data){
                var _data = this.get("app_data");
                _data[appVar]= data;
            },
            getAppData:function(appVar){
               return this.get("app_data")[appVar];   
            },
			getSalesForceStatus: function(callback)
			{
				var app = this;
				var retStatus = 0;
                var URL = "/pms/io/salesforce/getData/?BMS_REQ_TK="+this.get('bms_token')+"&type=status";
                jQuery.getJSON(URL,  function(tsv, state, xhr){
                    if(xhr && xhr.responseText){
                         var salesforce = jQuery.parseJSON(xhr.responseText);                                
                         if(app.checkError(salesforce)){
                             //return false;
                         }                        
                        app.setAppData("salesfocre",salesforce);
						callback();
						retStatus = 1;
                    }
              	}).fail(function() { console.log( "error in salesforce fields" ); });
				return retStatus;
			},
			getNetSuiteStatus: function(callback)
			{
				var app = this;
				var retStatus = 0;
				URL = "/pms/io/netsuite/getData/?BMS_REQ_TK="+this.get('bms_token')+"&type=status";
                jQuery.getJSON(URL,  function(tsv, state, xhr){
                    if(xhr && xhr.responseText){                        
                         var netstuite = jQuery.parseJSON(xhr.responseText);                                
                         if(app.checkError(netstuite)){
                             //return false;
                         }                        
                        app.setAppData("netsuite",netstuite);
						callback();
						retStatus = 1;
                    }
              	}).fail(function() { console.log( "error in salesforce fields" ); });
				return retStatus;
			},
            /*loadAppData:function(){
                var app = this;
                var URL = "/pms/io/salesforce/getData/?BMS_REQ_TK="+this.get('bms_token')+"&type=status";
                jQuery.getJSON(URL,  function(tsv, state, xhr){
                    if(xhr && xhr.responseText){                        
                         var salesforce = jQuery.parseJSON(xhr.responseText);                                
                         if(app.checkError(salesforce)){
                             return false;
                         }                        
                        app.setAppData("salesfocre",salesforce);                        
                    }
              }).fail(function() { console.log( "error in salesforce fields" ); });
              
              URL = "/pms/io/netsuite/getData/?BMS_REQ_TK="+this.get('bms_token')+"&type=status";
                jQuery.getJSON(URL,  function(tsv, state, xhr){
                    if(xhr && xhr.responseText){                        
                         var netstuite = jQuery.parseJSON(xhr.responseText);                                
                         if(app.checkError(netstuite)){
                             return false;
                         }                        
                        app.setAppData("netsuite",netstuite);                        
                    }
              }).fail(function() { console.log( "error in salesforce fields" ); });                                          
            }*/
            showDialog:function(options){
                var dialog = new bmsDialog(options);                
                
                $("body").append(dialog.$el);
                dialog.show();
                
                return dialog;
            }
             
	});

	return new App();

});
