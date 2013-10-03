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
			  iconsource: 'file:///D:/wamp/www/new_ui/img/search-box-icon.jpg',
			  closeiconid: 'clearsearch'
			  }, options );
			  return this.each(function() {				  
				  var txt=$("<input type='text' id='"+ options.id +"' placeholder='"+ options.placeholder +"' style='width:"+ options.width +";' />");
				  txt.bind( "keyup", dosearch );
				  $(this).append(txt);
				  if(options.showicon == 'yes')
				  {
					  var icon = $('<img src="'+ options.iconsource +'" />');
					  $(this).append(icon);
				  }
				  var closeicon = $('<a class="close-icon" id="'+ options.closeiconid +'" style="display:none"></a>');
				  $(this).append(closeicon);
				  closeicon.click(function() { 
				  	//alert(txt.val());
				  	txt.val('');
					$("#"+ options.closeiconid).hide();
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
						  //alert($('#remove-merge-list'));
					  	$("#"+ options.closeiconid).show();
						//$('#remove-merge-list').css('display','block');
						$("#"+ options.gridcontainer +" tr").hide();
						 searchterm = searchterm.toLowerCase();
						 $("#"+ options.gridcontainer +" tr").filter(function() {                                   
							  return $(this).text().toLowerCase().indexOf(searchterm) > -1;
						  }).show();
						  $("#"+ options.gridcontainer).removeHighlight().highlight(searchterm);
					  }
					  else
					  {
					  	$("#"+ options.closeiconid).hide();
						$("#"+ options.gridcontainer +" tr").show();
						$("#"+ options.gridcontainer).removeHighlight();
					  }
				  }
			  });
		};
	}( jQuery ));