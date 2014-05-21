define(['text!contacts/html/subscriber_row.html','jquery.highlight'],
function (template,highlighter) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Subscriber Record View to show on listing page
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            className: 'contactbox',
            detailFields:{"firstName":{"label":"First Name"},"lastName":{"label":"Last Name"},"email":{"label":"Email"},"company":{"label":"Company"},"city":{"label":"City"},
                        "country":{"label":"Country"},"state":{"label":"State"},"zip":{"label":"Zip"},"address1":{"label":"Address 1"},"address2":{"label":"Address 2"},
                        "areaCode":{"label":"Area Code"},"telephone":{"label":"Telephone"},"jobStatus":{"label":"Job Status"},"industry":{"label":"Industry"},"salesRep":{"label":"Sales Rep"},
                        "source":{"label":"Source"},"salesStatus":{"label":"Sales Status"},"occupation":{"label":"Occupation"},"birthDate":{"label":"Birthday"}},
             mapping:{"SU":{"name":"Signup Form"},"CS":{"name":"Campaign Sent"},"OP":{"name":"Campaign Open"},"CK":{"name":"Email Click"},"MT":{"name":"Single Message Sent"}
                    ,"MO":{"name":"Single Message Open"},"MC":{"name":"Single Message URL Click"},"MS":{"name":"Single Message Surpress"},"WM":{"name":"WF C2Y Trigger Mail"}
                    ,"MM":{"name":"MY C2Y Trigger Mail"},"UN":{"name":"Unsubscribe"},"SP":{"name":"Suppress"},"SC":{"name":"Score Change"},"TF":{"name":"Tell a friend"}
                    ,"WV":{"name":"Web Visit"},"WA":{"name":"Workflow Alert"},"S":{"name":"Sent"},"O":{"name":"Opened"},"C":{"name":"Clicked"}},        
            /**
             * Attach events on elements in view.
            */
            events: {
               'click .more-detail':'showDetail',
               'click .closebtn': 'hideDetail',
               'click .tag':'tagSearch'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.sub = this.options.sub
                    this.app = this.sub.app;
                    this.render();
                    this.model.on('change',this.renderRow,this);
            },
            /**
             * Render view on page.
            */
            render: function () {                    
                
                this.$el.html(this.template({
                    model: this.model,
                    time : this.getActivityDate(this.model.get("lastActivityDate")),
                    contact_name:this.getContactName(),
                    activity_type:this.mapping[this.model.get("lastActivityType")]?this.mapping[this.model.get("lastActivityType")].name:this.model.get("lastActivityType")
                }));                
                this.initControls();  
               
            },
            /**
             * Render Row view on page.
            */
            renderRow:function(){
              
            },
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                this.$('input.contact-row-check').iCheck({
                        checkboxClass: 'checkpanelinput',
                        insert: '<div class="icheck_line-icon"></div>'
                 });
                 
                 this.$('input.contact-row-check').on('ifChecked', _.bind(function(event){
                    this.trigger('updatecount');
                    return false;
                },this))
                
                this.$('input.contact-row-check').on('ifUnchecked', _.bind(function(event){
                    this.trigger('updatecount');
                    return false;
                },this))
                
                if(this.model.get("supress")=="S"){
                    this.$el.addClass("suppressed");
                    this.$(".checkpanelinput").addClass("disabled");
                }
                if(this.sub.searchTxt){
                    this.$(".show-detail").highlight($.trim(this.sub.searchTxt));
                    this.$(".tag").highlight($.trim(this.sub.searchTxt));
                }
                else if(this.sub.tagTxt){
                    this.$(".tag").highlight($.trim(this.sub.tagTxt));
                }
            },
            showDetail:function(){
                this.$(".allprofileinfo .proinfo span").remove();
                this.$(".allprofileinfo,.closebtn").show();                
                var _this = this;
                _.each(this.detailFields,function(val,key){
                    var _val = _this.model.get(key) ? _this.model.get(key): "&nbsp;";
                    _this.$(".allprofileinfo .proinfo").append('<span>'+val.label+'<strong>'+_val+'</strong></span>');
                    
                });
                
            },
            hideDetail:function(){
                this.$(".allprofileinfo,.closebtn").hide();
                this.$(".allprofileinfo .proinfo span").remove();
            },
            getActivityDate:function(_date){
                if(_date){
                    var date_time = this.app.decodeHTML(_date);
                    date_time = date_time.split(" ")[0];
                    var _date = date_time.split("-");
                    return _date[2]+" "+this.app.getMMM(parseInt(_date[1])-1)+", "+_date[0];
                }
                else{
                    return "";
                }
            },
            getContactName:function(){
                var fName = this.model.get("firstName");
                var lName = this.model.get("lastName");
                var full_name = this.app.decodeHTML(fName) + ' ' + this.app.decodeHTML(lName);
                if(!fName && !lName){
                    full_name = this.app.decodeHTML(this.model.get("email")) ;                   
                }
                return full_name;
            },
            tagSearch:function(obj){
                this.trigger('tagclick',$(obj.target).html());
                return false;
            }
            
        });
});