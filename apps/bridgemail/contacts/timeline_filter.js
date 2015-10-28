define(['text!contacts/html/timeline_filter.html','app', 'jquery.chosen','jquery.icheck'],
function (template,app) {
        'use strict';
        return Backbone.View.extend({
            className: 'overlay',
            events: {
                'click .closebtn':'closeFilters',
                'click .btn-cancel':'closeFilters',
                'click .apply-filter':'applyFilters',
                'click .check-all':'checkAll',
                'click .uncheck-all':'unCheckAll'
            },
            initialize: function () {
                this.app = app;
                this.filter = this.options.filter;
                this.template = _.template(template);                
                
                this.render();
            },
            render: function (search) {
              this.$el.html(this.template({}));                
              
              this.$(".select-type").chosen({disable_search: "true",width:"220px"}).change(_.bind(function(e){
                  var target = $(e.target);
                  if(target.val()=="SM"){
                      this.$(".checklist").hide();                      
                      this.$(".singleMessage-events,.activity-heading").show();
                      this.$(".btns").css("padding-top","10px");
                      
                  } else if(target.val()=="SU"){
                      this.$(".checklist,.activity-heading").hide();
                      this.$(".btns").css("padding-top","120px");
                  }
                  else{
                      if(target.val()=="W" || target.val()=="" || target.val()=="B"){
                         this.$(".act-wf").show();
                      }
                      else{
                         this.$(".act-wf").hide();
                      }
                      this.$(".checklist").hide();
                      this.$(".all-events,.activity-heading").show();
                      this.$(".btns").css("padding-top","10px");
                  }
              },this));  
              if(this.filter.filterType!==""){
                  this.$(".select-type").change();
              }
             // this.$(".select-message").chosen({disable_search: "true",width:"220px"});  
              this.$('input.checkpanel').iCheck({
                    checkboxClass: 'checkpanelinput',
                    insert: '<div class="icheck_line-icon"></div>'
              });
              
              if (this.app.get("isFromCRM") && this.app.get("isFromCRM").toLowerCase() == "y") {
                 this.$(".filter_pop").css("top","34%");
              }
                
            },
            applyFilters:function(){
              if(this.options.callBack){
                  var selector = ".all-events input:checked";
                  var type = this.$(".select-type").val();
                  if(type=="SM"){
                      selector = ".singleMessage-events input:checked";
                      type="";
                  }
                  else {
                      if(type=="W" || type=="" || type=="B"){
                        selector = ".all-events input:checked";
                      }
                      else{
                          selector = ".all-events input.camp-event:checked";
                      }
                  }
                  var selectedTypes = this.$(selector).map(function() {
                    return this.value;
                  }).get().join();
                  if(type=="SU"){
                      selectedTypes = "";
                  }
                  if(selectedTypes=="" && type!=="SU"){
                      this.app.showAlert("Please select Activity type",$("body"));
                      return false;
                  }
                  this.options.callBack(type,selectedTypes);
              } 
              this.closeFilters();
            },
            closeFilters: function(){
                this.$el.remove();
            },
            checkAll:function(){
                this.$('input.checkpanel').iCheck('check');
            },
            unCheckAll:function(){
                this.$('input.checkpanel').iCheck('uncheck');
            }
            
        });    
});