define(['jquery','backbone','app', 'tinymce','views/common/header', 'text!templates/main_container.html','views/common/footer','views/common/news','views/workspace'],
        function($,Backbone, app,_tinymce, HeaderView ,LandingPage,FooterView,NewsView,WorkSpace){
  "use strict";
  
   return Backbone.View.extend({       
      id: 'main-container', 
      tagName :'div',
      wp_counter:0,
      events: {
          'click .tw-toggle button':function(obj){
              if(!$(obj.target).find("span").hasClass("workspace")){
                  if(!$(obj.target).hasClass("active")){
                      $(".tw-toggle button").removeClass("active");
                      $(obj.target).addClass("active");
                      $("#tiles").show();                      
                      $('#workspace').animate({left:'150%'},function(){
                          $(this).hide();
                      });
                                            
                  }
              }
              else{
                  if(!$(obj.target).hasClass("active")){
                       $(".tw-toggle button").removeClass("active");
                       $(obj.target).addClass("active"); 
                       $("#tiles").hide();
                       $('#workspace').show();
                       $('#workspace').animate({left:'0%'});  
                       
                       if(this.$el.find("#wstabs li").length==1){
                          this.openCampaign();                                                       
                      }
                  }
              }
              
          }
          ,
          'click #activities ul.tabnav > li > a' : function(){
                if($('#activities').css("right")=="0px"){
                    $('#activities').animate({right:-285});
                }
                else{
                    $('#activities').animate({right:0});
                }
          },
          'click #li_campaigns' : function(){
              var hash = CryptoJS.MD5("/pms/report/CustomizeAnalyticsPage.jsp");
              alert("checksum = "+hash);
          },
          'click #wp_li_1':function(obj){              
              var li = obj.target.tagName=="LI"?$(obj.target):$(obj.target).parents("li");
              this.activeWorkSpace(li);
          }
          ,
          'click #wp_li_0' : function(){
              this.addWorkSpace({type:''});
              
          }
          
      },
      initialize:function(){
         this.header = new HeaderView();
         this.footer = new FooterView();
         this.news = new NewsView();         
         this.render();
      }
      ,      
      render:function(){       
          // Render header, main container, footer and news panel          
          this.$el.append(this.header.$el,LandingPage, this.footer.$el,this.news.$el);          
      },
      addWorkSpace:function(options){
           var workspace_li = $("#wstabs li[workspace_id='"+options.workspace_id+"']");
           if(workspace_li.length===0){
                this.wp_counter = this.wp_counter +1;
                var obj = $(".tw-toggle button").eq(1);
                 if(!$(obj).hasClass("active")){                
                     $(".tw-toggle button").removeClass("active");
                     $(obj).addClass("active"); 
                     $("#tiles").hide();
                     $('#workspace').show();
                     $('#workspace').css({left:'0%'});  
                 }
                 
                var wp_count = this.wp_counter ; 
                if(options && options["params"]){
                    options["params"]["wp_id"] = wp_count;
                }
                var wp_view = new WorkSpace(options);              

                wp_view.$el.addClass("active");                

                $(".ws-tabs li").removeClass('active');
                var workspaceid = options.workspace_id?('workspace_id="'+options.workspace_id+'"'):"";
                $('#wp_li_0').before('<li class="active" id="wp_li_'+wp_count+'" '+workspaceid+'><a><span class="icon step1"></span></a></li>');

                wp_view.$el.attr("id","workspace_"+wp_count);
                $("#workspace .ws-content.active").removeClass('active').css("display","none");
                $("#workspace .workspace").append(wp_view.$el.fadeIn('fast',function(){
                     wp_view.initScroll(wp_view.$el);
                }));
                wp_view.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});

                var self = this;
                $("#wp_li_"+wp_count).click(function(){                  
                    self.activeWorkSpace($(this));
                });
           }
           else{
               if(!workspace_li.hasClass("active")){
                    workspace_li.click();
               }
           }
           

       },
       activeWorkSpace:function(obj){

         if(!obj.hasClass("active")){
             $(".ws-tabs li").removeClass('active');
             $("#workspace .ws-content.active").removeClass('active').css("display","none");
             obj.addClass("active");
             var workspace_id = obj.attr("id").split("_")[2];
             $("#workspace #workspace_"+workspace_id).fadeIn('fast',function(){
                 $("#workspace #workspace_"+workspace_id).addClass("active");
             });
         }
      },
      openCampaign:function(camp_id){
          var camp_id = camp_id?camp_id:0;
          this.addWorkSpace({type:'wizard',
            title:"Campaigns",
            workspace_id: 'campaign_'+camp_id,
            url : 'campaign',
            params: {camp_id:camp_id},
            wizard :{steps:4,active_step:1,step_text:["Settings","Create","Recipients","Schedule"]},
            actions :[{'iconCls':'campaigns','text':'New Campaign','url':''},{'iconCls':'upload-subscribers','text':'Upload Subscribers','url':''}
                      ,{'iconCls':'add-list','text':'Add List','url':''},{'iconCls':'forms','text':'Create Form','url':''}  
                      ,{'iconCls':'segments','text':'Edit Segments','url':''},{'iconCls':'reports','text':'Reports','url':''}  
                      ]
          });                               
      }
   });
   
});


