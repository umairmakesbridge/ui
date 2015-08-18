define(['text!reports/html/select_stats.html', 'jquery.icheck'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className: 'salesforce_campaigns',
                events: {
                },
                initialize: function () {
                    this.template = _.template(template);
                    this.webstatCheck = true;
                    this.selectedTypes = [];
                    this.parent = this.options.page;
                    this.app = this.parent.app;            
                    this.dialog = this.options.dialog;
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.$el.css("margin-top","-10px")
                    this.app = this.options.app;
                },
                init: function () {           
                    this.$('input.radiopanel').iCheck({
                        radioClass: 'radiopanelinput',
                        insert: '<div class="icheck_radio-icon"></div>'
                     });
                    
                },
                saveCall: function(){
                    var objectArray =[];     
                    var selectedStates = this.$("input[name='option_stats']:checked").val();
                    if(selectedStates){
                        objectArray.push(selectedStates);
                        this.selectedTypes.push(selectedStates);
                        this.parent.modelArray = this.selectedTypes;                        
                        this.parent.objects = objectArray;
                        this.dialog.hide();
                        this.parent.createWebstats();
                    }
                    else{
                         this.app.showAlert("Please select source.",this.$el);
                    }
                }
            });
        });
