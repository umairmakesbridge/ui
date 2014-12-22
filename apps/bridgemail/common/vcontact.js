/* 
 * Name: Visiting Contact Card
 * Date: 15 Deceber 2014
 * Author: Umair & Abdullah
 * Description: Single Contact View, Display Single Contact 
 * Dependency: Contact Card HTML
 */

define(['text!common/html/vcontact.html','jquery.highlight'],
function (template,highlighter) {
        'use strict';
        return Backbone.View.extend({
            tagName:'div',
            
            events: {
              'click .view-profile , .viewdetail':"openContact",
              //'click .page-view':'loadPageViewsDialog',
              'click .vsalestatus':'selectSalesStatus',
              'click .closebtn':'removeCard'
             
            },
            initialize: function () {
                //_.bindAll(this, 'getRightText', 'pageClicked');
                 this.template = _.template(template);
                 this.parent = this.options.parent;
                 this.app = this.options.app;
                 this.sub_id = this.options.subNum;
                 this.render();
            },
            render: function () {
                 
                this.loadContact();
                this.$el.css({'position':'relative','background-color': '#fff','min-height':'170px','width':'100%'});
                //this.template.id();
                
                //this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
                /* if(this.parent.searchText){
                    this.$(".view-profile").highlight($.trim(this.parent.searchText));
                    this.$(".tag").highlight($.trim(this.parent.searchText));
                }else{
                    this.$(".tag").highlight($.trim(this.parent.searchTags));
                }*/
            },
            loadContact : function(){
                 var _this = this;
                    var bms_token = this.app.get('bms_token');
                    //Load subscriber details, fields and tags
                    this.app.showLoading("Loading Contact Details...", this.$el);
                    var URL = "/pms/io/subscriber/getData/?BMS_REQ_TK=" + bms_token + "&subNum=" + this.sub_id + "&type=getSubscriber";
                    jQuery.getJSON(URL, function(tsv, state, xhr) {
                        _this.app.showLoading(false, _this.$el);
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (_this.app.checkError(_json)) {
                            return false;
                        }
                        else{
                            
                           _this.$el.html(_this.template({_json: _json}));
                        }
                        /*Contact Name on Header*/
                        /*if (_json.firstName !== "" || _json.lastName !== "")
                        {
                            _this.$el.parents(".ws-content").find("#workspace-header").html(_json.firstName + " " + _json.lastName);
                        } else {
                            _this.$el.parents(".ws-content").find("#workspace-header").html(_json.email);
                        }*/
                        
                        /*var create_date = moment(_this.app.decodeHTML(_json.creationDate), 'YYYY-M-D H:m');
                        _this.$(".s-date").html(create_date.date());
                        _this.$(".s-month-year").html("<strong>" + _this.app.getMMM(create_date.month()) + "</strong> " + create_date.year());
                        _this.sub_fields = _json;
                        
                        if(_json.score !== '0'){
                            _this.$('.score').html('<i class="icon score"></i>+<span class="score-value">'+_json.score+'</span>');
                        }else{
                            _this.$('.score').html('<i class="icon score"></i>&nbsp;<span class="score-value">0</span>');
                        }*/
                        //_this.showTags();
                        //_this.showFields();
                    })
                
            },
            openContact:function(event){
                event.stopPropagation();
                event.preventDefault();
                this.removeCard();
                this.app.mainContainer.openSubscriber(this.sub_id);
            },
            getFirstAlphabet : function(json){
                var sub_name='';
                 if(json.firstName){
                          sub_name = json.firstName;
                      }else if(json.lastName){
                          sub_name = json.lastName;
                      }else{
                          sub_name = json.email;
                      }
                     return sub_name.charAt(0);
            },
            getFullName:function(){
                var name = this.model.get('firstName') + " " + this.model.get('lastName');
                if(!this.model.get('firstName') || !this.model.get('lastName'))
                    return this.model.get('email');
                else 
                    return name;
            },
            firstLetterUpperCase:function(){
                
             return this.model.get('salesStatus').toLowerCase().replace(/\b[a-z]/g, function(letter) {
                   return letter.toUpperCase();
              });
            },
            selectContact:function(){
                //alert(this.model.get('firstName'));
                
                
                this.parent.parent.subNum = this.model.get('subNum');
                this.$el.parents('#tblcontacts').find('.checkedadded-preview').hide();
                this.$el.parents('#tblcontacts').find('.use-preview-btn').show();
                
                if(this.options.isCamPreview){
                    this.parent.$el.find('#contact-search').val(this.app.decodeHTML(this.getFullName()));
                    this.parent.$el.find('.stats_listing').hide();
                     this.$el.parents('.modal').find('.modal-header #dialog-title .loading-wheel').show();
                    this.$el.parents('#camp-prev-contact-search').css('background','none');
                }else{
                    this.$el.parents('.modal-body').find('.contact-name').text(this.app.decodeHTML(this.getFullName()));
                    this.$el.parents('.modal-body').find('#contact-name-prev').show();
                    this.parent.$el.parent().hide();
                }
                this.$('.use-preview-btn').hide();
                //this.$('.checkedadded-preview').show();
                this.parent.parent.setiFrameSrc();
            },
            removeCard:function(){
                this.$el.parents('#contact-vcard').remove();
                this.parent.isVisitcontactClick = false;
            },
            selectSalesStatus : function(){
                this.parent.$el.find('.salestatus').click();
            }
            
        });
});