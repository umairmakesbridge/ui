(function ( $ ) {
		 $.fn.searchcontrol = function( options ) 
		 {
			 var settings = $.extend({
                            // These are the defaults.
                            id: "search1",
                            width: "150px",
                            height: "20px",
                            placeholder: "Search list",
                            gridcontainer : "list_grid",
                            showicon: 'no',
                            tdNo:1,
                            iconsource: 'list',
                            searchFunc:null,
                            clearFunc:null,
                            closeiconid: 'clearsearch',
                            movingElement: 'tr',
                            countcontainer: 'no_of_camps'
			  }, options );
			  return this.each(function() {				  
				  var imageClass= ""; 
				  var movElement = options.movingElement? options.movingElement : 'tr';                                 
				  if(options.showicon == 'yes')
				  {
                                    var icon = $('<span class="icon '+options.iconsource+'"></span>');
                                    imageClass ="show-image";
                                    $(this).append(icon);
				  }
                                  //Search input
				  var txt=$("<input type='text' id='"+ options.id +"' placeholder='"+ options.placeholder +"' class='search-control "+imageClass+"' style='width:"+ options.width +";' />");
                                  $(this).append(txt);
                                  
                                  //Search clear icon
				  var closeicon = $('<a class="close-icon" id="clearsearch" style="display:none"></a>');
                                  $(this).append(closeicon);
                                  
                                  if(options.gridcontainer){
                                    txt.bind( "keyup", dosearch );
                                    closeicon.click(clearSearch);                                  
                                  }
				  if(options.searchFunc){
                                    txt.bind( "keyup", dosearch_func );
                                    txt.bind( "keydown", keydown_func );    
                                    closeicon.click(clearSearch_func);                                       
                                  }				  
				  
				  var buttons = $('<div class="btn-group"><button tabindex="-1" class="searchbtn" id="searchbtn"><span class="icon-search icon-white"> \
				  </span></button></div>');
				  $(this).append(buttons);
				  function clearSearch() { 
				  	if($('ul#template_search_menu'))
					{
						$('ul#template_search_menu').find("li").each(function(i) {
							if($(this).attr('oldactive') == 'active')
								$(this).addClass('active');
								$(this).removeAttr('oldactive');
						});
					}
				  	/*if($('ul#template_search_menu li').attr('oldactive') == 'active')
						$('ul#template_search_menu li').addClass('active');*/
                                        var grid = (typeof options.gridcontainer == 'string') ? $("#"+options.gridcontainer):options.gridcontainer;
				  	txt.val('');
					$(this).parent().find("#clearsearch").hide();
					if(movElement == 'tr')
                                            grid.find("tr").show();
					else
                                            grid.find("li").show();
					grid.removeHighlight();
					if($("#"+options.countcontainer))
                                            $("#"+options.countcontainer).html(grid.find("tr").length + ' Campaigns found');
					grid.parent().find('.notfound').hide();
				  }
                                  function keydown_func(obj){
                                      search_val= $.trim($(obj.target).val());
                                  }
                                  /****handling passed functions****/
                                  var search_val = "";
                                  function clearSearch_func(){                                      
                                       closeicon.hide();
                                       txt.val('');
                                       if(options.clearFunc){
                                           options.clearFunc();
                                       }                                       
                                       
                                          
                                  }
                                  function dosearch_func(obj){									  
                                      var searchterm = $(obj.target).val();
                                      if(searchterm.length > 0)
                                      {
                                          closeicon.show();
                                          options.searchFunc(obj,searchterm);
                                      }
                                      else{
                                          if(search_val!==searchterm){
                                            options.clearFunc();
                                          }
                                          closeicon.hide();
                                      }
                                  }
                                  /****end****/
				  function dosearch(obj) {
					  if($('ul#template_search_menu'))
					{
						  $('ul#template_search_menu li.active').attr('oldActive','active');
						  $('ul#template_search_menu li').removeClass('active');
					}
					  var movElement = options.movingElement? options.movingElement : 'tr';
					  var searchterm = $(obj.target).val();					  
                                          var grid = (typeof options.gridcontainer == 'string') ? $("#"+options.gridcontainer):options.gridcontainer;
					  grid.parent().find('.notfound').hide();
					  if(searchterm.length > 0)
					  {
					  	$(this).parent().find("#clearsearch").show();
                                                var nthchild = options.tdNo? options.tdNo : 1;
						if(movElement == 'tr')
							grid.find("tr").hide();
                                                    else
							grid.find("li").hide();
						 searchterm = searchterm.toLowerCase();
						 var count = 0;
						 if(movElement == 'tr')
						 {
                                                        grid.find("tr").filter(function() {
                                                                if($(this).find("td:nth-child("+nthchild+")").text().toLowerCase().indexOf(searchterm) > -1)
                                                                {								 
                                                                       count++;								 
                                                                       return $(this);
                                                                }
                                                         }).show();						  
                                                         grid.find("tr").each(function(i) {
                                                                 // find the first td in the row                                                           
                                                               $(this).find("td:nth-child("+nthchild+")").removeHighlight().highlight(searchterm);							
                                                         });
					  	  }
						  else
						  {
							 grid.find("li").filter(function() {
								 if($(this).find("a:nth-child("+nthchild+")").text().toLowerCase().indexOf(searchterm) > -1)
								 {								 
									count++;								 
									return $(this);
								 }
							  }).show();						  
							  grid.find("li").each(function(i) {
								  // find the first td in the row                                                           
								$(this).find("a:nth-child("+nthchild+")").removeHighlight().highlight(searchterm);							
							  }); 
						  }
						  if($("#"+options.countcontainer))
							$("#"+options.countcontainer).html(count + ' ' + options.placeholder.replace('Search ','') +' found <b>for &lsquo;' + searchterm + '&rsquo;</b>');
									
						  if(count == 0)
						  {
							  grid.parent().append('<p class="notfound">No '+ options.placeholder.replace('Search ','') +' found containing &lsquo;'+ searchterm +'&rsquo;</p>');							  
						  }
					  }
					  else
					  {
					  	$(this).parent().find("#clearsearch").hide();
						if(movElement == 'tr')
							grid.find("tr").show();
						else
							grid.find("li").show();
						if($("#"+options.countcontainer))
							$("#"+options.countcontainer).html(grid.find("tr").length + ' Campaigns found');
						grid.removeHighlight();
					  }
				  }
			  });
		};
	}( jQuery ));