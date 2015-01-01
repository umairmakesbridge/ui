/* 
 * Name: Common Contacts Collection VIEW
 * Date: 02 April 2014
 * Author: Umair & Abdullah
 * Description: display All Contacts
 * Dependency: CCOntacts HTML, CContacts Collection, CContact View
 */
define(['text!common/html/ccontacts.html',"common/collections/ccontacts","common/ccontact"],
function (template,Contacts,viewContact) {
     'use strict';
        return Backbone.View.extend({
            events: {
                "keyup .search-control":"search",
                "click  #clearsearch":"clearSearch",
                'click .stats-scroll':'scrollToTop',
                'click #prev-closebtn':'closeContactsListing'
            },
            className:'contacts-div',
            initialize: function () {
                 this.template = _.template(template);	
                 //this.type= "campaignResponders";
                 this.objContacts = new Contacts();
                 this.responderType = this.options.type;
                 //this.campNum = this.options.campNum;
                 //this.where = this.options.listing;
                 //this.contacts_request = null;
                 this.offsetLength = 0;
                 this.offset = 0;
                 this.searchText = '';
                 this.tagText = '';
                 this.total_fetch  = 0;
                 this.total = 0;
                 this.timer = 0;
                 this.app = this.options.page.app;
                 this.parent = this.options.page;
                 this.searchWidth = this.options.searchCss ? this.options.searchCss:'415px';
                 this.isOTOFlag = (this.options.isOTOFlag) ? this.options.isOTOFlag  : false;
                 this.contactHeight = this.options.contactHeight;
                 this.placeholderText = this.options.placeholderText ? this.options.placeholderText:'Search Contacts &amp; Tags';
                 this.isHideCross = this.options.hideCross;
                 this.isCamPreview = this.options.isCamPreview;
                 this.render();
                  
            },
            render: function () {
              this.$el.html(this.template());
              //this.loadContacts();
             if(this.where != "page"){
                this.$el.find(".stats_listing").scroll(_.bind(this.liveLoading,this));
                this.$el.find(".stats_listing").resize(_.bind(this.liveLoading,this));
              }
              // Search Text Width 
              if(this.isHideCross)this.$('#prev-closebtn').hide();
              if(this.isCamPreview)this.$('.stats_listing').hide();
           // $(window).scroll(_.bind(this.liveLoading,this));
           // $(window).resize(_.bind(this.liveLoading,this));
             
             },
              loadContacts:function(fcount){
                   var _data = {};
                     if(!fcount){
                        this.offset = 0;
                    }
                    else{
                      this.offset = this.offset + this.offsetLength;
                  }
                  if(this.contacts_request)
                    this.contacts_request.abort();
                 
                 if(this.offset == 0){
                         this.$el.find(".temp-filters").remove();  
                        this.$el.find('#tblcontacts tbody').empty();
                        this.objContacts.reset();
                        
                        if(this.where == "page"){
                        // this.$el.find(".contact-search").before(this.badgeText());
                        }else{
                         //this.$el.find(".contact-search").after(this.badgeText("margin-left:1%"));
                        }
                  
                  }
                  this.$el.find('#tblcontacts tbody .load-tr').remove();
                  this.$el.find('#tblcontacts tbody').append("<tr class='erow load-tr' id='loading-tr'><td colspan=4><div class='no-contacts' style='display:none;margin-top:15px;padding-left:43%;'>No contacts founds!</div><div class='loading-contacts' style='margin-top:45px'></div></td></tr>");
                  this.$('.bmsgrid div.bDiv').css({'background':'none','overflow':'hidden'});
                  this.app.showLoading("&nbsp;",this.$el.find('#tblcontacts tbody').find('.loading-contacts'));
                 
                  var that = this;
                  _data['offset'] = this.offset;
                  _data['responderType'] = this.responderType;
                  _data['type'] = this.type ;
                  _data['orderBy'] = "firstName";
                  //_data['campNum'] = this.campNum ;
//                  if(this.options.article)
//                    _data['articleNum'] = this.options.article;
                  
              
                    if(this.searchText){
                      _data['searchValue'] = this.searchText;
                       //that.showSearchFilters(this.searchText);
                    }
                       this.contacts_request = this.objContacts.fetch({data:_data,success:function(data1){
                      //that.$el.find('#total_subscriber .badge').text(that.options.app.addCommas(that.objContacts.total));  
                      that.offsetLength = data1.length;
                       that.total_fetch = that.total_fetch + data1.length;
                      if(data1.models.length == 0) {
                          that.$el.find('.no-contacts').show();
                          that.$el.find('#tblcontacts tbody').find('.loading-contacts').remove();
                      }else{
                          that.$('#tblcontacts tbody').find('.loading-contacts').remove();
                           that.$el.find('#tblcontacts tbody #loading-tr').remove();
                      }
                      _.each(data1.models, function(model){
                           that.$el.find('#tblcontacts tbody').append(new viewContact({model:model,page:that,isCamPreview:that.isCamPreview}).el);
                       });
                       if(that.where != "page"){
                           if(that.contactHeight)
                                height = that.contactHeight;
                           else
                                var height = that.$el.find(".stats_listing").outerHeight(true) ;
                           if(height < 360){
                               
                             that.$el.find(".stats_listing").css({"height":height+"px", "overflow-y":"auto"});
                            
                           }else{
                                if(data1.models.length != 0)
                                    that.$el.find(".stats_listing").css({"height":"273px", "overflow-y":"auto"});
                             if(height > 375){
                                    that.$el.find(".stats_listing").find('.stats-scroll').remove();
                              that.$el.find(".stats_listing").append("<button class='stats-scroll ScrollToTop' type='button' style='display: none; position:absolute;bottom:5px;right:20px;'></button>") ;
                             
                             }
                           } 
                           
                       }
                        if(that.total_fetch < parseInt(that.objContacts.total)){
                               that.$el.find("#tblcontacts tbody tr:last").attr("data-load","true");
                          } 
                      
                      that.$el.find('#tblcontacts tbody').find('.tag').on('click',function(){
                          var html = $(this).html();
                          that.searchText = $.trim(html);
                          that.$el.find(".search-control").val("Tag: "+ html); 
                          that.$el.find('#clearsearch').show();
                          
                              //that.showSearchFilters(html);
                         
                          that.loadContacts();
                      });
                      that.$el.find('#tblcontacts tbody').find('.salestatus').on('click',function(){
                          var html = $(this).html();
                          that.searchText = $.trim(html);
                          that.$el.find(".search-control").val("Sale Status: "+ html);
                          that.$el.find('#clearsearch').show();
                         // that.showSearchFilters(html);
                          that.loadContacts();
                      });
                     
                  }});
            },
            search:function(ev){
              this.searchText = '';
              this.searchTags = '';
              var that = this;
              var code = ev.keyCode ? ev.keyCode : ev.which;
              var nonKey =[17, 40 , 38 , 37 , 39 , 16];
              if ((ev.ctrlKey==true)&& (code == '65' || code == '97')) {
                    return;
              }
              if($.inArray(code, nonKey)!==-1) return;
               
               if (code == 13 || code == 8){
                 that.$el.find('#clearsearch').show();
                
                 var text = $(ev.target).val();
                 if(text){
                     that.searchText = text;
                     that.loadContacts();
                    }else{
                        this.$('#clearsearch').click();
                        return false;
                    }
               }else if(code == 8 || code == 46){
                   var text = $(ev.target).val();
                   if(!text){
                    that.$el.find('#clearsearch').hide();
                    this.searchText = text;
                    that.loadContacts();
                   }
               }else{ 
                     that.$el.find('#clearsearch').show();
                      if(that.isCamPreview) {that.$('.stats_listing').show();that.$el.parents('#camp-prev-contact-search').css('background','#fff');that.loadContacts();}
                     var text = $(ev.target).val();
                     clearTimeout(that.timer); // Clear the timer so we don't end up with dupes.
                     that.timer = setTimeout(function() { // assign timer a new timeout 
                         if ($(ev.target).val().length < 2) return;
                         that.searchText = text;
                         that.loadContacts();
                    }, 500); // 2000ms delay, tweak for faster/slower
               }
            }, 
            clearSearch:function(ev){
                   $(ev.target).hide();
                   $(".search-control").val('');
                   this.total = 0;
                   this.searchText = '';
                   this.searchTags = '';
                   this.total_fetch = 0; 
                   
                   if(this.isCamPreview) {
                       this.$('.stats_listing').hide();
                       this.parent.$el.find('#camp-prev-contact-search').css('background','none');
                       if(this.parent.subNum != null){
                           this.$el.parents('.modal').find('.modal-header #dialog-title .loading-wheel').show();
                           this.parent.subNum=null;
                           this.parent.setiFrameSrc();
                       }
                   };
                   this.$el.find("#total_subscriber span").html("contacts found");
                   
                   //this.loadContacts();
           },
           liveLoading:function(){
                var $w = $(window);
                var th = 200;
               /*Scroll to Top */
                    if (this.$el.find(".stats_listing").scrollTop()>70) {
                          this.$el.find(".stats-scroll").fadeIn('slow');
                       } else {
                          this.$el.find(".stats-scroll").fadeOut('slow');
                    }
               /*Ends*/
                var inview =this.$el.find('table tbody tr:last').filter(function() {
                    var $e = $(this),
                        wt = $w.scrollTop(),
                        wb = wt + $w.height(),
                        et = $e.offset().top,
                        eb = et + $e.height();
                    return eb >= wt - th && et <= wb + th;
                  });
                if(inview.length && inview.attr("data-load") && this.$el.height()>0){
                   inview.removeAttr("data-load");
                    this.loadContacts(this.offsetLength);
                }  
                
            },
            scrollToTop:function(){
                this.$el.find(".stats_listing").animate({scrollTop:0},600);    
            },
            closeContactsListing:function(){
                this.$el.parents('.modal-body').find('#contact-search').val('');
                this.$el.parents('.modal-body').find('#campaign-temp-contact-dialog').hide();
                  if(this.parent.subNum === null){
                      this.$el.parents('.modal-body').find('.annonymous-btn').removeClass('active');
                      this.$el.parents('.modal-body').find('#camp-prev-select-contact').addClass('active');
                  }
            }
        });
    
});