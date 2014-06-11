
jQuery(document).ready(function() {

	
$(function(){
      
      var $tiles = $('#tiles');
      
      
      // add randomish size classes
      $tiles.find('.box').each(function(){
        var $this = $(this),
            number = parseInt( $this.find('.number').text(), 10 );
        if ( number % 7 % 2 === 1 ) {
          $this.addClass('width2');
        }
        if ( number % 3 === 0 ) {
          $this.addClass('height2');
        }
      });
      
      $tiles.isotope({
        itemSelector: '.box',
        masonry : {
          columnWidth : 120
        }
      });
      
      
      // change size of clicked box
      $tiles.delegate( '.box', 'click', function(){
		 // $('.box').removeClass('expand');
        $(this).toggleClass('expand');
        $tiles.isotope('reLayout');
      });

      // toggle variable sizes of all boxs
      $('#toggle-sizes').find('a').click(function(){
        $tiles
          .toggleClass('variable-sizes')
          .isotope('reLayout');
        return false;
      });

 
      
    });
	
	
	
	//--------------------------------------
	


	$('.dropdown-toggle').toggle(function(){
		$('.dropdown-menu').css('display', 'block');
		$(this).addClass('open');
	},function(){
		$('.dropdown-menu').css('display', 'none');
		$(this).removeClass('open');
	});


	$('.srt-div-btn').toggle(function(){
		$('.srt-div').css('display', 'block'); 
	},function(){
		$('.srt-div').css('display', 'none'); 
	});



	$('#updates-bar .thumb').toggle(function(){
		$('#updates-bar').animate({bottom:0});
	},function(){
		$('#updates-bar').animate({bottom:-80})
	});



$('.stats-panel .slidetoggle').toggle(function(){
		$('.stats-panel > div').animate({height:215});
		$(this).addClass('close');
	},function(){
		$('.stats-panel > div').animate({height:70});
		$(this).removeClass('close');
	});
	

	
	
	$('#activities ul.tabnav > li > a').toggle(function(){
		$('#activities').animate({right:0});
	},function(){
		$('#activities').animate({right:-285});
	});
	
	
		$('#search > input').toggle(function(){
		$('.dd-search').css('display', 'block');
	},function(){
		$('.dd-search').css('display', 'none');
	});
	
	

	$('#tiles').hide();
	$('#workspace').animate({left:'0%'});
	/*
		$('.tw-toggle').toggle(function(){
			
			$('#tiles').fadeOut();
			setTimeout(function(){     
			$('#workspace').animate({left:'0%'});
			    },500);
				
		},function(){
			$('#workspace').animate({left:'150%'});
			setTimeout(function(){   
			$('#tiles').fadeIn();
			},500);
			
		});
		*/
		
		
		
		
			$('.toggleinfo').toggle(function(){
				$('.topinfo').animate({'height':'420px'},1000);
					$(this).addClass('up');
				},function(){
					$('.topinfo').animate({'height':'173px'},1000);
					$(this).removeClass('up');
			});
	
	 
		
		
	
		///////
		
		
			$('a.edit').click(function(){
				$('.c-name > div').css('display', 'block');
				//$(this).parent().css('display', 'none');
			});
			
			$('.schtoggle').click(function(){
				$('.schedule-camp').css('display', 'none');
				$('.sch-made').css('display', 'block');
				//$(this).parent().css('display', 'none');
			});
	
	
		//////////
	/*$('.icon').hover(function(){
			
			$(this).parent().addClass('active');
		},function(){
			
			$(this).parent().removeClass('active');
		});
		*/
		//////////
		
$( ".lc-accord .advncfilter " ).click(function() {
					$( this ).addClass( "active" );
					});
		
			
			
			
			$( ".c-name h2 span" ).click(function() {
					$('.c-name h2 span').css('display', 'none');
					$('.c-name h2 .editname').css('display', 'block');
					});
		
			
			
			
			
			
			
			

			

  });
  
  
  
  	$(document).ready(function(){
              $('input').iCheck({
                checkboxClass: 'checkinput',
                radioClass: 'radioinput'
              });
			  
			   $('input.checkpanel').iCheck({
                checkboxClass: 'checkpanelinput',
				insert: '<div class="icheck_line-icon"></div>'
              });
			  
			    $('input.radiopanel').iCheck({
				radioClass: 'radiopanelinput',
				insert: '<div class="icheck_radio-icon"></div>'
              });
			  
			   $( "ul.socialbtns li label " ).click(function() {
					$( this ).toggleClass( "btnchecked" );
					});
			
			
			$(".chosen-select").chosen();
			$(".nosearch").chosen({disable_search_threshold: 10});
								  
			  
			  
            });
			
	
	function initializeiCheck(parent) {
		$('input').iCheck('destroy');
		$('input.checkpanel').iCheck('destroy');
		$('input.radiopanel').iCheck('destroy');
		
		parent.find('input').iCheck({
                checkboxClass: 'checkinput',
                radioClass: 'radioinput'
              });
			  
			   parent.find('input.checkpanel').iCheck({
                checkboxClass: 'checkpanelinput',
				insert: '<div class="icheck_line-icon"></div>'
              });
			  
			    parent.find('input.radiopanel').iCheck({
				radioClass: 'radiopanelinput',
				insert: '<div class="icheck_radio-icon"></div>'
              });
			  
			   $( "ul.socialbtns li label " ).click(function() {
					$( this ).toggleClass( "btnchecked" );
					});
			

	}		 
			
			
  ////////////////////////////////////////////////////////////////////////
  (function($){
			$(window).load(function(){
				$(".scroll-content").mCustomScrollbar({
					scrollButtons:{
						enable:true
					},
					callbacks:{
						onScroll:function(){ 
							$("."+this.attr("id")+"-pos").text(mcs.top);
						}
					}
				});
				/*demo fn*/
				$(".output a[rel~='_mCS_1_scrollTo']").click(function(e){
					e.preventDefault();
					$("#content-1").mCustomScrollbar("scrollTo",$(this).attr("href"));
				});
				$(".output a[rel~='_mCS_2_scrollTo']").click(function(e){
					e.preventDefault();
					$("#content-1").mCustomScrollbar("scrollTo","#content-2");
					$("#content-2").mCustomScrollbar("scrollTo",$(this).attr("href"));
				});
				$(".output a[rel~='_mCS_3_scrollTo']").click(function(e){
					e.preventDefault();
					$("#content-1").mCustomScrollbar("scrollTo","#content-2");
					$("#content-2").mCustomScrollbar("scrollTo","#content-3");
					$("#content-3").mCustomScrollbar("scrollTo",$(this).attr("href"));
				});
			});
		})(jQuery);
		
		
		
		
		
					$('#daterange').daterangepicker();
			
			
	
			
			
			
			