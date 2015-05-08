define(['text!contacts/html/timeline_filter.html','app', 'jquery.chosen','jquery.icheck'],
function (template,app) {
        'use strict';
        return Backbone.View.extend({
            className: 'overlay',
            events: {
                'click .closebtn':'closeFilters',
                'click .btn-cancel':'closeFilters',
                'click .apply-filter':'applyFilters'
            },
            initialize: function () {
                this.app = app;
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
                      this.$(".checklist").hide();
                      this.$(".all-events,.activity-heading").show();
                      this.$(".btns").css("padding-top","10px");
                  }
              },this));  
             // this.$(".select-message").chosen({disable_search: "true",width:"220px"});  
              this.$('input.checkpanel').iCheck({
                    checkboxClass: 'checkpanelinput',
                    insert: '<div class="icheck_line-icon"></div>'
              });
                
            },
            applyFilters:function(){
              if(this.options.callBack){
                  var selector = ".all-events";
                  var type = this.$(".select-type").val();
                  if(type=="SM"){
                      selector = ".singleMessage-events";
                      type="";
                  }
                  else {
                      selector = ".all-events";
                  }
                  var selectedTypes = this.$(selector+" input:checked").map(function() {
                    return this.value;
                  }).get().join();
                  if(type=="SU"){
                      selectedTypes = "";
                  }
                  this.options.callBack(type,selectedTypes);
              } 
              this.closeFilters();
            },
            closeFilters: function(){
                this.$el.remove();
            }
            
        });    
});