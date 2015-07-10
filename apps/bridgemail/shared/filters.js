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
      
      this.select_html_formList = null;
      this.isScrollattachform = false; // Check if the scroll lazyloading is attach or not
      this.isScrollattachlist = false;
      this.isScrollattachlistFilter= false;
      //check if the scroll is position to selected list item
      this.scrolltoListView = false;
      this.scrolltoSubLisView = false;
      this.scrolltoFormListView = false;
      //Off Set flags
      this.offsetLengthformList = '';
      this.offsetLengthSubList = '';
      this.offsetLengthLists = '';
      this.isfilterfound = false;
      // Objects
      this.listsObj = {};
      this.webformsObj = {};
      this.subListObj = {};
      if(this.options.filterFor==="C"){
       // this.$element.find(".filter-div").append(this.options.toprow)
       // this.$element.find(".filter-div").find(".all-any").t_button()
        addFilterRow()
      } 
      function addFilterRow(){
        var  basicFilter = $('<li><a><span class="icon basic"></span> <strong class="filter">Basic Filter</strong> </a></li>')
        var  emailFilter = $('<li><a><span class="icon emailact"></span> <strong class="filter">Email Activity</strong></a></li>')
        self.listFilter = $('<li><a><span class="icon list"></span> <strong class="list">Lists</strong></a></li>')
        var  formFilter = $('<li><a><span   class="icon form"></span> <strong class="form" style="background: rgba(0, 0, 0, 0) none repeat scroll 0 0;">Form Submissions</strong></a></li>')
        var  websiteFilter = $('<li><a><span class="icon webaction"></span> <strong class="web">Website Actions</strong></a></li>')
        var  leadScoreFilter = $('<li><a><span class="icon score"></span> <strong class="score" style="color:#fff;">Lead Score</strong></a></li>')
        var tagFilter = $('<li data-type="tags"><a><span class="icon tags"></span><strong>Tags</strong></a></li>')
        var add_filter_row = $(self.options.bottomrow_c);
         
       
        //adding different filter to add row
        add_filter_row.find("ul").append(basicFilter)
        add_filter_row.find("ul").append(emailFilter)
        add_filter_row.find("ul").append(self.listFilter)
        add_filter_row.find("ul").append(formFilter)
        add_filter_row.find("ul").append(websiteFilter)
        add_filter_row.find("ul").append(leadScoreFilter)
        add_filter_row.find("ul").append(tagFilter)
        self.$element.find(".filter-div").append(add_filter_row)
         // Adding any/all options
          if(self.options.filterFor==="C"){
            self.$element.find(".filter-div .new_activities").prepend(self.options.toprow)
            self.$element.find(".filter-div").find("#all-any").chosen({width:'80px', "disable_search": true})
            //self.$element.find(".filter-div").find(".all-any").t_button()
         }
        //Attaching events to filter buttons
        basicFilter.on("click",$.proxy(self.addBasicFilter,self))
        emailFilter.on("click",$.proxy(self.addEmailFilter,self))
        self.listFilter.on("click",$.proxy(self.addListFilter,self))
        formFilter.on("click",$.proxy(self.addFormFilter,self))
        leadScoreFilter.on("click",$.proxy(self.addLeadScoreFilter,self))
        websiteFilter.on("click",$.proxy(self.addWebsiteFilter,self))
        tagFilter.on("click",$.proxy(self.addTagsFilter,self))
      }
      
      
      
    }
  , addBasicFilter:function(obj,e,params){
      var filter = $(this.options.filterRow)
      filter.addClass("filter darkblue")
      var list_div = '';
      var selected_field = "",selected_rule="",selected_formats="", matchValue="",gapValue = "0",list_html='<div class="btn-group sub-date-container" style="display:none"><a class="icon add-list"></a></div>',
          list_div = "<div class='subname-filters-dialog-class' id='subname-filters-dialog'><div id='show-loading' style='width:300px;height:300px;margin:0 auto;position:relative;display:none;'></div></div>",
          format_display="none",value_display="block",gap_display="none"
      //In case of edit set parameters    
      if(params){    
        matchValue = (params.matchValue)?params.matchValue:""
        gapValue = (params.spanInDays)?params.spanInDays:"0"
        if( params.fieldName=="{{SUBSCRIPTION_DATE}}"){
            this.subListObj['params']=params;
            this.subListObj['parentFilter']=filter;
            list_html = '<div class="btn-group sub-date-container" style="display:none;" data-sublist="'+params['triggerOrder']+'" list_id="'+params['listNumber.encode']+'" list_checksum="'+params['listNumber.checksum']+'"><a class="icon list"></a></div>'          
            list_div = "<div class='subname-filters-dialog-class' id='subname-filters-dialog'><div id='show-loading' style='width:300px;height:300px;margin:0 auto;position:relative;'></div></div>";
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
          filter_html +='<div class="btn-group rules-container"><div class="inputcont"><select id="basic-filter-options"  class="selectbox rules" disabled="disabled"><option value="">Loading...</option>'                      
          filter_html +='</select></div></div>'          
          filter_html += '<div class="btn-group days-container" style="display:'+gap_display+'"><div class="inputcont"><input type="text" value="'+gapValue+'" name="" class="gap" style="width:30px;" /></div></div>'
          filter_html +='<div class="btn-group formats-container" style="display:'+format_display+'"><div class="inputcont"><select class="selectbox formats" disabled="disabled"><option>Loading...</option>'                    
          filter_html +='</select></div></div>'
          filter_html += '<div class="btn-group value-container" style="display:'+value_display+'"><div class="inputcont"><input type="text" value="'+matchValue+'" name="" class="matchValue" style="width:240px;" /></div></div>'
          if(params && params.fieldName=="{{SUBSCRIPTION_DATE}}"){filter.append(list_div)}
          filter.append('<div class="icon basic"></div>');
          filter.find(".filter-cont").append(filter_html);
      //filter.find(".filter-cont").append('<span class="timelinelabel">Basic Filter</span>');  
      //Chosen with fields
      var self = this;
      filter.find(".fields").chosen({width:'200px'}).change(function(){
          if($(this).val()=="{{SUBSCRIPTION_DATE}}"){
              self.subListObj['parentFilter']=filter;
              filter.find(".sub-date-container").hide();
              filter.find("#subname-filters-dialog").show();
              self.subListObj['params']= "";
              $(this).parents('.filter-row').find('.icon.basic').before(list_div);
              this.offsetLengthSubList = 0;
              self.showDialog(false,filter);
              self.isScrollattachlist = false;
          }
          else{
              filter.find(".sub-date-container").hide();
              filter.find("#subname-filters-dialog").hide();
              filter.find("#subname-filters-dialog").remove();
          }
          if($(this).val()=="{{SUBSCRIPTION_DATE}}" || $(this).val()=="{{BIRTH_DATE}}" ){
              filter.find(".formats-container").show()
              filter.find('#basic-filter-options option:nth-child(3)').hide().trigger("chosen:updated");
              filter.find('#basic-filter-options option:nth-child(4)').hide().trigger("chosen:updated");
               filter.find('#basic-filter-options option:nth-child(8)').hide().trigger("chosen:updated");
          }
          else{
              filter.find(".formats-container").hide()
              filter.find('#basic-filter-options option:nth-child(3)').show().trigger("chosen:updated");
              filter.find('#basic-filter-options option:nth-child(4)').show().trigger("chosen:updated");
               filter.find('#basic-filter-options option:nth-child(8)').show().trigger("chosen:updated");
          }
          if($(this).val()=="{{SUBSCRIPTION_DATE}}"){
                 filter.find('#basic-filter-options').val('dayof').trigger("chosen:updated")
                 filter.find(".formats-container").hide()  
                 filter.find(".value-container,.days-container").hide()
                 
             }else if($(this).val()=="{{BIRTH_DATE}}"){
                filter.find('#basic-filter-options').val('birthday').trigger("chosen:updated")
                filter.find(".formats-container").hide() 
                filter.find(".value-container").hide()    
            }else{
                 filter.find('#basic-filter-options').val('=').trigger("chosen:updated")
                 filter.find(".formats-container").show()  
                 filter.find(".value-container").show()  
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
                    filter.find(".formats-container").show();
                    
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
      
     
      this.addActionBar(filter,'Basic Filter')
      this.$element.find(".addfilter").before(filter)
      this.showTooltips(filter)
      
      // Hide the fields for Birthday and Subscriber 
      if(params){
          
          if( params.fieldName=="{{SUBSCRIPTION_DATE}}" || params.fieldName=="{{BIRTH_DATE}}"){
            if(params.rule!=="dr"){
                       filter.find(".formats-container").hide().trigger("chosen:updated");
             }
            this.showDialog(false,filter);
        }
      }
      
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
                     // Hide the fields for Birthday and Subscriber \
                     if(params){
                         if( params.fieldName=="{{SUBSCRIPTION_DATE}}" || params.fieldName=="{{BIRTH_DATE}}"){
                            filter.find('#basic-filter-options option:nth-child(3)').hide().trigger("chosen:updated");
                            filter.find('#basic-filter-options option:nth-child(4)').hide().trigger("chosen:updated");
                            filter.find('#basic-filter-options option:nth-child(8)').hide().trigger("chosen:updated");
                         }
                     }
                    
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
      filter.addClass("email blue")
      var selected_camp = "",selected_article = "";
      var mapValue = ''; // 
      var self = this
      var filter_html = '<div class="row"><label style="width: 120px;">Filter by</label>'
           filter_html += ' <div class="btn-group "><select data-placeholder="Select Filter by" class="filter-by"><option value="OP">Email Opened</option><option value="CK">Email Clicked</option><option value="NC">Non Clickers</option></select></div>'
           filter_html += '</div>'
       filter_html += '<div class="row">'
            filter_html += '<label style="width: 120px;">Campaign</label>'            
            filter_html += ' <div class="btn-group "><select data-placeholder="Any Campaign" class="chosen-select campaign-source"><option value=""></option><option value="N" selected>Campaigns</option><option value="A">Auto Trigger</option><option value="T">Nurture Track</option><option value="W">Workflow</option><option value="B">Autobot</option></select></div>'  
            filter_html += '<div class="btn-group "><select data-placeholder="Select Campaign" class="campaign-list">'  
                  filter_html +='<option value="-1">Any Campaign</option>'  
                  var campaigns_array =this.options.app.getAppData("campaigns")   
                  filter_html +='<option value=""></option>'
                  /*$.each(campaigns_array.campaigns[0], function(index, val) {
                      filter_html +='<option value="'+val[0].campNum+'">'+val[0].name+'</option>'
                  })*/
                  
            filter_html +='</select></div>'
            filter_html += '<a  class="icon view showtooltip preview-campaign" title="Preview Campaign" ></a></div>'
            
           
          filter_html += '<div class="row nolabel campaign-url-container" style="display:none"><label style="width: 9px; visibility: hidden;">test</label><div class="btn-group "><select data-placeholder="Select URL" class="campaign-url"></select></div>'              
          filter_html += '<a  class="icon view showtooltip" title="Preview Link"></a></div>'
          filter_html += '<div class="row match"> <em class="text">happens in last</em> '
          filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan emailTimeSpan">'+this.getTimeSpan(30,90)+'</select><em class="text">days</em></div> '  
          filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan emailFreq">'+this.getTimeSpan(1)+'</select><em class="text">or more times</em></div> '  
          
          filter_html += '</div>'
      filter.append('<div class="icon open"></div>');        
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
          var campainVal =$(this).val();
          filter.find(".campaign-list").html("<option value='-1'>Loading...</option>").prop("disabled",true).trigger("chosen:updated")
          var map ={N:"listNormalCampaigns",A:"listAutoTriggerCampaigns",W:"listWorkflowsCampaigns",T:"listNurtureTracksCampaigns",B:"listAutobotCampaigns"}
          mapValue = $(this).val();
          var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+self.options.app.get('bms_token')+"&type="+map[$(this).val()]+"&status=A&bucket=20&offset=0";                                                                                
            jQuery.getJSON(URL,  function(tsv, state, xhr){
                if(xhr && xhr.responseText){
                    var _json = jQuery.parseJSON(xhr.responseText);
                    if(self.options.app.checkError(_json)){
                          return false;
                     } 
                     filter.find(".campaign-source").parent().find(".chosen-container .loading-wheel").remove()
                     filter.find(".campaign-source").prop("disabled",false).trigger("chosen:updated")
                     if(campainVal == "N"){
                        var select_html = '<option value="-1">Any Campaign</option>' 
                     }else if(campainVal == "B"){
                         var select_html = '<option value="-1">Any Autobot</option>'
                     }else if(campainVal == "A"){
                         var select_html = '<option value="-1">Any Auto Trigger</option>'
                     }else if(campainVal == "W"){
                         var select_html = '<option value="-1">Any Workflows</option>'
                     }else if(campainVal == "T"){
                         var select_html = '<option value="-1">Any Nurture Track</option>'
                     }
                     if(_json.count!=="0"){
                        var camp_list = _json.lists || _json.campaigns
                        $.each(camp_list[0], function(index, val) {    
                            var _checksum = val[0].md5 || val[0]["campNum.checksum"]
                            selected_camp = (params && params["campaignNumber.checksum"]==_checksum)?"selected":""
                            var _value = val[0]["campNum.encode"] || val[0]["campNum"]
                            if(val[0]["isTextOnly"]){
                            select_html += '<option value="'+_value+'" '+selected_camp+' data-istext="'+val[0]["isTextOnly"]+'">'+val[0].name+'</option>'
                            }
                            else{
                                select_html += '<option value="'+_value+'" '+selected_camp+'>'+val[0].name+'</option>'
                            }
                        })
                     }
                    
                     filter.find(".campaign-list").html(select_html).prop("disabled",false).trigger("chosen:updated")
                     if( filter.find(".campaign-list").find("option").length < parseInt(_json.totalCount)){
                                    filter.find(".campaign-list").find("option:last-child").attr("data-load","true");
                             }
                      // 
                     
                     if(params && params["campaignNumber.checksum"]){
                         if(filter.find(".campaign-source").val()==="N"){
                           filter.find(".campaign-list").attr("data-selected",self.options.app.decodeHTML(params['campaignNumber.checksum']));
                           filter.find(".campaign-list").trigger("chosen:select")
                        }
                       filter.find(".campaign-list").change()
                     }
                     
                }
            }).fail(function() { console.log( "error campaigns listing" ); });
            
           
      })
      if(filter.find(".campaign-source").val()==="N"){
            filter.find(".campaign-list").chosen({width:"400px",is_remote:true
                                           ,remote_url:"/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+self.options.app.get('bms_token')+"&type=listNormalCampaigns&status=A&bucket=20",
                                           page_urls : '',
                                           is_remote_type:'campaings'
                                                            }).change(function(){
                            $(this).val($(this).val())
                            $(this).trigger("chosen:updated")
                        })
      }
      
       // Preview campaign 
          filter.find(".preview-campaign").click(function(){
              var obj = {};
              obj["currview"] = self;
              if($( ".campaign-list option:selected" ).val() != -1){
                  obj['camp_id'] = $( ".campaign-list option:selected" ).val();
                  obj['camp_name'] = $( ".campaign-list option:selected" ).text();
                  if(mapValue==="N"){
                      obj['isTextOnly'] = $( ".campaign-list option:selected" ).data('istext'); 
                  }else{
                      obj['isTextOnly'] = "N";
                  }
                  self.options.app.previewCCampaign(obj);
              } 
              
          });
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
      this.addActionBar(filter,'Email Activity');
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
    addListFilter:function(obj,e,params){
      if(obj){
          this.isScrollattachlistFilter = false;
      }
      this.listFilter.find("a.btn-green").addClass("saving");
      var self = this;
      var filter = $(this.options.filterRow)      
      filter.addClass("list");
      
      if(params){
                  var filterClass = (params['triggerOrder'])? '_list_grid-'+params['triggerOrder'] : '';
                  //var searchDiv = (self.subListObj.params['triggerOrder'])? 'listssearch-'+self.subListObj.params['triggerOrder'] : 'listssearch';
              }else{
                  filterClass =''; 
                 // searchDiv ='listssearch';
              }
      
      var filter_html = '<div class="row temp-filters"><label style="display:none;">Filter by</label>'
          filter_html += '<div class="match" style="margin-bottom:0px;margin-left: 5px;float:left"> <em class="text">Match</em> '
          filter_html += '<div class="btn-group"><span class="lists-all-any filt" style="display:none;width:72px;">All</span><select id="lists-all-any-selectbox" class="match-box"><option value="Y">All</option><option value="N">Any</option></select></div> '                
          filter_html += ' <div class="btn-group "><select class="member-box"><option value="Y">Member</option><option value="N">Non Member</option></select></div> <em class="text">of the selected list(s).</em>'
          filter_html += '</div>'
          filter_html += '</div>'          
          filter_html += '<div class="template-container"><div class="row temp-filters"><h2 style="margin-left: 15px;margin-top: 4px;" id="total_subscriber_lists"><strong class="badge">0</strong><span>lists found</span></h2><h2 class="header-list" style=" float: right;margin-right: 5px;margin-top: 2px;background-color:transparent"><a style="margin: -4px 2px;display:none;" data-original-title="Refresh listing" class="refresh_btn showtooltip list-refresh"><i>Refresh</i></a>&nbsp; <div class="input-append search"></div></h2></div><div class="target-listing"  style="margin-top:9px">'
          filter_html += '<div class="bmsgrid" style="overflow:inherit!important;"><div class="hDiv"><div class="hDivBox"><table cellspacing="0" cellpadding="0"></table></div></div><div class="bDiv" style="height: 320px;"><table cellpadding="0" cellspacing="0" width="100%" id="__list_grid" class="listsgrid '+filterClass+'" ><tbody>'
          filter_html += '</tbody></table></div><button class="stats-scroll ScrollToTop" type="button" style="display: none; position:absolute;bottom:5px;right:20px;"></button></div>'
          filter_html += '</div></div>'
          filter.append('<div class="icon list"></div>');            
          filter.find(".filter-cont").append(filter_html);
          
          
          
          filter.find(".member-box").chosen({disable_search: "true",width:"200px"}).change(function(){
          $(this).val($(this).val())
          $(this).trigger("chosen:updated")
          if($(this).val()==="N"){
              filter.find('#lists-all-any-selectbox').val('Y').trigger("chosen:updated")
              filter.find('#lists_all_any_selectbox_chosen').hide();
              filter.find('.lists-all-any').show();
          }else{
              filter.find('#lists-all-any-selectbox').val('Y').trigger("chosen:updated")
              filter.find('#lists_all_any_selectbox_chosen').show();
              filter.find('.lists-all-any').hide();
          }
          
      }) 
      filter.find(".search").searchcontrol({
                id:'list-search',
                width:'300px',
                height:'22px',
                tdNo:2,
                placeholder: 'Search Lists',
                //gridcontainer: filter.find(".target-listing"),
                showicon: 'yes',
                iconsource: 'list',
                searchFunc: $.proxy(this.searchList, this,filter),
                clearFunc: $.proxy(this.clearSearchList, this,filter),
                
         });
     
      filter.find('#__list_grid').parent().on('scroll', function () {
                    self.scrolling(filter,'listfilter');
                });
      
             filter.find('.stats-scroll').click(function(){
                    self.scrollingTop(filter,'listfilter');
             });
      
      this.addActionBar(filter,'Lists')      
      this.$element.find(".addfilter").before(filter)
      this.showTooltips(filter)
      this.listsObj['filter'] = filter;
      this.listsObj['params'] = params;
      if(params){
       filter.attr('checksumlists',params["listNumbers.checksums"]);   
      }
      this.loadLists(false,filter,params);
    },
    loadLists:function(fcount,filter,params,searchtext){
        var self = this;
         var filter = filter;
         var searchtext = (searchtext)?searchtext:"";
        var params = params;
        if (!fcount || this.offsetLengthLists===0) {
                        this.offsetLengthLists = 0;
                        this.options.app.showLoading("Loading Lists...", filter.find('#__list_grid'));
                        filter.find('#__list_grid .loading p').css({'margin-left':'-150px','margin-right':'0'});
                        filter.find('#__list_grid tbody').html('');
                       // this.$(".notfound").remove();

                    }
                    else {
                        //this.offset = parseInt(this.offset) + this.offsetLength;
                        
                        filter.find("#__list_grid tbody").append('<tr class="loading-campagins"><td colspan="3"><div class="loadmore"><img src="img/loading.gif" alt=""/><p style="float:none;">Please wait, loading more Lists.</p></div></td></tr>');
                    }
        if(searchtext){
            var URL = "/pms/io/list/getListData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=batches&offset="+self.offsetLengthLists+"&searchText="+searchtext;
        }else{
            var URL = "/pms/io/list/getListData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=batches&offset="+self.offsetLengthLists;
        }
        
       $.ajax({
            url: URL,
            dataType: 'json',
//            async: true,
            type:'GET',
            success: function(data) {
                      //  console.log('need to checj');
                    self.offsetLengthLists = data.nextOffset;
                    self.options.app.showLoading(false, filter.find('#__list_grid'));
                    if(data.totalCount !== "0"){
                        
                     self.generateListFilter(data,filter,params);
                    }else{
                        console.log('no record found');
                    }
              }
        })
    }
    ,searchList : function(filter,o,txt){
        
       this.listsObj['searchText'] = txt;
        this.offsetLengthLists =0;
        this.loadLists(this.offsetLengthLists,filter,this.listsObj.params,this.listsObj['searchText']);
    }
    ,clearSearchList: function(filter){
        this.offsetLengthLists =0;
        this.listsObj['searchText'] = "";
        this.loadLists(this.offsetLengthLists,filter,this.listsObj.params);
    }
  , generateListFilter : function(list_array,filter,params){
      var self = this;
      var filter_html;
      if(this.listsObj.searchText){
          filter.find('#__list_grid').html('');
      }
      
      
      filter.find('#total_subscriber_lists strong').html(list_array.totalCount);
      
      $.each(list_array.lists[0], function(index, val) {     
                        filter_html += '<tr id="row_'+val[0]["listNumber.encode"]+'" checksum="'+val[0]["listNumber.checksum"]+'">';      
                        filter_html +='<td width="100px"><div><input class="check-list" type="checkbox" value="'+val[0]["listNumber.encode"]+'" list_checksum="'+val[0]["listNumber.checksum"]+'" /></div></td>'
                        filter_html += '<td width="100%"><div><div class="name-type"><h3 class="lists-name">'+val[0].name+'</h3><div class="tags tagscont">'+self.options.app.showTags(val[0].tags)+'</div></div></div></td>';                        
                        filter_html += '<td width="100px"><div><div class="subscribers" style="min-width:80px"><span  class=""></span>'+self.options.app.addCommas(val[0].subscriberCount)+'</div><div id="'+val[0]["listNumber.encode"]+'" class="action"><a class="btn-green"><span>Use</span><i class="icon next"></i></a></div></div></td>';                        
                        filter_html += '</tr>';
                        
                    });
       
       filter.find('.loading-campagins').remove();
       filter.find('#__list_grid').append(filter_html);  
      
      if(this.listsObj.searchText){
                        filter.find("#__list_grid tr").each(function(k,val){
                            $(this).find(".lists-name").highlight($.trim(self.listsObj.searchText))
                            $(this).find(".taglink").highlight($.trim(self.listsObj.searchText));
                           });
                           var list_arr = filter.attr('checksumlists').split(',');
                            $.each(list_arr,function(k,v){
                                //filter.find("#__list_grid input[list_checksum='"+v+"']").prop("checked",true).parents("tr").addClass("selected")               
                                filter.find("#__list_grid input[list_checksum='"+v+"']").parents("tr").addClass("selected")  
                                filter.find("#__list_grid input[list_checksum='"+v+"']").parents("tr").find('.check-list').iCheck('check');
                              });
                }
      
      if(self.offsetLengthLists !== "-1"){
          filter.find("#__list_grid tbody tr").last().attr("data-load", "true");
        }    
    
      
       if(!this.isScrollattachlistFilter){ 
            filter.find("#__list_grid").parent().scroll($.proxy(this.liveLoadingList, this,filter,'#__list_grid',params));
            this.isScrollattachlistFilter = true;
         }
      filter.find(".match-box").chosen({disable_search: "true",width:"100px"}).change(function(){
          $(this).val($(this).val())
          $(this).trigger("chosen:updated")
      })
      
      
        /*ICHECK IMPLEMENTATION BY ABDULLAH*/
            if(filter.find('#__list_grid .check-list').iCheck){
             self.icheckCreate(filter.find('#__list_grid .check-list'));
         }
      /*Ends*/
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
      if(params && params['isMemberOfList']==="false"){
                                filter.find('#lists_all_any_selectbox_chosen').hide();
                                filter.find('.lists-all-any').show();
                            }
      if(params && !this.listsObj.searchText){ 
           var isMemberOfList = params.isMemberOfList=="false"?"N":"Y"
           filter.find(".member-box").val(isMemberOfList).trigger("chosen:updated")
           var matchAll = params.matchAll=="false"?"N":"Y"
           filter.find(".match-box").val(matchAll).trigger("chosen:updated");
          
           var list_arr = filter.attr('checksumlists').split(',');
           
           $.each(list_arr,function(k,v){
               //filter.find("#__list_grid input[list_checksum='"+v+"']").prop("checked",true).parents("tr").addClass("selected")               
               filter.find("#__list_grid input[list_checksum='"+v+"']").parents("tr").addClass("selected")  
               filter.find("#__list_grid input[list_checksum='"+v+"']").parents("tr").find('.check-list').iCheck('check');
           });
           
            filter.find(".filtercheck").on('ifUnchecked', function(event){
                if(params){
                    //var list_arr = params["listNumbers.checksums"].split(",")
                    var uncheckVal = $(event.target).parents("tr").attr('checksum');
                    $.each(list_arr,function(key,val){
                        if(uncheckVal === list_arr[key]){
                            list_arr.splice(key, 1)
                        }
                    });
                    
                    filter.attr('checksumlists',list_arr.join());
                }
                
              });
           
           $.each($('#__list_grid .selected'),function(k,v){
              $(this).find('.check-list').iCheck('check');
           })
           
           if(list_arr[0] && filter.find('#__list_grid input[list_checksum='+list_arr[0]+']').length == 0){
               this.options.app.showLoading("Loading Lists...", filter.find('#__list_grid'));
                    filter.find('#__list_grid .loading p').css({'margin-left':'-150px','margin-right':'0'});
               self.loadLists(self.offsetLengthLists,filter,params)
           }else{
               
               $.each(list_arr,function(k,v){
                    //filter.find("#__list_grid input[list_checksum='"+v+"']").prop("checked",true).parents("tr").addClass("selected")               
                    filter.find("#__list_grid input[list_checksum='"+v+"']").parents("tr").addClass("selected");  
                    filter.find("#__list_grid").addClass('scrollapplied');
                    filter.find("#__list_grid input[list_checksum='"+v+"']").parents("tr").find('.check-list').iCheck('check');
                });
               
                if(!self.scrolltoListView)
                {
                    
                    filter.find("#__list_grid input[list_checksum="+list_arr[0]+"]").parents("tr").scrollintoview();
                    if(self.$element.find('.listsgrid').length ===  self.$element.find('.listsgrid.scrollapplied').length){
                        self.scrolltoListView = true; 
                    }
                    
                }
               
           }
      }
      //highlight the search text 
     
      this.listFilter.find("a.btn-green").removeClass("saving")
  }
  , addFormFilter:function(obj,e,params){
      this.isScrollattachform = false;
      this.offsetLengthformList =0;
      if(obj){
           this.isScrollattachform = false;
      }
      var filter = $(this.options.filterRow)
      var select_form = ""
      filter.addClass("form yellow").css('background','#fff');
      var self = this;
      var filter_html_tb='';
      var filter_html = '<div class="row"><label style="display:none;">Submitted Form</label>'
        filter_html += '<div class="row"> <em class="text">Happened in last</em> '
        filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan formTimeSpan">'+this.getTimeSpan(30,90)+'</select></div> <em class="text">days</em>'                  
        filter_html += '</div>'
        filter_html += '</div>'          
        filter_html += '<div class="row" style=""><div class="btn-group forms-box-container" style="display:none;"><div class="inputcont"><select data-placeholder="Select Webform" disabled="disabled" class="forms-box"><option value="-1">Loading Web Forms...</option></select></div></div></div>'
      filter.append('<div class="icon form2"></div>');                
       filter.find(".filter-cont").append(filter_html);
    
      
      filter_html_tb = '<div class="webforms-container"><div class="inputcont"><div class="template-container"><div class="row temp-filters"><h2 style="margin-left: 15px;margin-top: 4px;" id="total_form_subscriber"><strong class="badge">0</strong><span>lists found</span></h2><h2 class="header-list" style=" float: right;margin-right: 5px;margin-top: 2px;background-color:transparent"><a style="margin: -4px 2px;display:none;" data-original-title="Refresh listing" class="refresh_btn showtooltip list-refresh"><i>Refresh</i></a>&nbsp; <div id="formlistsearch" style="margin:0;" class="input-append search"></div></h2></div><div class="target-listing" id="filter-forms" style="margin-top:9px"><div class="bmsgrid"><div class="hDiv"><div class="hDivBox"><table cellspacing="0" cellpadding="0"></table></div></div>'
      filter_html_tb += '<div class="bDiv" style="height: 320px;"> <table cellpadding="0" cellspacing="0" width="100%" id="__form_grid"><tbody>'
       
      filter_html_tb += '</tbody></table></div><button class="stats-scroll ScrollToTop" type="button" style="display: none; position:absolute;bottom:5px;right:20px;"></button></div>'
      filter_html_tb += '</div></div></div></div>'
      filter.find(".filter-cont").append(filter_html_tb);
      
      
      filter.find(".search").searchcontrol({
                id:'form-search',
                width:'250px',
                height:'22px',
                placeholder: 'Search Forms',
                //gridcontainer: 'filter-forms',
                showicon: 'yes',
                iconsource: 'sforms',
                closeiconid: 'dialoglistssearch',
                searchFunc: $.proxy(self.searchWebforms,self,filter),
                clearFunc:$.proxy(self.clearWebforms,self,filter)
         }); 
      
      this.LoadFormList(false,filter,params);
      filter.find(".forms-box").chosen({width:"300px"})      
      filter.find(".timespan").chosen({disable_search: "true",width:"80px"}).change(function(){
          $(this).val($(this).val())
          $(this).trigger("chosen:updated")
      })
      
      
      
      this.addActionBar(filter,'Form Submission')
      this.$element.find(".addfilter").before(filter)
      this.showTooltips(filter)
       
       if(params){ 
           if(params.isTimeSpan=="true"){
              filter.find(".formTimeSpan").val(params.timeSpanInDays).trigger("chosen:updated")
          } 
       }
      this.webformsObj['filter'] = filter;
      this.webformsObj['params'] = params;
      
      if(!this.isScrollattachform){ 
             filter.find("#__form_grid").parent().scroll($.proxy(this.liveLoadingForm, this,filter,params));
             this.isScrollattachform = true;
             filter.find('#__form_grid').parent().on('scroll', function () {
                    self.scrolling(filter,'formlist');
                });
             filter.find('.stats-scroll').click(function(){
                    self.scrollingTop(filter,'formlist');
             });
         }
    }  
    ,
    searchWebforms : function(filter,o,txt){
        
       this.webformsObj['searchText'] = txt;
        this.offsetLengthformList =0;
        this.LoadFormList(this.offsetLengthformList,filter,this.webformsObj.params,this.webformsObj['searchText']);
    }
    ,clearWebforms: function(filter){
        this.offsetLengthformList =0;
        this.webformsObj['searchText'] = "";
        this.LoadFormList(this.offsetLengthformList,filter,this.webformsObj.params);
    } 
   ,LoadFormList : function(fcount,filter,params,searchtext){
      var select_form = ""
      var self = this;
      var filter_html_tb;
      var searchtxt = (searchtext)?searchtext:"";
      var _json = '';
      if (!fcount) {
                        this.offsetLengthformList = 0;
                        this.options.app.showLoading("Loading forms...", filter.find('#__form_grid'));
                        filter.find('#__form_grid .loading p').css({'margin-left':'-150px','margin-right':'0'});
                        filter.find('#__form_grid tbody').html('');
                    }
                    else {
                        filter.find("#__form_grid tbody").append('<tr class="loading-campagins"><td colspan="2"><div class="loadmore"><img src="img/loading.gif" alt=""/><p style="float:none;">Please wait, loading more forms.</p></div></td></tr>');
                    }
     
            if(searchtxt){
                var URL = "/pms/io/form/getSignUpFormData/?BMS_REQ_TK="+self.options.app.get('bms_token')+"&type=search&offset="+self.offsetLengthformList+"&searchText="+searchtxt;                 
            }else{
                var URL = "/pms/io/form/getSignUpFormData/?BMS_REQ_TK="+self.options.app.get('bms_token')+"&type=search&offset="+self.offsetLengthformList                   
            }
            jQuery.getJSON(URL,  function(tsv, state, xhr){
              if(xhr && xhr.responseText){
                  _json = jQuery.parseJSON(xhr.responseText);
                  if(self.options.app.checkError(_json)){
                        return false
                   } 
                   if(!self.isScrollattachform){
                       filter.find(".forms-box").html('');
                       self.select_html_formList = '<option value=""></option>'  
                   }   
                   if(self.webformsObj.searchText){
                        filter.find('#__form_grid tbody').html('');
                    }
                   if(_json.totalCount!=="0"){
                      filter.find('.loading-campagins').remove();
                      self.options.app.showLoading(false, filter.find('#__form_grid'));
                      $.each(_json.forms[0], function(index, val) {    
                          var _value = val[0]["formId.encode"] 
                          select_form = (params && params['formNumber.checksum']==val[0]["formId.checksum"]) ? "selected" : ""
                          if(select_form){
                              self.select_html_formList += '<option value="'+_value+'" '+select_form+' webform_checksum="'+val[0]["formId.checksum"] +'">'+val[0].name+'</option>'
                              filter.find(".forms-box").addClass('formlistadded');
                          }else{
                              self.select_html_formList += '<option value="'+_value+'" webform_checksum="'+val[0]["formId.checksum"] +'">'+val[0].name+'</option>'
                          }
                          
                          self.webforms.push({"id":_value,"name":val[0].name,checksum:val[0]["formId.checksum"]})
                      })
                    
                      $.each(_json.forms[0], function(index, val) {
                          var _value = val[0]["formId.encode"] 
                          select_form = (params && params['formNumber.checksum']==val[0]["formId.checksum"]) ? "selected" : "";
                          
                         filter_html_tb += '<tr id="row_'+_value+'"  class="'+select_form+'" webform_checksum="'+val[0]["formId.checksum"]+'">';
                         filter_html_tb += '<td width="100%"><div><div class="name-type"><h3 class="forweb-list">'+val[0].name+'</h3></div></div></td>';                        
                         filter_html_tb += '<td width="100px"><div><div class="subscribers show" style="min-width:70px;visibility:hidden;"><span  class=""></span>33</div><div id="'+_value+'" class="action"><a class="btn-green"><span>Use</span><i class="icon next"></i></a></div></div></td>';                        
                         filter_html_tb += '</tr>';
                          //self.webforms.push({"id":_value,"name":val[0].name,checksum:val[0]["formId.checksum"]})
                      })  
                      filter.find(".forms-box").append(self.select_html_formList).prop("disabled",false).trigger("chosen:updated")
                      filter.find("#total_form_subscriber strong").html(_json.totalCount);
                      self.offsetLengthformList = _json.nextOffset;
                      self.generateFormTab(filter,filter_html_tb,params);
                   }else{
                       filter.find('.loading').remove();
                       filter.find("#__form_grid tbody").append('<tr class=""><td colspan="2"><div class=""><p style="float: none; text-align: center;">No forms can be found</p></div></td></tr>');
                   }                   
                  
              }
          }).fail(function() { console.log( "error campaign listing" ); })
   }
  , generateFormTab:function(filter,filter_html_tb,params){
         var self = this;
                  
       
        filter.find("#__form_grid tbody").append(filter_html_tb);
        if(this.webformsObj.searchText){
                         if(this.webformsObj.searchText){
                                filter.find("#__form_grid tr").each(function(k,val){
                                    $(this).find(".forweb-list").highlight($.trim(self.webformsObj.searchText));
                                    $(this).find(".taglink").highlight($.trim(self.listsObj.searchText));
                                   });
                           }
                        
                      //  filter.find(".taglink").highlight($.trim(self.listsObj.searchText));
                   
                }
        if(self.offsetLengthformList !== "-1"){
          filter.find("#__form_grid tbody tr").last().attr("data-load", "true");
        }else{
            this.offsetLengthformList=0;
        }
        
          
       
        //$(window).resize(_.bind(this.liveLoading, this));
          filter.find("#__form_grid .action").click(function(){            
             filter.find('.forms-box').val($(this).attr("id")).trigger("chosen:updated");
             filter.find("#__form_grid tr").removeClass("selected");
             $(this).parents("tr").addClass("selected");
             filter.attr('selected_checksum',$(this).parents("tr").attr('webform_checksum'));
            // dialog.hide();
         })
         if(filter.attr('selected_checksum')){
             filter.find("#__form_grid tr[webform_checksum='"+filter.attr('selected_checksum')+"']").addClass("selected")
         }
        
        if(params && !self.webformsObj.searchText){
            if(params && params['formNumber.checksum'] && filter.find("#__form_grid tr.selected").length == 0 ){
                               //console.log('calling for ajax');
                               self.options.app.showLoading("Loading forms...", filter.find('#__form_grid'));
                               filter.find('#__form_grid .loading p').css({'margin-left':'-150px','margin-right':'0'});
                               self.LoadFormList(self.offsetLengthformList,filter,params) 
                             }else if(params && filter.find("#__form_grid tr.selected").length > 0 && !filter.hasClass('scrolltoview')){
                               
                                             filter.find("#__form_grid tr.selected").scrollintoview();
                                             filter.addClass('scrolltoview');
                                            self.scrolltoFormListView = true; 
                                
                             }
                             
                             
        }
        
        
  },
 
  liveLoadingForm: function (filter,params) { 
                    var $w = $(window);
                    var th = 200;
                    var inview = filter.find("#__form_grid tbody tr:last").filter(function () {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$element.find("#__form_grid").parent().height() > 0) {
                        inview.removeAttr("data-load");
                        this.select_html_formList = null;
                        this.LoadFormList(this.offsetLengthformList,filter,params);
                      
                    }
                }
  , addLeadScoreFilter:function(obj,e,params){
      var filter = $(this.options.filterRow)
      filter.addClass("score");
      var filter_html = '<label style="width:120px;">Score</label>'
      filter_html += '<div class="btn-group "><select class="condtion-box">'
      filter_html += '<option value="eq">equals</option><option value="less">less than</option><option value="gr8">greater than</option><option value="btw">between</option><option value="incmore">increase more than</option>'
      filter_html += '</select></div>'  
      filter_html += '<div class="btn-group scoreValue-container"><div class="inputcont"><input type="text" value="" name="" style="width:50px;" class="scoreValue" /></div></div>'
      filter_html += '<div class="match row days-container" style="display:none;clear:both;margin-left:145px;padding-top:10px;"> in last '
            filter_html += '<div class="btn-group "><select class="timespan scoreRange">'+this.getTimeSpan(30)+'</select></div> days'                  
      filter_html += '</div>'
      filter.append('<div class="icon score"></div>');            
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
      this.addActionBar(filter,'Lead Score')
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
      filter.addClass("web blue")
      var selected_link="",selected_ptype="",selected_linkfilter=""
      // Loading Page url, page types and link filters data
      var URL = ""
      var self = this
      var filter_html = '<div class="row"><label style="display:none">Filter by</label>'
          filter_html += ' <div class="btn-group "><select data-placeholder="" class="filter-box">'
          filter_html += '<option value="WV" selected>Web Visit</option><option value="PU">Page URL</option><option value="PT">Page Type</option><option value="LF">Link Filter</option>'
          filter_html += '</select></div>'
          filter_html += '<div class="pagelink-box-container" style="display:none">'
            filter_html += '<label style="display:none">Filter URL</label>'
            filter_html += '<div class="btn-group "><select data-placeholder="Select Page Link" class="pagelink-box" disabled="disabled"><option value="">Loading Page URL... </option></select></div>'                        
          filter_html += '</div>'
          filter_html += '<div class="pagetype-box-container" style="display:none">'
            filter_html += '<label style="display:none">Page Type</label>'
            filter_html += '<div class="btn-group "><select data-placeholder="Select Page Types" class="pagetype-box" disabled="disabled">'
            filter_html += '<option value="">Loading Page Types... </option>'
            filter_html += '</select></div>'                        
          filter_html += '</div>'
          filter_html += '<div class=" linkfilter-box-container" style="display:none">'
            filter_html += '<label style="display:none">Link Filter</label>'
            filter_html += '<div class="btn-group "><select data-placeholder="Select Link Filter" class="linkfilter-box" disabled="disabled">'
            filter_html += '<option value="">Loading Link Filters... </option>'
            filter_html += '</select></div>'                        
          filter_html += '</div>'
          filter_html += '<div class=""> <em class="text">in last</em> '
                filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan webTimeSpan">'+this.getTimeSpan(30,90)+'</select></div> <em class="text">days</em>'  
                filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan webFreq">'+this.getTimeSpan(1)+'</select></div> <em class="text">or more times</em>'  
          filter_html += '</div>'
          
          filter_html += '</div>'  // end of class row
          
          
          
          
      filter.append('<div class="icon pageview"></div>')    
      filter.find(".filter-cont").append(filter_html)
      filter.find(".filter-box").chosen({disable_search: "true",width:"220px"}).change(function(){
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
      this.addActionBar(filter,'Website Action')
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
  , addActionBar:function(filterRow,filterType){
					
      var action =  $('<div class="btm-bar "><div class="filter_type"><span class="">'+filterType+'</span></div></div>')            
      var del_btn = $('<a title="Delete Filter" class="icon delete showtooltip"></a>');
      var edit_btn = $('<a class="icon edit" title="Edit Filter"></a>')
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
  ,showDialog:function(obj,filter){
     
      /*if($("body").hasClass('modal-open')){
                     var active_ws = $(".modal-body");
                     active_ws.find('.filter-clickers').remove();
                     var parentDiv = $(obj.target).parents('.filter-cont');
                     parentDiv.append("<div class='filter-clickers' id='subname-filters-dialog'><div id='show-loading' style='width:300px;height:300px;position:relative;'></div></div>");
                     active_ws.find('.filter-clickers').css({top:'55px'});
                    }*/
           
      /*var dialog = this.options.app.showDialog({title:'Choose List',
            css:{"width":"700px","margin-left":"-350px"},
            bodyCss:{"min-height":"290px"}
      });*/
      var dialog = filter.find('#subname-filters-dialog');
     
      var showloading = $('#show-loading');
      this.options.app.showLoading("Loading Lists...",showloading.show()); 
      var self = this;   
      
     
       if(obj){
                var list_icon = $.getObj(obj,"div")
                var selected_list = list_icon.attr("list_checksum")
                
              }
            
              var d = "";
              if(self.subListObj.params){
                  var filterClass = (self.subListObj.params['triggerOrder'])? 'filter_list_grid-'+self.subListObj.params['triggerOrder'] : 'filter_list_grid';
                  var searchDiv = (self.subListObj.params['triggerOrder'])? 'listssearch-'+self.subListObj.params['triggerOrder'] : 'listssearch';
              }else{
                  filterClass ='filter_list_grid'; 
                  searchDiv ='listssearch';
              }
              var list_html = '<div class="bmsgrid" style="overflow:inherit!important;"><div class="hDiv"><div class="hDivBox"><table cellspacing="0" cellpadding="0"></table></div></div><div class="bDiv" style="height: 320px;"><table cellpadding="0" cellspacing="0" width="100%" id="filter_list_grid" class="filter_list_grid '+filterClass+'"><tbody>';
              list_html += '</tbody></table></div></div><button class="stats-scroll ScrollToTop" type="button" style="display: none; position:absolute;bottom:5px;right:20px;"></button>'
              
        d +='<div>'
        d += '<div class="template-container" style="margin-right:5px;min-height:290px"><div style="display: inline-block; padding: 4px 0px; height:auto;width:100%;" id="temp-search-total-badge" class="temp-filters clearfix"><h2 id="total_subscriber" style="margin-left: 15px;margin-top: 4px;"><strong class="badge"></strong><span>lists found</span></h2><h2 class="header-list filter-target-head" style="float:right;">&nbsp;<a style="margin: -2px 2px;display:none;" data-original-title="Refresh listing" class="refresh_btn showtooltip subscribe-refresh"><i>Refresh</i></a><div id="'+searchDiv+'" style="margin:0;" class="input-append search"></div><a class="closebtn" id="filter-dropdown-close"></a></h2></div><div class="target-listing" id="filter-lists">'+list_html+'</div></div>'
        d += '</div>'
        
        d = $(d)
        
        //dialog.getBody().html(d)
        dialog.html(d)
        d.find("#"+searchDiv).searchcontrol({
                id:'list-search',
                width:'250px',
                height:'22px',
                placeholder: 'Search Lists',
                gridcontainer: d.find('.'+filterClass),
                showicon: 'yes',
                iconsource: 'list',
                closeiconid: 'dialoglistssearch',
                 searchFunc: $.proxy(this.searchsubList, this,d),
                clearFunc: $.proxy(this.clearSearchsubList, this,d),
         });        
             this.subListObj['filter'] = dialog;
        
         if(!this.isScrollattachlist){ 
             dialog.find("#filter_list_grid").parent().scroll($.proxy(this.liveLoadingList, this,dialog,"#filter_list_grid"));
          //  this.isScrollattachlist = true;
         }
        
        
       self.loadSubsList(false,obj,dialog,d); // change to global offset
       
      //}
       
      
  },
  searchsubList : function (d,o,txt){
     // console.log(d);
       this.subListObj['searchText'] = txt;
        this.offsetLengthSubList =0;
        this.loadSubsList(this.offsetLengthSubList,false,d,false,this.subListObj['searchText']);

  },
  clearSearchsubList : function(d){
      this.offsetLengthSubList =0;
        this.subListObj['searchText'] = "";
        this.loadSubsList(this.offsetLengthSubList,false,d,false);
  },
  loadSubsList: function(fcount,obj,dialog,d,searchText){
      var self= this;
      var searchtext = (searchText)?searchText:"";
      if (!fcount) {
                        this.offsetLengthSubList = 0;
                        this.options.app.showLoading("Loading Lists...", dialog.find('#filter_list_grid'));
                        dialog.find('#filter_list_grid .loading p').css({'margin-left':'-150px','margin-right':'0'});
                        dialog.find('#filter_list_grid tbody').html('');
                         dialog.find(".notfound").remove();

                    }
                    else {
                         dialog.find("#filter_list_grid tbody").append('<tr class="loading-campagins"><td colspan="2"><div class="loadmore"><img src="img/loading.gif" alt=""/><p style="float:none;">Please wait, loading more Lists.</p></div></td></tr>');
                    }
       
      if(searchtext){
            var URL = "/pms/io/list/getListData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=batches&offset="+self.offsetLengthSubList+"&searchText="+searchtext;
            dialog.find("#filter_list_grid tbody").html('<tr class="loading-campagins"><td colspan="2"><div class="loadmore"><img src="img/loading.gif" alt=""/><p style="float:none;">Please wait, Loading Lists.</p></div></td></tr>');
        }else{
            var URL = "/pms/io/list/getListData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=batches&offset="+self.offsetLengthSubList
        }
      
      var checksumlist;
      if(self.subListObj.params){
         checksumlist = self.subListObj.params['listNumber.checksum'];
         
      }
       jQuery.getJSON(URL,  function(tsv, state, xhr){
                if(xhr && xhr.responseText){
                      var lists = jQuery.parseJSON(xhr.responseText); 
                      var filter = $(self.options.filterRow)
                      self.options.app.showLoading(false, dialog.find('#filter_list_grid'));
                      if(lists.totalCount !== "0"){
                         self.populateDialog(obj,dialog,lists,checksumlist); 
                      }else{
                          filter.find("#filter_list_grid tbody").append('<tr class=""><td colspan="2"><div class=""><p style="float: none; text-align: center;">No List can be found</p></div></td></tr>');
                      }
                      
                }
        }).fail(function() { console.log( "error lists listing" ); });
  },
  populateDialog:function(obj,dialog,lists,checksumlist){
      var self = this;
      var list_array =lists;
      var filter = this;
      var list_html;
      dialog.find('#total_subscriber strong').html(list_array.totalCount); 
      self.offsetLengthSubList = list_array.nextOffset;
      
     // var selected_list = self.$element.find('.sub-date-container').attr("list_checksum")
      var selected_list = (checksumlist) ? checksumlist : "";
            $.each(list_array.lists[0], function(index, val) {  
                        if(val[0].name.substring(0,13)==='Supress_List_'){
                        list_html += '<tr id="row_'+val[0]["listNumber.encode"]+'" list_checksum="'+val[0]["listNumber.checksum"]+'" class="filter-supress-row" >';  
                        }else{
                            
                               list_html += '<tr id="row_'+val[0]["listNumber.encode"]+'" list_checksum="'+val[0]["listNumber.checksum"]+'">';
     
                        }
                        list_html += '<td width="100%"><div><div class="name-type"><h3 class="listsub-name">'+val[0].name+'</h3><div class="tags tagscont">'+filter.options.app.showTags(val[0].tags)+'</div></div><div></td>';                        
                        list_html += '<td width="100px"><div><div class="subscribers show" style="min-width:90px"><span  class=""></span>'+filter.options.app.addCommas(val[0].subscriberCount)+'</div><div id="'+val[0]["listNumber.encode"]+'" class="action"><a class="btn-green"><span>Use</span><i class="icon next"></i></a></div></div></td>';                        
                        list_html += '</tr>';
                    });
       dialog.find('.loading-campagins').remove();    
       dialog.find("#filter_list_grid").append(list_html);
       
       if(this.subListObj.searchText){
                                dialog.find("#filter_list_grid tr").each(function(k,val){
                                    $(this).find(".listsub-name").highlight($.trim(self.subListObj.searchText));
                                    $(this).find(".taglink").highlight($.trim(self.subListObj.searchText));
                                   });
                }
       if(self.offsetLengthSubList !== "-1"){
          dialog.find("#filter_list_grid tbody tr").last().attr("data-load", "true");
        }
        
    
      
        
        
        dialog.find("#filter_list_grid .action").click(function(){            
             dialog.parent().find('.sub-date-container').attr("list_id",$(this).attr("id"))
             dialog.parent().find('.sub-date-container').attr("list_checksum",$(this).parents("tr").attr("list_checksum"))
             dialog.parent().find('.sub-date-container').find("a").removeClass("add-list").addClass("list");
             dialog.find("#filter_list_grid tr").removeClass("selected");
             $(this).parents("tr").addClass("selected");
            // dialog.hide();
         })
         
      /*if(selected_list){
          
            var tr = dialog.find("#filter_list_grid tr[list_checksum='"+selected_list+"']")
            if(tr.length){
                tr.addClass("selected");
            }
        }*/
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
       var triggerNo;
     
        $.each(self.$element.find('.sub-date-container'),function(key,val){
                   
                   if(!$(val).hasClass('selected-row') ){
                     console.log(selected_list);
                       triggerNo = $(val).data('sublist');
                    if(selected_list && dialog.find('.filter_list_grid-'+triggerNo+' tr[list_checksum='+selected_list+']').length == 0){
                                var showloading = $('#show-loading');
                                self.options.app.showLoading("Loading Lists...",filter.find('#filter_list_grid'));
                                self.loadSubsList(self.offsetLengthSubList,false,dialog); 
                             
                             }else{
                                 var tr = dialog.find(".filter_list_grid-"+triggerNo+" tr[list_checksum='"+selected_list+"']")
                                 $(val).addClass('selected-row');
                                 if(tr.length){
                                        tr.addClass("selected");
                                        if(!self.scrolltoSubLisView ){
                                            dialog.find(".filter_list_grid-"+triggerNo+" tr.selected").scrollintoview();
                                            if(self.$element.find('.sub-date-container').length === self.$element.find('.sub-date-container.selected-row').length){
                                                self.scrolltoSubLisView = true; 
                                            }
                                            
                                        }
                                        
                                    }
                             }
                   } 
           });
  },
   liveLoadingList: function (filter,listType,params) {
                    //console.log(filter);
                    var $w = $(window);
                    var th = 200;
                    var inview = filter.find(listType+" tbody tr:last").filter(function () {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$element.find(listType).parent().height() > 0) {
                        inview.removeAttr("data-load");
                        if(listType==="#__list_grid"){
                            this.loadLists(this.offsetLengthLists,filter,params);
                        }else{
                            this.loadSubsList(this.offsetLengthSubList,false,filter);
                        }
                      
                    }
                },
  addTagsFilter : function(obj,e,params){
       var filter = $(this.options.filterRow)
      filter.addClass("tag green")
       var selected_link="",selected_ptype="",selected_linkfilter=""
       var taglist;
      // Loading Page url, page types and link filters data
      var self = this
      var filter_html = '<div class="row"><label style="display:none">Filter by</label>'
          filter_html += ' <div class="btn-group "><select data-placeholder="" class="tag-box">'
          filter_html += '<option value="contains_all" selected>Contains All</option><option value="contains_any">Contains Any</option><option value="not_contains">Not Contains</option>'
          filter_html += '</select></div>'
          filter_html += '</div>'
          filter_html += '<div class="template-container"><div id="area_choose_tags" class=" " style="display: block; height:250px; "><div>'
          filter_html += '<div class="col1"><div id="temp-search-total-badge" class="temp-filters clearfix" style="display: inline-block; padding: 4px 0px; height:auto;width:100%;"><h2 style="margin-left: 15px;margin-top: 4px;float:left;" id="total_tags1"><span>Tags</span></h2><h2 class="tags-search" style=" float: right;margin-right: 5px;margin-top: 2px;background-color:transparent"><a style="margin: -4px 2px;display:none;" data-original-title="Refresh listing" class="refresh_btn showtooltip list-refresh"><i>Refresh</i></a>&nbsp; <div class="input-append search"></div></h2></div>'
          filter_html += '<div class="template-container tagsbox leftcol" style="overflow-y: auto; border: 5px solid rgb(255, 255, 255); height: 210px;margin:0;min-height:auto;"><div id="tagslistone" class="tagscont tagslist"></div></div>'
          filter_html +='</div>'
          filter_html += '<div class="col2"><div id="temp-search-total-badge" class="temp-filters clearfix" style="display: inline-block; padding: 4px 0px; height:auto;width:100%;"><h2 style="margin-left: 15px;margin-top: 4px;float:left;" id="total_tags2"><span>Tags</span></h2><h2 class="tags-search" style=" float: right;margin-right: 5px;margin-top: 2px;background-color:transparent"><a style="margin: -4px 2px;display:none;" data-original-title="Refresh listing" class="refresh_btn showtooltip list-refresh"><i>Refresh</i></a>&nbsp; <div class="input-append search" style="display:none;"></div></h2></div>'
          filter_html += '<div class="template-container tagsbox rightcol" style="overflow-y: auto; border: 5px solid rgb(255, 255, 255); height: 210px;margin:0;min-height:auto;"><div id="tagslisttwo" class="tagscont tagslist"><ul></ul></div></div>'
          filter_html +='</div>'
          filter_html += '</div></div></div>'
        
          filter_html += '</div>'  // end of class row
          
          
          
          
      filter.append('<div class="icon tags"></div>')    
      filter.find(".filter-cont").append(filter_html)
     
       this.addActionBar(filter,'Tags')
       this.$element.find(".addfilter").before(filter)
       this.options.app.showLoading("Loading tags...", filter.find('#area_choose_tags'));
       filter.find('#area_choose_tags .loading p').css({'margin-left':'-150px','margin-right':'0'});
       this.showTooltips(filter)
       filter.find(".tag-box").chosen({disable_search: "true",width:"220px"})
       
       filter.find(".search").searchcontrol({
                id:'tagssearch',
                width:'210px',
                height:'22px',
                tdNo:2,
                placeholder: 'Search tags',
                //gridcontainer: filter.find(".target-listing"),
                showicon: 'yes',
                iconsource: 'tag',
                
         });
         
     filter.find('#tagssearch').keyup($.proxy(self.searchTags,self,filter))
     filter.find('#clearsearch').click($.proxy(self.clearSearch,self,filter))
         var URL = "/pms/io/user/getData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=subscriberTagCountList"
         jQuery.getJSON(URL,  function(tsv, state, xhr){
                if(xhr && xhr.responseText){
                      var tags = jQuery.parseJSON(xhr.responseText); 
                      //var filter = $(self.options.filterRow)
                      self.options.app.showLoading(false, filter.find('#area_choose_tags'));
                      if(tags.totalCount !== "0"){
                        taglist ='<ul>';  
                        var i =0;
                        $.each(tags.tagList[0], function(index, val) {
                            var inactive = (val[0].subCount === "0") ? "inactive" : "";
                              taglist += '<li id="row_'+index+'" class="action '+inactive+'" item_index="'+i+'" checksum="'+val[0].tag+'"><a class="tag"><span>'+val[0].tag+'</span><strong class="badge">'+val[0].subCount+'</strong></a>';               
                              if(inactive === ""){
                                taglist += '<a class="btn-green move-row"><span>Use</span><i class="icon next"></i></a></li>';  
                              }else{
                                  taglist +='</li>';
                              }
                            i++;  
                            });
                         taglist +='</ul>'; 
                         filter.find('#tagslistone').html(taglist);
                         filter.find('#tagslistone ul li .move-row').click($.proxy(self.addTagToCol2,self,filter));
                         
                          if(params){
                                $.each(params.tags.split(","),function(key,val){
                                   filter.find('#tagslistone ul li[checksum="'+val+'"] .move-row').click();
                                });
                                
                                filter.find('.tag-box').val(params.rule).trigger("chosen:updated");
                            }
                      }    
                }
        }).fail(function() { console.log( "error tag listing" ); });
     
        
  
        
  },
  addTagToCol2: function (filter,obj) {
                    
                    var self = this;
                   var selectedli = $(obj.currentTarget).parent().attr('checksum');
                        filter.find("#tagslistone").find("li").filter(function () {
                           
                                if($(this).attr('checksum') === selectedli){
                                    var tag_copy = $(this).clone();
                                    $(this).remove();
                                    tag_copy.removeHighlight()
                                    tag_copy.find(".action").children().hide();
                                    tag_copy.find(".move-row").removeClass("btn-green").addClass("btn-red").html('<i class="icon back left"></i><span>Remove</span>');
                                    tag_copy.find(".move-row").show();
                                    tag_copy.find(".move-row").click($.proxy(self.removeFromCol2, self,filter));
                                    tag_copy.appendTo(filter.find(".col2 #tagslisttwo ul"));
                                }
                        });
                    
                },
  removeFromCol2: function (filter,obj) {
                    var self = this;
                    var tr_obj = $(obj.target).parents("li");
                    tr_obj.fadeOut("fast", function () {
                        var tr_copy = tr_obj.clone();
                        $(this).remove();
                        tr_copy.find(".action").children().show();
                        tr_copy.find(".move-row").removeClass("btn-red").addClass("btn-green").html('<span>Use</span><i class="icon next"></i>');
                        tr_copy.find(".move-row").click($.proxy(self.addTagToCol2, self,filter))
                        var _index = tr_copy.attr("item_index")
                        var next_element = null
                        var col1_rows = filter.find("#tagslistone ul li");
                        for (var i = 0; i < col1_rows.length; i++) {
                            if (parseInt($(col1_rows[i]).attr("item_index")) > _index) {
                                next_element = $(col1_rows[i])
                                break
                            }
                        }
                        tr_copy.appendTo(filter.find(".col1 #tagslistone ul")); 
                       if (next_element) {
                            tr_copy.insertBefore(next_element).show();
                        }
                        
                    });
                },
  searchTags: function(filters,ev) {
                    
                    if ($(ev.target).val().length > 0) {
                         filters.find('#clearsearch').show();
                        filters.find("#tagslistone .action").show().filter(function () {
                          return $(this).find('.tag span').text().toLowerCase().indexOf($(ev.target).val().toLowerCase()) == -1;
                        }).hide();
                    }
                    else {
                        filters.find('#clearsearch').hide();
                        filters.find(".action").show();
                        filters.find("#tagslisttwo ul li").removeHighlight()
                        filters.find("#tagslistone ul li").removeHighlight()
                    }
                    var total = $('#tagslistone ul li:visible').size()
                    var searchText = $(ev.target).val();
                    if(searchText){
                        filters.find("#total_tags1 span").html("Tag(s) found for <b> \""+searchText+"\"</b>"); 
                        filters.find("#tagslistone ul li").removeHighlight()
                        filters.find("#tagslistone ul li:visible").each(function(k,val){
                            $(this).find(".tag span").highlight($.trim(searchText))
                           // $(this).find(".taglink").highlight($.trim(self.listsObj.searchText));
                           });
                        filters.find("#tagslisttwo ul li").removeHighlight()
                    }else{
                        filters.find("#total_tags1 span").html("Tags");
                    }
                    filters.find("#total_tags1 .badge").html(total);
                }, 
                clearSearch: function(filters,ev) {
                    //this.$("#total_tags .badge").html(this.objTags.total);
                    filters.find("#total_tags1 span").html("Tags");
                    filters.find("#tagslistone ul li").removeHighlight()
                    filters.find('#tagssearch').val('');
                    filters.find('#clearsearch').hide();
                    filters.find(".action").show();
                },
  
  loadFilters:function(data){
      var _target = this.$element
      var self = this
      _target.find(".filter-div ._row").remove()
      _target.find("#all-any ").val(data.applyRuleCount).trigger("chosen:updated")
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
          else if(filter.type=="T"){
              self.addTagsFilter(false,false,filter)
          }
          else if(filter.type=="W"){
             self.addWebsiteFilter(false,false,filter) 
          }
      })
      
  },
  initFilters:function(){
      var _target = this.$element
      _target.find(".filter-div ._row").remove()
      //_target.find("#all-any button[rule='A']").click()
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
                    control:filter.find(".webforms-container"),
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
      filters_post["applyRuleCount"]= _target.find("#all-any option:selected").val();
      
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
          else if($(total_rows[i]).hasClass("tag")){
              filters_post[N+".filterType"]="T"
              filters_post[N+".rule"]= filter.find(".tag-box").val()
              var tags = '';
                    filter.find(".col2 #tagslisttwo li").each(function(i) {
                        tags += $(this).find("a:nth-child(1) span").text() + ',';
                    });
              tags = tags.replace(/,(?=[^,]*$)/, '');
              filters_post[N+".tags"]= tags;
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
    scrolling:function(dialog,listType){
        var scrollVal = "";
        if(listType=="formlist"){
            scrollVal = dialog.find('#__form_grid').parent().scrollTop()
        }else if(listType =="listfilter"){
            scrollVal = dialog.find('#__list_grid').parent().scrollTop()
        }
        else{
            scrollVal = dialog.find('#filter_list_grid').parent().scrollTop();
        }
       
        if (scrollVal>70) {
                          dialog.find(".stats-scroll").fadeIn('slow');
                       } else {
                          dialog.find(".stats-scroll").fadeOut('slow');
                    }
    },
    scrollingTop:function(dialog,listType){
        if(listType=="formlist"){
            dialog.find('#__form_grid').parent().animate({scrollTop:0},600);
        }else if(listType =="listfilter"){
            dialog.find('#__list_grid').parent().animate({scrollTop:0},600);
        }else{
            dialog.find('#filter_list_grid').parent().animate({scrollTop:0},600);
        }
        
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
  , toprow : '<div class="act_row  nobg"> <div class="icon allany"></div> <div class="filt_cont"><em class="text">If </em><select style="width: 80px; margin: 0px 5px;" id="all-any" class=" nosearch selectbox rules"><option value="A">All</option><option value="1">Any</option></select><em class="text"> of the Filter match below</em></div></div>'
  , bottomrow_c : '<div class="timeline_panel"><div class="new_activities"><div class="addfilter"><div class="addbar"><a class="icon plus"></a><ul></ul></div></div></div></div>'
  , filterRow : '<div class="filter-row _row act_row "><div class="head-icon"><span class="icon filter"></span></div><div class="filter-cont"></div></div>'
  , filterFor : 'C'
  , title: ''
  , app:null
  }

}(window.jQuery);