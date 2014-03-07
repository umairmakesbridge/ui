define(['jquery.bmsgrid','jquery.highlight','jquery.searchcontrol','text!html/campaigns.html','bms-filters','daterangepicker'],
function (bmsgrid,jqhighlight,jsearchcontrol,template,bmsfilters,_daterangepicker) {
        'use strict';
        return Backbone.View.extend({
			id: 'campaigns_list',
			tags : 'div',
			events: {				
                            "click #addnew_campaign":function(){             		
                                    this.createCampaign();
                            },
                            "keyup #daterange":function(){
                                    this.$el.find('#clearcal').show();
                            },
                            "click #clearcal":function(obj){
                                    this.$el.find('#clearcal').hide();
                                    this.$el.find('#daterange').val('');
                                    this.findCampaigns(obj);
                            },
                            "click #camps_grid .btn-gray, .name-type .Editable":function(obj){
                                    var camp_obj = this;
                                    var target = $.getObj(obj,"a");
                                    if(target.attr("id")){
                                        camp_obj.app.mainContainer.openCampaign(target.attr("id"));
                                    }
                            },
                            "click #camps_grid .btn-red":function(obj){
                                var camp_obj = this;
                                var appMsgs = camp_obj.app.messages[0];
                                var target = $.getObj(obj,"a");
                                if(target.attr("id")){
                                        camp_obj.app.showAlertDetail({heading:'Confirm Deletion',
                                        detail:appMsgs.CAMPS_delete_confirm_error,                                                
                                        callback: _.bind(function(){
                                                camp_obj.$el.parents(".ws-content.active").find(".overlay").remove();
                                                camp_obj.deleteCampaign(target.attr("id"));
                                        },camp_obj)},
                                        camp_obj.$el.parents(".ws-content.active"));
                                            /*$(".overlay .btn-ok").click(function(){
                                                    $(".overlay").remove();
                                               camp_obj.deleteCampaign(target.attr("id"));
                                            });*/
                                }
                            },
                            "click #camps_grid .btn-preview, #camps_grid a.notEditable":function(obj){
                                    var camp_obj = this;
                                    var target = $.getObj(obj,"a");
                                    if(target.attr("id")){
                                            camp_obj.previewCampaign(target.attr("id"),target.parents('tr').find('.name-type h3 a').html());
                                    }
                            },
                            "click #camps_grid .btn-copy":function(obj){
                                    var camp_obj = this;
                                    var target = $.getObj(obj,"a");
                                    if(target.attr("id")){
                                            camp_obj.copyCampaign(target.attr("id"));
                                    }
                            },
                            "click #camps_grid .btn-schedule,#camps_grid .btn-reschedule":function(obj){
                                    var camp_obj = this;
                                    var target = $.getObj(obj,"a");
                                    if(target.attr("id")){
                                            camp_obj.app.mainContainer.openCampaign(target.attr("id"));
                                    }
                            },
                            "click .stattype":function(obj){					
                                    var camp_obj = this;
                                    var appMsgs = this.app.messages[0];
                                    var target = $.getObj(obj,"a");
                                    camp_obj.$el.find('.stattype').parent().removeClass('active');
                                    target.parent().addClass('active');
                                    var type = target.attr("search");
                                    var schDates = '';
                                    if(this.$('#daterange').val() != '')
                                    {
                                            schDates = this.$('#daterange').val().split(' - ');
                                            if(schDates != '' && schDates.length == 1)
                                            {
                                                    schDates[1] = schDates[0];
                                            }
                                    }
                                    var dateURL = ""
                                    if(schDates)
                                    {
                                            var fromDateParts = schDates[0].split('/');
                                            var fromDate = fromDateParts[0] + '-' + fromDateParts[1] + '-' + fromDateParts[2].substring(2,4);
                                            var toDateParts = schDates[1].split('/');
                                            var toDate = toDateParts[0] + '-' + toDateParts[1] + '-' + toDateParts[2].substring(2,4);
                                            var dateURL = "fromDate="+fromDate+"&toDate="+toDate;
                                    }
                                    camp_obj.$el.find("#target-camps .bmsgrid").remove();
                                    camp_obj.app.showLoading("Loading Campaigns...",camp_obj.$("#target-camps"));

                                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+camp_obj.app.get('bms_token')+"&type=listNormalCampaigns&offset=0&status="+type+"&"+dateURL;				
                                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                                            camp_obj.app.showLoading(false,camp_obj.$("#target-camps"));
                                            if(xhr && xhr.responseText){
                                                     var camps = jQuery.parseJSON(xhr.responseText);                                
                                                     camp_obj.$el.find('#total_templates .badge').html(camps.count);
                                                     if(camps.count > 0){
                                                            camp_obj.app.removeCache("campaigns");                      
                                                            camp_obj.app.setAppData('campaigns',camps);							
                                                            camp_obj.createListTable();
                                                     }
                                                     else
                                                    {
                                                            camp_obj.$el.find('#target-camps').html('<p class="notfound">'+ appMsgs.CAMPS_name_empty_error +'</p>');
                                                    }
                                            }
                                            else
                                            {
                                                    camp_obj.$el.find('#target-camps').html('<p class="notfound">'+ appMsgs.CAMPS_name_empty_error +'</p>');
                                            }
                                    });
                            },
                            "click .btn-draft":function(obj){
                                var camp_obj = this;
                                var target = $.getObj(obj,"a");
                                var camp_id = target.attr("id");
                                var URL = '/pms/io/campaign/saveCampaignData/?BMS_REQ_TK='+camp_obj.app.get('bms_token');
                                camp_obj.app.showLoading("Changing Campaign to Draft...",camp_obj.$el.parents(".ws-content.active"));
                                var camp_json = '';
                                $.post(URL, {type:'saveStep4',campNum:camp_id,status:'D'})
                                .done(function(data) {
                                        camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content.active"));
                                        camp_json = jQuery.parseJSON(data);
                                        if(camp_json[0] == 'err')
                                        {
                                                camp_obj.app.showAlert(camp_json[1],camp_obj.$el.parents(".ws-content.active"));
                                        }
                                        else
                                        {
                                                var appMsgs = camp_obj.app.messages[0];
                                                camp_obj.app.showMessge(appMsgs.CAMP_draft_success_msg);							
                                                camp_obj.app.mainContainer.openCampaign(camp_id);
                                        }
                                });					
                            },
                            "click .btnDone":function(obj)
                            {
                                    var camp_obj = this;
                                    var target = $.getObj(obj,"a");
                                    var targetText = target.html();
                                    switch(targetText)
                                    {
                                            case "Yesterday":
                                                    var schDates = this.$('#daterange').val().split(' - ');
                                                    break;
                                            case "Today":
                                                    var schDates = this.$('#daterange').val().split(' - ');
                                                    break;
                                            case "Last 7 days":
                                                    var schDates = this.$('#daterange').val().split(' - ');
                                                    break;
                                            case "Last 30 Days":
                                                    var schDates = this.$('#daterange').val().split(' - ');
                                                    break;
                                            default:
                                                    var schDates = this.$('#daterange').val().split(' - ');
                                                    break;
                                    }					
                                    var fromDateParts = schDates[0].split('/');
                                    var fromDate = fromDateParts[0] + '-' + fromDateParts[1] + '-' + fromDateParts[2].substring(2,4);
                                    var toDateParts = schDates[1].split('/');
                                    var toDate = toDateParts[0] + '-' + toDateParts[1] + '-' + toDateParts[2].substring(2,4);
                                    var type = camp_obj.$('ul#template_search_menu li.active a').attr('search');
                                    if(!type)
                                            type = 'A';
                                    camp_obj.$el.find("#target-camps .bmsgrid").remove();
                                    camp_obj.app.removeCache("campaigns");
                                    camp_obj.app.showLoading("Loading Campaigns...",camp_obj.$("#target-camps"));
                                    camp_obj.app.getData({
                                            "URL":"/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+camp_obj.app.get('bms_token')+"&type=listNormalCampaigns&offset=0&status="+type+"&fromDate="+fromDate+"&toDate="+toDate,
                                            "key":"campaigns",
                                            "callback":_.bind(camp_obj.createListTable,camp_obj)
                                    });
                            }
                            ,
                            "click .calendericon":function(obj)
                            {
                                    this.$el.find('#daterange').click();
                                    return false;
                            },
                            "click .cstats .closebtn":"closeChart"
			},			
			previewCampaign: function(camp_id,camp_name)
			{
				var camp_obj = this;
				var appMsgs = this.app.messages[0];				
				var dialog_width = $(document.documentElement).width()-60;
				var dialog_height = $(document.documentElement).height()-182;
				var dialog = camp_obj.app.showDialog({title:'Campaign Preview of &quot;' + camp_name + '&quot;' ,
						  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
						  headerEditable:false,
						  headerIcon : 'dlgpreview',
						  bodyCss:{"min-height":dialog_height+"px"},
                                                  buttons: {saveBtn:{text:'Email Preview',btnicon:'copycamp'} }
				});	
				camp_obj.app.showLoading("Loading Campaign HTML...",dialog.getBody());									
                                var preview_url = "https://"+this.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+camp_id+"&html=Y&original=N";                                
                                var preview_iframe = $("<iframe class=\"email-iframe\" style=\"height:"+dialog_height+"px\" frameborder=\"0\" src=\""+preview_url+"\"></iframe>");                                                            
				dialog.getBody().html(preview_iframe);
                                dialog.saveCallBack(_.bind(this.sendTextPreview,this,camp_id));
											
			},
			sendTextPreview:function(camp_id){
				var camp_obj = this;
				var dialog_width = 650;
				var dialog_height = 100;
				var dialog = camp_obj.app.showDialog({title:'Email Preview' ,
                                        css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20%"},
                                        headerEditable:false,
                                        headerIcon : 'copycamp',
                                        bodyCss:{"min-height":dialog_height+"px"},
                                        buttons: {saveBtn:{text:'Send',btnicon:'copycamp'} }
				});	
				var email_preview ='<div style=" min-height:100px;"  class="clearfix template-container gray-panel" id="create-template-container">';
                                    email_preview +='<div class="cont-box" style="margin-top:10px; top:0; left:56%; width:90%;">';
                                    email_preview +='<div class="row campname-container">';
                                    email_preview +='<label style="width:10%;">To:</label>';
                                    email_preview +='<div class="inputcont" style="text-align:right;">';
                                    email_preview +='<input type="text" name="_email" id="send_email" placeholder="Enter comma separated email addresses" style="width:83%;" />';
                                    email_preview +='</div></div></div></div>';
                                    email_preview = $(email_preview);                                
                                    dialog.getBody().html(email_preview);
                                    email_preview.find("#send_email").focus();
                                    email_preview.find("#send_email").keydown(_.bind(function(e){
                                            if(e.keyCode==13){
                                                    this.sendTestCampaign(dialog,camp_id);
                                            }
                                    },this))
                                    dialog.saveCallBack(_.bind(this.sendTestCampaign,this,dialog,camp_id));
			},
			sendTestCampaign:function(dialog,camp_id){
				var _this = this;
				var _emails = dialog.$el.find("#send_email").val();
				if(_emails){
					var post_data = {toEmails:_emails};                            
					this.app.showLoading("Sending Email...",dialog.$el);
					var _this = this;
					var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&campNum="+camp_id+"&type=email";
					$.post(URL, post_data)
					.done(function(data) {                                 
						   var _json = jQuery.parseJSON(data);                         
						   _this.app.showLoading(false,dialog.$el);          
						   if(_json[0]!=="err"){
							   dialog.hide();
							   _this.app.showMessge("Email sent successfully!");  
						   }
						   else{
							   _this.app.showAlert(_json[1],$("body"),{fixed:true}); 
						   }
				   });
			   }
			},
			deleteCampaign: function(camp_id)
			{
                            var camp_obj = this;
                            var appMsgs = this.app.messages[0];
                            var URL = '/pms/io/campaign/saveCampaignData/?BMS_REQ_TK='+camp_obj.app.get('bms_token');
                            camp_obj.app.showLoading("Deleting Campaign...",camp_obj.$el.parents(".ws-content.active"));
                            $.post(URL, {type:'delete',campNum:camp_id})
                            .done(function(data) {                                 
                                var del_camp_json = jQuery.parseJSON(data);  
                                /*if(camp_obj.app.checkError(del_camp_json)){
                                               return false;
                                }*/
                                if(del_camp_json[0]!=="err"){
                                        camp_obj.app.showMessge(appMsgs.CAMPS_delete_success_msg);
                                        camp_obj.$el.find("#area_copy_campaign .bmsgrid").remove();
                                        camp_obj.app.removeCache("campaigns");
                                        camp_obj.getallcampaigns();
                                        var wp_id = $("#wstabs li[workspace_id=campaign_"+camp_id+"]").attr('id').split("_")[2];
                                        $("#wp_li_"+wp_id+",#workspace_"+wp_id).remove();
                                }
                                else{
                                             camp_obj.app.showAlert(del_camp_json[1],camp_obj.$el.parents(".ws-content.active"));							
                                }
                                camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content.active"));					   
                            });
			},
			createCampaign: function()
			{
                            var camp_obj = this;
                            var dialog_title = "New Campaign";
                            var dialog = this.app.showDialog({title:dialog_title,
                                              css:{"width":"650px","margin-left":"-325px"},
                                              bodyCss:{"min-height":"100px"},							   
                                              headerIcon : 'new_headicon',
                                              buttons: {saveBtn:{text:'Create Campaign'} }                                                                           
                            });
                            this.app.showLoading("Loading...",dialog.getBody());
                            require(["newcampaign"],function(newcampPage){                                     
                                             var mPage = new newcampPage({camp:camp_obj,app:camp_obj.app,newcampdialog:dialog});
                                             dialog.getBody().html(mPage.$el);
                                             dialog.saveCallBack(_.bind(mPage.createCampaign,mPage));
                            });
			},
			copyCampaign: function(camp_id)
			{
                            var camp_obj = this;
                            var dialog_title = "Copy Campaign";
                            var dialog = this.app.showDialog({title:dialog_title,
                                              css:{"width":"600px","margin-left":"-300px"},
                                              bodyCss:{"min-height":"260px"},							   
                                              headerIcon : 'copycamp',
                                              buttons: {saveBtn:{text:'Create Campaign'} }                                                                           
                            });
                            this.app.showLoading("Loading...",dialog.getBody());
                            require(["copycampaign"],function(copycampaignPage){                                     
                                             var mPage = new copycampaignPage({camp:camp_obj,camp_id:camp_id,app:camp_obj.app,copycampsdialog:dialog});
                                             dialog.getBody().html(mPage.$el);
                                             dialog.saveCallBack(_.bind(mPage.copyCampaign,mPage));
                            });
			},
			findCampaigns: function(obj)
			{
				var camp_obj = this;
				var appMsgs = this.app.messages[0];
				var target = $.getObj(obj,"a");
				if(target.html() != 'Date Range')
				{
                                    if(target.prevObject && target.prevObject[0].localName == 'span')
                                    {
                                        target = $.getObj(obj,"span");
                                        camp_obj.$el.find('.stattype').parent().removeClass('active');
                                        switch(target.attr("search"))
                                        {
                                                case "C":
                                                        camp_obj.$el.find('.sent').parent().addClass('active');
                                                        break;
                                                case "P":
                                                        camp_obj.$el.find('.pending').parent().addClass('active');
                                                        break;
                                                case "S":
                                                        camp_obj.$el.find('.scheduled').parent().addClass('active');
                                                        break;
                                                case "D":
                                                        camp_obj.$el.find('.draft').parent().addClass('active');
                                                        break;
                                        }						
                                    }
                                    var dateStart = target.attr('dateStart');
                                    var dateEnd = target.attr('dateEnd');
                                    var schDates = [];
                                    if(dateStart)
                                    {					
                                            schDates[0] = $.datepicker.formatDate( 'm/d/yy', Date.parse(dateStart) );
                                            schDates[1] = $.datepicker.formatDate( 'm/d/yy', Date.parse(dateEnd) );
                                    }
                                    else
                                    {
                                            schDates = this.$('#daterange').val().split(' - ');
                                            if(schDates != '' && schDates.length == 1)
                                            {
                                                    schDates[1] = schDates[0];
                                            }
                                    }
                                    if(schDates != '')
                                    {
                                            var fromDateParts = schDates[0].split('/');
                                            var fromDate = fromDateParts[0] + '-' + fromDateParts[1] + '-' + fromDateParts[2].substring(2,4);
                                            var toDateParts = schDates[1].split('/');
                                            var toDate = toDateParts[0] + '-' + toDateParts[1] + '-' + toDateParts[2].substring(2,4);
                                    }
                                    var type = target.attr("search");
                                    if(!type)
                                            type = $('#template_search_menu li.active a').attr('search');
                                    if(target.attr('class') == 'stattype topbadges')
                                    {
                                            camp_obj.$el.find('#template_search_menu li').removeClass('active');
                                            $('#template_search_menu').find("li").each(function(i) {
                                                    if($(this).find('a').attr('search') == type)
                                                            $(this).addClass('active');							
                                            });
                                    }
                                    camp_obj.$el.find("#target-camps .bmsgrid").remove();
                                    camp_obj.app.showLoading("Loading Campaigns...",camp_obj.$("#target-camps"));				
                                    if(schDates != '')
                                            var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+camp_obj.app.get('bms_token')+"&type=listNormalCampaigns&offset=0&status="+type+"&fromDate="+fromDate+"&toDate="+toDate;
                                    else
                                            var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+camp_obj.app.get('bms_token')+"&type=listNormalCampaigns&offset=0&status="+type;
                                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                                            camp_obj.app.showLoading(false,camp_obj.$("#target-camps"));
                                            if(xhr && xhr.responseText){
                                                     var camps = jQuery.parseJSON(xhr.responseText);                                
                                                     camp_obj.$el.find('#total_templates .badge').html(camps.count);
                                                     if(camps.count > 0){
                                                            camp_obj.app.removeCache("campaigns");                      
                                                            camp_obj.app.setAppData('campaigns',camps);							
                                                            camp_obj.createListTable();
                                                     }
                                                     else
                                                    {
                                                            camp_obj.$el.find('#target-camps').html('<p class="notfound">'+ appMsgs.CAMPS_name_empty_error +'</p>');
                                                    }
                                            }
                                            else
                                            {
                                                    camp_obj.$el.find('#target-camps').html('<p class="notfound">'+ appMsgs.CAMPS_name_empty_error +'</p>');
                                            }
                                    });
                            }
			},
			initialize:function(){
			   this.template = _.template(template);			   
			   this.render();
			},
			render: function () 
			{
                            this.$el.html(this.template({}));
                            this.app = this.options.app;
                            var camp_obj = this;
                            camp_obj.getallcampaigns();
                            camp_obj.$el.find('div#campslistsearch').searchcontrol({
                                    id:'list-search',
                                    width:'300px',
                                    height:'22px',
                                    placeholder: 'Search Campaigns',
                                    gridcontainer: 'camps_grid',
                                    showicon: 'yes',
                                    iconsource: 'campaigns',
                                    countcontainer: 'no_of_camps'
                             });				 
                             camp_obj.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
			},
			init:function(){				
                            this.$el.find('#daterange').daterangepicker();
                            $(".btnDone").click(_.bind(this.findCampaigns,this));
                            $(".ui-daterangepicker li a").click(_.bind(function(obj){
                                    this.$el.find('#clearcal').show();
                                    this.findCampaigns(obj);
                            },this));
                            $("#daterange").keyup(_.bind(function(obj){
                                    this.$el.find('#clearcal').show();
                                    this.findCampaigns(obj);
                            },this));
                             var camp_obj = this;
                             var active_ws = this.$el.parents(".ws-content");
                             var header_title = active_ws.find(".camp_header .edited  h2");                 
                             active_ws.find("#addnew_action").attr("data-original-title","Add new Campaign").click(_.bind(this.createCampaign,this));
                             var URL = '/pms/io/campaign/getCampaignData/?BMS_REQ_TK='+camp_obj.app.get('bms_token');				  
                             $.post(URL, {type:'allStats'})
                              .done(function(data) {
                                    var allStats = jQuery.parseJSON(data);  
                                    if(camp_obj.app.checkError(allStats)){
                                                   return false;
                                    }
                                    var header_title = active_ws.find(".camp_header .edited");
                                    var stats = '<ul class="c-current-status">';
                                    stats += '<li><span class="badge pclr18 stattype topbadges" tabindex="-1" search="C">'+ allStats['sent'] +'</span>Sent</li>';
                                    stats += '<li><span class="badge pclr6 stattype topbadges" tabindex="-1" search="P">'+ allStats['pending'] +'</span>Pending</li>';
                                    stats += '<li><span class="badge pclr2 stattype topbadges" tabindex="-1" search="S">'+ allStats['scheduled'] +'</span>Scheduled</li>';
                                    stats += '<li><span class="badge pclr1 stattype topbadges" tabindex="-1" search="D">'+ allStats['draft'] +'</span>Draft</li>';
                                    stats += '</ul>';							
                                    header_title.append(stats);
                                    $(".c-current-status li span").click(_.bind(camp_obj.findCampaigns,camp_obj));
                                             //header_title.find(".c-current-status li a").click(_.bind(camp_obj.$el.find('.stattype').click(),camp_obj));
                             });
                            this.current_ws = this.$el.parents(".ws-content");
                            this.tagDiv = this.current_ws.find("#campaign_tags");
                            this.tagDiv.hide();    
			},
			getallcampaigns: function () {
                            this.$el.find("#target-camps .bmsgrid").remove();				                               				
                            if(!this.app.getAppData("campaigns")){
                                    this.app.showLoading("Loading Campaigns...",this.$("#target-camps"));                                    
                                    this.app.getData({
                                            "URL":"/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=listNormalCampaigns&offset=0", // For Online Repo
                                            //"URL":"/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=listNormalCampaigns&offset=131&bucket=20", // for Abdullah local
                                            "key":"campaigns",
                                            "callback":_.bind(this.createListTable,this)
                                    });
                             }
                             else{
                                     this.app.showLoading("Loading Campaigns...",this.$("#target-camps"));                                       
                                     window.setTimeout(_.bind(this.createListTable,this),500);
                             }
			},
			createListTable: function () {
                            var camp_obj = this;				
                            var camp_list_json = this.app.getAppData("campaigns");
                            var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="camps_grid"><tbody>';				
                            if(camp_list_json.count!=="0"){
                                    $.each(camp_list_json.campaigns[0], function(index, val) {
                                                    list_html += camp_obj.makecamprows(val);					
                                    });	

                                    list_html += '</tbody></table>';
                                    this.app.showLoading(false,camp_obj.$el.find("#target-camps"));
                                    this.$el.find("#target-camps").html(list_html);

                                    this.$("#camps_grid").bmsgrid({
                                        useRp : false,
                                        resizable:false,
                                        colresize:false,
                                        lazyLoading:_.bind(this.appendCampaigns,this),
                                        //height:this.app.get('wp_height')-122,
                                        height:'100%',
                                        usepager : false,
                                        colWidth : ['100%','70px','140px']
                                    });
                                    this.$("#camps_grid tr td:nth-child(1)").attr("width","100%");
                                    this.$("#camps_grid tr td:nth-child(2)").attr("width","90px");
                                    this.$("#camps_grid tr td:nth-child(3)").attr("width","140px");
                                    this.$("#camps_grid tr .showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                                    this.$("#camps_grid tr td:nth-child(1) .report").click(_.bind(this.showChart,this))
                            }
                            else
                                    this.$("#area_copy_campaign .bmsgrid").remove();
                            var camp_count_lable = '';				
                            if(parseInt(camp_list_json.count)==parseInt(camp_list_json.totalCount)){
                                    this.$("#camps_grid tr:last-child").removeAttr("data-load");
                            }
                            this.$el.find("#total_templates .badge").html(camp_list_json.totalCount);
                            this.app.showLoading(false,this.$("#target-camps"));
                            this.$el.find(".taglink").click(_.bind(function(obj){
                                camp_obj.app.initSearch(obj,this.$el.find("#list-search"));
                            },this));                                
			},			
			makecamprows: function (val,extraDiv){
				var camp_obj = this;				
                                var start_div ="", end_div = "";
                                if(extraDiv){
                                    start_div = "<div>";
                                    end_div = "</div>";
                                }
				var flag_class = '';
				if(val[0].status == 'D')
					flag_class = 'pclr1';
				else if(val[0].status == 'P')
					flag_class = 'pclr6';
				else if(val[0].status == 'S')
					flag_class = 'pclr2';
				else if(val[0].status == 'C')
					flag_class = 'pclr18';
				var row_html = '<tr id="row_'+val[0]['campNum.encode']+'">';
				var chartIcon = '';
				var editClass = 'notEditable';
				if(val[0].status == 'P' || val[0].status == 'C')
				{
					chartIcon = '<div class="campaign_stats showtooltip" title="Click to View Chart"><a class="icon report"></a></div>';
				}
				if(val[0].status == 'D' || val[0].status == 'S')
				{
					editClass = 'Editable';
				}
				else if(val[0].status == 'C' || val[0].status == 'P')
				{
					editClass = 'notEditable';
				}
				row_html += '<td class="firstcol">'+start_div+'<div class="name-type"><h3><a id="'+ val[0]['campNum.encode'] +'" class="campname '+ editClass +'">'+ val[0].name +'</a><a class="cstatus '+flag_class+'">'+this.app.getCampStatus(val[0].status)+'</a>'+ chartIcon +'</h3>   <div class="tags tagscont">'+ this.app.showTags(val[0].tags) +'</div></div>'+end_div+'</td>';
				var datetime = '';
				var dtHead = '';
				if(val[0].status != 'D')
				{
					dtHead = '<em>Schedule Date</em>';
					datetime = val[0].scheduledDate;
				}
				else
				{
					dtHead = '<em>Updation Date</em>';
					if(val[0].updationDate)
						datetime = val[0].updationDate;
					else
						datetime = val[0].creationDate;
				}
				if(datetime)
				{
					var date = datetime.split(' ');
					var dateparts = date[0].split('-');					
					var month = camp_obj.app.getMMM(dateparts[1].replace('0','')-1);
					var dateFormat = dateparts[2] + ' ' + month + ', ' + dateparts[0];
				}
				else{
					dateFormat = '';					
                                     }   
                                //row_html += '<td>'+start_div+'<div class="time show" style="min-width:90px">'+this.app.getCampStatus(val[0].status)+'</div>'+end_div+'</td>';     
				if(val[0].status != 'D')
					row_html += '<td>'+start_div+'<div class="subscribers show" style="min-width:60px"><strong><span><em>Sent</em>'+val[0].sentCount+'</span></strong></div>'+end_div+'</td>';
				else
					row_html += '<td>'+start_div+''+end_div+'</td>';
				var action_button = '';
				var btns = '';
				switch(val[0].status)
				{					
					case 'D':
						btns = 'DL,P,C,S,E';
						break;					
					case 'S':
						btns += 'DL,P,C,R,DR';
						break;
					case 'C':
						btns += 'DL,P,C';
						break;
					case 'P':
						btns += 'P,C';
						break;
				} 
				action_button = camp_obj.drawButtons(btns,val[0]['campNum.encode']);
				var timeshow = '';
				if(dateFormat != '')
					timeshow = '<div class="time show" style="width:105px"><strong><span>'+ dtHead + dateFormat +'</span></strong></div>';
				row_html += '<td>'+start_div+ timeshow +'<div id="'+ val[0]['campNum.encode'] +'" class="action">'+ action_button +'</div>'+end_div+'</td>';					
				row_html += '</tr>';
				return row_html;
			},
			drawButtons: function(buttons,camp_id){
				var btnsArray = [];
				btnsArray["DL"] = '<a id="'+ camp_id +'" class="btn-red"><i class="icon delete"></i></a>';
				btnsArray["P"] = '<a id="'+ camp_id +'" class="btn-blue btn-preview"><span>Preview</span><i class="icon preview3"></i></a>';
				btnsArray["C"] = '<a id="'+ camp_id +'" class="btn-green btn-copy"><span>Copy</span><i class="icon copy"></i></a>';
				btnsArray["S"] = '<a id="'+ camp_id +'" class="btn-green btn-schedule"><span>Schedule</span><i class="icon time2"></i></a>';
				btnsArray["E"] = '<a id="'+ camp_id +'" class="btn-gray btn-edit"><span>Edit</span><i class="icon edit"></i></a>';
				btnsArray["R"] = '<a id="'+ camp_id +'" class="btn-green btn-reschedule"><span>Reschedule</span><i class="icon time2"></i></a>';
				btnsArray["DR"] = '<a id="'+ camp_id +'" class="btn-blue btn-draft"><span>Draft</span><i class="icon time2"></i></a>';
				
				var buttons = buttons.split(',');
				var btns = '';
				for(var i=0; i<buttons.length; i++)
				{
					btns += btnsArray[buttons[i]];
				}
				return btns;
			},
			appendCampaigns:function(){
                            var camp_list_json = this.app.getAppData("campaigns");                            
                            if(camp_list_json){
                                var camp_obj = this;
                                var new_offset = camp_list_json.offset ? (camp_list_json.offset + 50): 50 ;
                                var list_html = "";
                                var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=listNormalCampaigns&offset="+new_offset;
                                jQuery.getJSON(URL,  function(tsv, state, xhr){
                                if(xhr && xhr.responseText){
                                         var campaigns = jQuery.parseJSON(xhr.responseText);                                
                                         if(camp_obj.app.checkError(campaigns)){
                                                 return false;
                                         }               
                                         var row_no =1;
                                         camp_obj.$("#target-camps .footer-loading").remove();
                                         camp_list_json.offset = new_offset;
                                         $.each(campaigns.campaigns[0], function(index, val) {
                                                        list_html = $(camp_obj.makecamprows(val,true));					                                            
                                                        if(row_no==50 && camp_list_json.offset+parseInt(campaigns.count)<parseInt(campaigns.totalCount)){
                                                                list_html.attr("data-load","true")
                                                        }
                                                        camp_list_json["campaigns"][0]["campaign"+(new_offset+row_no)] = val;
                                                        camp_obj.$("#camps_grid tbody").append(list_html);
                                                        row_no = row_no +1;
                                                        });                                    
                                                   camp_list_json.count = parseInt(camp_list_json.count) + parseInt(campaigns.count);
                                                   camp_obj.$el.find(".taglink").click(_.bind(function(obj){
                                                   camp_obj.app.initSearch(obj,camp_obj.$el.find("#list-search"));
                                        },camp_obj));

                                }
                                }).fail(function() { console.log( "error in campaign lazy loading fields" ); }); 
                            }
                            else{
                                    this.getallcampaigns();
                            }
			},
                        showChart:function(obj){
                            var _ele = $.getObj(obj,"div");
                            var left_minus = 96;
                            var ele_offset = _ele.offset();                    
                            var ele_height =  _ele.height();
                            var top = ele_offset.top + ele_height - 134;
                            var left = ele_offset.left-left_minus;      
                            var _this = this;                            
                            var camp_id= _ele.parents("tr").attr("id").split("_")[1];
                            this.$(".campaign-name").html( _ele.parents("tr").find("h3 a.campname").text()); //Setting name of Campaign in Chart
                            this.app.showLoading("Loading Chart...",this.$(".cstats .chart-area"));                            
                            if(!this.chartPage){
                                require(["reports/campaign_pie_chart"],function(chart){                                    
                                    _this.chartPage = new chart({page:_this,legend:'none',chartArea:{width:"95%",height:"95%",left:'0px',top:'0px'}});
                                    _this.$(".campaign-chart").html(_this.chartPage.$el);
                                    _this.chartPage.$el.css({"width":"280px","height":"280px"});                                   
                                    _this.loadChart(camp_id);
                                });
                            }
                            else{
                                 this.loadChart(camp_id);
                            }
                                                        
                            
                            this.$(".cstats").css({"left":left+"px","top":top+"px"}).show();
                        },
                        closeChart:function(){
                            this.$(".cstats").hide();
                        },
                        loadChart:function(camp_id){                            
                            var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get("bms_token")+"&type=stats";                  
                            URL +="&campNums="+camp_id;       
                            if(this.states_call){
                                this.states_call.abort();
                                this.states_call = null;
                            }
                            this.chart_data = {clickCount:0,conversionCount:0,openCount:0,pageViewsCount:0,sentCount:0};
                            this.states_call = jQuery.getJSON(URL, _.bind(function(tsv, state, xhr){                                
                                var camp_json = jQuery.parseJSON(xhr.responseText);                                
                                this.app.showLoading(false,this.$(".cstats .chart-area"));                                   
                                _.each(camp_json.campaigns[0], function(val) {                                    
                                   this.chart_data["clickCount"] = this.chart_data["clickCount"] + parseInt(val[0].clickCount);
                                   this.chart_data["conversionCount"] = this.chart_data["conversionCount"] +parseInt(val[0].conversionCount);                                                                                                            
                                   this.chart_data["openCount"] = this.chart_data["openCount"] + parseInt(val[0].openCount);
                                   this.chart_data["pageViewsCount"] = this.chart_data["pageViewsCount"] + parseInt(val[0].pageViewsCount);                                                                                                                                                
                                   this.chart_data["sentCount"] = this.chart_data["sentCount"] + parseInt(val[0].sentCount);                                                                                                                                                
                               },this);
                                var _data =[
                                 ['Action', 'Count'],
                                   ['Opens',   this.chart_data["openCount"]],
                                   ['Page Views',       this.chart_data["pageViewsCount"]],
                                   ['Conversions',  this.chart_data["conversionCount"]],
                                   ['Clicks',    this.chart_data["clickCount"]]
                               ];

                               this.chartPage.createChart(_data);                               
                               _.each(this.chart_data,function(val,key){
                                   this.$("."+key).html(this.app.addCommas(val));
                               },this);
                               
                            },this));
                      }
                        
		});
});