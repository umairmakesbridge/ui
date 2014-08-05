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

response.setHeader("Cache-Control","no-cache"); //HTTP 1.1
response.setHeader("Pragma","no-cache"); //HTTP 1.0
response.setDateHeader ("Expires", 0); //prevents caching at the proxy server

UserInfo userInfo = (UserInfo)session.getAttribute(PMSDefinitions.USER_INFO_SESSION_ID);

if(userInfo == null) {
  WebServerLogger.getLogger().log(new LogEntry("/mchart/customChart.jsp", "", "Invalid Access! userInfo not found in Session"));
%><jsp:forward page="../InvalidAccess.jsp"/><%
  return;
}
String _path = "/pms/alpha/";
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
    
    <link href="<%= _path %>css/bootstrap.css" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/icons.css" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/style.css" rel="stylesheet" type="text/css" >  
    <link rel="stylesheet" href="<%= _path %>css/isotope.css" rel="stylesheet" />    
    <link href="<%= _path %>css/bmsgrid.css" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/jquery-ui.css" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/calendar.css" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/custom_2.css" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/chosen.css" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/changes.css" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/skins/lightgray/skin.min.css" rel="stylesheet">
    <link href="<%= _path %>css/tan_changes.css" rel="stylesheet" type="text/css" >
    <link rel="stylesheet" href="<%= _path %>css/ui.daterangepicker.css" type="text/css" />
    <link rel="stylesheet" href="<%= _path %>css/animate.css" type="text/css" />
    <link rel="stylesheet" href="<%= _path %>css/dash.css" rel="stylesheet" />
    <link rel="stylesheet" href="<%= _path %>css/a_changes.css" rel="stylesheet" />        
    <link rel="stylesheet" href="<%= _path %>css/jquery.mCustomScrollbar.css" rel="stylesheet" />        
    <script>
        var bms_token = '<%= Default.toDefault((String)session.getAttribute(PMSDefinitions.CSRF_TOKEN_NAME)) %>';
        var _path = '<%= _path %>'
    </script>
    <script type="text/javascript" src="<%= _path %>js/require.js" data-main="apps/bridgemail/main"></script>
    <script  type="text/javascript">
        var previewDomain = "<%=PMSResources.getInstance().getPreviewDomain()%>";
        var imagesCDN =  "<%=PMSResources.getInstance().getCDNForImages()%>";
        var staticCDN =  "<%=PMSResources.getInstance().getCDNForStaticContents()%>";        
    </script>
    
    <!-- <link href="build/bridgemail/bridgemail_0.1.min.css" rel="stylesheet" type="text/css" >
    <script type="text/javascript" src="js/require.js" data-main="build/bridgemail/bridgemail_0.1.min"></script>-->
    

    <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
          <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->   
    <script type="text/javascript" src="https://test.bridgemailsystem.com/tiny_mce_old/tiny_mce.js"></script>
</head>
<body>
    
    
</body>
</html>



