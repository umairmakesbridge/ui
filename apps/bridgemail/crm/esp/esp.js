define(['text!crm/esp/html/esp.html', 'text!crm/esp/html/esp_row.html'],
    function (template, espRowTemplate) {
        'use strict';
        return Backbone.View.extend({                
            /**
             * Attach events on elements in view.
            */ 
            events: {                
            },
            /**
             * Initialize view - backbone .
            */
            initialize: function () {   
                this.app = this.options.app;
                this.template = _.template(template);
                this.espArray = [
                                  {id: 1, name: "Makesbridge", img:'img/makesbridge.png',default:true},
                                  {id: 2, name: "MailGun", img:'img/mailgun.png',default:false},
                                  {id: 3, name: "SendGrid", img:'img/sendgrid.png',default:false},
                                  {id: 4, name: "Ongage", img:'img/ongage.png',default:false}
                                ];
                this.render();

            },
            /**
             * Initialize view .
            */
            render: function () {                        
                this.$el.html(this.template({}));
                 this.$(".esp-list-search").searchcontrol({
                    id:'esp-search-field',
                    width:'300px',
                    height:'22px',
                    gridcontainer: 'esp_grid',
                    placeholder: 'Search ESP',
                    showicon: 'yes',
                    iconsource: 'list',
                    tdNo:2
             });
            },
             /**
              * Intialize workspace when it is rendered and ready.
             */
            init:function(){
                this.$("#accordion_esp").accordion({heightStyle: "fill",collapsible: true});
                this.createEsp();
            },
            createEsp: function(){
                var collectionESP = new Backbone.Collection(this.espArray);
                var espRow = this.espRowView();

                 _.each(collectionESP.models, _.bind(function (model) {
                    var rowView = new espRow({model: model, sub: this});
                    this.$el.find('#esp_grid tbody').append(rowView.el);
                }, this));

                /*-----Remove loading------*/
                    this.app.removeSpinner(this.$el);
                /*------------*/

            },
            espRowView : function () {
                 return Backbone.View.extend({
                        tagName:"tr",
                        className:"erow",
                        events: {
                           "click .setup-esp": "openSetup"
                        },
                        initialize: function () {
                             this.template = _.template(espRowTemplate);
                             this.page = this.options.sub;
                             this.app = this.page.app;
                             this.render();
                        },
                        render: function () {
                            this.$el.html(this.template(this.model.toJSON()));
                            this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                            if(this.model.get("id") > 2 ){
                                this.$el.addClass("disabled-row");
                            }
                        },
                         getESPImage: function(model){
                             return this.app.get("path") + model.get("img");
                         },
                         openSetup: function(e){
                            var esp_id = $(e.target).data("id");
                            if(esp_id=="2"){
                                this.openMailGun();
                            }
                         },
                         openMailGun: function() {
                            this.app.mainContainer.addWorkSpace({
                                 type:'',
                                 title:'MailGun',
                                 url:'crm/esp/mailgun/mailgun',
                                 workspace_id: 'crm_esp_mailgun',
                                 tab_icon:'crm',
                                 sub_title:'MailGun Setup',
                                 addAction: false,
                                 noTags: true
                             });
                         }

                    });
            }

        });
    });