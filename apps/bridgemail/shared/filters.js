/*
 *Created by : Umair Shahid
 *Version: 1 
 *=================================*/

!function ($) {
  "use strict"; 

  var Filters = function (element, options) {
    this.init(element, options)
  }

  Filters.prototype = {

    constructor: Filters

  , init: function (element, options) {           
      this.$element = $(element)
      this.options = this.getOptions(options)            
      this.$element.append($(this.options.template))
      this.webforms = []
      this.pageUrls = []
      this.pageTypes = []
      this.linkFilters = []
      this.basicFields = []
      this.customFields = []
      this.lists = null;
      this.formats = []
      this.rules = []
      this.listFilter = null
      var self = this;
      if(this.options.filterFor==="C"){
        this.$element.find(".filter-div").append(this.options.toprow)
        this.$element.find(".filter-div").find(".all-any").t_button()
        addFilterRow()
      } 
      function addFilterRow(){
        var  basicFilter = $('<li><a class="btn-green"><span>Basic Filter</span> <i class="filter"></i> </a></li>')
        var  emailFilter = $('<li><a class="btn-green"><span>Email Activity</span> <i class="email"></i></a></li>')
        self.listFilter = $('<li><a  class="btn-green"><span>Lists</span> <i class="list"></i> </a></li>')
        var  formFilter = $('<li><a  class="btn-green"><span>Form Submissions</span> <i class="form"></i></a></li>')
        var  websiteFilter = $('<li><a  class="btn-green"><span>Website Actions</span> <i class="web"></i></a></li>')
        var  leadScoreFilter = $('<li><a  class="btn-green"><span>Lead Score</span> <i class="score"></i></a></li>')
        var add_filter_row = $(self.options.bottomrow_c);
        
        //adding different filter to add row
        add_filter_row.find("ul").append(basicFilter)
        add_filter_row.find("ul").append(emailFilter)
        add_filter_row.find("ul").append(self.listFilter)
        add_filter_row.find("ul").append(formFilter)
        add_filter_row.find("ul").append(websiteFilter)
        add_filter_row.find("ul").append(leadScoreFilter)
        self.$element.find(".filter-div").append(add_filter_row)
        
        //Attaching events to filter buttons
        basicFilter.on("click",$.proxy(self.addBasicFilter,self))
        emailFilter.on("click",$.proxy(self.addEmailFilter,self))
        self.listFilter.on("click",$.proxy(self.addListFilter,self))
        formFilter.on("click",$.proxy(self.addFormFilter,self))
        leadScoreFilter.on("click",$.proxy(self.addLeadScoreFilter,self))
        websiteFilter.on("click",$.proxy(self.addWebsiteFilter,self))
      }
      
      
      
    }
  , addBasicFilter:function(obj,e,params){
      var filter = $(this.options.filterRow)
      filter.addClass("filter")
      var nofield_change = false;
      var selected_field = "",selected_rule="",selected_formats="", matchValue="",gapValue = "0",list_html='<div class="btn-group sub-date-container" style="display:none"><a class="icon add-list"></a></div>',
          format_display="none",value_display="block",gap_display="none"
      //In case of edit set parameters    
      if(params){    
        matchValue = (params.matchValue)?params.matchValue:""
        gapValue = (params.spanInDays)?params.spanInDays:"0"
        if( params.fieldName=="{{SUBSCRIPTION_DATE}}"){
            list_html = '<div class="btn-group sub-date-container" style="display:block" list_id="'+params['listNumber.encode']+'" list_checksum="'+params['listNumber.checksum']+'"><a class="icon list"></a></div>'          
        }
        if(params.rule=="dr" || params.rule=="prior" || params.rule=="after" || params.rule=="dayof" || params.rule=="birthday" || params.rule=="pbday"){               
             format_display = "block"
             if(params.rule=="prior" || params.rule=="after" || params.rule=="pbday"){
                 gap_display="block"
             }
             if(params.rule=="dr"){
                value_display = "block"
             }
             else{
                value_display = "none" 
             }
        }
         if(params.rule=="empty" || params.rule=="notempty"){
             value_display = "none" 
             format_display = "none"
             gap_display="none"
         }
      }
             
      var filter_html = '<div class="btn-group field-container"><div class="inputcont"><select data-placeholder="Choose a Field" class="selectbox fields" disabled="disabled"><option>Loading Fields...</option>'                        
          filter_html +='</select></div></div>'
          filter_html +=list_html
          filter_html +='<div class="btn-group rules-container"><div class="inputcont"><select  class="selectbox rules" disabled="disabled"><option value="">Loading...</option>'                      
          filter_html +='</select></div></div>'          
          filter_html += '<div class="btn-group days-container" style="display:'+gap_display+'"><div class="inputcont"><input type="text" value="'+gapValue+'" name="" class="gap" style="width:30px;" /></div></div>'
          filter_html +='<div class="btn-group formats-container" style="display:'+format_display+'"><div class="inputcont"><select class="selectbox formats" disabled="disabled"><option>Loading...</option>'                    
          filter_html +='</select></div></div>'
          filter_html += '<div class="btn-group value-container" style="display:'+value_display+'"><div class="inputcont"><input type="text" value="'+matchValue+'" name="" class="matchValue" style="width:240px;" /></div></div>'
      filter.find(".filter-cont").append('<span class="timelinelabel">Basic Filter</span>');    
      filter.find(".filter-cont").append(filter_html)
      //Chosen with fields
      filter.find(".fields").chosen({width:'200px'}).change(function(){
          if($(this).val()=="{{SUBSCRIPTION_DATE}}"){
              filter.find(".sub-date-container").show();
          }
          else{
              filter.find(".sub-date-container").hide();
          }
          if($(this).val()=="{{SUBSCRIPTION_DATE}}" || $(this).val()=="{{BIRTH_DATE}}" ){
              filter.find(".formats-container").show()
          }
          else{
              filter.find(".formats-container").hide()
          }
          
          filter.find(".selectbox.rules").change()             
          
          
          
      })
      var self = this
      //Chosen with rules
      filter.find(".selectbox.rules").chosen({disable_search: "true",width:'170px'}).change(function(){             
             if((filter.find(".fields").val()=="{{SUBSCRIPTION_DATE}}" || filter.find(".fields").val()=="{{BIRTH_DATE}}") && ($(this).val()=="ct" || $(this).val()=="!ct" || $(this).val()=="nr") ){
                 self.options.app.showAlert("'Subscribe Date' OR 'Birth Date' field can not have rules like: contains, not contains & within numeric range.",$("body"),{fixed:true});
                 $(this).val('=').trigger("chosen:updated").change()
                 return false
             }
             if($(this).val()=="dr" || $(this).val()=="prior" || $(this).val()=="after" || $(this).val()=="dayof" || $(this).val()=="birthday" || $(this).val()=="pbday"){
                
                if(filter.find(".fields").val()=="{{SUBSCRIPTION_DATE}}" || filter.find(".fields").val()=="{{BIRTH_DATE}}"){
                    filter.find(".formats-container").hide()
                }
                else{
                    filter.find(".formats-container").show()
                }
                
                if($(this).val()=="prior" || $(this).val()=="after" || $(this).val()=="pbday"){
                    filter.find(".days-container").show().val('0')
                }
                else{
                    filter.find(".days-container").hide()
                }
                
                if($(this).val()=="dr"){
                    filter.find(".value-container").show()
                    filter.find(".formats-container").show()
                }
                else{
                    filter.find(".value-container").hide()
                }
             }
             else{
                filter.find(".days-container").hide()
                if((filter.find(".fields").val()=="{{SUBSCRIPTION_DATE}}" || filter.find(".fields").val()=="{{BIRTH_DATE}}")){
                    filter.find(".formats-container").show()
                }
                else{
                    filter.find(".formats-container").hide()
                }
                filter.find(".value-container").show()
             }
             
             if($(this).val()=="empty" || $(this).val()=="notempty"){
                  filter.find(".days-container").hide()  
                  filter.find(".formats-container").hide()
                  filter.find(".value-container").hide()
             }
             
             
      });
            
      //Chosen with formats      
      filter.find(".selectbox.formats").chosen({disable_search: "true",width:'152px'})
      
      filter.find(".sub-date-container").on("click",$.proxy(this.showDialog,this))
      
      this.addActionBar(filter)
      this.$element.find(".addfilter").before(filter)
      this.showTooltips(filter)
      //Loading Rules, basic fields and formats
        var URL = ""
        var self = this        
        if(this.basicFields.length===0){
            URL = "/pms/io/getMetaData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=fields_all";
            jQuery.getJSON(URL,  function(tsv, state, xhr){
                if(xhr && xhr.responseText){                        
                     var fields_json = jQuery.parseJSON(xhr.responseText);                                
                     if(self.options.app.checkError(fields_json)){
                         return false;
                     }       
                    var bas_field_html ='<option value=""></option>'
                        bas_field_html +='<optgroup label="Basic Fields">'                            
                    var cust_field_html = '<optgroup label="Custom Fields">'                        
                    $.each(fields_json,function(key,val){
                        selected_field = (params && params.fieldName==val[0]) ? "selected" : ""
                        if(val[2]=="true"){                            
                            self.basicFields.push(val)                            
                            bas_field_html +='<option value="'+val[0]+'" '+selected_field+'>'+val[1]+'</option>'                           
                        }
                        else{
                            self.customFields.push(val)
                            cust_field_html += '<option value="'+val[0]+'" '+selected_field+'>'+val[1]+'</option>'
                        }
                    });
                    bas_field_html +='</optgroup>'
                    cust_field_html +='</optgroup>'                    
                    filter.find(".fields").html(bas_field_html+cust_field_html).prop("disabled",false).trigger("chosen:updated")
                }
          }).fail(function() { console.log( "error in loading fields" ); });
      }
      else{
          var fields_array =this.basicFields
            var filter_html ='<option value=""></option>'
            filter_html +='<optgroup label="Basic Fields">'
            $.each(fields_array,function(k,val){
                selected_field = (params && params.fieldName==val[0]) ? "selected" : ""
                filter_html +='<option value="'+val[0]+'" '+selected_field+'>'+val[1]+'</option>'
            });
            filter_html +='</optgroup>'
            fields_array =this.customFields
            filter_html +='<optgroup label="Custom Fields">'
            $.each(fields_array,function(k,val){
                selected_field = (params && params.fieldName==val[0]) ? "selected" : ""
                filter_html +='<option value="'+val[0]+'" '+selected_field+'>'+val[1]+'</option>'
            });
            filter_html +='</optgroup>'
            filter.find(".fields").html(filter_html).prop("disabled",false).trigger("chosen:updated")
      }
      if(this.rules.length===0){
        URL = "/pms/io/getMetaData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=rules";
          jQuery.getJSON(URL,  function(tsv, state, xhr){
              if(xhr && xhr.responseText){                        
                   var rules_json = jQuery.parseJSON(xhr.responseText);                                
                   if(self.options.app.checkError(rules_json)){
                       return false;
                   }                                     
                   var filter_html =''
                   $.each(rules_json,function(k,val){
                        selected_rule = (params && params.rule==val[0]) ? "selected" : ""
                        filter_html +='<option value="'+val[0]+'" '+selected_rule+'>'+val[1]+'</option>'
                        self.rules.push(val)
                   });                   
                   filter.find(".selectbox.rules").html(filter_html).prop("disabled",false).trigger("chosen:updated")
              }
        }).fail(function() { console.log( "error in loading rules" ); });
      }
      else{
            var filter_html = ''
            $.each(this.rules,function(k,val){
                selected_rule = (params && params.rule==val[0]) ? "selected" : ""
                filter_html +='<option value="'+val[0]+'" '+selected_rule+'>'+val[1]+'</option>'                
            })  
        
            filter.find(".selectbox.rules").html(filter_html).prop("disabled",false).trigger("chosen:updated")
      }
      if(this.formats.length===0){
        URL = "/pms/io/getMetaData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=formats";
          jQuery.getJSON(URL,  function(tsv, state, xhr){
              if(xhr && xhr.responseText){                        
                   var formats_json = jQuery.parseJSON(xhr.responseText);                                
                   if(self.options.app.checkError(formats_json)){
                       return false;
                   }
                   
                   var filter_html =''
                   $.each(formats_json,function(k,val){
                        selected_formats = (params && params.dateFormat==val[0]) ? "selected" : ""
                        filter_html +='<option value="'+val[0]+'" '+selected_formats+'>'+val[1]+'</option>'
                        self.formats.push(val)
                   });                   
                   filter.find(".selectbox.formats").html(filter_html).prop("disabled",false).trigger("chosen:updated")
                  
              }
        }).fail(function() { console.log( "error in loading formats" ); });
      }
      else{
          var filter_html = ''
            $.each(this.formats,function(k,val){
                selected_formats = (params && params.dateFormat==val[0]) ? "selected" : ""
                filter_html +='<option value="'+val[0]+'" '+selected_formats+'>'+val[1]+'</option>'                
            })  
        
          filter.find(".selectbox.formats").html(filter_html).prop("disabled",false).trigger("chosen:updated")
      }
      
      
    }
  , addEmailFilter:function(obj,e,params){
      var filter = $(this.options.filterRow)
      filter.addClass("email")
      var selected_camp = "",selected_article = ""
      var self = this
      var filter_html = '<div class="row"><label>Filter by</label>'
          filter_html += ' <div class="btn-group "><select data-placeholder="Select Filter by" class="filter-by"><option value="OP">Email Opened</option><option value="CK">Email Clicked</option><option value="NC">Non Clickers</option></select></div>'
          filter_html += '</div>'
          filter_html += '<div class="row">'
            filter_html += '<label>Campaign</label>'            
            filter_html += ' <div class="btn-group "><select data-placeholder="Any Campaign" class="chosen-select campaign-source"><option value=""></option><option value="N" selected>Campaigns</option><option value="A">Auto Trigger</option><option value="T">Nurture Track</option><option value="W">Workflow</option></select></div>'  
            filter_html += '<div class="btn-group "><select data-placeholder="Select Campaign" class="campaign-list">'  
                  filter_html +='<option value="-1">Any Campaign</option>'  
                  var campaigns_array =this.options.app.getAppData("campaigns")   
                  filter_html +='<option value=""></option>'
                  /*$.each(campaigns_array.campaigns[0], function(index, val) {
                      filter_html +='<option value="'+val[0].campNum+'">'+val[0].name+'</option>'
                  })*/
                  
            filter_html +='</select></div>'
            filter_html += '<a  class="icon view showtooltip" title="Preview Campaign" ></a></div>'
            filter_html += '<div class="row nolabel campaign-url-container" style="display:none"><div class="btn-group "><select data-placeholder="Select URL" class="campaign-url"></select></div>'              
          filter_html += '<a  class="icon view showtooltip" title="Preview Link"></a></div>'
          filter_html += '<div class="match row"> Happened in last '
                filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan emailTimeSpan">'+this.getTimeSpan(30,90)+'</select></div> days'  
                filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan emailFreq">'+this.getTimeSpan(1)+'</select></div> or more times'  
          filter_html += '</div>'
      filter.find(".filter-cont").append('<span class="timelinelabel">Email Activity</span>');        
      filter.find(".filter-cont").append(filter_html)
      filter.find(".filter-by").chosen({disable_search: "true",width:"152px"}).change(function(){
          if($(this).val()=="CK" &&  filter.find(".campaign-list").val()!=="-1"){
              filter.find(".campaign-url-container").show()
              if( filter.find(".campaign-source").val()!=="-1"){
                  filter.find(".campaign-source").change()
              }
          }
          else{
              filter.find(".campaign-url-container").hide()
          }
      })
      //Campaign Soruces i.e campaigns, workflows, Nuture Track and Auto Triggers
      filter.find(".campaign-source").chosen({disable_search: "true",width:"170px"}).change(function(){
          $(this).val($(this).val()).prop("disabled",true)
          $(this).trigger("chosen:updated")
          $(this).parent().find(".chosen-container").append('<div class="loading-wheel combo"></div>')
          
          filter.find(".campaign-list").html("<option value='-1'>Loading...</option>").prop("disabled",true).trigger("chosen:updated")
          var map ={N:"listNormalCampaigns",A:"listAutoTriggerCampaigns",W:"listWorkflowsCampaigns",T:"listNurtureTracksCampaigns"}
          var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+self.options.app.get('bms_token')+"&type="+map[$(this).val()];                                                                                
            jQuery.getJSON(URL,  function(tsv, state, xhr){
                if(xhr && xhr.responseText){
                    var _json = jQuery.parseJSON(xhr.responseText);
                    if(self.options.app.checkError(_json)){
                          return false;
                     } 
                     filter.find(".campaign-source").parent().find(".chosen-container .loading-wheel").remove()
                     filter.find(".campaign-source").prop("disabled",false).trigger("chosen:updated")
                     var select_html = '<option value="-1">Any Campaign</option>'
                     if(_json.count!=="0"){
                        var camp_list = _json.lists || _json.campaigns
                        $.each(camp_list[0], function(index, val) {    
                            var _checksum = val[0].md5 || val[0]["campNum.checksum"]
                            selected_camp = (params && params["campaignNumber.checksum"]==_checksum)?"selected":""
                            var _value = val[0]["campNum.encode"] || val[0]["campNum"]
                            select_html += '<option value="'+_value+'" '+selected_camp+'>'+val[0].name+'</option>'
                        })
                     }
                     
                     filter.find(".campaign-list").html(select_html).prop("disabled",false).trigger("chosen:updated")
                     if(params && params["campaignNumber.checksum"]){
                         filter.find(".campaign-list").change()
                     }
                     
                }
            }).fail(function() { console.log( "error campaigns listing" ); });
          
      })
      
      //Campaign List Select box 
      filter.find(".campaign-list").chosen({width:"450px"}).change(function(){
          if($(this).val()!=="-1" &&  filter.find(".filter-by").val()=="CK"){
              filter.find(".campaign-url-container").show()
              filter.find(".campaign-url").html("<option value='-1'>Loading...</option>").prop("disabled",true).trigger("chosen:updated")
              var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+self.options.app.get('bms_token')+"&type=links&campNum="+$(this).val();                                                                                
              jQuery.getJSON(URL,  function(tsv, state, xhr){
                if(xhr && xhr.responseText){
                    var _json = jQuery.parseJSON(xhr.responseText);
                    if(self.options.app.checkError(_json)){
                          return false
                     } 
                     var select_html = '<option value="-1">Any Article</option>'                     
                     if(_json.count!=="0"){
                        $.each(_json.articles[0], function(index, val) {    
                            var _value = val[0]["articleNumber.encode"] 
                            selected_article = (params && params["articleNumber.checksum"]==val[0]["articleNumber.checksum"])?"selected":""
                            select_html += '<option value="'+_value+'" '+selected_article+'>'+val[0].title+'</option>'
                        })
                     }
                     filter.find(".campaign-url").html(select_html).prop("disabled",false).trigger("chosen:updated")
                     
                }
            }).fail(function() { console.log( "error Articals listing" ); })
              
          }
          else{
              filter.find(".campaign-url-container").hide()
          }
      })
      //Article URL select box
      filter.find(".campaign-url").chosen({width:"350px"})
      
      //Time Span Select boxes
      filter.find(".timespan").chosen({disable_search: "true",width:"80px"}).change(function(){
          $(this).val($(this).val())
          $(this).trigger("chosen:updated")
      })
      this.addActionBar(filter)
      this.$element.find(".addfilter").before(filter)                
      this.showTooltips(filter)
      if(params){
          filter.find(".filter-by").val(params.filterBy).trigger("chosen:updated")
          filter.find(".filter-by").change()
          if(params.campaignType){
            filter.find(".campaign-source").val(params.campaignType).trigger("chosen:updated")
            filter.find(".campaign-source").change()
          }
          else if(params.campaignNumber!==""){
            filter.find(".campaign-source").change()
          }          
          if(params.isTimeSpan=="true"){
              filter.find(".emailTimeSpan").val(params.timeSpanInDays).trigger("chosen:updated")
          }
          if(params.isFrequency=="true"){
              filter.find(".emailFreq").val(params.frequency).trigger("chosen:updated")
          }
      }
      else{
        filter.find(".campaign-source").change()
      }
    },
    loadLists:function(){
        var self = this;
        var URL = "/pms/io/list/getListData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=all";
       $.ajax({
            url: URL,
            dataType: 'json',
            async: false,
            type:'GET',
            success: function(data) {
                    self.lists = data;                                             
              }
        })
    }
  , addListFilter:function(obj,e,params){
      this.listFilter.find("a.btn-green").addClass("saving");
      var self = this;
      var filter = $(this.options.filterRow)      
      filter.addClass("list");
      
      var filter_html = '<div class="row"><label>Filter by</label>'
          filter_html += ' <div class="btn-group "><select class="member-box"><option value="Y">Member</option><option value="N">Non Member</option></select></div>'
          filter_html += '</div>'          
            
          filter_html += '<div class="match row" style="margin-bottom:0px"> Match '
                filter_html += '<div class="btn-group"><select class="match-box"><option value="Y">All</option><option value="N">Any</option></select></div> of the selected list(s).'                  
          filter_html += '</div>'
          filter_html += '<h2 class="header-list" style="margin-top:0px;background-color:transparent"><a style="margin: -4px 2px;display:none;" data-original-title="Refresh listing" class="refresh_btn showtooltip list-refresh"><i>Refresh</i></a>&nbsp; <div class="input-append search"></div></h2><div class="target-listing"  style="margin-top:9px">'
            filter_html += '<table cellpadding="0" cellspacing="0" width="100%" id="__list_grid"><tbody>'
            if(!this.lists){
                this.loadLists();
            }
            var list_array =this.lists
            var filter_ref = this;
            $.each(list_array.lists[0], function(index, val) {     
                        filter_html += '<tr id="row_'+val[0]["listNumber.encode"]+'">';      
                        filter_html +='<td><input class="check-list" type="checkbox" value="'+val[0]["listNumber.encode"]+'" list_checksum="'+val[0]["listNumber.checksum"]+'" /></td>'
                        filter_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3><div class="tags tagscont">'+filter_ref.options.app.showTags(val[0].tags)+'</div></div></td>';                        
                        filter_html += '<td><div class="subscribers" style="min-width:80px"><span  class=""></span>'+val[0].subscriberCount+'</div><div id="'+val[0]["listNumber.encode"]+'" class="action"><a class="btn-green"><span>Use</span><i class="icon next"></i></a></div></td>';                        
                        filter_html += '</tr>';
                    });
            filter_html += '</tbody></table>'
          filter_html += '</div>'
      filter.find(".filter-cont").append('<span class="timelinelabel">Lists</span>');            
      filter.find(".filter-cont").append(filter_html)
      filter.find(".member-box").chosen({disable_search: "true",width:"200px"}).change(function(){
          $(this).val($(this).val())
          $(this).trigger("chosen:updated")
      })      
      filter.find(".match-box").chosen({disable_search: "true",width:"100px"}).change(function(){
          $(this).val($(this).val())
          $(this).trigger("chosen:updated")
      })
      
      filter.find(".search").searchcontrol({
                id:'list-search',
                width:'300px',
                height:'22px',
                tdNo:2,
                placeholder: 'Search Lists',
                gridcontainer: filter.find(".target-listing"),
                showicon: 'yes',
                iconsource: 'list'
         });
         
      
      this.addActionBar(filter)      
      this.$element.find(".addfilter").before(filter)
      this.showTooltips(filter)
      filter.find("#__list_grid").bmsgrid({
                useRp : false,
                resizable:false,
                colresize:false,
                height:290,
                usepager : false,
                colWidth : ['40px','100%','100px']
        });
        /*ICHECK IMPLEMENTATION BY ABDULLAH*/
            if(filter.find('#__list_grid .check-list').iCheck){
             self.icheckCreate(filter.find('#__list_grid .check-list'));
         }
      /*Ends*/
        filter.find("#__list_grid").find("tr td:nth-child(1)").attr("width","40px")
        filter.find("#__list_grid").find("tr td:nth-child(2)").attr("width","100%")
        filter.find("#__list_grid").find("tr td:nth-child(3)").attr("width","100px")
        filter.find("#__list_grid .action").click(function(event){
          $(this).parents("tr").addClass("selected")
          //$(this).parents("tr").find(".check-list").prop("checked",true);
          /* ICHECK BY ABDULLAH */
           if(filter.find('#__list_grid .check-list').iCheck){
            $(event.target).parents("tr").find(".check-list").iCheck('check');
        }
      });
      filter.find('.list-refresh').click(function(){
            self.lists = null;
            self.addListFilter();
            //self.loadLists();
      });
      /*filter.find("#__list_grid .check-list").click(function(){
          if($(this).prop("checked")){
              $(this).parents("tr").addClass("selected");
          }
          else{
              $(this).parents("tr").removeClass("selected");  
          }
      });*/
 
      if(params){ 
           var isMemberOfList = params.isMemberOfList=="false"?"N":"Y"
           filter.find(".member-box").val(isMemberOfList).trigger("chosen:updated")
           var matchAll = params.matchAll=="false"?"N":"Y"
           filter.find(".match-box").val(matchAll).trigger("chosen:updated")
           var list_arr = params["listNumbers.checksums"].split(",")
           $.each(list_arr,function(k,v){
               //filter.find("#__list_grid input[list_checksum='"+v+"']").prop("checked",true).parents("tr").addClass("selected")               
               filter.find("#__list_grid input[list_checksum='"+v+"']").parents("tr").addClass("selected")               
           });
           $.each($('#__list_grid .selected'),function(k,v){
              $(this).find('.check-list').iCheck('check');
           })
      }
      this.listFilter.find("a.btn-green").removeClass("saving")
    }    
  , addFormFilter:function(obj,e,params){
      var filter = $(this.options.filterRow)
      var select_form = ""
      filter.addClass("form");
      var self = this
      var filter_html = '<div class="row"><label>Submitted Form</label>'
          filter_html += ' <div class="btn-group forms-box-container"><div class="inputcont"><select data-placeholder="Select Webform" disabled="disabled" class="forms-box"><option value="-1">Loading Web Forms...</option></select></div></div>'
          filter_html += '</div>'          
            
          filter_html += '<div class="match row"> Happened in last '
                filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan formTimeSpan">'+this.getTimeSpan(30,90)+'</select></div> days'                  
          filter_html += '</div>'
      filter.find(".filter-cont").append('<span class="timelinelabel">Form Submission</span>');                
      filter.find(".filter-cont").append(filter_html)
      filter.find(".forms-box").chosen({width:"300px"})      
      filter.find(".timespan").chosen({disable_search: "true",width:"80px"}).change(function(){
          $(this).val($(this).val())
          $(this).trigger("chosen:updated")
      })
      
      this.addActionBar(filter)
      this.$element.find(".addfilter").before(filter)
      this.showTooltips(filter)
      if(this.webforms.length===0){
      var URL = "/pms/io/form/getSignUpFormData/?BMS_REQ_TK="+self.options.app.get('bms_token')+"&type=search"                  
            jQuery.getJSON(URL,  function(tsv, state, xhr){
              if(xhr && xhr.responseText){
                  var _json = jQuery.parseJSON(xhr.responseText);
                  if(self.options.app.checkError(_json)){
                        return false
                   } 
                   var select_html = '<option value=""></option>'                     
                   if(_json.count!=="0"){
                      $.each(_json.forms[0], function(index, val) {    
                          var _value = val[0]["formId.encode"] 
                          select_form = (params && params['formNumber.checksum']==val[0]["formId.checksum"]) ? "selected" : ""
                          select_html += '<option value="'+_value+'" '+select_form+' webform_checksum="'+val[0]["formId.checksum"] +'">'+val[0].name+'</option>'
                          self.webforms.push({"id":_value,"name":val[0].name,checksum:val[0]["formId.checksum"]})
                      })
                   }                   
                   filter.find(".forms-box").html(select_html).prop("disabled",false).trigger("chosen:updated")

              }
          }).fail(function() { console.log( "error campaign listing" ); })
       }
       else{
           var select_html = '<option value=""></option>'                     
           $.each(this.webforms, function(index, val) {
               select_form = (params && params['formNumber.checksum']==val.checksum) ? "selected" : ""
               select_html +='<option value="'+val.id+'" '+select_form+' webform_checksum="'+val.checksum +'">'+val.name+'</option>'
           }) 
           filter.find(".forms-box").html(select_html).prop("disabled",false).trigger("chosen:updated")
       }
       
       if(params){ 
           if(params.isTimeSpan=="true"){
              filter.find(".formTimeSpan").val(params.timeSpanInDays).trigger("chosen:updated")
          } 
       }
      
    }    
  , addLeadScoreFilter:function(obj,e,params){
      var filter = $(this.options.filterRow)
      filter.addClass("score");
      var filter_html = '<label>Score</label>'
      filter_html += '<div class="btn-group "><select class="condtion-box">'
      filter_html += '<option value="eq">equals</option><option value="less">less than</option><option value="gr8">greater than</option><option value="btw">between</option><option value="incmore">increase more than</option>'
      filter_html += '</select></div>'  
      filter_html += '<div class="btn-group scoreValue-container"><div class="inputcont"><input type="text" value="" name="" style="width:50px;" class="scoreValue" /></div></div>'
      filter_html += '<div class="match row days-container" style="display:none;clear:both"> in last '
            filter_html += '<div class="btn-group "><select class="timespan scoreRange">'+this.getTimeSpan(30)+'</select></div> days'                  
      filter_html += '</div>'
      filter.find(".filter-cont").append('<span class="timelinelabel">Lead Score</span>');            
      filter.find(".filter-cont").append(filter_html)
      filter.find(".condtion-box").chosen({disable_search: "true",width:"200px"}).change(function(){
          if($(this).val()=="incmore"){
              filter.find(".days-container").show()
          }
          else{
              filter.find(".days-container").hide()
          }
      })
      filter.find(".timespan").chosen({disable_search: "true",width:"80px"}).change(function(){
          $(this).val($(this).val())
          $(this).trigger("chosen:updated")
      })
      this.addActionBar(filter)
      this.$element.find(".addfilter").before(filter)
      this.showTooltips(filter)
      if(params){
          filter.find(".condtion-box").val(params.rule).trigger("chosen:updated")
          filter.find(".scoreValue").val(params.score)
          if(params.rangeInDays!=="0"){
            filter.find(".days-container").show()
            filter.find(".scoreRange").val(params.rangeInDays).trigger("chosen:updated")
          }
      }
    }
   , addWebsiteFilter:function(obj,e,params){
      var filter = $(this.options.filterRow)
      filter.addClass("web")
      var selected_link="",selected_ptype="",selected_linkfilter=""
      // Loading Page url, page types and link filters data
      var URL = ""
      var self = this
      var filter_html = '<div class="row"><label>Filter by</label>'
          filter_html += ' <div class="btn-group "><select data-placeholder="" class="filter-box">'
          filter_html += '<option value="WV" selected>Web Visit</option><option value="PU">Page URL</option><option value="PT">Page Type</option><option value="LF">Link Filter</option>'
          filter_html += '</select></div>'
          filter_html += '</div>'
          filter_html += '<div class="row pagelink-box-container" style="display:none">'
            filter_html += '<label>Filter URL</label>'
            filter_html += '<div class="btn-group "><select data-placeholder="Select Page Link" class="pagelink-box" disabled="disabled"><option value="">Loading Page URL... </option></select></div>'                        
          filter_html += '</div>'
          filter_html += '<div class="row pagetype-box-container" style="display:none">'
            filter_html += '<label>Page Type</label>'
            filter_html += '<div class="btn-group "><select data-placeholder="Select Page Types" class="pagetype-box" disabled="disabled">'
            filter_html += '<option value="">Loading Page Types... </option>'
            filter_html += '</select></div>'                        
          filter_html += '</div>'
          filter_html += '<div class="row linkfilter-box-container" style="display:none">'
            filter_html += '<label>Link Filter</label>'
            filter_html += '<div class="btn-group "><select data-placeholder="Select Link Filter" class="linkfilter-box" disabled="disabled">'
            filter_html += '<option value="">Loading Link Filters... </option>'
            filter_html += '</select></div>'                        
          filter_html += '</div>'
          filter_html += '<div class="match row"> Happened in last '
                filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan webTimeSpan">'+this.getTimeSpan(30,90)+'</select></div> days'  
                filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan webFreq">'+this.getTimeSpan(1)+'</select></div> or more times'  
          filter_html += '</div>'
      filter.find(".filter-cont").append('<span class="timelinelabel">Website Action</span>')    
      filter.find(".filter-cont").append(filter_html)
      filter.find(".filter-box").chosen({disable_search: "true",width:"152px"}).change(function(){
          if($(this).val()=="PU"){
              filter.find(".linkfilter-box-container").hide()
              filter.find(".pagetype-box-container").hide()
              filter.find(".pagelink-box-container").show()
               //Load page urls
                if(self.pageUrls.length===0){
                  URL = "/pms/io/filters/getLinkIDFilter/?BMS_REQ_TK="+self.options.app.get('bms_token')+"&type=listLinkLibrary";
                  jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){                        
                             var _json = jQuery.parseJSON(xhr.responseText);                                
                             if(self.options.app.checkError(_json)){
                                 return false;
                             }
                             var select_html = ''
                             $.each(_json.links[0], function(index, val) {            
                                  selected_link = (params && params['pageURL']==val[0]["url"]) ? "selected" : ""
                                  var url = val[0]["url"] ? self.options.app.decodeHTML(val[0]["url"]) : ""
                                  var title = val[0].title ? self.options.app.decodeHTML(val[0].title) : ""
                                  select_html += '<option value="'+url+'" '+selected_link+'>'+(title? title : url)+'</option>'
                                  self.pageUrls.push({"id":url,"title":title})
                              })
                                                                                                                      
                             filter.find(".pagelink-box").html(select_html).prop("disabled",false).trigger("chosen:updated")                            
                           
                             if( filter.find(".pagelink-box").find("option").length < parseInt(_json.totalCount)){
                                    filter.find(".pagelink-box").find("option:last-child").attr("data-load","true");
                             }
                             if(params && params['pageURL'] &&  filter.find(".pagelink-box").val()!== self.options.app.decodeHTML(params['pageURL'])){
                                 filter.find(".pagelink-box").attr("data-selected",self.options.app.decodeHTML(params['pageURL']));
                                 filter.find(".pagelink-box").trigger("chosen:select")
                             }
                        }
                  }).fail(function() { console.log( "error in loading page urls" ); });
                }
                else{
                    var select_html = ''
                    $.each(self.pageUrls, function(index, val) {                            
                          selected_link = (params && params['pageURL']==val.id) ? "selected" : ""
                          select_html += '<option value="'+val.id+'" '+selected_link+'>'+val.title+'</option>'                
                      })
                     filter.find(".pagelink-box").html(select_html).prop("disabled",false).trigger("chosen:updated")
                }
          }
          else if($(this).val()=="WV"){
              filter.find(".linkfilter-box-container").hide()
              filter.find(".pagetype-box-container").hide()
              filter.find(".pagelink-box-container").hide()
          }
          else if($(this).val()=="PT"){
              filter.find(".linkfilter-box-container").hide()
              filter.find(".pagetype-box-container").show()
              filter.find(".pagelink-box-container").hide()
              //Load page types
                if(self.pageTypes.length===0){
                  URL = "/pms/io/filters/getLinkIDFilter/?BMS_REQ_TK="+self.options.app.get('bms_token')+"&type=listLinkFilterGroups";
                  jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){                        
                             var _json = jQuery.parseJSON(xhr.responseText);                                
                             if(self.options.app.checkError(_json)){
                                 return false;
                             }
                             var select_html = ''
                             $.each(_json.groups[0], function(index, val) {                            
                                  selected_ptype = (params && params['linkFilterGroupId.checksum']==val[0]["groupId.checksum"]) ? "selected" : ""
                                  select_html += '<option value="'+val[0]["groupId.encode"]+'" '+selected_ptype+'>'+val[0].name+'</option>'
                                  self.pageTypes.push({"id":val[0]["groupId.encode"],"name":val[0].name,checksum:val[0]["groupId.checksum"]})
                              })

                             filter.find(".pagetype-box").html(select_html).prop("disabled",false).trigger("chosen:updated")
                        }
                  }).fail(function() { console.log( "error in loading page types" ); });
                }
                else{
                    var select_html = '<option value=""></option>'
                    $.each(self.pageTypes, function(index, val) {       
                          selected_ptype = (params && params['linkFilterGroupId.checksum']==val.checksum) ? "selected" : ""
                          select_html += '<option value="'+val.id+'" '+selected_ptype+'>'+val.name+'</option>'                
                      })
                     filter.find(".pagetype-box").html(select_html).prop("disabled",false).trigger("chosen:updated")
                }

          }
          else if($(this).val()=="LF"){
              filter.find(".linkfilter-box-container").show()
              filter.find(".pagetype-box-container").hide()
              filter.find(".pagelink-box-container").hide()
              //Load link filters 
                if(self.linkFilters.length===0){
                  URL = "/pms/io/filters/getLinkIDFilter/?BMS_REQ_TK="+self.options.app.get('bms_token')+"&type=listLinkFilters";
                  jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){                        
                             var _json = jQuery.parseJSON(xhr.responseText);                                
                             if(self.options.app.checkError(_json)){
                                 return false;
                             }
                             var select_html = ''
                             $.each(_json.filters[0], function(index, val) {                            
                                  selected_linkfilter = (params && params['linkIDFilterNum.checksum']==val[0]["filterNumber.checksum"]) ? "selected" : ""
                                  select_html += '<option value="'+val[0]["filterNumber.encode"]+'" '+selected_linkfilter+'>'+val[0].name+'</option>'
                                  self.linkFilters.push({"id":val[0]["filterNumber.encode"],"name":val[0].name,checksum:val[0]["ilterNumber.checksum"]})
                              })

                             filter.find(".linkfilter-box").html(select_html).prop("disabled",false).trigger("chosen:updated")
                        }
                  }).fail(function() { console.log( "error in loading page types" ); });
                }
                else{
                    var select_html = ''
                    $.each(self.linkFilters, function(index, val) {                            
                          selected_linkfilter = (params && params['linkIDFilterNum.checksum']==val.checksum) ? "selected" : ""
                          select_html += '<option value="'+val.id+'" '+selected_linkfilter+'>'+val.name+'</option>'                
                      })
                     filter.find(".linkfilter-box").html(select_html).prop("disabled",false).trigger("chosen:updated")
                }

          }
          $(this).val($(this).val())
          $(this).trigger("chosen:updated")
      })
      filter.find(".pagelink-box").chosen({width:"400px",is_remote:true
                                           ,remote_url:"/pms/io/filters/getLinkIDFilter/?BMS_REQ_TK="+self.options.app.get('bms_token')+"&type=listLinkLibrary",
                                           page_urls : self.pageUrls
                                          }).change(function(){
          $(this).val($(this).val())
          $(this).trigger("chosen:updated")
      })
      filter.find(".pagetype-box").chosen({width:"300px"}).change(function(){
          $(this).val($(this).val())
          $(this).trigger("chosen:updated")
      })
      filter.find(".linkfilter-box").chosen({width:"300px"}).change(function(){
          $(this).val($(this).val())
          $(this).trigger("chosen:updated")
      })
      filter.find(".timespan").chosen({disable_search: "true",width:"80px"}).change(function(){
          $(this).val($(this).val())
          $(this).trigger("chosen:updated")
      })
      this.addActionBar(filter)
      this.$element.find(".addfilter").before(filter)
      this.showTooltips(filter)

      if(params){
          filter.find(".filter-box").val(params.filterBy).trigger("chosen:updated")
          filter.find(".filter-box").change()
          if(params.isTimeSpan=="true"){
              filter.find(".webTimeSpan").val(params.timeSpanInDays).trigger("chosen:updated")
          }
          if(params.isFrequency=="true"){
              filter.find(".webFreq").val(params.frequency).trigger("chosen:updated")
          }
      }
      
      
      
    }
  , addActionBar:function(filterRow){
      var action =  $('<div class="right-btns"></div>')            
      var del_btn = $('<a title="Delete Filter" class="btn-red showtooltip"><i class="icon delete "></i></a>')      
      action.append(del_btn)            
      del_btn.click(function(){
         $(this).parents(".filter-row").remove()
      });
      filterRow.find(".filter-cont").append(action)    
      
      //Action url 
      /*filterRow.mouseover(function(){
          action.show()
      })
      filterRow.mouseout(function(){
          action.hide()
      })*/
  }
  ,showDialog:function(obj){
     
      if($("body").hasClass('modal-open')){
                     var active_ws = $(".modal-body");
                     active_ws.find('.filter-clickers').remove();
                     var parentDiv = $(obj.target).parents('.filter-cont');
                     parentDiv.append("<div class='filter-clickers' id='subname-filters-dialog'><div id='show-loading' style='width:300px;height:300px;position:relative;'></div></div>");
                     active_ws.find('.filter-clickers').css({top:'55px'});
                    }
           
      /*var dialog = this.options.app.showDialog({title:'Choose List',
            css:{"width":"700px","margin-left":"-350px"},
            bodyCss:{"min-height":"290px"}
      });*/
      var dialog = $('#subname-filters-dialog');
      var showloading = $('#show-loading');
      this.options.app.showLoading("Loading Lists...",showloading); 
      if(this.lists){
          //dialog.append('Ready to load list');
          this.populateDialog(obj,dialog)
      }
      else{
       var self = this;   
       var URL = "/pms/io/list/getListData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=all";
       jQuery.getJSON(URL,  function(tsv, state, xhr){
                if(xhr && xhr.responseText){
                      self.lists = jQuery.parseJSON(xhr.responseText);   
                      self.populateDialog(obj,dialog);
                }
        }).fail(function() { console.log( "error lists listing" ); });
      }
       
      
  },
  populateDialog:function(obj,dialog){
      var self = this;
      var filter = $(this.options.filterRow)
      var list_icon = $.getObj(obj,"div")
      var selected_list = list_icon.attr("list_checksum")
      var d = "";
 
       var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="filter_list_grid" class="filter_list_grid"><tbody>'
            var list_array =this.lists
            var filter = this;
            $.each(list_array.lists[0], function(index, val) {  
                        if(val[0].name.substring(0,13)==='Supress_List_'){
                        list_html += '<tr id="row_'+val[0]["listNumber.encode"]+'" list_checksum="'+val[0]["listNumber.checksum"]+'" class="filter-supress-row" >';  
                        }else{
                            list_html += '<tr id="row_'+val[0]["listNumber.encode"]+'" list_checksum="'+val[0]["listNumber.checksum"]+'">';
                        }
                        list_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3><div class="tags tagscont">'+filter.options.app.showTags(val[0].tags)+'</div></div></td>';                        
                        list_html += '<td><div class="subscribers show" style="min-width:70px"><span  class=""></span>'+val[0].subscriberCount+'</div><div id="'+val[0]["listNumber.encode"]+'" class="action"><a class="btn-green"><span>Use</span><i class="icon next"></i></a></div></td>';                        
                        list_html += '</tr>';
                    });
            list_html += '<button class="stats-scroll ScrollToTop" type="button" style="display: none; position:absolute;bottom:5px;right:20px;"></button></tbody></table>'
       
        d +='<div><h2 class="header-list filter-target-head">&nbsp;<a style="margin: -2px 2px;display:none;" data-original-title="Refresh listing" class="refresh_btn showtooltip subscribe-refresh"><i>Refresh</i></a><div id="listssearch" class="input-append search"></div><a class="closebtn" id="filter-dropdown-close"></a></h2>'
        d += '<div class="template-container" style="margin-right:5px;min-height:290px"><div class="target-listing" id="filter-lists"><div style="display: inline-block; padding: 4px 0px; margin-left: 1%;" class="temp-filters clearfix"><h2 id="total_subscriber"><strong class="badge">'+list_array.count+'</strong><span>lists found</span></h2></div>'+list_html+'</div></div>'
        d += '</div>'
        
        d = $(d)
        d.find(".search").searchcontrol({
                id:'list-search',
                width:'467px',
                height:'22px',
                placeholder: 'Search Lists',
                gridcontainer: 'filter-lists',
                showicon: 'yes',
                iconsource: 'list',
                closeiconid: 'dialoglistssearch',
                searchFunc: _.bind(self.searchContacts,self),
                clearFunc:_.bind(self.clearSearchLists,self)
         });        
        //dialog.getBody().html(d)
        dialog.html(d)
        
      d.find("#filter_list_grid").bmsgrid({
                useRp : false,
                resizable:false,
                colresize:false,
                height:320,  //previous : 290
                usepager : false,
                colWidth : ['100%','100px']
        });
        d.find("#filter_list_grid tr td:nth-child(1)").attr("width","100%");
        d.find("#filter_list_grid tr td:nth-child(2)").attr("width","100px");
        d.find("#filter_list_grid .action").click(function(){            
             list_icon.attr("list_id",$(this).attr("id"))
             list_icon.attr("list_checksum",$(this).parents("tr").attr("list_checksum"))
             list_icon.find("a").removeClass("add-list").addClass("list");
             dialog.hide();
         })
         
      if(selected_list){
            var tr = d.find("#filter_list_grid tr[list_checksum='"+selected_list+"']")
            if(tr.length){
                tr.addClass("selected");
            }
        }
        // Attaching Event with close button
       dialog.find('#filter-dropdown-close').click(function(){
            self.closefilterBox();
        });
      dialog.find('#filter-lists .bDiv').on('scroll', function () {
            self.scrolling(dialog);
        });
       dialog.find('.stats-scroll').click(function(){
            self.scrollingTop(dialog);
       });

       // filter.$("#filter_list_grid tr[checksum='"+this.newList+"']").scrollintoview();
  },
 
  loadFilters:function(data){
      var _target = this.$element
      var self = this
      _target.find(".filter-div ._row").remove()
      _target.find(".all-any button[rule='"+data.applyRuleCount+"']").click()
      $.each(data.triggers[0],function(i,v){
          var filter =  v[0] 
          if(filter.type=="P"){
             self.addBasicFilter(false,false,filter) 
          }
          else if(filter.type=="E"){
             self.addEmailFilter(false,false,filter) 
          }
          else if(filter.type=="L"){
             self.addListFilter(false,false,filter)  
          }
          else if(filter.type=="F"){
             self.addFormFilter(false,false,filter)  
          }
          else if(filter.type=="S"){
             self.addLeadScoreFilter(false,false,filter) 
          }
          else if(filter.type=="W"){
             self.addWebsiteFilter(false,false,filter) 
          }
      })
      
  },
  initFilters:function(){
      var _target = this.$element
      _target.find(".filter-div ._row").remove()
      _target.find(".all-any button[rule='A']").click()
  },
  validate:function(total_rows){
      var isError = false
      for(var i=0;i<total_rows.length;i++){
          var filter = $(total_rows[i])
          if(filter.hasClass("filter")){
            if(filter.find(".fields").val()==""){
                this.options.app.showError({
                    control:filter.find(".field-container"),
                    message:this.options.app.messages[0].TRG_basic_no_field
                })
                isError = true
            }
            else{
                this.options.app.hideError({control:filter.find(".field-container")})
            }
            
            if(filter.find(".value-container").css("display")=="block" && filter.find(".matchValue").val()==""){
                 this.options.app.showError({
                    control:filter.find(".value-container"),
                    message:this.options.app.messages[0].TRG_basic_no_matchvalue
                })
                isError = true
            }
            else{
                this.options.app.hideError({control:filter.find(".value-container")})
            }
            //End of basic filter
          }
          else if(filter.hasClass("score")){
              if(filter.find(".scoreValue").val()==""){
                this.options.app.showError({
                    control:filter.find(".scoreValue-container"),
                    message:this.options.app.messages[0].TRG_score_novalue
                })
                isError = true
            }
            else{
                this.options.app.hideError({control:filter.find(".scoreValue-container")})
            }
            //End of score filter
          }
          else if(filter.hasClass("form")){
             if(filter.find(".forms-box").val()==""){
                this.options.app.showError({
                    control:filter.find(".forms-box-container"),
                    message:this.options.app.messages[0].TRG_form_noform
                })
                isError = true
            }
            else{
                this.options.app.hideError({control:filter.find(".forms-box-container")})
            }
          }
      }
      return isError
  },
  saveFilters:function(){
      var filters_post = {}
      var _target = this.$element;
      var self = this;
      var total_rows = _target.find(".filter-div ._row");
      filters_post["count"] = total_rows.length
      filters_post["applyRuleCount"]= _target.find(".all-any .btn.active").attr("rule")
      
      if(this.validate(total_rows)){return false}
      
      for(var i=0;i<total_rows.length;i++){
          var N = i+1
          var filter = $(total_rows[i])
          if($(total_rows[i]).hasClass("score")){
               filters_post[N+".filterType"]="S"
               filters_post[N+".scoreRule"]=filter.find(".condtion-box").val()
               filters_post[N+".scoreValue"]=filter.find(".scoreValue").val()
               if($(total_rows[i]).find(".condtion-box").val()=="incmore"){
                    filters_post[N+".scoreRange"]=filter.find(".scoreRange").val()
               }
          }
          else if($(total_rows[i]).hasClass("list")){
              filters_post[N+".filterType"]="L"
              filters_post[N+".listNumbers"]=filter.find(".check-list:checked").map(function(){ return $(this).val()}).get().join()
              filters_post[N+".subscribed"]=filter.find(".member-box").val()
              filters_post[N+".match"]=filter.find(".match-box").val()
          }
          else if($(total_rows[i]).hasClass("email")){
              filters_post[N+".filterType"]="E"
              filters_post[N+".emailCampType"]=filter.find(".campaign-source").val()
              filters_post[N+".emailFilterBy"]=filter.find(".filter-by").val()
              filters_post[N+".campaignNumber"]=filter.find(".campaign-list").val()
              if(filter.find(".campaign-list").val()!=="-1" && filter.find(".filter-by").val()=="CK"){
                filters_post[N+".articleNumber"]=filter.find(".campaign-url").val()
              }
              else{
                  filters_post[N+".articleNumber"]="-1";
              }
              var emailTimeSpan = filter.find(".emailTimeSpan").val()
              filters_post[N+".isEmailTimeSpan"]= ((emailTimeSpan!=="-1") ?"Y":"N")
              if(emailTimeSpan!=="-1"){
                  filters_post[N+".emailTimeSpan"]=emailTimeSpan
              }
              var emailFreq = filter.find(".emailFreq").val()
              filters_post[N+".isEmailFreq"]=((emailFreq!=="-1") ?"Y":"N")
              if(emailTimeSpan!=="-1"){
                  filters_post[N+".emailFreq"]=emailFreq
              }
          }
          else if($(total_rows[i]).hasClass("web")){
              filters_post[N+".filterType"]="W"
              filters_post[N+".webFilterBy"]=filter.find(".filter-box").val()
              if(filter.find(".filter-box").val()=="PU"){
                filters_post[N+".webURL"]=filter.find(".pagelink-box").val()
              }
              else if(filter.find(".filter-box").val()=="LF"){
                  filters_post[N+".linkIDFilterNum"]=filter.find(".linkfilter-box").val()
              }
              else if(filter.find(".filter-box").val()=="PT"){
                  filters_post[N+".linkFilterGroupId"]=filter.find(".pagetype-box").val()
              }
              var webTimeSpan = filter.find(".webTimeSpan").val()
              filters_post[N+".isWebTimeSpan"]= ((webTimeSpan!=="-1")?"Y":"N")
              if(webTimeSpan!=="-1"){
                  filters_post[N+".webTimeSpan"]=webTimeSpan
              }              
              var webFreq = filter.find(".webFreq").val()
              filters_post[N+".isWebFreq"]= ((webFreq!=="-1")?"Y":"N")
              if(webFreq!=="-1"){
                  filters_post[N+".webFreq"]= webFreq
              }
          }
          else if($(total_rows[i]).hasClass("form")){
              filters_post[N+".filterType"]="F"
              filters_post[N+".formId"]= filter.find(".forms-box").val()
              var formTimeSpan = filter.find(".formTimeSpan").val()
              filters_post[N+".isFormTimeSpan"]= ((formTimeSpan!=="-1")?"Y":"N")
              if(formTimeSpan!=="-1"){
                  filters_post[N+".formTimeSpan"]= formTimeSpan
              }
          }
          else if($(total_rows[i]).hasClass("filter")){
              filters_post[N+".filterType"]="P"                              
              filters_post[N+".fieldName"]= filter.find(".fields").val()
              filters_post[N+".rule"]= filter.find(".selectbox.rules").val()
              var rule_val = filter.find(".selectbox.rules").val()
              if(rule_val=="dr" || rule_val=="prior" || rule_val=="after" || rule_val=="dayof" || rule_val=="birthday" || rule_val=="pbday"){
                filters_post[N+".dateFormat"]= filter.find(".selectbox.formats").val()
                if(rule_val=="prior" || rule_val=="after" || rule_val=="pbday"){
                    filters_post[N+".gap"]= filter.find(".gap").val()
                }
                if(rule_val=="dr"){
                  filters_post[N+".matchValue"]= filter.find(".matchValue").val()   
                }
              }
              else{
                  filters_post[N+".matchValue"]= filter.find(".matchValue").val()              
              }
                            
              if(filter.find(".fields").val()=="{{SUBSCRIPTION_DATE}}"){
                   filters_post[N+".listNum"]=filter.find(".sub-date-container").attr("list_id")
              }
          }
      }
      /*Closing Filter Clickers*/
      self.closefilterBox();

      /**/
      return filters_post
  },
  saveCall:function(){
      
  },
    searchContacts:function(){
                //var filter = $(this.options.filterRow);
                var dialog = $('#subname-filters-dialog')
                var display = dialog.find('#filter_list_grid tr');
                var i = 0;
                $.each(display,function(k,v){
                    if($(v).css('display')=='table-row'){
                        i = i+1;
                    }
                });
                $('#total_subscriber strong').text(i);
                /*if(o.keyCode==13 && this.searchTxt){
                    if(this.searchTxt.indexOf("Tag: ")>-1){
                       var tagName = this.searchTxt.split(": ");
                       this.searchByTag(tagName[1]);
                    }
                    else{
                        this.fetchContacts();
                    }
                   
                }  */              
            },
             clearSearchLists:function(){
                  $('#total_subscriber strong').text($('#filter_list_grid tr').length);          
            }
  , getTimeSpan:function(val,count){
      var spanHTML = ""
      var selected_val = ""
      spanHTML +=''
      var counter = count ? count:30;
      for(var i=1;i<=counter;i++){         
         selected_val = (i==val) ?"selected":""
         spanHTML +='<option value="'+i+'" '+selected_val+'>'+i+'</option>'
      }
      return spanHTML
  }
  , getOptions: function (options) {
      options = $.extend({}, $.fn.filters.defaults, options)    
      return options
    }
  , showTooltips:function(filter){
      filter.find(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false})      
  }
  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    },
    icheckCreate: function(obj){
        //var filter = $(this.options.filterRow)
                obj.iCheck({
                          checkboxClass: 'checkpanelinput filtercheck',
                          insert: '<div class="icheck_line-icon" style="margin: 22px 0 0 10px;"></div>'
                        });
             obj.on('ifChecked', function(event){
                       $(event.target).parents("tr").addClass("selected");
                   });
              obj.on('ifUnchecked', function(event){
                       $(event.target).parents("tr").removeClass("selected");
                   });
    },
    closefilterBox : function(){
            var active_ws = $(".modal-body");
            active_ws.find('.filter-clickers').remove();
    },
    scrolling:function(dialog){
       var scrollVal = dialog.find('#filter_list_grid').parent().scrollTop();
        if (scrollVal>70) {
                          dialog.find(".stats-scroll").fadeIn('slow');
                       } else {
                          dialog.find(".stats-scroll").fadeOut('slow');
                    }
    },
    scrollingTop:function(dialog){
        dialog.find('#filter_list_grid').parent().animate({scrollTop:0},600);
    }
  }

 /* FILTER PLUGIN DEFINITION
  * ========================= */

  $.fn.filters = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('filters')
        , options = typeof option == 'object' && option
      if (!data) $this.data('filters', (data = new Filters(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.filters.Constructor = Filters

  $.fn.filters.defaults = {
    
    template: '<div class="timeline"><div class="filter-div"></div></div>'
  , toprow : '<div class="match filter_start">If <div class="btn-group all-any" data-toggle="buttons-radio"><button class="btn active" rule="A">All</button><button class="btn" rule="1">Any</button></div> of the Filter match below</div>'
  , bottomrow_c : '<div class="filter-row filter-menu addfilter"><ul></ul></div>'
  , filterRow : '<div class="filter-row _row"><div class="head-icon"><span class="icon filter"></span></div><div class="filter-cont"></div></div>'
  , filterFor : 'C'
  , title: ''
  , app:null
  }

}(window.jQuery);