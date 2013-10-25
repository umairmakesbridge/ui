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
      var self = this;
      if(this.options.filterFor==="C"){
        this.$element.find(".filter-div").append(this.options.toprow)
        this.$element.find(".filter-div").find(".all-any").button()
        addFilterRow()
      } 
      function addFilterRow(){
        var  basicFilter = $('<li><a class="btn-green"><span class="filter"></span>Basic Filter </a></li>')
        var  emailFilter = $('<li><a class="btn-green"><span class="email"></span>Email Activity </a></li>')
        var  listFilter = $('<li><a  class="btn-green"><span class="list"></span>Lists </a></li>')
        var  formFilter = $('<li><a  class="btn-green"><span class="form"></span>Form Submissions </a></li>')
        var  websiteFilter = $('<li><a  class="btn-green"><span class="web"></span>Website Actions</a></li>')
        var  leadScoreFilter = $('<li><a  class="btn-green"><span class="score"></span>Lead Score</a></li>')
        var add_filter_row = $(self.options.bottomrow_c);
        
        //adding different filter to add row
        add_filter_row.find("ul").append(basicFilter)
        add_filter_row.find("ul").append(emailFilter)
        add_filter_row.find("ul").append(listFilter)
        add_filter_row.find("ul").append(formFilter)
        add_filter_row.find("ul").append(websiteFilter)
        add_filter_row.find("ul").append(leadScoreFilter)
        self.$element.find(".filter-div").append(add_filter_row)
        
        //Attaching events to filter buttons
        basicFilter.on("click",$.proxy(self.addBasicFilter,self))
        emailFilter.on("click",$.proxy(self.addEmailFilter,self))
        listFilter.on("click",$.proxy(self.addListFilter,self))
        formFilter.on("click",$.proxy(self.addFormFilter,self))
        leadScoreFilter.on("click",$.proxy(self.addLeadScoreFilter,self))
        websiteFilter.on("click",$.proxy(self.addWebsiteFilter,self))
      }
      
    }
  , addBasicFilter:function(){
      var filter = $(this.options.filterRow)
      filter.addClass("filter")
      var filter_html = '<div class="btn-group"><select data-placeholder="Choose a Field" class="selectbox fields">'
                    if(this.options.app){
                        var fields_array =this.options.app.getAppData("basicFields")
                        filter_html +='<option value=""></option>'
                        filter_html +='<optgroup label="Basic Fields">'
                        $.each(fields_array,function(k,val){
                            filter_html +='<option value="'+val[0]+'">'+val[1]+'</option>'
                        });
                        filter_html +='</optgroup>'
                        fields_array =this.options.app.getAppData("customFields")
                        filter_html +='<optgroup label="Custom Fields">'
                        $.each(fields_array,function(k,val){
                            filter_html +='<option value="'+val[0]+'">'+val[1]+'</option>'
                        });
                        filter_html +='</optgroup>'
                    }    
          filter_html +='</select></div>'
          filter_html +='<div class="btn-group sub-date-container" style="display:none"><a class="icon add-list"></a></div>'
          filter_html +='<div class="btn-group rules-container"><select data-placeholder="Choose Match Type" class="selectbox rules">'  
                     if(this.options.app){
                        var rules_array =this.options.app.getAppData("rules"); 
                        filter_html +='<option value=""></option>'
                        $.each(rules_array,function(k,val){
                            filter_html +='<option value="'+val[0]+'">'+val[1]+'</option>'
                        });
                    }
          filter_html +='</select></div>'          
          filter_html += '<div class="btn-group days-container" style="display:none"><input type="text" value="0" name="" style="width:30px;" /></div>'
          filter_html +='<div class="btn-group formats-container" style="display:none"><select data-placeholder="Choose a format" class="selectbox formats">'
                    if(this.options.app){
                        var formats_array =this.options.app.getAppData("formats"); 
                        filter_html +='<option value=""></option>'
                        $.each(formats_array,function(k,val){
                            filter_html +='<option value="'+val[0]+'">'+val[1]+'</option>'
                        });
                    }
          filter_html +='</select></div>'
          filter_html += '<div class="btn-group value-container"><input type="text" value="" name="" style="width:120px;" /></div>'
      filter.find(".filter-cont").append(filter_html)
      //Chosen with fields
      filter.find(".fields").chosen({width:'200px'}).change(function(){
          if($(this).val()=="{{SUBSCRIPTION_DATE}}"){
              filter.find(".sub-date-container").show();
          }
          else{
              filter.find(".sub-date-container").hide();
          }
      })
      //Chosen with rules
      filter.find(".selectbox.rules").chosen({width:'170px'}).change(function(){             
             if($(this).val()=="dr" || $(this).val()=="prior" || $(this).val()=="after" || $(this).val()=="dayof" || $(this).val()=="birthday" || $(this).val()=="pbday"){
                filter.find(".formats-container").show();
                if($(this).val()=="prior" || $(this).val()=="after" || $(this).val()=="pbday"){
                    filter.find(".days-container").show().val('0')
                }
                else{
                    filter.find(".days-container").hide()
                }
                filter.find(".value-container").hide()
             }
             else{
                filter.find(".days-container").hide()
                filter.find(".formats-container").hide()
                filter.find(".value-container").show()
             }
      });
            
      //Chosen with formats      
      filter.find(".selectbox.formats").chosen({disable_search: "true",width:'152px'})
      
      filter.find(".sub-date-container").on("click",$.proxy(this.showDialog,this))
      
      this.addActionBar(filter)
      this.$element.find(".addfilter").before(filter)
    }
  , addEmailFilter:function(){
      var filter = $(this.options.filterRow)
      filter.addClass("email");
      
      var filter_html = '<div class="row"><label>Filter by</label>'
          filter_html += ' <div class="btn-group "><select data-placeholder="Select Filter by" class="filter-by"><option value=""></option><option value="OP">Email Opened</option><option value="CK">Email Clicked</option><option value="NC">Non Clickers</option></select></div>'
          filter_html += '</div>'
          filter_html += '<div class="row">'
            filter_html += '<label>Campaign</label>'
            filter_html += '<div class="btn-group "><select data-placeholder="Select Campaign" class="campaign-list">'  
                  filter_html +='<option value="-1">Any Campaign</option>'  
                  var campaigns_array =this.options.app.getAppData("campaigns")   
                  $.each(campaigns_array.lists[0], function(index, val) {
                      filter_html +='<option value="'+val[0].campNum+'">'+val[0].name+'</option>'
                  })
                  
            filter_html +='</select></div>'
            filter_html += '<a  class="icon view"></a></div>'
            filter_html += '<div class="row nolabel campaign-url-container" style="display:none"><div class="btn-group "><select data-placeholder="Select URL" class="campaign-url"></select></div>'              
          filter_html += '</div>'
          filter_html += '<div class="match row"> Happened in last '
                filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan">'+this.getTimeSpan()+'</select></div> days'  
                filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan">'+this.getTimeSpan()+'</select></div> or more times'  
          filter_html += '</div>'
          
      filter.find(".filter-cont").append(filter_html)
      filter.find(".filter-by").chosen({disable_search: "true",width:"152px"}).change(function(){
          if($(this).val()=="CK"){
              filter.find(".campaign-url-container").show()
          }
          else{
              filter.find(".campaign-url-container").hide()
          }
      })
      filter.find(".campaign-list").chosen({width:"400px"})
      filter.find(".campaign-url").chosen({width:"350px"})
      filter.find(".timespan").chosen({disable_search: "true",width:"52px"})
      this.addActionBar(filter)
      this.$element.find(".addfilter").before(filter)
    }  
  , addListFilter:function(){
      var filter = $(this.options.filterRow)      
      filter.addClass("list");
      
      var filter_html = '<div class="row"><label>Member</label>'
          filter_html += ' <div class="btn-group "><select class="member-box"><option value="Y">Member</option><option value="N">Non Member</option></select></div>'
          filter_html += '</div>'          
            
          filter_html += '<div class="match row"> Match '
                filter_html += '<div class="btn-group"><select class="match-box"><option value="">All</option><option value="N">Any</option></select></div> of the selected list(s).'                  
          filter_html += '</div>'
          filter_html += '<div class="target-listing">'
            filter_html += '<table cellpadding="0" cellspacing="0" width="100%" id="__list_grid"><tbody>'
            var list_array =this.options.app.getAppData("lists")
            var filter_ref = this;
            $.each(list_array.lists[0], function(index, val) {     
                        filter_html += '<tr id="row_'+val[0].listNum+'">';      
                        filter_html +='<td><input class="check-list" type="checkbox" /></td>'
                        filter_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3><div class="tags"><h5>Tags:</h5>'+filter_ref.options.app.showTags(val[0].tags)+'</div></div></td>';                        
                        filter_html += '<td><div class="subscribers show"><span  class=""></span>'+val[0].subscriberCount+'</div><div id="'+val[0].listNum+'" class="action"><a class="btn-green">Use</a></div></td>';                        
                        filter_html += '</tr>';
                    });
            filter_html += '</tbody></table>'
          filter_html += '</div>'
      filter.find(".filter-cont").append(filter_html)
      filter.find(".member-box").chosen({disable_search: "true",width:"200px"})      
      filter.find(".match-box").chosen({disable_search: "true",width:"100px"})
      
      this.addActionBar(filter)      
      this.$element.find(".addfilter").before(filter)
      
      filter.find("#__list_grid").bmsgrid({
                useRp : false,
                resizable:false,
                colresize:false,
                height:290,
                usepager : false,
                colWidth : ['40px','100%','100px']
        });
      filter.find("#__list_grid .action").click(function(){
          $(this).parents("tr").addClass("selected")
          $(this).parents("tr").find(".check-list").prop("checked",true)
      })  
      filter.find("#__list_grid .check-list").click(function(){
          if($(this).prop("checked")){
              $(this).parents("tr").addClass("selected")
          }
          else{
              $(this).parents("tr").removeClass("selected")
          }
      })
    }    
  , addFormFilter:function(){
      var filter = $(this.options.filterRow)
      filter.addClass("form");
      
      var filter_html = '<div class="row"><label>Submitted Form</label>'
          filter_html += ' <div class="btn-group "><select data-placeholder="Select Webform" class="forms-box"></select></div>'
          filter_html += '</div>'          
            
          filter_html += '<div class="match row"> Happened in last '
                filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan">'+this.getTimeSpan()+'</select></div> days'                  
          filter_html += '</div>'
      filter.find(".filter-cont").append(filter_html)
      filter.find(".forms-box").chosen({disable_search: "true",width:"300px"})      
      filter.find(".timespan").chosen({disable_search: "true",width:"52px"})
      
      this.addActionBar(filter)
      this.$element.find(".addfilter").before(filter)
    }    
  , addLeadScoreFilter:function(){
      var filter = $(this.options.filterRow)
      filter.addClass("score");
      var filter_html = '<h4>Score</h4>'
      filter_html += '<div class="btn-group "><select class="condtion-box">'
      filter_html += '<option value="eq">equals</option><option value="less">less than</option><option value="gr8">greater than</option><option value="btw">between</option><option value="incmore">increase more than</option>'
      filter_html += '</select></div>'  
      filter_html += '<input type="text" value="" name="" style="width:50px;" />'
      filter_html += '<div class="match row days-container" style="display:none"> in last '
            filter_html += '<div class="btn-group "><select class="timespan">'+this.getTimeSpan()+'</select></div> days'                  
      filter_html += '</div>'
      filter.find(".filter-cont").append(filter_html)
      filter.find(".condtion-box").chosen({disable_search: "true",width:"152px"}).change(function(){
          if($(this).val()=="incmore"){
              filter.find(".days-container").show()
          }
          else{
              filter.find(".days-container").hide()
          }
      })
      filter.find(".timespan").chosen({disable_search: "true",width:"52px"})
      this.addActionBar(filter)
      this.$element.find(".addfilter").before(filter)
    }
   , addWebsiteFilter:function(){
      var filter = $(this.options.filterRow)
      filter.addClass("web")
      var filter_html = '<div class="row"><label>Filter by</label>'
          filter_html += ' <div class="btn-group "><select data-placeholder="" class="filter-box">'
          filter_html += '<option value="PU">Page URL</option><option value="WV">Web Visit</option><option value="PT">Page Type</option><option value="LF">Link Filter</option>'
          filter_html += '</select></div>'
          filter_html += '</div>'
          filter_html += '<div class="row weblink-box-container">'
            filter_html += '<label>Filter URL</label>'
            filter_html += '<div class="btn-group "><select data-placeholder="Web Link" class="weblink-box"></select></div>'                        
          filter_html += '</div>'
          filter_html += '<div class="row pagetype-box-container" style="display:none">'
            filter_html += '<label>Page Type</label>'
            filter_html += '<div class="btn-group "><select data-placeholder="PT-1" class="pagetype-box">'
            filter_html += '<option value=""></option>'
            filter_html += '</select></div>'                        
          filter_html += '</div>'
          filter_html += '<div class="row linkfilter-box-container" style="display:none">'
            filter_html += '<label>Link Filter</label>'
            filter_html += '<div class="btn-group "><select data-placeholder="Score +250" class="linkfilter-box">'
            filter_html += '<option value=""></option>'
            filter_html += '</select></div>'                        
          filter_html += '</div>'
          filter_html += '<div class="match row"> Happened in last '
                filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan">'+this.getTimeSpan()+'</select></div> days'  
                filter_html += '<div class="btn-group "><select data-placeholder="2" class="timespan">'+this.getTimeSpan()+'</select></div> or more times'  
          filter_html += '</div>'
      filter.find(".filter-cont").append(filter_html)
      filter.find(".filter-box").chosen({disable_search: "true",width:"152px"}).change(function(){
          if($(this).val()=="PU"){
              filter.find(".linkfilter-box-container").hide()
              filter.find(".pagetype-box-container").hide()
              filter.find(".weblink-box-container").show()
          }
          else if($(this).val()=="WV"){
              filter.find(".linkfilter-box-container").hide()
              filter.find(".pagetype-box-container").hide()
              filter.find(".weblink-box-container").hide()
          }
          else if($(this).val()=="PT"){
              filter.find(".linkfilter-box-container").hide()
              filter.find(".pagetype-box-container").show()
              filter.find(".weblink-box-container").hide()
          }
          else if($(this).val()=="LF"){
              filter.find(".linkfilter-box-container").show()
              filter.find(".pagetype-box-container").hide()
              filter.find(".weblink-box-container").hide()
          }
      })
      filter.find(".weblink-box").chosen({width:"300px"})
      filter.find(".pagetype-box").chosen({width:"300px"})
      filter.find(".linkfilter-box").chosen({width:"300px"})
      filter.find(".timespan").chosen({disable_search: "true",width:"52px"})
      this.addActionBar(filter)
      this.$element.find(".addfilter").before(filter)
    }
  , addActionBar:function(filterRow){
      var action =  $('<div class="right-btns"></div>')            
      var del_btn = $('<a class="icon delete showtooltip" title="Delete Filter"></a>')      
      action.append(del_btn)            
      del_btn.click(function(){
         $(this).parents(".filter-row").remove()
      });
      filterRow.find(".filter-cont").append(action)    
      
      //Action url 
      filterRow.mouseover(function(){
          action.show()
      })
      filterRow.mouseout(function(){
          action.hide()
      })
  }
  ,showDialog:function(obj){
      var list_icon = $.getObj(obj,"div")
      var d = null;
      if($("#filtersModal").length==0){
        var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="filter_list_grid"><tbody>'
            var list_array =this.options.app.getAppData("lists")
            var filter = this;
            $.each(list_array.lists[0], function(index, val) {     
                        list_html += '<tr id="row_'+val[0].listNum+'">';                            
                        list_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3><div class="tags"><h5>Tags:</h5>'+filter.options.app.showTags(val[0].tags)+'</div></div></td>';                        
                        list_html += '<td><div class="subscribers show"><span  class=""></span>'+val[0].subscriberCount+'</div><div id="'+val[0].listNum+'" class="action"><a class="btn-green">Use</a></div></td>';                        
                        list_html += '</tr>';
                    });
            list_html += '</tbody></table>'
        d = '<div class="modal" id="filtersModal" style="width:700px;margin-left:-350px">'
        d += '<div class="modal-header">'
        d += '<a class="close" data-dismiss="modal">×</a>'
        d += '<h3>Select List</h3>'
        d += '</div>'
        d += '<div class="modal-body">'
        d +='<h2 class="header-list">Lists<div id="listssearch" class="input-append search"></div></h2>'
        d += '<div class="template-container" style="margin-right:5px;min-height:290px"><div class="target-listing" id="filter-lists">'+list_html+'</div></div>'
        d += '</div>'
        d += '<div class="modal-footer">'        
        d += '<a class="btn btn-gray" data-dismiss="modal">Close</a>'
        d += ' </div> </div>'
        d = $(d)
        d.find(".search").searchcontrol({
                id:'list-search',
                width:'300px',
                height:'22px',
                placeholder: 'Search Lists',
                gridcontainer: 'filter-lists',
                showicon: 'yes',
                iconsource: 'add-list',
                closeiconid: 'dialoglistssearch'
         });
        d.modal({keyboard: true})
        $("body").append(d)
        d.find("#filter_list_grid").bmsgrid({
                useRp : false,
                resizable:false,
                colresize:false,
                height:290,
                usepager : false,
                colWidth : ['100%','100px']
        });
        d.find("#filter_list_grid tr td:nth-child(1)").attr("width","100%");
        d.find("#filter_list_grid tr td:nth-child(2)").attr("width","100px");
         d.find("#filter_list_grid .action").click(function(){            
             list_icon.attr("list_id",$(this).attr("id"))
             list_icon.find("a").removeClass("add-list").addClass("list");
             d.modal("hide")
         })
      }
      else{
          d = $("#filtersModal");
          var selected_list = list_icon.attr("list_id")
          d.find("#filter_list_grid tr.selected").removeClass("selected");
          if(selected_list){
              var tr = d.find("#filter_list_grid tr[id='row_"+selected_list+"']")
              if(tr.length){
                  tr.addClass("selected");
              }
          }
      }      
      d.modal("show")
  }
  , getTimeSpan:function(){
      var spanHTML = ""
      for(var i=1;i<=30;i++){
         spanHTML +='<option value="'+i+'">'+i+'</option>'
      }
      return spanHTML
  }
  , getOptions: function (options) {
      options = $.extend({}, $.fn.filters.defaults, options)    
      return options
    }
  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
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
  , toprow : '<div class="match filter_start">If <div class="btn-group all-any" data-toggle="buttons-radio"><button class="btn active">All</button><button class="btn ">Any</button></div> of the Filter match below</div>'
  , bottomrow_c : '<div class="filter-row filter-menu addfilter"><ul></ul></div>'
  , filterRow : '<div class="filter-row"><div class="head-icon"><span class="icon filter"></span></div><div class="filter-cont"></div></div>'
  , filterFor : 'C'
  , title: ''
  , app:null
  }

}(window.jQuery);