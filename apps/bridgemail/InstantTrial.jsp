<%@page import="com.PMSystems.*" %>
<%@page import="com.PMSystems.dbbeans.*" %>
<%@page import="com.PMSystems.util.*" %>

<%@page import="java.util.*" %>

<%
long subNum = PMSEncoding.decodeToLong(request.getParameter("subNum"));
if(subNum <= 0){
	System.out.println("[/events/InstantTrial.jsp] == Invalid subNum");
	return;
}

Vector userIdVec = new Vector();
userIdVec.add("demo");
userIdVec.add("jayadams");
userIdVec.add("bayshoresolutions");

String userId = UserManager.getUserIdBySubNum(subNum);
if(userId.equals("")){
	System.out.println("[/events/InstantTrial.jsp] == Invalid subNum, userId not found.");
	return;
}

//== checking if userId is having permission
if(!userIdVec.contains(userId)){
	System.out.println("[/events/InstantTrial.jsp] == Invalid subNum, userId is not partner of Makesbridge.");
	return;
}


SubscriberInfo subInfo = SubscriberManager.getSubscriberInfo(userId,subNum);

if(subInfo == null){
	System.out.println("[/events/InstantTrial.jsp] == Invalid subNum, subscriber not found.");
	return;
}

String tipId = Default.toDefault(request.getParameter("tipId"));
UserDataBean userBean = UserManager.getUser(subInfo.getEmail());
if(userBean != null){
	System.out.println("[/events/InstantTrial.jsp] == This account is already existing at Makesbridge.");	
	response.sendRedirect("/pms/index.jsp?tipId="+tipId);
}

//== to redirect freeware email ids on seprate form
if(!TrialAccountManager.isValidEmailDomain(subInfo.getEmail())){
	//== need to show form them ..to get more information & trial activation should be manually
	//== later on
	System.out.println("[/events/InstantTrial.jsp] == Freeware domains not allowed ==== "+subInfo.getEmail());
	return;	
}

String email=subInfo.getEmail();
%>
<!-- need to show Term & Services agreement form  --> 
<html>
<head>
<TITLE>MakesBridge Instant Trial</TITLE>
<link rel="stylesheet" HREF="/pms/css/bootstrap.css">
<link HREF="/pms/pms2.css" rel="STYLESHEET" TYPE="text/css"/>

<link HREF="/pms/css/welcome_tip_trial.css" rel="STYLESHEET" TYPE="text/css"/>


<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>
<script src="/pms/js/jquery.icheck.min.js?v=0.9.1"></script> 
<script language="javascript">
function validate() {
	if($('#proceed').hasClass('gray')){
		return false;
	}
	else
   		return true;
}
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
			  
			  $('input').on('ifChecked', function(event){
					  $('#proceed').removeClass('gray');
					});

			  $('input').on('ifUnchecked', function(event){
					  $('#proceed').addClass('gray');
					});
			  $('#proceed').click(function(event){
			  		if($(event.target).hasClass('gray')){
			  			return false;
			  		}else{
			  			$('form[name="trialLogin"]').submit();
			  		}
			  })

			  $('[data-toggle="tooltip"]').tooltip();
            });
</script>

</head>

<body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" >





<div class="dashbg"></div>

<div class="overlay" style="background:none repeat scroll 0 0 rgba(47, 63, 74, 0.95);">
  <div id="myModal" class="modal in" style="margin-left: -385px; margin-top:5%; width: 770px;" aria-hidden="false">
    
    <div class="modal-body" style="min-height: 300px;">
      
      		<a class="closebtn" href=""></a>
            
            <div class="welcome">
            
            
            <a href="" class="logo"></a>
            <h1><strong>Welcome</strong>to your <span>FREE Tip & Test Member Account</span></h1>
            
            <h3>We'll create an account for you with a User ID (<span class="email"><%=email%></span>)</h3>
            
            
            <div class="btnunchecked">
                                        <input type="checkbox" id="" class="checkpanel" value=""/>
                                        <label for="terms&services" >Please Confirm you agree to the <a style="font-size: 16px;" href="http://www.makesbridge.com/terms" target="blank">terms & Service</a> for Makesbridge</label>
                                   </div>
            <div class="clearfix"></div>
            
            <!-- <a href="" class="button"> Proceed </a> -->
            
            <form name="trialLogin" action="InstantTrialHandler.jsp" method="POST" onsubmit="javascript:return validate();">
				<input type="hidden" name="subNum" value="<%=request.getParameter("subNum")%>">
				<input type="hidden" name="tipId" value="<%=Default.toDefault(request.getParameter("tipId"))%>">

				<%=WebSecurityManager.getCSRFToken_FORM(session)%>

				<input type="button" id="proceed" class="button gray" value="Proceed" data-toggle="tooltip" data-placement="bottom" title="Please check the terms and conditions">
				</form>
            
            
            
            
            
            
            
            </div>
            
      		  <!-- welcome -->
      
      
      
      
    </div>
    <br> 
      </div>
    </div>
    
</body>
</html>





