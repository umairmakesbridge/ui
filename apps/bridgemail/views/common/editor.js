define(['jquery','backbone', 'underscore', 'text!templates/common/editor.html'],
	function ($,Backbone,_, template) {
		'use strict';
		return Backbone.View.extend({			                                               
                        className:'fullwindow campaign-content',
                        tagName: 'div',
                        events: {                            
                            'click .btn-gray':function(obj){
                                this.hideEditor();
                                this.page.wizard.back();
                            },
                            'click .mergefields-box' :function(obj){
                                this.showMergeFieldDialog(obj);
                            },
                            'click .save_editor':function(obj){
                                var button = $.getObj(obj,"a");
                                if(!button.hasClass("saving")){
                                    this.page.saveStep2(false);
                                    button.addClass("saving");
                                }                                                                
                            }
                            ,
                            'click .save_continue_editor':function(){
                                this.hideEditor();
                                this.page.wizard.validateStep();
                            },
							'click .selectiondropdown li':function(obj){
								var camp_obj = this.options.opener;
								var source_li =$.getObj(obj,"li"); 
								//camp_obj.step2SlectSource(target_li);
								this.hideEditor();
								camp_obj.$el.find(".step2 #"+source_li.attr('id')).click();
							},
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
                            
			},
                        showMergeFieldDialog:function(obj){                                      
                            var btn = $.getObj(obj,"button");
                            var ele_offset = btn.offset();
                            var ele_width =  btn.width();
                            var ele_height =  btn.height();
                            var top = ele_offset.top + ele_height+11;
                            var left = ele_offset.left -193 ;
                            var m_fields_box = $(".mergefields");
                            if(m_fields_box.css("display")=="block" && parseInt(m_fields_box.css("top"))==parseInt(top)){
                                m_fields_box.hide();
                            }
                            else{
                                $(".mergefields .browsefields").show();
                                m_fields_box.addClass("mergefields_editor");
                                $(".mergefields .searchfields,#remove-merge-list").hide();                                
                                $("#merge_list_search").val("");

                                m_fields_box.css({"top":top+"px","left":left+"px"}).show();

                                var input_container = "editor_mergeinput";
                                m_fields_box.attr("input-source",input_container);

                                if($(".merge-feilds-type li.active").length==0){
                                    $(".merge-feilds-type li#mergefields_basic").click();
                                }
                            }
                            obj.stopPropagation();
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
                                               // console.log('Editor contents was modified. Contents: ');
                                        });
                                }

                        });
                        },
                        showEditor:function(){
                            this.$el.show();                            
                            $("body").css("overflow","hidden");
                            $("html,body").scrollTop(0);
                            var editor_height = $(window).height()-166;
                            this.$el.css({width:($(window).width()-32)+"px",height:editor_height+"px"});
                            var editor_window_height = editor_height - 172;
                            this.$("#bmseditor_ifr").css("height",editor_window_height+"px");
                            $("#activities,#search,.icons-bar").hide();
                            $(".camp_header #more-tool-actions li:nth-child(2)").hide();
                            $(".camp_header #more-tool-actions li:nth-child(3)").hide();
                            this.$("#editor_mergeinput").val('');
                            
                        },
                        hideEditor:function(){
                            this.$el.hide();
                            $("body").css("overflow","auto");                            
                            $(".camp_header").removeClass("workspace-fixed-editor"); 
                            $("#activities,#search,.icons-bar").show();
                            $(".camp_header #more-tool-actions li:nth-child(2)").show();
                            $(".camp_header #more-tool-actions li:nth-child(3)").show();
                        }
                        
                        
		});
	});
