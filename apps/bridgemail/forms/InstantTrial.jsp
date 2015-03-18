<%@page import="com.PMSystems.*" %>
<%@page import="com.PMSystems.dbbeans.*" %>
<%@page import="com.PMSystems.util.*" %>

<%@page import="java.util.*" %>

<%
long subNum = PMSEncoding.decodeToLong(request.getParameter("subNum"));

if(subNum <= 0){
	System.out.println("[/events/TrialActivation.jsp] == Invalid subNum");
	return;
}

String userId= "demo";
SubscriberInfo subInfo = SubscriberManager.getSubscriberInfo(userId,subNum);

if(subInfo == null){
	System.out.println("[/events/InstantTrial.jsp] == Invalid subNum ");
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
%>
<!-- need to show Term & Services agreement form  --> 
<html>
<head>
<TITLE>MakesBridge Instant Trial</TITLE>
<link HREF="/pms/pms2.css" rel="STYLESHEET" TYPE="text/css"/>
<link HREF="/pms/jwb.css" rel="STYLESHEET" TYPE="text/css"/>


<script language="javascript">
function validate() {
   return true;
}

</script>

</head>

<body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" >

<form name="trialLogin" action="InstantTrialHandler.jsp" method="POST" onsubmit="javascript:return validate();">
<input type="hidden" name="subNum" value="<%=request.getParameter("subNum")%>">
<input type="hidden" name="tipId" value="<%=Default.toDefault(request.getParameter("tipId"))%>">

<%=WebSecurityManager.getCSRFToken_FORM(session)%>

<input type="button" value="Proceed" onclick="javascript:submit();">
</form>
</body>
</html>





