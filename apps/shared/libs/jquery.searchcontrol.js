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
			  iconsource: '',
			  closeiconid: 'clearsearch',
			  countcontainer: 'no_of_camps'
			  }, options );
			  return this.each(function() {				  
				  var imageClass= "";                                  
				  if(options.showicon == 'yes')
				  {
					  var icon = $('<span class="icon '+options.iconsource+'"></span>');
                                          imageClass ="show-image";
					  $(this).append(icon);
				  }
				  var txt=$("<input type='text' id='"+ options.id +"' placeholder='"+ options.placeholder +"' class='search-control "+imageClass+"' style='width:"+ options.width +";' />");
				  txt.bind( "keyup", dosearch );
				  $(this).append(txt);
				  var closeicon = $('<a class="close-icon" id="clearsearch" style="display:none"></a>');
				  $(this).append(closeicon);
				  closeicon.click(function() { 				  	
                  	var grid = (typeof options.gridcontainer == 'string') ? $("#"+options.gridcontainer):options.gridcontainer;
				  	txt.val('');
					$(this).parent().find("#clearsearch").hide();
					 grid.find("tr").show();
					 grid.removeHighlight();
					 if($("#"+options.countcontainer))
							$("#"+options.countcontainer).html(grid.find("tr").length + ' Campaigns found');
						grid.parent().find('.notfound').hide();
				  });
				  var buttons = $('<div class="btn-group"><button tabindex="-1" class="searchbtn" id="searchbtn"><span class="icon-search icon-white"> \
				  </span></button></div>');
				  $(this).append(buttons);
				  
				  function dosearch(obj) {
					  var searchterm = $(obj.target).val();					  
                      var grid = (typeof options.gridcontainer == 'string') ? $("#"+options.gridcontainer):options.gridcontainer;
					  grid.parent().find('.notfound').hide();
					  if(searchterm.length > 0)
					  {
					  	$(this).parent().find("#clearsearch").show();
                        var nthchild = options.tdNo? options.tdNo : 1;
						grid.find("tr").hide();						
						 searchterm = searchterm.toLowerCase();
						 var count = 0;
						 grid.find("tr").filter(function() {
							 if($(this).find("td:nth-child("+nthchild+")").text().toLowerCase().indexOf(searchterm) > -1)
							 {								 
								 count++;								 
							  	return $(this);
							 }
						  }).show();
						  //$("#"+ options.gridcontainer + ' tr td').removeHighlight().highlight(searchterm);
						  
						  grid.find("tr").each(function(i) {
							  // find the first td in the row                                                           
                          	$(this).find("td:nth-child("+nthchild+")").removeHighlight().highlight(searchterm);							
						  });
						  
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
						grid.find("tr").show();						
						if($("#"+options.countcontainer))
							$("#"+options.countcontainer).html(grid.find("tr").length + ' Campaigns found');
						grid.removeHighlight();
					  }
				  }
			  });
		};
	}( jQuery ));