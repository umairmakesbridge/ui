/*
 *Created by : Umair Shahid
 *Version: 1 
 *=================================*/

!function ($) {
  "use strict"; 

  var CRMFilters = function (element, options) {
    this.init(element, options)
  }

  CRMFilters.prototype = {

    constructor: CRMFilters

  , init: function (element, options) {           
      this.$element = $(element)
      this.options = this.getOptions(options)            
      this.$element.append($(this.options.template))
      if(this.options.showAdvanceOption){
        this.$element.append($(this.options.adv_option))
      }
      this.fields = []
      this.rules = []
      
      var self = this;
      
      addFilterRow()
       
      function addFilterRow(){
        var  basicFilter = $('<li><a class="btn-green"><span class="filter"></span> Add Filter </a></li>')
       
        var add_filter_row = $(self.options.bottomrow_c);
        self.$element.find(".filter-div").append(add_filter_row)
        //adding different filter to add row
        add_filter_row.find("ul").append(basicFilter)
       
        
        //Attaching events to filter buttons
        basicFilter.on("click",$.proxy(self.addBasicFilter,self))
       
      }
      
      
      
    }
  , addBasicFilter:function(obj,e,params){
      if(this.$element.find(".filter-div ._row").length===this.options.maxFilter){
          this.options.app.showAlert("You can't add more than 8 filter rows.",$("body"),{fixed:true});
      }
      var filter = $(this.options.filterRow)
      var value_display='block',matchValue='',selected_field=''
      filter.addClass("filter")           
      var filter_html = '<div class="btn-group"><select data-placeholder="Choose a Field" class="selectbox fields" disabled="disabled"><option>Loading Fields...</option>'                        
          filter_html +='</select></div>'          
          filter_html +='<div class="btn-group rules-container"><select data-placeholder="Choose Match Type" class="selectbox rules" disabled="disabled"><option value="">Loading...</option>'                      
          filter_html +='</select></div>'                              
          filter_html += '<div class="btn-group value-container" style="display:'+value_display+'"><input type="text" value="'+matchValue+'" name="" class="matchValue" style="width:140px;" /></div>'
      
      filter.find(".filter-cont").append(filter_html)
      this.addActionBar(filter)
      
      if(this.$element.find(".filter-div ._row").length>=1){
          var condition_row = $(this.options.condition_row);
          this.$element.find(".addfilter").before(condition_row)
          if(this.options.filterFor==="S"){
            condition_row.find("select").chosen({disable_search: "true",width:'80px'}).change(function(){ 
                  $(this).val($(this).val())
                  $(this).trigger("chosen:updated")  
            })
          }
          else if(this.options.filterFor==="N"){
              condition_row.find(".btn-group").html('<button data-toggle="dropdown" class="btn dropdown-toggle" style="padding:1px 12px">And</button>')
          }
      }
      var self = this 
      filter.find(".fields").chosen({width:'200px'}).change(function(){
           var rule_html = ""
           if(self.options.filterFor==="S"){        
                var attr_type = $(this).find("option:selected").attr("field_type").toLowerCase()	
                $.each(self.rules,function(key,val){
                     if(attr_type==val.type.toLowerCase()){
                          rule_html +='<option value="'+val.name+'" rule_type="'+val.type+'">'+val.label+'</option>'                           
                     }           
                })
                filter.find(".rules").html(rule_html).prop("disabled",false).trigger("chosen:updated")
           }
      })
      filter.find(".rules").chosen({disable_search: "true",width:'170px'}).change(function(){
          $(this).val($(this).val())
          $(this).trigger("chosen:updated")  
      })
      this.$element.find(".addfilter").before(filter)
      this.showTooltips(filter)
            
      
      //Load Elements 
      if(this.options.filterFor==="S"){
          this.addSalesForceField(filter,params)
          this.addSalesForceRules(filter,params)
      }
      else if(this.options.filterFor==="N"){
          this.addNetSuiteField(filter,params)
          this.addNetSuiteRules(filter,params)
      }
      
    }
  ,addSalesForceField:function(filter,params){
      var URL = ""
      var self = this
      var selected_field = ""
      if(this.fields.length===0){
          URL = "/pms/io/salesforce/getData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=filterFields";
          jQuery.getJSON(URL,  function(tsv, state, xhr){
                if(xhr && xhr.responseText){                        
                     var fields_json = jQuery.parseJSON(xhr.responseText);                                
                     if(self.options.app.checkError(fields_json)){
                         return false;
                     }       
                    var field_html ='<option value=""></option>'                                            
                    $.each(fields_json.fldList[0],function(key,val){
                        selected_field = (params && params.fieldName==val[0]) ? "selected" : ""                        
                        self.fields.push(val[0])                            
                        field_html +='<option value="'+val[0].name+'" '+selected_field+' field_type="'+val[0].type+'">'+val[0].label+'</option>'                           
                        
                    });
                    
                    filter.find(".fields").html(field_html).prop("disabled",false).trigger("chosen:updated")
                }
          }).fail(function() { console.log( "error in loading fields" ); });
      }
      else{
          var field_html ='<option value=""></option>'                                            
          $.each(this.fields,function(key,val){
                selected_field = (params && params.fieldName==val[0]) ? "selected" : ""                
                field_html +='<option value="'+val.name+'" '+selected_field+' field_type="'+val.type+'">'+val.label+'</option>'                           

            })
        filter.find(".fields").html(field_html).prop("disabled",false).trigger("chosen:updated")
      }
  }
  ,addSalesForceRules:function(filter,params){
      var URL = ""
      var self = this
      var selected_field = ""
      if(this.rules.length===0){
          URL = "/pms/io/salesforce/getData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=getOperators";
          jQuery.getJSON(URL,  function(tsv, state, xhr){
                if(xhr && xhr.responseText){                        
                     var fields_json = jQuery.parseJSON(xhr.responseText);                                
                     if(self.options.app.checkError(fields_json)){
                         return false;
                     }       
                    var rule_html =''                                            
                    $.each(fields_json.fldList[0],function(key,val){
                        selected_field = (params && params.fieldName==val[0]) ? "selected" : ""                        
                        self.rules.push(val[0])                            
                        if(val[0].type=="string"){
                            rule_html +='<option value="'+val[0].name+'" '+selected_field+' rule_type="'+val[0].type+'">'+val[0].label+'</option>'                           
                        }
                        
                    });                    
                    filter.find(".rules").html(rule_html).prop("disabled",false).trigger("chosen:updated")
                }
          }).fail(function() { console.log( "error in loading fields" ); });
      }
      else{
          var rule_html =''                                            
          $.each(this.rules,function(key,val){
                selected_field = (params && params.fieldName==val[0]) ? "selected" : ""                                                              
                if(val.type=="string"){
                    rule_html +='<option value="'+val.name+'" '+selected_field+' rule_type="'+val.type+'">'+val.label+'</option>'                           
                }
            })
          filter.find(".rules").html(rule_html).prop("disabled",false).trigger("chosen:updated")
      }
  }
  ,addNetSuiteField:function(filter,params){
      var URL = ""
      var self = this
      var selected_field = ""
      if(this.fields.length===0){
          URL = "/pms/io/netsuite/getData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=filterFields";
          jQuery.getJSON(URL,  function(tsv, state, xhr){
                if(xhr && xhr.responseText){                        
                     var fields_json = jQuery.parseJSON(xhr.responseText);                                
                     if(self.options.app.checkError(fields_json)){
                         return false;
                     }       
                    var field_html ='<option value=""></option>'                                            
                    $.each(fields_json.fldList[0],function(key,val){
                        selected_field = (params && params.fieldName==val[0]) ? "selected" : ""                        
                        self.fields.push(val[0])                            
                        field_html +='<option value="'+val[0].name+'" '+selected_field+' >'+val[0].label+'</option>'                           
                        
                    });
                    
                    filter.find(".fields").html(field_html).prop("disabled",false).trigger("chosen:updated")
                }
          }).fail(function() { console.log( "error in loading fields" ); });
      }
      else{
          var field_html ='<option value=""></option>'                                            
          $.each(this.fields,function(key,val){
                selected_field = (params && params.fieldName==val[0]) ? "selected" : ""                
                field_html +='<option value="'+val.name+'" '+selected_field+' >'+val.label+'</option>'                           

            })
        filter.find(".fields").html(field_html).prop("disabled",false).trigger("chosen:updated")
      }
  }
  ,addNetSuiteRules:function(filter,params){
      var URL = ""
      var self = this
      var selected_field = ""
      if(this.rules.length===0){
          URL = "/pms/io/netsuite/getData/?BMS_REQ_TK="+this.options.app.get('bms_token')+"&type=getOperators";
          jQuery.getJSON(URL,  function(tsv, state, xhr){
                if(xhr && xhr.responseText){                        
                     var fields_json = jQuery.parseJSON(xhr.responseText);                                
                     if(self.options.app.checkError(fields_json)){
                         return false;
                     }       
                    var rule_html =''                                            
                    $.each(fields_json.oprList[0],function(key,val){
                        selected_field = (params && params.fieldName==val[0]) ? "selected" : ""                        
                        self.rules.push(val[0])                                                    
                        rule_html +='<option value="'+val[0].name+'" '+selected_field+' >'+val[0].label+'</option>'                           
                        
                        
                    });                    
                    filter.find(".rules").html(rule_html).prop("disabled",false).trigger("chosen:updated")
                }
          }).fail(function() { console.log( "error in loading fields" ); });
      }
      else{
          var rule_html =''                                            
          $.each(this.rules,function(key,val){
                selected_field = (params && params.fieldName==val[0]) ? "selected" : ""                                                                              
                rule_html +='<option value="'+val.name+'" '+selected_field+' >'+val.label+'</option>'                           
                
            })
          filter.find(".rules").html(rule_html).prop("disabled",false).trigger("chosen:updated")
      }
  }
  , addActionBar:function(filterRow){
      var action =  $('<div class="right-btns"></div>')            
      var del_btn = $('<a class="icon delete showtooltip" title="Delete Filter"></a>')      
      action.append(del_btn)            
      del_btn.click(function(){
         if($(this).parents(".filter-row").index()==0){
             $(this).parents(".filter-row").next("span").remove() 
         }
         $(this).parents(".filter-row").prev("span").remove() 
         $(this).parents(".filter-row").remove()
      });
      filterRow.find(".filter-cont").append(action)    
            
  }
  ,
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
      })
      
  },
  initFilters:function(){
      var _target = this.$element
      _target.find(".filter-div ._row").remove()      
      _target.find(".filter-div span.andor").remove()      
  },
  saveFilters:function(src){      
      var filters_post = {}
      if(this.options.filterFor==="S"){
          filters_post = this.saveSalesForce(src)
      }
      else if(this.options.filterFor==="N"){
          filters_post = this.saveNetSuite(src)
      }
      return filters_post
  }
  ,saveSalesForce:function(src){
      var filters_post = {}
      var _target = this.$element
      var total_rows = _target.find(".filter-div ._row");               
      for(var i=0;i<total_rows.length;i++){
          var N = i+1
          var filter = $(total_rows[i])
          if($(total_rows[i]).hasClass("filter")){
              filters_post[src+"Field"+N] = filter.find(".fields").val()
              filters_post[src+"FieldCondition"+N] = filter.find(".rules").val()
              filters_post[src+"FieldValue"+N] = filter.find(".matchValue").val()
              if(filter.next("span.andor").length==1){
                filters_post[src+"ANDOR"+N] = filter.next("span.andor").find("select").val()
              }
              var adv_option = this.$element.find(".advance-option")
              if($.trim(adv_option.val())!==""){
                var _src = src=="lead"?"L":"C"
                filters_post["advancedOptions"+_src] = $.trim(adv_option.val())
              }
          }
      }
      return filters_post
  }
  ,saveNetSuite:function(src){
     src = "search" 
     var filters_post = {}
      var _target = this.$element
      var total_rows = _target.find(".filter-div ._row");               
      for(var i=0;i<total_rows.length;i++){
          var N = i+1
          var filter = $(total_rows[i])
          if($(total_rows[i]).hasClass("filter")){
              filters_post[src+"Fields"+N] = filter.find(".fields").val()
              filters_post[src+"Operator"+N] = filter.find(".rules").val()
              filters_post[src+"Value"+N] = filter.find(".matchValue").val()                            
          }
      }
      return filters_post 
  }
  , getOptions: function (options) {
      options = $.extend({}, $.fn.crmfilters.defaults, options)    
      return options
    }
  , showTooltips:function(filter){
      filter.find(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false})      
  }
  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    }
  }

 /* FILTER PLUGIN DEFINITION
  * ========================= */

  $.fn.crmfilters = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('crmfilters')
        , options = typeof option == 'object' && option
      if (!data) $this.data('crmfilters', (data = new CRMFilters(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.crmfilters.Constructor = CRMFilters

  $.fn.crmfilters.defaults = {
    
    template: '<div class="timeline"><div class="filter-div"></div></div>'
  , bottomrow_c : '<div class="filter-row filter-menu addfilter"><ul></ul></div>'
  , condition_row : '<span class="andor"><div class="btn-group"><select><option value="AND">And</option><option value="OR">Or</option></select></div></span>'
  , filterRow : '<div class="filter-row _row"><div class="head-icon"><span class="icon filter"></span></div><div class="filter-cont"></div></div>'
  , adv_option : '<div class="adv_bar"><h4>Advanced Filtering Options</h4><input type="text" value="" class="advance-option" /></div>'
  , filterFor : 'S'
  , title: ''
  , app:null
  ,maxFilter:8,
  showAdvanceOption:true
  }

}(window.jQuery);