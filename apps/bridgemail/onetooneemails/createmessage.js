/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(['text!onetooneemails/html/createmessage.html','common/ccontacts','jquery.chosen'],
function (template,contactsView) {
   /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Subscriber Record View to show on listing page
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
           /**
             * Attach events on elements in view.
            */
            events: {
              // 'click .copy-camp':'copyEmail',
             //  "click .preview-camp":'previewEmail',
              // 'click .oto-subject':'subjectClick',
             //  'click .metericon':'showProgressMeter',
              // 'click .contact-name':'singleContact',
              // 'click .show-detail':'openContact'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.page;
                    this.app = this.parent.app;
                    this.subNum = '';
                    this.tagTxt = '';
                    this.sub_name = '';
                    this.render();
                    //this.model.on('change',this.renderRow,this);
            },
            render: function () {                    
                
               this.$el.html(this.template());
               this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});

                this.initControls();  
               
            },
            initControls : function(){
                 this.$("#campaign_from_email").chosen({no_results_text:'Oops, nothing found!', disable_search: "true"});
                var message_obj = this;
                /*this.$("#campaign_from_email").chosen().change(function(){
                    camp_obj.fromNameSelectBoxChange(this)
                    camp_obj.$("#campaign_from_email_input").val($(this).val());
                });*/
                this.$("#fromemail_default").chosen({no_results_text:'Oops, nothing found!', width: "62%",disable_search: "true"});                                        
                this.$("#fromemail_default").chosen().change(function(){                       
                    message_obj.$("#fromemail_default_input").val($(this).val());
                });
                this.$("#campaign_from_email_chosen .chosen-single div").attr("title","View More Options").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                this.$("#fromemail_default_chosen .chosen-single div").attr("title","View More Options").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
            },
            init:function(){
              this.setFromNameField();
              this.loadContact();
              //this.loadVContact(); // Call when subNum is available
             // this.loadData();  
              /*if(this.editable===false){
                this.$(".block-mask").show();
              }*/
            },
            setFromNameField:function(){
               var active_workspace = this.$el;
               var subj_w = this.$('#campaign_subject').width(); // Abdullah Check
               active_workspace.find('#campaign_from_email_chosen').css({"width":parseInt(subj_w+82)+"px"});   // Abdullah Try
                if(active_workspace.find("#campaign_from_email_input").prev().find(".chosen-single span").width()){  
                   active_workspace.find("#campaign_from_email_input").css({"width":active_workspace.find("#campaign_from_email_input").prev().find(".chosen-single span").width()+"px","margin-right":"61px"}); // Abdullah Check
                   active_workspace.find("#campaign_from_email_chosen .chosen-drop").css("width",(parseInt(active_workspace.find('#campaign_from_email_chosen').width()))+"px");
                 }
                 if(active_workspace.find("#fromemail_default_input").prev().find(".chosen-single span").width()){
                   active_workspace.find("#fromemail_default_input").css("width",active_workspace.find("#fromemail_default_input").prev().find(".chosen-single span").width()-6+"px");   // Abdullah Check
                 } 
            },
             loadContact : function(){
                    var active_ws = $(".modal-body");
                    active_ws.find('.campaign-clickers').remove();                    
                    active_ws.find('#camp-prev-contact-search').append(new contactsView({page: this, searchCss: '489px', contactHeight: '274px', hideCross: true, isCamPreview: true, placeholderText: 'Search for a contact to use for testing merge tag values',isOTOFlag:true}).el)
                    active_ws.find('#prev-closebtn').css({'top': '18px'});                    
                    return;
             }
    });   
});