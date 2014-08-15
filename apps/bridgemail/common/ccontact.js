/* 
 * Name: Common Contact View
 * Date: 02 April 2014
 * Author: Umair & Abdullah
 * Description: Single Contact View, Display Single Contact 
 * Dependency: CCONTACT HTML
 */

define(['text!common/html/ccontact.html','jquery.highlight'],
function (template,highlighter) {
        'use strict';
        return Backbone.View.extend({
            className: 'erow',
            tagName:'tr',
            
            events: {
              'click .view-profile':"openContact",
              'click .page-view':'loadPageViewsDialog',
              'click .select-contact-camp':'selectContact',
              'click .checkedadded-preview':'removeContact'
             
            },
            initialize: function () {
                //_.bindAll(this, 'getRightText', 'pageClicked');
                 this.template = _.template(template);
                 this.parent = this.options.page;
                 this.app = this.parent.app;
                 this.render();
            },
            render: function () {
                this.$el.html(this.template(this.model.toJSON())); 
                //this.template.id();
                
                //this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
                 if(this.parent.searchText){
                    this.$(".view-profile").highlight($.trim(this.parent.searchText));
                    this.$(".tag").highlight($.trim(this.parent.searchText));
                }else{
                    this.$(".tag").highlight($.trim(this.parent.searchTags));
                }
            },
            openContact:function(){
                this.$el.parents('.modal').find('.close').click();
                this.app.mainContainer.openSubscriber(this.model.get('subNum'));
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
            removeContact:function(){
                this.$el.parents('.modal-body').find('.contact-name').removeAttr('id').text('');
                this.$el.parents('.modal-body').find('#contact-name-prev').hide();
                this.$('.use-preview-btn').show();
                this.$('.checkedadded-preview').hide();
                this.parent.parent.subNum = null;
                this.parent.parent.setiFrameSrc();
            }
            
        });
});