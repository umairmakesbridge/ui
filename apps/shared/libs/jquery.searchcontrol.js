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
			  iconsource: ''
			  }, options );
			  return this.each(function() {				  
				  var txt=$("<input type='text' id='"+ options.id +"' placeholder='"+ options.placeholder +"' style='width:"+ options.width +";height:"+ options.height +";' />");
				  txt.bind( "keyup", dosearch );
				  $(this).append(txt);
				  if(options.showicon == 'yes')
				  {
					  var icon = $('<img src="'+ options.iconsource +'" />');
					  $(this).append(icon);
				  }
				  var closeicon = $('<a class="close-icon" id="remove-merge-list" style="display:none"></a>');
				  $(this).append(closeicon);
				  closeicon.click(function() { 
				  	//alert(txt.val());
				  	txt.val('');
					$("#remove-merge-list").hide();
					 $("#"+ options.gridcontainer +" tr").show();
					 $("#"+ options.gridcontainer).removeHighlight();
				  });
				  var buttons = $('<div class="btn-group"><button tabindex="-1" class="searchbtn" id="searchbtn"><span class="icon-search icon-white"> \
				  </span></button></div>');
				  $(this).append(buttons);
				  
				  function dosearch(obj) {
					  var searchterm = $(obj.target).val();
					  if(searchterm.length)
					  {
					  	$('#remove-merge-list').show();
						$("#"+ options.gridcontainer +" tr").hide();
						 searchterm = searchterm.toLowerCase();
						 $("#"+ options.gridcontainer +" tr").filter(function() {                                   
							  return $(this).text().toLowerCase().indexOf(searchterm) > -1;
						  }).show();
						  $("#"+ options.gridcontainer).removeHighlight().highlight(searchterm);
					  }
					  else
					  {
					  	$('#remove-merge-list').hide();
						$("#"+ options.gridcontainer +" tr").show();
						$("#"+ options.gridcontainer).removeHighlight();
					  }
				  }				  
			  });
		};
	}( jQuery ));