/* 
 * Name: Visiting Contact Card
 * Date: 15 Deceber 2014
 * Author: Umair & Abdullah
 * Description: Single Contact View, Display Single Contact 
 * Dependency: Contact Card HTML
 */

define(['text!common/html/vcontact.html','jquery.highlight', 'bms-tags'],
function (template,highlighter,tags) {
        'use strict';
        return Backbone.View.extend({
            tagName:'div',
            
            events: {
              'click .view-profile,.viewdetail':"openContact",
              'click .vsalestatus':'selectSalesStatus',
              'click .closebtn':'removeCard'
             
            },
            initialize: function () {
                //_.bindAll(this, 'getRightText', 'pageClicked');
                 this.template = _.template(template);
                 this.parent = this.options.parent;
                 this.app = this.options.app;
                 this.sub_id = this.options.subNum;
                 this.sub_name = '';
                 this.jSon = '';
                 this.render();
            },
            render: function () {
                
                this.loadContact();
                this.$el.css({'position':'relative','background-color': '#fff','min-height':'170px','width':'100%'});
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
                                        if(_this.options.isOTOFlag){
                                 _this.hideElements();
                             }
                        }
                    })
                
            },
            getFirstAlphabet : function(json){

                 if(json.firstName){
                          this.sub_name = json.firstName;
                      }else if(json.lastName){
                          this.sub_name = json.lastName;
                      }else{
                          this.sub_name = json.email;
                      }
                     return this.sub_name.charAt(0);
            },
            openContact:function(){
                this.$el.parents('body').find('#contact-vcard').remove();
                this.app.mainContainer.openSubscriber(this.sub_id,this.sub_name);
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
            },
            hideElements : function(){
                this.$('.viewdetail').hide();
            }
            
        });
});