define(['text!crm/esp/mailgun/html/domains.html', 'text!crm/esp/mailgun/html/domain_row.html'],
function (template, domainRowTemplate) {
        'use strict';
        return Backbone.View.extend({                                                
                className:'domains-mailgun-inner',
                events: {
                    'click .fetch-domains-btn' : 'fetchDomains'
                },
                initialize: function () {                    			                 
                    this.template = _.template(template);
                    this.domainArray = [
                      {id: 1, name: "domain1.com",default:true},
                      {id: 2, name: "domain2.com",default:false},
                      {id: 3, name: "domain3.com",default:false},
                      {id: 4, name: "domain4.com",default:false}
                    ];
                    this.render();                            
                },

                render: function () {
                    this.app = this.options.page.app;
                    this.parent = this.options.page;
                    this.$el.html(this.template({}));      	                    
                    this.$el.css({"position":"static","margin":"0px"});
                    this.initControl();   
                    
                },
                initControl:function(){
                     this.$(".domains-list-search").searchcontrol({
                            id:'mailgun-domains-field',
                            width:'300px',
                            height:'22px',
                            gridcontainer: 'mailgun-domains-grid',
                            placeholder: 'Search Domains',
                            showicon: 'yes',
                            iconsource: 'list',
                            tdNo:2
                     });
                },
                getMailGunAccount: function(){

                },
                fetchDomains: function(){
                    this.$(".notfound").hide();
                    var collectionDomain = new Backbone.Collection(this.domainArray);
                    var domainRow = this.domainView();
                    this.$el.find('#mailgun-domains-grid tbody').children().remove();

                    this.$("#total_templates").html('<strong class="badge">'+this.domainArray.length+'</strong> Domains');
                     _.each(collectionDomain.models, _.bind(function (model) {
                        var rowView = new domainRow({model: model, sub: this});
                        this.$el.find('#mailgun-domains-grid tbody').append(rowView.el);
                    }, this));
                },
                domainView: function(){
                    return Backbone.View.extend({
                        tagName:"tr",
                        className:"erow",
                        events: {
                        },
                        initialize: function () {
                             this.template = _.template(domainRowTemplate);
                             this.page = this.options.sub;
                             this.app = this.page.app;
                             this.render();
                        },
                        render: function () {
                            this.$el.html(this.template(this.model.toJSON()));
                            this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                        },
                        getImage: function(){
                            return this.app.get("path") + 'img/scorebot-icon.png';
                        }


                    });
                }
        });
});