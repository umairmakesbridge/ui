
<%@ page language="java" contentType="text/html; charset=UTF-8"pageEncoding="UTF-8" language="java"%>
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

			case 2 : message="";
			message+=" Invalid user ID and(or) password.";
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
			 case 8 : message="You are not allowed to login. Please email support@makesbridge.com for further assistance.";
 				 break;

			default : message="";break;
		}

	}
%>

<!DOCTYPE HTML>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>Makesbridge Login</title>
<link href="mks/css/bootstrap.css" rel="stylesheet">
<link href="mks/css/style.css" rel="stylesheet">
<link href="mks/css/bootstrap-responsive.css" rel="stylesheet">
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

        var today = new Date();
        var year = today.getFullYear();
        $('#curYear').html(year);

});

</script>

</head>

<body class="login" onLoad="document.passwdLogin.userid.focus();">
    <div class="oldui" style="display:none;">
        Looking for old UI? <a href="https://www.bridgemailsystem.com/pms/login.jsp" class="here">Click Here</a>
        <a class="closebtn"></a>
    </div>	

    <div id="wrap">
        <div class="container">
            <div class="from_wrap">
                <% String sysAdminMessage = SysAdminManager.getLoginPageMessage();                    
                    if(!sysAdminMessage.equals("")) { %>
                        <div class="errortext"><i class="erroricon"></i><em><%=sysAdminMessage%></em></div>
                 <%}%>  
                <div class="headline_login"><p>Sign in with your Makesbridge Account</p></div>                
                <form name="passwdLogin" action="loginHandler.jsp" method="POST" onsubmit="javascript:return validate();" class="form-signin">
                    <div class="logo_svg">
                        <div class="logosvg_wrap">
                            <svg width="80" height="67">
                              <image xlink:href="mks/images/logo_icon.svg" src="mks/images/logo_icon.png" width="80" height="67" />
                            </svg>
                        </div>
                    </div>
                                      
                    <% if(message!=null && !message.equals("")) { %>
                        <div class="messageerror ">
                        <p><%=message%></p>
                        <div class="clearfix"></div>
                        </div>
                    <% } %>  
                    <br>
                    <input type="text" class="input-block-level" placeholder="User ID" name="userid" value="" />
                    <input type="password" name="password" class="input-block-level" placeholder="Password" autocomplete="off" />
                    <div class="tos_text">
                        <p>
                            By clicking Login you agree to Makesbridge
                            <br>
                            <a href="http://www.makesbridge.com/index.php?option=com_content&amp;view=article&amp;id=130&amp;Itemid=137" style="color:#97a4a9; text-decoration:underline;" target="_blank">Terms of Service</a>
                        </p>
                    </div>
                    <button class="btn_login" type="submit">LOGIN</button>
                    <%=WebSecurityManager.getCSRFToken_FORM(session)%>
                    <div class="lock_svg">
                        <div class="txt_fyp2">
                            <a href="passwordRequest.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">Forgot your password?</a> &nbsp; | &nbsp; <a href="requestForm.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">Forgot your User ID?</a>
                        </div>
                        <div class="clr"></div>
                    </div>
                </form>
                <div class="login_text_footer">
                    <p>
                        Copyright &copy; 2002 - <span id="curYear">2016</span> Makesbridge Technologies, Inc.
                        <br>
                        All rights reserved.
                    </p>
                </div>
            </div>
        </div>
        <!-- /container -->
    </div>

   
 <% String sysAdminMessage1 = SysAdminManager.getLoginPageMessage();
                if(!sysAdminMessage1.equals("")) { %>
                <div align="center">
  <center>
<table width="658" border="0" cellspacing="0" cellpadding="0" style="font-family:arial,helvetica,verdana,sans-serif; border-collapse:collapse" height="321" bordercolor="#111111">
      <tbody><tr>
        <td width="654" height="19" align="left" valign="top" colspan="4">
         </td>
      </tr>
      <tr>
        <td width="1" height="261" align="left" valign="top" bgcolor="C5C5C5"></td>
        <td width="9" height="261" align="left" valign="top" bgcolor="#F1F1F1"></td>
        <td width="647" height="261" align="left" valign="top" bgcolor="#F1F1F1">
        <table width="649" border="0" cellspacing="0" cellpadding="0" style="font-family:arial,helvetica,verdana,sans-serif;" height="177">
          <tbody><tr>
            <td width="20" height="35" align="left" valign="top"></td>
            <td width="180" height="35" align="left" valign="top" style="font-size:24px;font-weight:bold;color:#666699;">
            <img border="0" src="http://mail.bridgemailsystem.com/pms/graphics/jayadams/mktgcollateral/featureicons/Icon_07-23-10_Clock_200x200.png" width="200" height="200"></td>
            <td width="400" height="35" align="left" valign="top" style="font-size:14px;font-weight:bold;color:#666699;">

<%=sysAdminMessage1%>

</td>
            <td width="12" height="177" align="left" valign="top" rowspan="4"> </td>
          </tr>
          <tr>
            <td width="20" height="1" align="left" valign="top" rowspan="3"></td>
          </tr>
          <tr>
            <td width="528" height="1" align="left" valign="top" style="font-size:12px;color:#666;" bgcolor="#666699" colspan="2">
             </td>
          </tr>
          <tr>
            <td width="528" height="26" align="left" valign="top" style="font-size:12px;color:#666;" bgcolor="#F1F1F1" colspan="2"> </td>
          </tr>
          </tbody></table></td>
        <td width="1" height="261" align="left" valign="top" bgcolor="#C5C5C5"></td>
      </tr>
      <tr>
        <td width="1" height="1" align="left" valign="top" bgcolor="#C5C5C5"></td>
        <td width="9" height="1" align="left" valign="top" bgcolor="#C5C5C5"></td>
        <td width="647" height="1" align="left" valign="top" bgcolor="#C5C5C5"></td>
        <td width="1" height="1" align="left" valign="top" bgcolor="#C5C5C5"></td>
      </tr>
      </tbody></table>
  </center>
</div>
                
                <%}%>
<%//===== Includes CSRF Script =====%>
<%@include file="newuifooter.jsp"%>
<style type="text/css">
.errortext em{
  line-height: 20px;
  font-size: 13px;
}
</style>
</body>
</html>

