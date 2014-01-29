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
			message+="3. You did not follow the provided link to access this page and are trying to reach here by invalid means.";
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

<html>
<head>
<TITLE>MakesBridge Technology Login</TITLE>
<link HREF="/pms/pms2.css" rel="STYLESHEET" TYPE="text/css"/>
<link HREF="/pms/jwb.css" rel="STYLESHEET" TYPE="text/css"/>


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
</script>

</head>

<body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" onLoad="document.passwdLogin.userid.focus();">
<center>
<table border="0" cellpadding="0" align=center cellspacing="0" width="450px" id="mainWrapper" class="publisherPageWrapper">
<tr><td colspan=3>&nbsp;</td></tr>
<tr><td colspan=3><img border="0" src="/pms/graphics/mkb_logo.gif"></td></tr>
<tr><td colspan=3>&nbsp;</td></tr>

<tr><td colspan=3 class="columnHeader sectionHeader">&nbsp;Please enter your credentials</td></tr>
<tr> <td colspan=3 align=center>&nbsp;</td>  </tr>

<% if(message!=null && !message.equals("")) { %>
  <tr><td colspan=3 class="error"><%=message%></td></tr>
  <tr> <td colspan=3 align=center>&nbsp;</td>  </tr>
<% } %>

<form name="passwdLogin" action="loginHandler.jsp" method="POST" onsubmit="javascript:return validate();">
<%=WebSecurityManager.getCSRFToken_FORM(session)%>
<tr style="display:none;"><td colspan=3 align=center class="error bold">
<br>Service Notice:

<br><br>We'll be performing planned maintenance today between 2:00am PDT and 2:30am PDT in order to push system updates.

<br><br>Please accept our apologies for any inconvenience<br>&nbsp;
</td></tr>

<tr><td width="20%" class="bold">&nbsp;User ID</td><td width="50%" align=center><input  name="userid" type="text" value="" style="width:150px;height:22px;"></td><td>&nbsp;</td></tr>
<tr><td class="bold">&nbsp;Password</td><td align=center><input name="password" type="password" style="width:150px;height:22px;" value="" autocomplete="off"></td><td>&nbsp;</td></tr>
<tr><td colspan=3>&nbsp;</td></tr>
<tr><td>&nbsp;</td>
<td colspan="1" align=center><input type=submit name="submit" value="Login" style="color:WHITE;font-size:12px;background-color:#A3A3A3;width:120px;height:24px;border:none;"></td>
<!--<td colspan="1" align=center><a href="javascript:if(validate())document.passwdLogin.submit();"><img src="/pms/img/newui/login.gif"></a></td>-->
<td>&nbsp;</td></tr>

<tr><td colspan=3 align="center"><br><br><a href="passwordRequest.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">Forgot your password?</a>
&nbsp;|&nbsp;<a href="requestForm.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">Forgot your User ID?</a></td>  </tr>

<tr><td colspan=3>&nbsp;</td></tr>
</form>
</table>
</center>

<% String sysAdminMessage = SysAdminManager.getLoginPageMessage();
if(!sysAdminMessage.equals("")) { %>
<table border="0" cellpadding="0" align=center cellspacing="0" width="700px" id="mainWrapper" class="publisherPageWrapper">
<tr><td width=100%><%=sysAdminMessage%></td></tr></table>
<%}%>

<%//===== Includes CSRF Script =====%>
<%@include file="newuifooter.jsp"%>

</body>
</html>
