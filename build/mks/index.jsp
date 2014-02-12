<%@page import="java.util.*" %>
<%@page import="java.security.*" %>
<%@page import="java.math.*" %>

<%@page import="com.PMSystems.*" %>
<%@page import="com.PMSystems.util.*" %>
<%@page import="com.PMSystems.logger.*" %>
<%@page import="com.PMSystems.dbbeans.*" %>
<%@page import="com.PMSystems.beans.*" %>
<%@page import="com.PMSystems.template.*" %>

<%@page import="com.PMSystems.SFIntegration.*" %>
<%@page import="com.PMSystems.*" %>

<%
//=======================Default Processing=============================

response.setHeader("Cache-Control","no-cache"); //HTTP 1.4
response.setHeader("Pragma","no-cache"); //HTTP 1.0
response.setDateHeader ("Expires", 0); //prevents caching at the proxy server

UserInfo userInfo = (UserInfo)session.getAttribute(PMSDefinitions.USER_INFO_SESSION_ID);

if(userInfo == null) {
  WebServerLogger.getLogger().log(new LogEntry("/mchart/customChart.jsp", "", "Invalid Access! userInfo not found in Session"));
%><jsp:forward page="../InvalidAccess.jsp"/><%
  return;
}

%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Bridgemail System</title>
    
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">    
    <link rel="shortcut icon" href="img/favicon.ico">
    
    <link href="css/bootstrap.css?bust=1.4" rel="stylesheet" type="text/css" >
    <link href="css/icons.css?bust=1.4" rel="stylesheet" type="text/css" >
    <link href="css/style.css?bust=1.4" rel="stylesheet" type="text/css" >    
    <link href="css/bmsgrid.css?bust=1.4" rel="stylesheet" type="text/css" >
    <link href="css/jquery-ui.css?bust=1.4" rel="stylesheet" type="text/css" >
    <link href="css/calendar.css?bust=1.4" rel="stylesheet" type="text/css" >
    <link href="css/custom_2.css?bust=1.4" rel="stylesheet" type="text/css" >
    <link href="css/chosen.css?bust=1.4" rel="stylesheet" type="text/css" >
    <link href="css/changes.css?bust=1.4" rel="stylesheet" type="text/css" >
    <link href="css/skins/lightgray/skin.min.css?bust=1.4" rel="stylesheet">
    <link href="css/tan_changes.css?bust=1.4" rel="stylesheet" type="text/css" >
    <link rel="stylesheet" href="css/ui.daterangepicker.css?bust=1.4" type="text/css" />
    <link rel="stylesheet" href="css/animate.css?bust=1.4" type="text/css" />
    
    <link rel="stylesheet" href="css/dash.css?bust=1.4" rel="stylesheet" />
    
    <script type="text/javascript" src="js/require.js" data-main="bridgemail_1.4.min"></script>
    <script  type="text/javascript">
        var previewDomain = "<%=PMSResources.getInstance().getPreviewDomain()%>";
        var imagesCDN =  "<%=PMSResources.getInstance().getCDNForImages()%>";
        var staticCDN =  "<%=PMSResources.getInstance().getCDNForStaticContents()%>";        
    </script> 

    <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
          <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->   
    <script type="text/javascript" src="https://mks.bridgemailsystem.com/tiny_mce/tiny_mce.js"></script>
    
</head>
<body>
    
</body>
</html>



