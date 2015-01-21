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
String _path = "/pms/umair/";
%>
<!DOCTYPE html>
<html lang="en" class="loading-html">
<head>
    <meta charset="utf-8">
    <title>Bridgemail System</title>    
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">     
    <style>
            html {
                -webkit-transition: background-color 1s;
                transition: background-color 1s;
            }
            html, body { min-height: 100%; }
            html.loading-html {
                background: #fff url('img/mb-loading.gif') no-repeat 50% 50%;
                -webkit-transition: background-color 0;
                transition: background-color 0;
            }
            body {
                -webkit-transition: opacity 1s ease-in;
                transition: opacity 1s ease-in;
            }
            html.loading-html body {
                opacity: 0;
                -webkit-transition: opacity 0;
                transition: opacity 0;
            }
            
    </style>
    <link rel="shortcut icon" href="img/favicon.ico">    
    <link href="<%= _path %>css/bootstrap.css?bust=1.362" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/icons.css?bust=1.362" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/style.css?bust=1.362" rel="stylesheet" type="text/css" >  
    <link rel="stylesheet" href="<%= _path %>css/isotope.css?bust=1.362" rel="stylesheet" />    
    <link href="<%= _path %>css/bmsgrid.css?bust=1.362" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/jquery-ui.css?bust=1.362" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/calendar.css?bust=1.362" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/custom_2.css?bust=1.362" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/chosen.css?bust=1.362" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/changes.css?bust=1.362" rel="stylesheet" type="text/css" >
    <link href="<%= _path %>css/skins/lightgray/skin.min.css?bust=1.362" rel="stylesheet">
    <link href="<%= _path %>css/tan_changes.css?bust=1.362" rel="stylesheet" type="text/css" >
    <link rel="stylesheet" href="<%= _path %>css/ui.daterangepicker.css?bust=1.362" type="text/css" />
    <link rel="stylesheet" href="<%= _path %>css/animate.css?bust=1.362" type="text/css" />
    <link rel="stylesheet" href="<%= _path %>css/dash.css?bust=1.362" rel="stylesheet" />
    <link rel="stylesheet" href="<%= _path %>css/a_changes.css?bust=1.362" rel="stylesheet" />        
    <link rel="stylesheet" href="<%= _path %>css/jquery.mCustomScrollbar.css?bust=1.362" rel="stylesheet" />        
        
    <link href="<%= _path %>css/editorcss/jquery.minicolors.css?bust=1.362" rel="stylesheet" />
    <link href="<%= _path %>css/editorcss/style.css?bust=1.362" rel="stylesheet" />
    <link href="<%= _path %>css/editorcss/editorstyle.css?bust=1.362" rel="stylesheet" />
    <script>
        var bms_token = '<%= Default.toDefault((String)session.getAttribute(PMSDefinitions.CSRF_TOKEN_NAME)) %>';
        var _path = '<%= _path %>'
        var previewDomain = "<%=PMSResources.getInstance().getPreviewDomain()%>";
        var imagesCDN =  "<%=PMSResources.getInstance().getCDNForImages()%>";
        var staticCDN =  "<%=PMSResources.getInstance().getCDNForStaticContents()%>"; 
        var userKey =  "<%=userInfo.getUserKey()%>"; 
    </script>
    <script type="text/javascript" src="<%= _path %>js/require.js" data-main="apps/bridgemail/main"></script>

    
    <!-- <link href="build/bridgemail/bridgemail_0.1.min.css" rel="stylesheet" type="text/css" >
    <script type="text/javascript" src="js/require.js" data-main="build/bridgemail/bridgemail_0.1.min"></script>-->
    

    <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
          <script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->   
    <script type="text/javascript" src="https://test.bridgemailsystem.com/tinymce_3/tiny_mce_old.js"></script>
</head>
<body>

    
    
</body>
</html>



