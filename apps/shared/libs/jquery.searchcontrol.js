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
			  iconsource: '',
			  closeiconid: 'clearsearch'
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
				  	//alert(txt.val());
				  	txt.val('');
					$(this).parent().find("#clearsearch").hide();
					 $("#"+ options.gridcontainer +" tr").show();
					 $("#"+ options.gridcontainer).removeHighlight();
				  });
				  var buttons = $('<div class="btn-group"><button tabindex="-1" class="searchbtn" id="searchbtn"><span class="icon-search icon-white"> \
				  </span></button></div>');
				  $(this).append(buttons);
				  
				  function dosearch(obj) {
					  var searchterm = $(obj.target).val();
					  //alert(searchterm.length);
					  if(searchterm.length > 0)
					  {
						//alert($(this).parent().attr('id'));
					  	$(this).parent().find("#clearsearch").show();
						//$('#remove-merge-list').css('display','block');
						$("#"+ options.gridcontainer +" tr").hide();
						 searchterm = searchterm.toLowerCase();
						 $("#"+ options.gridcontainer +" tr").filter(function() {                                   
							  return $(this).children('td').text().toLowerCase().indexOf(searchterm) > -1;
						  }).show();
						  //$("#"+ options.gridcontainer + ' tr td').removeHighlight().highlight(searchterm);
						  $("#"+ options.gridcontainer + " tr").each(function(i) {
							  // find the first td in the row
							  $(this).find("td:first-child").removeHighlight().highlight(searchterm);							  
						  });
					  }
					  else
					  {
					  	$(this).parent().find("#clearsearch").hide();
						$("#"+ options.gridcontainer +" tr").show();
						$("#"+ options.gridcontainer).removeHighlight();
					  }
				  }
			  });
		};
	}( jQuery ));