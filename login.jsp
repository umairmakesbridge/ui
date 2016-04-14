<% response.addHeader("P3P","CP=\"OTI CURa ADMa DEVa TAIa OUR BUS IND UNI COM NAV INT\""); %>

<%@page import="com.PMSystems.*" %>
<%@page import="com.PMSystems.beans.*" %>
<%@page import="com.PMSystems.util.*" %>

<%!
String message = "";
%>
<%
	message = "";
	String msg = (String)request.getParameter("msg");
	if(msg!=null && !msg.equals("")) {

                 System.out.println("[/pms/login.jsp]: Error Code Received: "+msg);
		int a = Integer.parseInt(msg);
		switch(a) {
			case 1 : message="You are here due to one of the following reasons:<br><br>";
			message+="1. Your login session has expired.<br>";
			message+="2. You are trying to access the page without logging-in.<br>";
			message+="3. You did not follow the provided link to access this page.";
			break;

			case 2 : message="Invalid Credentials:<br>";
			message+=" You have entered invalid user ID and(or) password.<br>";
			break;

			case 3 : message="";break;
			case 4 : message="Invalid change password request. Please follow the instructions sent to the email address you provided during change password request.";
				 break;
			case 5 : message="This account has been locked because of too many failed authentication attempts. Please try again in approximately 5 minutes.";
 				 break;
			case 6 : message="Sorry, your account has disabled. Please email support@makesbridge.com for further assistance.";
 				 break;
			case 7 : message="Sorry, your account has expired."
					+" <a href='http://makesbridge.com/index.php?option=com_content&view=article&id=128'>Subscribe today!</a>"
					+"<br> If you would like to extend your trial, send email sales@makesbridge.com.";
 				 break;

			default : message="";break;
		}

	}
%>

<!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>Makesbridge Login</title>
<link href="mks/css/login.css?bust=1" rel="stylesheet">
<style>
    center{
        display: none !important;
    }
</style>
<script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
<script language="javascript">
function validate() {
   var isOK=true,errorMessage="Please correct following(s)\n";
   var userid = document.passwdLogin.userid.value;
   var pass = document.passwdLogin.password.value;

   if(userid=='') {
      isOK=false;
      errorMessage += "\n- Enter valid User ID";
   }
   if(pass=='') {
      isOK=false;
      errorMessage += "\n- Enter valid Password";
   } else if(!isValidPass(pass)) {
//      isOK=false;
//	errorMessage += "\n- Password must be at least 8 characters long"
//		+"\n- Password must contain at least one letter and one number";
   }

   if(isOK) {
      //document.passwdLogin.submit();
	return true;
   } else {
     alert(errorMessage);
   }
   return false;
}

function isValidPass(string) {
   // /^.*(?=.{10,})(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/
  if (string.search(/^.*(?=.{8,})(?=.*\d)(?=.*[A-Za-z]).*$/) != -1)
	return true;
  else
        return false;
}
$(document).ready(function(){
    $('.oldui').delay(2000).slideDown(500);
	
	$('.closebtn').click(function() {
    	$('.oldui').slideUp(500);
	});


});
</script>

</head>

<body class="login" onLoad="document.passwdLogin.userid.focus();">
    <div class="oldui" style="display:none;">
                Looking for old UI? <a href="https://www.bridgemailsystem.com/pms/login.jsp" class="here">Click Here</a>
                <a class="closebtn"></a>
        </div>	
    <div class="header">
    <div class="makesbridge">
        <img src="mks/images/makesbridge.png" alt="" />                       
    </div>
    </div>
<div class="logincontnet">
        <div class="content-l">

        <div class="features-login">

            <div>
            <h3>System Features</h3>
                <ul>
                <li>Marketing</li>
                <li>Sales</li>
                <li>Automation</li>
                <li>Reports &amp; Analytics</li>
                <li>Connections</li>
             </ul>
                </div>
                <img src="mks/images/mbs.png" alt=""/>

        </div> <!-- features login  -->

        <form name="passwdLogin" action="loginHandler.jsp" method="POST" onsubmit="javascript:return validate();">
          
            <div class="loginform">

                <h4>Please enter your credentials</h4>
                <%=WebSecurityManager.getCSRFToken_FORM(session)%>
                <% if(message!=null && !message.equals("")) { %>
                    <div class="messageerror ">
                    <p><%=message%></p>
                    <div class="clearfix"></div>
                    </div>
                <% } %>    
                <div class="inputrow">
                    <label>User ID</label>
                    <input name="userid" type="text" value="" />
                </div>

                <div class="inputrow">
                    <label>Password</label>
                    <input autocomplete="off" input name="password" type="password" />
                </div>

<div align="center" style="color: rgb(255, 255, 255); text-align: left; font-size: 12px; padding: 10px 0px 0px;" colspan="3">By clicking Login you agree to Makesbridge 
<a href="http://www.makesbridge.com/index.php?option=com_content&amp;view=article&amp;id=130&amp;Itemid=137" style="color:#fff; text-decoration:underline;" target="_blank">Terms of Service</a>
</div>
                    <button class="loginbtn" type=submit name="submit"><span>Login</span> <i class="icon next"></i></button>

            </div><!-- login form  -->
       </form>  
    </div>
</div>
<div class="loginfooter">
    <div class="content-l">        		
        <p><a href="passwordRequest.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">Forgot your password?</a> &nbsp;&nbsp;&nbsp;&nbsp;  |  &nbsp;&nbsp;&nbsp;&nbsp;  
            <a href="requestForm.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">Forgot your User ID?</a></p>                
        <p>Copyright &copy; 2002 - 2015 Makesbridge Technologies, Inc. All rights reserved.</p>        	
    </div>
</div>
<% String sysAdminMessage = SysAdminManager.getLoginPageMessage();
if(!sysAdminMessage.equals("")) { %>
<div><%=sysAdminMessage%></div>
<%}%>
<%//===== Includes CSRF Script =====%>
<%@include file="newuifooter.jsp"%>

</body>
</html>

