define(['jquery','backbone', 'underscore', 'text!editor/html/editor.html'],
	function ($,Backbone,_, template) {
		'use strict';
		return Backbone.View.extend({			                                                                       
                        className:'editor_box',
                        tagName: 'div',
                        events: {                            
                            'click .btn-gray':function(obj){
                                this.hideEditor();
                                this.page.wizard.back();
                            },
                            'click .editorbtn':function(){
                                this.$el.hide();
                                this.$el.prev().show();
                                this.$el.prev().find("textarea").val(tinyMCE.get('bmseditor_'+this.editor_id).getContent());
                            }
                        },
			initialize: function () {                            
                            this.template = _.template(template);				
                            this.page = this.options.opener;
                            this.editor_id = this.options.wp_id;
                            this.render();                               
			},

			render: function () {
                            this.$el.html(this.template({}));	                                   
                            this.$("#bmseditor").attr("id","bmseditor_"+this.editor_id);
                            this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
			},
                        initEditor:function(options){
                            var editor = this;
                            tinyMCE.init({
                                // General options
                                mode : "exact",
                                elements : "bmseditor_"+options.id,
                                theme : "advanced",
                                plugins : "contextmenu,fullscreen,inlinepopups,paste,searchreplace,iespell,style,table,visualchars,fullpage,preview,imagemanager",
                                //browsers : "msie,gecko,opera,safari",

                                doctype : '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">',
                                element_format : "html",

                                //plugins : "safari",
                                convert_urls : false,
                                relative_urls : false,
                                remove_script_host : false,

                                // paste options
                                paste_auto_cleanup_on_paste : true,
                                paste_retain_style_properties : "none",
                                paste_convert_middot_lists : false,
                                paste_strip_class_attributes : "all",
                                paste_remove_spans : true,
                                paste_remove_styles : true,
                                paste_text_use_dialog : true,
                                //paste_text_sticky : false,
                                paste_text_linebreaktype : "<br>",


                                // for <br>
                                forced_root_block : "",
                                force_br_newlines : true,
                                force_p_newlines : false,

                                // clean code
                                //apply_source_formatting : true,
                                //convert_newlines_to_brs : true,
                                convert_fonts_to_spans : false,
                                valid_elements : "*[*]",
                                height:450,

                                // Theme options
                                theme_advanced_buttons1 : "newdocument,bold,italic,underline,justifyleft,justifycenter,justifyright,justifyfull,formatselect,fontselect,fontsizeselect",
                                theme_advanced_buttons2 : "cut,copy,paste,pastetext,pasteword,search,replace,bullist,numlist,outdent,indent,blockquote,undo,redo,hr,removeformat,sub,sup,forecolor,backcolor,link,unlink,anchor,image,insertimage,cleanup,code,fullscreen,preview",
                                theme_advanced_buttons3 : "",

                                //preview options
                                plugin_preview_width : "950",
                                plugin_preview_height : "750",

                                //theme_advanced_buttons4 : "styleprops",
                                theme_advanced_toolbar_location : "top",
                                theme_advanced_toolbar_align : "left",
                                theme_advanced_statusbar_location : "bottom",
                                theme_advanced_font_sizes: "8=8px,9=9px,10=10px,11=11px,12=12px,13=13px,14=14px,15=15px,16=16px,18=18px,20=20px,22=22px,24=24px,26=26px,28=28px,30=30px,36=36px",
                                theme_advanced_fonts : "Arial=Arial;Comic Sans MS=Comic Sans MS;Courier=Courier;Courier New=Courier New;Georgia=Georgia;Tahoma=Tahoma;"+
                                                        "Times New Roman=Times New Roman;Trebuchet MS=Trebuchet MS;Lucinda Sans Unicode=Lucinda Sans Unicode;Verdana=Verdana",
                                theme_advanced_resizing : true,


                                // Example content CSS (should be your site CSS)
                                content_css : "/pms/css/tiny_mce.css",
                                //font_size_style_values : "10px,12px,13px,14px,16px,18px,20px",

                                // Drop lists for link/image/media/template dialogs
                                template_external_list_url : "/pms/js/tiny_mce_templates.js",
                                external_link_list_url : "lists/link_list.js",
                                external_image_list_url : "lists/image_list.js",
                                media_external_list_url : "lists/media_list.js",


                                // Replace values for the template plugin
                                template_replace_values : {
                                        username : "Some User",
                                        staffid : "991234"
                                },
                                setup : function(ed) {
                                        ed.onChange.add(function(ed, l) {
                                                editor.page.states.editor_change = true;                                               
                                        });
                                }

                        });
                        },
                        showEditor:function(eid){
                            this.$el.show();                                                                                    
                            var editor_height = $(window).height()-431;
                            //this.$el.css({width:($(window).width()-32)+"px",height:editor_height+"px"});                            
                            this.$("#bmseditor_"+eid+"_ifr").css("height",editor_height+"px"); 
                            this.$("#bmseditor_"+eid+"_tbl").css("height",(editor_height-100)+"px");
                            //this.page.$("#bmstexteditor").css({"height":editor_height+"px","width":((this.$("#bmseditor_"+eid+"_tbl").width()-20)+"px")});                                                        
                        },
                        hideEditor:function(){
                                                                                
                        }
                        
                        
		});
	});
