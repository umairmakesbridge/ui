define(['text!contacts/html/subscriber.html','jquery.searchcontrol','jquery.chosen','moment','bms-tags'],
function (template,jsearchcontrol,chosen,moment,tags) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Subscriber detail page view depends on search control, chosen , date library moment and tags control
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({     
            className:'subscriber-detail',
            basicFields:{"firstName":{"label":"First Name"},"lastName":{"label":"Last Name"},"email":{"label":"Email"},"company":{"label":"Company"},"city":{"label":"City"},
                        "country":{"label":"Country"},"state":{"label":"State"},"zip":{"label":"Zip"},"address1":{"label":"Address 1"},"address2":{"label":"Address 2"},
                        "areaCode":{"label":"Area Code"},"telephone":{"label":"Telephone"},"jobStatus":{"label":"Job Status"},"industry":{"label":"Industry"},"salesRep":{"label":"Sales Rep"},
                        "source":{"label":"Source"},"salesStatus":{"label":"Sales Status"},"occupation":{"label":"Occupation"},"birthDate":{"label":"Birthday"}},           
            /**
             * Attach events on elements in view.
            */        
            events: {				
                'click .toggleinfo':'toggleFieldsView',
                'click .edit-profile':'editProfile',
                'click .manage-lists':'manageLists'
            },
            /**
             * Initialize view - backbone
            */
            initialize:function(){
               this.sub_fields = null;
               this.current_ws = null;
               this.template = _.template(template);			   
               this.render();
            },
            /**
             * Render view on page.
            */
            render: function () {
               this.$el.html(this.template({}));
               this.app = this.options.app;
                if(this.options.params && this.options.params.sub_id){
                    this.sub_id = this.options.params.sub_id;
                }
               this.initControls();
               this.loadData();
            }
            ,
            /**
             * Custom init function called after view is completely render in wrokspace.
            */
            init:function(){
                this.current_ws = this.$el.parents(".ws-content");
                this.tagDiv = this.current_ws.find("#campaign_tags");
                this.tagDiv.show();
                                
                var editIconSub = $('<a class="icon edit"></a>');
                var deleteIconSub = $('<a class="icon delete"></a>');
                var action_icon = $('<div class="pointy"></div>")');
                action_icon.append(editIconSub);
                //action_icon.append(deleteIconSub);
                this.current_ws.find(".edited  h2").append(action_icon);
               
                editIconSub.click(_.bind(function(){
                    this.editProfile();
                },this));
                
                this.loadActivityTimeLine();
                
            },
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){                
                
                this.$(".connection-setup").chosen({ width: "150px",disable_search: "true"})                
               
            },
            /**
             * Loading data from server to populate page info.
            */
            loadData:function(){
                var _this = this;
                var bms_token =this.app.get('bms_token');
                //Load subscriber details, fields and tags
                this.app.showLoading("Loading Contact Details...",this.$el);   
                var URL = "/pms/io/subscriber/getData/?BMS_REQ_TK="+bms_token+"&subNum="+this.sub_id+"&type=getSubscriber";
                jQuery.getJSON(URL,  function(tsv, state, xhr){                    
                    _this.app.showLoading(false,_this.$el);   
                    var _json = jQuery.parseJSON(xhr.responseText); 
                    if(_this.app.checkError(_json)){
                        return false;
                    }
                    _this.$el.parents(".ws-content").find("#workspace-header").html(_json.firstName + " "+_json.lastName)
                    var create_date = moment(_this.app.decodeHTML(_json.creationDate),'YYYY-M-D H:m');                    
                    _this.$(".s-date").html(create_date.date());
                    _this.$(".s-month-year").html("<strong>"+_this.app.getMMM(create_date.month())+"</strong> "+create_date.year());
                    _this.sub_fields = _json;
                    _this.showTags();
                    _this.showFields();
                })               
                
                //Loading subscriber activities like last seen, visists and actions 
                this.app.showLoading("States..",this.$(".sub-stats"));   
                URL = "/pms/io/subscriber/getData/?BMS_REQ_TK="+bms_token+"&subNum="+this.sub_id+"&type=getActivityStats";
                jQuery.getJSON(URL,  function(tsv, state, xhr){                    
                    _this.app.showLoading(false,_this.$(".sub-stats"));   
                    var _json = jQuery.parseJSON(xhr.responseText); 
                    if(_this.app.checkError(_json)){
                        return false;
                    }
                    _this.$("._visits").html(_json.visits);
                    _this.$("._actions").html(_json.actions);
                    if(_json.lastSeanDate){
                        var date_today = new Date();
                        var date1 = moment(date_today.getFullYear()+'-'+(date_today.getMonth()+1)+'-'+date_today.getDate()+" "+date_today.getHours()+":"+date_today.getMinutes(),'YYYY-M-D H:m');
                        var date2 = moment(_this.app.decodeHTML(_json.lastSeanDate),'YYYY-M-D H:m');
                        var diffMin = date1.diff(date2, 'minutes');
                        var diffHour = date1.diff(date2, 'hours');
                        var diffDays = date1.diff(date2, 'days');
                        var diffMonths = date1.diff(date2, 'months');
                        var diffYear = date1.diff(date2, 'years');
                        if(diffMin<60){
                            _this.$(".seen-interval").html(diffMin);
                            _this.$(".seen-time-text").html("Mins")
                        }
                        else if(diffHour<24){
                            _this.$(".seen-interval").html(diffHour);
                            _this.$(".seen-time-text").html("Hrs")
                        }
                        else if(diffDays<32){
                            _this.$(".seen-interval").html(diffDays);
                            _this.$(".seen-time-text").html("Days")
                        }
                        else if(diffMonths<12){
                            _this.$(".seen-interval").html(diffMonths);
                            _this.$(".seen-time-text").html("Months")
                        }
                        else if(diffMonths<=12){
                            _this.$(".seen-interval").html(diffYear);
                            _this.$(".seen-time-text").html("Years")
                        }
                    }
                    else{
                        _this.$(".seen-interval").html("&nbsp;");
                        _this.$(".seen-time-text").html("-")
                    }
                })
                
                //Loading subscriber activities COUNT like email, alert, workflows, segements, lists and alerts
                this.app.showLoading("Activities...",this.$(".activity-details"));                  
                URL = "/pms/io/subscriber/getData/?BMS_REQ_TK="+bms_token+"&subNum="+this.sub_id+"&type=getInvolvedInStats";
                jQuery.getJSON(URL,  function(tsv, state, xhr){                    
                    _this.app.showLoading(false,_this.$(".activity-details"));  
                    var _json = jQuery.parseJSON(xhr.responseText); 
                    if(_this.app.checkError(_json)){
                        return false;
                    }
                    $.each(_json,function(key,value){
                        _this.$("."+key).html(value);
                    })
                })                               
            },
            /**
             * Show tags of view called when data is fetched.
            */
            showTags:function(){
                var tags = this.sub_fields.tags;                                    
                this.tagDiv.tags({app:this.app,
                    url:'/pms/io/subscriber/setData/?BMS_REQ_TK='+this.app.get('bms_token'),
                    params:{type:'tags',subNum:this.sub_id,tags:''}
                    ,showAddButton:true,
                    tempOpt:true,
                    tags:tags,
                    typeAheadURL:"/pms/io/user/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=allSubscriberTags"
                 });
                 
            },
            /**
            * Show and hide large view of fields on view.
            *
            * @param {obj} clicked object.
            *
            * @returns .
            */
            toggleFieldsView:function(obj){
                var a_button = $.getObj(obj,"a");
                if(a_button.hasClass("up")){
                    this.$(".topinfo").scrollTop(0)
                    this.$('.topinfo').animate({'height':'173px'},1000,function(){
                        $(this).css("overflow-y","hidden");
                    });

                    a_button.removeClass("up")
                }
                else{
                    this.$(".topinfo").animate({'height':'420px'},1000,function(){
                        $(this).css("overflow-y","auto");
                    });                        
                    a_button.addClass("up")
                }                               
            },
            /**
             * Populate basic and custom fields in view.
            */
            showFields:function(){
                var _this = this;
                _this.$(".topinfo").children().remove();
                var changeFieldsBtn = $('<a class="settingbtn"></a>');
                    changeFieldsBtn.click(_.bind(this.editProfile,this));
                _this.$(".topinfo").append(changeFieldsBtn);
                $.each(_this.basicFields,function(key,val){
                      var _val = _this.sub_fields[key] ? _this.sub_fields[key] : "&nbsp;";
                      _this.$(".topinfo").append('<span>'+val.label+'<strong>'+_val+'</strong> </span>');
                    
                })
                if(_this.sub_fields.cusFldList){
                    $.each(_this.sub_fields.cusFldList[0], function(key, val) {  
                        $.each(val[0],function(key,val){
                              var _val = val?val:"&nbsp;";
                              _this.$(".topinfo").append('<span>'+key+'<strong>'+_val+'</strong> </span>');
                              
                         });
                    });
                }
                _this.$(".topinfo").append('<div class="clearfix"></div>');                
                if(this.sub_fields["salesStatus"]){
                   this.$(".statusdd").show();  
                   this.$(".statusdd span").html(this.sub_fields["salesStatus"]);
                }
                else{
                   this.$(".statusdd").hide(); 
                }
                this.$(".score span").html(this.sub_fields["score"]);
            },
            /**
             * Open edit profile dialog view.
            */
            editProfile:function(){
                 var _this = this;
                 var dialog_width = 1000;
                 var dialog_height = $(document.documentElement).height()-182;                 
                 var btn_prp ={title:'Edit Profile',
                        css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                        headerEditable:false,
                        headerIcon : 'account',
                        bodyCss:{"min-height":dialog_height+"px"},                                                                          
                        buttons: {saveBtn:{text:'Update',btnicon:'update'}}                        
                 }
                 if(this.sub_fields["conLeadId"]){
                    btn_prp['newButtons'] = [{'btn_name':'Update at Salesforce'}];
                 }
                 var dialog = this.app.showDialog(btn_prp);
                 this.app.showLoading("Loading...",dialog.getBody());                                  
                 require(["contacts/subscriber_fields"],function(sub_detail){                                     
                    var page = new sub_detail({sub:_this});                    
                    dialog.getBody().html(page.$el);
                    if(_this.sub_fields["conLeadId"]){
                        dialog.saveCallBack2(_.bind(page.updateSubscriberDetailAtSalesForce,page,dialog));
                    }
                    dialog.saveCallBack(_.bind(page.updateSubscriberDetail,page,dialog));
               });
            }
            /**
             * Manage lists , loading view in same area and hiding parent detail view.
            */
            ,
            manageLists:function(){
                var _this = this;
                 var dialog_width = 1000;
                 var dialog_height = $(document.documentElement).height()-182;                 
                 var btn_prp ={title:'Manage Lists',
                        css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10%"},
                        headerEditable:false,
                        headerIcon : 'mlist2',
                        bodyCss:{"min-height":"448px"},                                                                          
                        buttons: {saveBtn:{text:'Save',btnicon:'save'}}                        
                 }
                
                var dialog = this.app.showDialog(btn_prp);
                this.app.showLoading("Loading...",dialog.getBody());                                                                   
                require(["contacts/manage_lists"],function(sub_manage_lists){                                     
                    var page = new sub_manage_lists({sub:_this});                    
                    dialog.getBody().html(page.$el);
                    dialog.saveCallBack(_.bind(page.updateSubscriberLists,page,dialog));
                });
            },
            fetchContacts:function(){
                //this.sub.fetchContacts();
            },
            loadActivityTimeLine:function(){
                var _this = this;
                this.app.showLoading("Loading Timeline...",this.$(".colright"));                                                                   
                require(["contacts/subscriber_timeline"],function(timeline){                                     
                    var page = new timeline({sub:_this});                    
                    _this.$(".colright").html(page.$el);                    
                });
            }
            
        });
});