/* 
 * This file is used for copying existing template only.
 * This file is depended on html/copytemplate.html
 * its called from template library - copy campaign and template detail -- copy template.
 */
define(['text!./html/copytemplate.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {
                    'keypress .inputcont #template_name':'enterSave'
                },
                enterSave:function(e){
                     if(e.which === 13){ 
                        this.options.templatesDialog.$el.find('.btn-save').click();  
                      }
                },
                initialize: function () {
                    this.template = _.template(template);				
                    this.render();
                    var app = this.options.app;
                    var copydialog = '';
                    if(this.options.templateDialog)
                            copydialog = this.options.templateDialog;
                    else
                            copydialog = this.options.templatesDialog;
                    var curview = this;
                    this.app.showLoading(false,copydialog.getBody());
                    var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=get&templateNumber="+this.options.template_id;;
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){                        
                                curview.app.showLoading(false,curview.$el);
                                var template_json = jQuery.parseJSON(xhr.responseText);                                                                                               
                                if(curview.app.checkError(template_json)){
                                     return false;
                                }
                                curview.$el.find('.copy_campbox h2 span').html(template_json.name);
                                curview.$el.find('#template_name').focus();
                                //copydialog.$el.find('#template_name').on('keypress',function(e){
                                   // if ( e.which === 13 ) 
                                    //   copydialog.$el.find('.btn-save').click();
                                   // else 
                                     //  return true;
                                //}) ;
                         }
                    });
                         
                },
                render: function () {                        						
                    this.app = this.options.app;
                    this.$el.html(this.template({}));
                },
               copyTemplate : function(){
                        var template_id = this.options.template_id;
                        var curview = this;
                        var page = this.options.templ;
                        var _current = this.options._current;
                        var app = this.options.app;
                        var el = curview.$el;
                        var appMsgs = app.messages[0];
                        var templateName = el.find('#template_name').val();
                        if(!templateName){						
                                app.showError({
                                        control:el.find('.templatename-container'),
                                        message:appMsgs.CAMPS_templatename_empty_error
                                });
                        }
                        else{
                                var URL = "/pms/io/campaign/saveUserTemplate/?BMS_REQ_TK="+app.get('bms_token')+"&type=clone";
                                app.showLoading("Creating copy of Template...",curview.$el);
                                $.post(URL, { templateNumber: template_id,templateName: templateName})
                                .done(function(data) {
                                        app.showLoading(false,curview.$el);
                                        var res = jQuery.parseJSON(data);
                                        if(res[0] == 'err')
                                            app.showAlert(res[1].replace('&#58;',':'),curview.$el);
                                        else if(!res[1]){
                                            app.showAlert(res[1].replace('&#58;',':'),curview.$el);
                                        }else{
                                                      var id = res[1];
                                                      var isTotal = true;
                                                       
                                                      if(typeof page !="undefined"){ 
                                                        page.dialog.hide();
                                                      }
                                                      //curview.options.dialog.hide();
                                                      curview.options.templatesDialog.hide();
                                                      //_current.template_id = id;
                                                      _current.updateTemplate(id,isTotal);
                                                      _current.$el.find("#template_search_menu li:first-child").removeClass("active").click();
                                                
                                          } 
                                });
                        }
                }
        });
});



