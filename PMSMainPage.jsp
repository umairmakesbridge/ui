<%@page import="com.PMSystems.*" %>
<%@page import="com.PMSystems.beans.*" %>
<%@page import="com.PMSystems.container.Campaign_CC" %>
<%@page import="com.PMSystems.logger.*" %>
<%@page import="com.PMSystems.util.*" %>
<%@page import="java.util.*" %>
<%@page import="java.net.*" %>
<%@page import="com.PMSystems.beans.HotListProcessorBean" %>
<%@page import="com.PMSystems.dbbeans.*" %>

<%
response.setHeader("Cache-Control","no-cache"); //HTTP 1.1
response.setHeader("Pragma","no-cache"); //HTTP 1.0
response.setDateHeader ("Expires", 0); //prevents caching at the proxy server

session.setAttribute("APP.ID", ""+ApplicationManager.APPL_ID_BRIDGEMAILSYSTEM);

UserInfo userInfo = (UserInfo)session.getAttribute("userInfo");
if(userInfo == null) {
        WebServerLogger.getLogger().log(new LogEntry("PMSMainPage.jsp", "", "Invalid Access! userInfo not found in Session"));
        %> <jsp:forward page="InvalidAccess.jsp"/> <%
        return;
}//end if

String formWizardURL = "https://"+PMSResources.getInstance().getEventsDomain()+"/pms/landingpages/rformBuilderNew.jsp?"+WebSecurityManager.getCSRFToken_HREF(session)+"&ukey="+userInfo.getUserKey();

%>

<html>
<head>

	<!-- BEGIN TITLE -->
	<title>Bridge Mail Main Page</title>
	<!-- END TITLE -->

<!-- link tag should always be inside <head> tag -->
<link HREF="pms.css" rel="STYLESHEET" TYPE="text/css"/>
<link HREF="jwb.css" rel="STYLESHEET" TYPE="text/css"/>

<!-- the following 3 lines will load a hack for ie 6 and below, it is not just a comment -->
<!--[if lte IE 6]>
<link rel="stylesheet" media="screen" href="ie.css" />
<![endif]--></head>
<body style="background-color: #FFFFFF;">

<jsp:include page="newuiheader.jsp" />

<!-- @START OLD DATA -->
<script language=javascript>

function editTemplate() {
	if(document.currentLists.tempDropDown.value == '') {
		alert('Please select template to edit.');
		return;
	}
var tNumber = document.currentLists.templateNumber.value;
window.location = '/pms/publisher/UserTemplateHandler.jsp?templateNumber='+tNumber+'&action=e&<%=WebSecurityManager.getCSRFToken_HREF(session)%>';
}

function showTemplate(data) {
//alert('data: ' + data);
var index = data.indexOf(' ');
//alert('index of ' + index);
var templateNumber = data.substring(0, index);
//alert('templateNumber: ' + templateNumber);
document.currentLists.templateNumber.value = templateNumber;
data = data.substring(index, data.length);
//alert('data: ' + data);
var ele = document.getElementById('tempTd');
ele.innerHTML = data;
document.getElementById('tempTr').style.display = '';
}

function goToCreateTemplate() {
window.location='/pms/publisher/CreateTemplate.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&origin=../PMSMainPage.jsp';
}

function showPreview(number) {
 window.open('/pms/publisher/UserTemplateView.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&templateNumber='+number,'prevWindow','width=850,height=750,left=200,top=200,screenX=200,screenY=200,resizable=yes,scrollbars=yes');
}

function showNextTemplatesPage(page) {
	document.currentLists.tempPage.value = page;
	document.currentLists.submit();
}

function delUserTemplate(number) {
	document.currentLists.templateNumber.value = number;
	document.currentLists.delTemplate.value = 'y';
	document.currentLists.submit();
}

function preview(cn) {
        var link = '/pms/publisher/ViewTemplateHandler.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&cmpNo='+cn;
	window.open(link,'mywindow1','width=850,height=750,left=100,top=100,screenX=100,screenY=100,scrollbars=yes,resizable=yes');
}

    function deleteMultiList() {
	var ln="", flag=false;

	if(document.currentLists.listOne.length==null && document.currentLists.listOne.checked){
		ln += ('listNumber='+document.currentLists.listOne.value);
		flag=true;
	}else{
		for(var i=0; i<document.currentLists.listOne.length; i++) {
			if(document.currentLists.listOne[i].checked) {
				flag=true;
				var num = document.currentLists.listOne[i].value;
				if(ln.length>1) ln+='&';
				var num = document.currentLists.listOne[i].value;
				var name = document.getElementById(num);
				ln += ('listNumber='+num);
			}
		}
	}
	if(flag) {
		myWindow1 = window.open('/pms/list/DeleteList.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&'+ln,'mywindow1','width=600, height=350,left=200,top=200,screenX=200,screenY=200,resizable=yes,scrollbars=yes');
	} else {
		alert("Please select list(s) for deletion.");
	}
    }

    function deleteMultiCampaign() {
var noCampaign=false;
if(document.currentLists.cmpCb==null) {
return;
}
	flag=false; var v="";

if(document.currentLists.cmpCb.length==null && document.currentLists.cmpCb.checked) {
  v += document.currentLists.cmpCb.value;
  flag = true;

} else {
	for(var i=0; i<document.currentLists.cmpCb.length; i++) {
		if(document.currentLists.cmpCb[i].checked) {
			flag=true;
			v += document.currentLists.cmpCb[i].value;
		}
	}

}
	if(flag) {
		window.open('/pms/publisher/DeleteCampaign.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&'+v,'mywindow2','width=600,height=250,left=200,top=200,screenX=200,screenY=200,resizable=yes,scrollbars=yes');
	} else {
			alert("Please select campaign(s) for deletions.");
	}
    }

    function help() {
		window.open('/pms/help/helpFrame.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&page=<%=request.getRequestURI()%>','prevWindow','width=950,height=600,left=200,top=200,screenX=200,screenY=200,resizable=yes,scrollbars=yes');

	}
    function deleteList(number, lName) {
        myWindow1 = window.open('/pms/list/DeleteList.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&listNumber='+number+'&listName='+escape(lName),'mywindow1','width=600, height=350,left=200,top=200,screenX=200,screenY=200');
    }
    function deleteCampaign(campNumber, campName) {
        myWindow2 = window.open('/pms/publisher/DeleteCampaign.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&campaignNumber='+campNumber+'&campaignName='+campName,'mywindow2','width=600,height=250,left=200,top=200,screenX=200,screenY=200');
    }
    function nextListPage(pageNumber) {
        document.currentLists.listPageNumber.value = pageNumber;
        document.currentLists.submit();
    }
    function nextCampaignPage(pageNumber) {
        document.currentLists.campaignPageNumber.value = pageNumber;
        document.currentLists.submit();
    }

    function changeListLimit() {
        document.currentLists.listPageNumber.value = 1;
        document.currentLists.submit();
    }
    function changeCampaignLimit() {
        document.currentLists.campaignPageNumber.value = 1;
        document.currentLists.submit();
    }

    function viewCampaign() {
        var campNo = document.currentLists.campMenu.value;
        if(campNo !=0 ){
            //var link = "/pms/publisher/EditCampaignOptions.jsp?campaignNumber="+campNo;
            //location.href=link;
            document.currentLists.submit();
        }
    }//()
    function refreshStats(){
        document.currentLists.asRefreshStat.value = 1;
        document.currentLists.submit();
    }
    function changeCampOrder(orderBy,order){
	document.currentLists.orderBy.value = orderBy;
	document.currentLists.order.value = order;
        document.currentLists.asRefreshStat.value = 1;
        document.currentLists.submit();
    }
    function changeListOrder(listOrderBy,listOrder){
	document.currentLists.listOrderBy.value = listOrderBy;
	document.currentLists.listOrder.value = listOrder;
        document.currentLists.asRefreshStat.value = 1;
        document.currentLists.submit();
    }
    function findList(){
	if(document.currentLists.listMenu.value=='') {

           document.getElementById("find2").style.display='none';

	} else {

           document.getElementById("find2").style.display='';

	}
	var lData = document.currentLists.listMenu.value;
	var fIndex = lData.indexOf('~~~');
	var lNo = lData.substring(0,fIndex);
	fIndex = fIndex + 3;
	var lIndex = lData.indexOf('~~~',fIndex);
	var lName = lData.substring(fIndex,lIndex);
	fIndex = lIndex+3;
	lIndex = lData.indexOf('~~~',fIndex);
        var lCreationDate = lData.substring(fIndex,lIndex);
	fIndex = lIndex+3;
	lIndex = lData.indexOf('~~~',fIndex);
	var lSubCount = lData.substring(fIndex,lIndex);
	fIndex = lIndex+3;
	lIndex = lData.indexOf('~~~',fIndex);
	var lLocked = lData.substring(fIndex,lIndex);
	var lFunction = ""
	if(lName.indexOf('Supress_List_')!=0 ){
		if(lLocked=='Y'){
			lLocked = "<a href='/pms/PMSMainPage.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&listNumber="+lNo+"&action=unlock'><img border='0' src='/pms/graphics/Added.gif' alt='click to unlock list'></a>";
			lName = "<font class='disabled'>"+lName+"</font>";
			lCreationDate = "<font class='disabled'>"+lCreationDate+"</font>";
			lSubCount = "<font class='disabled'>"+lSubCount+"</font>";
			lFunction = "<font class='smalldisabled'><a href='/pms/PMSMainPage.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&listNumber="+lNo+"&action=unlock'>Unlock</a></font>";


    		}else{
					lFunction = "<a href=javascript:deleteList('"+lNo+"','"+escape(lName)+"');> Delete </a>";
			lLocked = "";
    		}
    	}else{
		lName = "<font color='red'>"+lName+"</font>";
		lLocked = "";
    	}
	document.getElementById("listL").innerHTML = lLocked;
	document.getElementById("listN").innerHTML = lName;
	document.getElementById("listS").innerHTML = lSubCount;
	document.getElementById("listF").innerHTML = lFunction;

    }

    function goToCRM() {
	if(document.currentLists.CRMClient.value=="SALESFORCE") {
	window.location.href="/pms/salesforce/SalesForce.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>";
	}else if(document.currentLists.CRMClient.value=="NETSUITE"){
	window.location.href="/pms/netsuite/NetSuite.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>";
	}else if(document.currentLists.CRMClient.value=="BULLHORN"){
	window.location.href="/pms/bullhorn/BullHorn.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>";
	}
    }
    function viewSubs(listNum) {
   	window.open('/pms/list/viewSubscribersListDetail.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&status=S&listNum='+listNum
    	,'L'+listNum, 'width=850,height=550,top=100,left=100,screenX=100,screenY=100,scrollbars=yes,status=yes,resizable=yes');
    }

function loadCustomChart() {
        var link = '/pms/mchart/customChart.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>';
	window.open(link,'','width='+(screen.width-50)+',height='+(screen.height-50)+',left=25,top=50,screenX=25,screenY=50,scrollbars=yes,status=yes,resizable=yes');
}

function loadWorkFlowWizard() {
    var link = '/pms/workflow/WorkFlowWizard.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>';
    window.open(link,'WFSLIDER','width='+(screen.width-50)+',height='+(screen.height-50)+',left=50,top=50,screenX=50,screenY=50,scrollbars=yes,status=yes,resizable=yes');
}

function loadFormWizard() {
    var link = '<%=formWizardURL%>';
    window.open(link,'_formwiz','width='+(screen.width-50)+',height='+(screen.height-50)+',left=50,top=50,screenX=50,screenY=50,scrollbars=yes,status=yes,resizable=yes');
}

function loadNewUI() {
    var link = '/pms/new_ui/index.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>';
    window.open(link,'new_ui','width='+(screen.width-50)+',height='+(screen.height-50)+',left=50,top=50,screenX=50,screenY=50,scrollbars=yes,status=yes,resizable=yes');
}

</script>

<jsp:useBean id="pmsBeanId" class="com.PMSystems.beans.PMSMainPageBean" scope="request">
<jsp:setProperty name="pmsBeanId" property="asRefreshStat"/>
</jsp:useBean>

<%!
void removeEvergreenRef(Vector cmpVec, Vector evergreenCampNumVec) {
 for(int i=0; i<cmpVec.size(); i++) {
  com.PMSystems.container.Campaign_CC myCmp = (com.PMSystems.container.Campaign_CC)cmpVec.get(i);
  if(evergreenCampNumVec.contains(""+myCmp.getCampaignNumber())) {
	cmpVec.remove(myCmp);
	i--;
  }
 }
}
%>

<%
//if(session.getAttribute("pendingCamps") != null) { code commented ; for notifying pending campaigns
%>
<!--<script>
var link = "/pms/PendingCampaignNotify.jsp";
window.open(link,'mywindow1','width=750,height=500,left=100,top=100,screenX=100,screenY=100,scrollbars=yes,resizable=yes');
</script>-->
<%
//}

if(request.getParameter("delTemplate") != null && request.getParameter("delTemplate").equals("y")) {
	UserTemplateManager.deleteUserTemplate(PMSEncoding.decode(request.getParameter("templateNumber")));
}
pmsBeanId.validatePMSMainPageBean(session); //added by Muhammad Ramzan
    Vector evergreenCampNumVec = EvergreenManager.getAllEvergreenCampaignNumbers(userInfo.getUserID());
    try {
        if(request.getParameter("action") != null) {
            if(request.getParameter("listNumber") != null) {
                userInfo.removeLock(Lock.LIST_LOCK, PMSEncoding.decode(request.getParameter("listNumber")));
                pmsBeanId.removeLockFromList(PMSEncoding.decode(request.getParameter("listNumber")));
            } else if(request.getParameter("campaignNumber") != null) {
                userInfo.removeLock(Lock.CAMPAIGN_LOCK, PMSEncoding.decode(request.getParameter("campaignNumber")));
                pmsBeanId.removeLockFromCampaign(PMSEncoding.decode(request.getParameter("campaignNumber")));
            }
        }
        pmsBeanId.removeLocks(userInfo);
        session.removeAttribute("FolUpWizCreateCampBean.CAMPAIGN_NUMBER");
        String status = Default.secureInput(request.getParameter("status"));
        String cn = Default.secureInput(request.getParameter("campaignNumber"));
        String campStatus = Default.secureInput(request.getParameter("campStatus"));
        if(campStatus == null) {
            campStatus = (String) session.getAttribute("campStatus");
            if(campStatus == null) {
                //campStatus = "all";
                campStatus = PMSDefinitions.CAMPAIGN_STATUS_DRAFT;
            }//end if
        } else {
            session.setAttribute("campStatus", campStatus);
        }//end if-else

        String listPageNumberString = Default.secureInput(request.getParameter("listPageNumber"));
        String campaignPageNumberString = Default.secureInput(request.getParameter("campaignPageNumber"));
        //String isRefreshStatsString = request.getParameter("isRefreshStats");

        if(listPageNumberString == null) {
            listPageNumberString = (String)session.getAttribute("listPageNumber");
            if(listPageNumberString == null) {
                listPageNumberString = "1";
            }
        } else {
            session.setAttribute("listPageNumber", listPageNumberString);
        }

        if(campaignPageNumberString == null) {
            campaignPageNumberString = (String)session.getAttribute("campaignPageNumber");
            if(campaignPageNumberString == null) {
                campaignPageNumberString = "1";
            }
        } else {
            session.setAttribute("campaignPageNumber", campaignPageNumberString);
        }

        //getting here bec we need it early.
        int listsCount = pmsBeanId.getListsCount(userInfo.getUserID(), userInfo.getCustomerNumber(), userInfo.getUserRole());
//        Vector data = pmsBeanId.getListSubscribersCount(userInfo.getUserID(), userInfo.getCustomerNumber(), userInfo.getUserRole());
session.removeAttribute("templateHtmlCode");
%>
<table border="0" cellpadding="0" cellspacing="0" width="900" align="center" id="mainWrapper" style="vertical-align:top;" >

<!--					Navigation and Content tr start					-->

	<tr>
<form name="currentLists" action="/pms/PMSMainPage.jsp" method="post">
<%=WebSecurityManager.getCSRFToken_FORM(session)%>

<input name="listPageNumber" type="hidden" value='<%=listPageNumberString%>'>
<input name="campaignPageNumber" type="hidden" value='<%=campaignPageNumberString%>'>
<input name="asRefreshStat" type="hidden" value='y'>
<input name="orderBy" type="hidden">
<input name="order" type="hidden">
<input name="listOrderBy" type="hidden">
<input name="listOrder" type="hidden">
<input name="templateNumber" type="hidden">
<input name="delTemplate" type="hidden">
<input type='hidden' name='tempPage' value='0'>


<!--					Content td start						-->

		<td colspan="2" id="mainContentCell" align="left" >
			<table cellpadding="" cellspacing="0" border="0" width="100%" >

			<tr><td width="35%" >
				<div id="quickstartWrapper" >
				<table cellpadding="0" cellspacing="0" border="0" width="100%" >
				<tr><td bgcolor="#666699" background="/pms/img/newui/header-icon-bg-quickstart.png"><img src="/pms/img/newui/header-icon-quickstart.png" alt="" width="120" height="40" /></td><td bgcolor="#666699" background="/pms/img/newui/header-icon-bg-quickstart.png" align="right"><img src="/pms/img/newui/header-text-quickstart.png" alt="" width="185" height="40" /></td></tr>
				<tr><td colspan="2" class="mainPageButtonCellWrapperCell">
					<table cellpadding="0" cellspacing="0" border="0" width="100%">
					<tr><td class="mainPageButtonCell center"><img src="/pms/img/newui/createNewCamp_main.png" width="40" height="40" /><br /><a href="/pms/publisher/SelectCampaignTemplate.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">Create New <br />Campaign</a></td>
					<td class="mainPageButtonCell center"><img src="/pms/img/newui/uploadSub_main.png" width="40" height="40" /><br /><%if(listsCount > 0) { out.println("<a href=\"/pms/list/AddSubscribers.jsp?"+WebSecurityManager.getCSRFToken_HREF(session)+"\">Upload <br />Subscribers</a>"); } else {out.println("Upload <br />Subscribers");}%></td>

					<td class="mainPageButtonCell center">
					<% if(userInfo.hasMarketingAccess()) { %>
                                            <a href="javascript:loadWorkFlowWizard();"><img class=vam src="/pms/img/newui/glass_play_button_50_50.png" /><br>Start Marketing</a>

					<% } else if(userInfo.hasSickAccess()) { %>
						<a href="javascript:loadCustomChart();"><img class=vam src="/pms/img/newui/sick.png" /><br>Custom Charts</a>
                                                <!--<a href="javascript:loadWorkFlowWizard();"><img class=vam src="/pms/img/newui/glass_play_button_50_50.png" /><br>Start Marketing</a>-->

				        <% }  else { %><img src="/pms/img/newui/main-view-report-of-last-5-campaigns.png" width="39" height="38" /><br/>
						<a href="/pms/report/PMSCampaignSummaryDetail.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">View Report of <br />Last 5 Campaigns</a>
				        <% }  %>

                                        </td></tr>
					</table>
				</td></tr>
				</table>
				</div>
			</td>
			<td width="65%" style="padding-left:20px;">
				<div id="toolsWrapper">

				<table cellpadding="0" cellspacing="0" border="0" width="100%">
				<tr><td bgcolor="#666699" background="/pms/img/newui/header-icon-bg-tools.png"><img src="/pms/img/newui/header-icon-tools.png" width="120" height="40" alt="" /></td><td bgcolor="#666699" background="/pms/img/newui/header-icon-bg-tools.png" align="right"><img src="/pms/img/newui/header-text-tools.png" width="185" height="40" alt="" /></td></tr>
				<tr><td colspan="2" class="mainPageButtonCellWrapperCell">
					<table cellpadding="0" cellspacing="0" border="0" width="100%">
					<tr><!--<td class="mainPageButtonCell center"><a href="/pms/publisher/PublisherMain.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>"><img src="/pms/img/newui/publishingCamp_main.png" width="40" height="40" /></a><br /><a href="/pms/publisher/PublisherMain.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">Publishing &amp; <br />Campaigns</a></td>-->
                                            <td class="mainPageButtonCell center"><a href="/pms/beta/index.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>" target="_blank"><img src="/pms/img/newui/publishingCamp_main.png" width="40" height="40" /></a><br /><a href="/pms/beta/index.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>" target="_blank">New UI</td>
					<td class="mainPageButtonCell center"><a href="/pms/list/listMgmtSeg.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>"><img src="/pms/img/newui/emailListManag_main.png" width="40" height="40" /></a><br /><a href="/pms/list/listMgmtSeg.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">Lists &<br> Segments</a></td>

					<td class="mainPageButtonCell center"><a href="/pms/report/AnalyticReportMain.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>"><img src="/pms/img/newui/reportsAnalytics_main.png" width="40" height="40" /></a><br /><a href="/pms/report/AnalyticReportMain.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">Reports &amp; <br />Analytics</a></td>
					<td class="mainPageButtonCell center"><%if(listsCount > 0){%><a href="javascript:loadFormWizard();"><%}%><img src="/pms/img/newui/signupForms_main.png" width="40" height="40" /><%if(listsCount > 0){%></a><%}%><br /><%if(listsCount > 0) { out.println("<a href=\"javascript:loadFormWizard();\">Sign Up <br />Forms</a>"); } else {out.println("Sign Up <br />Forms");}%></td>
					<td class="mainPageButtonCell center"><a href="javascript:help();"><img src="/pms/img/newui/video_main.png" width="40" height="40" /></a><br /><a href="javascript:help();">Video <br />Tutorials</a></td></tr>
					</table>
				</td></tr>

				</table>
				</div>
			</td></tr></table>



			<div id="dashboardWrapper">
			<table cellpadding="0" cellspacing="0" border="0" width="100%">
			<tr><td bgcolor="#666699" width="100%" background="/pms/img/newui/header-icon-bg-dashboard.png"><img src="/pms/img/newui/header-icon-dashboard.png" alt="" width="120" height="40" /></td><td bgcolor="#666699" background="/pms/img/newui/header-icon-bg-dashboard.png" width="100%" align="right"><img src="/pms/img/newui/header-text-dashboard.png" width="185" height="40" alt="" /></td><td id="refreshButtonCell"><a href='javascript:refreshStats();'><img src="/pms/img/newui/refresh_main.jpg" width="91" height="31" style="margin-left:3px;" /></a></td></tr>
			<tr><td colspan="3" class="mainPageButtonCellWrapperCell">

				<table width="100%" cellpadding="0" cellspacing="0" border="0">
<!-- @START OLD DATA -->
<%

Vector templateVec =  UserTemplateManager.getMyTemplatesVec(userInfo.getUserID());
if(templateVec == null)
	templateVec = new Vector();

%>
<!-- @END OLD DATA -->

				<tr><td width="59%">
					<table cellpadding="0" cellspacing="0" border="0" width="100%">
					<tr><td class="mainPageButtonCell" width="60%"><a href="/pms/publisher/PublisherMain.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>"><img src="/pms/img/newui/dashboard-templates-icon.png" width="24" height="23" align="absmiddle" /></a>&nbsp;<a href="/pms/publisher/PublisherMain.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">My Templates </a></td>
					<td class="mainPageButtonCell" style="text-align:right;">&nbsp;</td></tr>
					<tr><td class="mainPageButtonInnerCell" colspan="2" ><select name='tempDropDown' onchange='javascript:showTemplate(tempDropDown.value);' style="width:250px;"><option>Choose Template</option>
<option value=''>-----------------------------</option>
<%
for(int i = 0 ; i< templateVec.size(); i++) {
	UserTemplateDataBean bean = (UserTemplateDataBean) templateVec.get(i);
	if(bean == null)
		continue;
	String name = bean.getTemplateName().length()>24?bean.getTemplateName().substring(0,24):bean.getTemplateName();
%>
<!--<option value="<%=PMSEncoding.encode(Integer.toString(bean.getTemplateNumber()))%> <b><%=name%></b>&nbsp;<a href=javascript:showPreview('<%=PMSEncoding.encode(Integer.toString(bean.getTemplateNumber()))%>')><img src='/pms/img/newui/magnify_sub.gif' border=0 height=13 alt='Click to see preview'></a>&nbsp;&nbsp;&nbsp;<a href='javascript:editTemplate()'><font size='1'>Edit</font></a>&nbsp;&nbsp;&nbsp;<a href=javascript:delUserTemplate('<%=PMSEncoding.encode(Integer.toString(bean.getTemplateNumber()))%>')><font size='1'>Delete</font></a>&nbsp;&nbsp;&nbsp;<a href='/pms/publisher/PublishCampaignName.jsp?origin=../PMSMainPage.jsp&action=new&templateNumber=19&evergreen=N&htmlEditor=<%=(bean.getIsHtmlEditor().equalsIgnoreCase("n")? "N" : "Y")%>&templateName=<%=PMSEncoding.encode(Integer.toString(bean.getTemplateNumber()))%>'><font size='1'>Create New Campaign</font></a>"><%=bean.getTemplateName()%></option>-->
<option value="<%=PMSEncoding.encode(Integer.toString(bean.getTemplateNumber()))%> <b><%=name%></b>&nbsp;<a href=javascript:showPreview('<%=PMSEncoding.encode(Integer.toString(bean.getTemplateNumber()))%>')><img src='/pms/img/newui/magnify_sub.gif' border=0 height=13 alt='Click to see preview'></a>&nbsp;&nbsp;&nbsp;<a href='javascript:editTemplate()'><font size='1'>Edit</font></a>&nbsp;&nbsp;&nbsp;<a href=javascript:delUserTemplate('<%=PMSEncoding.encode(Integer.toString(bean.getTemplateNumber()))%>')><font size='1'>Delete</font></a>&nbsp;&nbsp;&nbsp;<a href='/pms/publisher/PublishCampaignName.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&origin=../PMSMainPage.jsp&action=new&templateNumber=19&evergreen=N&htmlEditor=<%=(bean.getIsHtmlEditor().equalsIgnoreCase("y") ? "Y" : "N")%>&userTemplateNo=<%=PMSEncoding.encode(Integer.toString(bean.getTemplateNumber()))%>'><font size='1'>Create New Campaign</font></a>"><%=bean.getTemplateName()%></option>
<%
}
%>

						</select>
					<tr id='tempTr'><td id='tempTd' class="mainPageButtonInnerCellData" style="padding-bottom:8px; vertical-align:middle;" colspan="2">&nbsp;</td></tr>
					<tr><td style="padding-top:5px; text-align:right;" colspan="2"><a href="javascript:goToCreateTemplate();"><img src="/pms/img/newui/add.gif"></a></td></tr>
					</table>
				</td>

<%
	Vector subVec= null;
	int hotCount = 0;
	HotListDataBean hotListDataBean = null;
	if(session.getAttribute("hotListDataBean")!=null){
 		hotListDataBean = (HotListDataBean)session.getAttribute("hotListDataBean");
	}else{
        	hotListDataBean = HotListProcessorBean.loadHotListQuery(userInfo);
		session.setAttribute("hotListDataBean",hotListDataBean);
	}
	if(session.getAttribute("hotSubscribers")!=null){
		subVec = (Vector) session.getAttribute("hotSubscribers");
	}else{
		if(hotListDataBean.getHotID()!=0){
		    subVec = HotListProcessorBean.getHotSubscribers(hotListDataBean.getHotID());
                    session.setAttribute("hotSubscribers",subVec);
		}
	}
	if(session.getAttribute("hotCount")!=null){
		hotCount = Default.defaultInt((String)session.getAttribute("hotCount"));
	}else{
 		hotCount = HotListProcessorBean.getHotListSubscribersCount(hotListDataBean.getHotID());
		session.setAttribute("hotCount",String.valueOf(hotCount));
	}


%>
				<td width="41%" style="padding-left:20px;">
					<table cellpadding="0" cellspacing="0" border="0" width="100%">
					<tr><td class="mainPageButtonCell noBottomPadding hotList " colspan="2" ><a href="/pms/report/HotList.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>"><img src="/pms/img/newui/hotlist_main.png" width="40" height="40" align="absmiddle" /></a>&nbsp;<a href="/pms/report/HotList.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">My Hot List </a></td></tr>
	<%if(subVec!=null && subVec.size()>0){
		SubscriberInfo subInfo;
		String telePh = "";
                String classData = "mainPageButtonInnerCellData mainPageButtonInnerCell";
		String areaCode = "";
               for(int i=0;i<subVec.size();i++){
		subInfo = (SubscriberInfo)subVec.get(i);
		areaCode = subInfo.getAreaCode()!=null?subInfo.getAreaCode():"";
		areaCode = areaCode.equals("")?"":"("+areaCode+")";
		telePh = (subInfo.getTelephone()==null||subInfo.getTelephone().equalsIgnoreCase("null"))?"":subInfo.getTelephone();
            	if(i>0)
                   classData = "mainPageButtonInnerCellData";
                 %>

					<tr><td class="<%=classData%>" width="70%"><%=subInfo.getEmail()%></td><td class="<%=classData%>" width="30%"><%=areaCode%>&nbsp;<%=telePh%></td></tr>
	<%}
	}else{
  %>
					<tr><td colspan="2" class="mainPageButtonInnerCellData mainPageButtonInnerCell">No subscribers found in hotlist. <a href="/pms/report/HotList.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">Create/Update HotList query</a></td></tr>
					<tr><td class="mainPageButtonInnerCellData" colspan="2">&nbsp;</td></tr>
	<%}%>
					</table>
				</tr>
<!-- Campaign portion -->
<%
    String campaignLimitString = Default.secureInput(request.getParameter("campaignLimit"));
    if(campaignLimitString == null) {
        campaignLimitString = (String)session.getAttribute("campaignLimit");
        if(campaignLimitString == null) {
            campaignLimitString = "5";
        }
    } else {
        session.setAttribute("campaignLimit", campaignLimitString);
    }
    if(true) {
    int pageNumber = 0;
    int noOfRecords = 0;
    if(campaignPageNumberString == null){
        pageNumber = 1;
    } else {
        pageNumber = Integer.parseInt(campaignPageNumberString);
    }


    int limit = Integer.parseInt(campaignLimitString);

    int offset = ((pageNumber - 1) * limit);

    noOfRecords = pmsBeanId.getCampaignsCount(userInfo.getUserID(), userInfo.getCustomerNumber(), userInfo.getUserRole(), PMSDefinitions.CAMPAIGN_TYPE_NORMAL, campStatus);
    if(campStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_ALL)) {
	noOfRecords = noOfRecords - evergreenCampNumVec.size();
    }

    int noOfRecordsToBeShown = noOfRecords / limit;
    int totalNoOfPagesToBeShown = 10;
    int noToBeAdded = (pageNumber % totalNoOfPagesToBeShown) == 0?1:0;
    int startingNoOfPage = ((pageNumber/(totalNoOfPagesToBeShown + noToBeAdded))*totalNoOfPagesToBeShown)+1;
    if((noOfRecords % limit) != 0) {
        noOfRecordsToBeShown = noOfRecordsToBeShown + 1;
    }
%>


				<tr><td colspan="2">&nbsp;</td></tr>

				<tr><td width="59%">
					<table cellpadding="0" cellspacing="0" border="0" width="100%">
					<tr><td class="mainPageButtonCell"  colspan="2"><a href="/pms/publisher/PublisherMain.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>"><img src="/pms/img/newui/dashboard-my-campaigns-icon.png" align="absmiddle" width="25" height="18" /></a>&nbsp;<a href="/pms/publisher/PublisherMain.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">Campaigns & Auto Triggers </a></td>
					<td class="mainPageButtonCell" style="text-align:right;" colspan="2">&nbsp;</td></tr>

					<tr><td class="mainPageButtonInnerCell" colspan="4">
		<select name="campMenu" onchange="javascript:viewCampaign();" style="width:250px;">
                <option value="0" >Select a Campaign</option>
                <%
    /* -- Added by Bilal*/
    Vector cmpVec = pmsBeanId.getAllCampaigns(userInfo.getUserID(),
                                           new Long(userInfo.getCustomerNumber()),
                                           userInfo.getUserRole(),
                                           false);

    removeEvergreenRef(cmpVec, evergreenCampNumVec);

    {//block
        String cmpNo;
        String cmpName;
        String cmpStatus;
        String cmpLocked = "";
        int accessType;
        String updationDate="nishta";
        String scheduledDate="nishta";
        String creationDate="nishta";
	String cmpDate="";

        for(int i=0; i<cmpVec.size();i++) {
            Campaign_CC cmp = (Campaign_CC)cmpVec.elementAt(i);
	    if(!cmp.getCampaignType().equalsIgnoreCase(PMSDefinitions.CAMPAIGN_TYPE_NORMAL))
		 continue;

            int count=0;
            cmpNo = cmp.getCampaignNumber().toString();

            cmpName = cmp.getCampaignName();
            cmpStatus = ""+cmp.getStatus();
            cmpLocked = ""+cmp.getLocked();
            accessType = cmp.getAccessType();
            updationDate = ""+cmp.getUpdationDate();
            scheduledDate = ""+cmp.getScheduledDate();
            creationDate = ""+cmp.getCreationDate();

%>
                <option value="<%=PMSEncoding.encode(cmpNo)%>"><%=cmpName+" ("+creationDate+")"%></option>
                <%
        }//for
    }//block
    /* -- */
%>
              </select>
<br />
	</td>
          </tr>

					<tr><td class="mainPageButtonInnerCellData columnHeader" width="40%">Name</td><td class="mainPageButtonInnerCellData columnHeader" width="12%">Status</td><td class="mainPageButtonInnerCellData columnHeader" width="36%">Functions</td><td class="mainPageButtonInnerCellData columnHeader" width="12%"><a onMouseOver="window.status='Click to delete campaign(s).'; return true" onMouseOut="window.status=''" href="javascript:deleteMultiCampaign();">Delete</a></td></tr>
<%
    String cmpSelected = Default.secureInput(request.getParameter("campMenu"));
    //System.out.println("[-Bilal Info-] selected campaign value recieved from REQUEST ="+cmpSelected);
    if(cmpSelected==null) {
        Object obj = session.getAttribute("selectedCampaignKey");
        cmpSelected = obj==null? null:(String)obj;
        //System.out.println("[-Bilal Info-] selected campaign value recieved from SESSION ="+cmpSelected);
    }
//    Campaign campaign;
    if(cmpSelected ==null || cmpSelected.equals("0")) {
        ;//System.out.println("[Bilal Info] cmpValue="+cmpSelected);
    } else {
        String cmpNo = PMSEncoding.decode(String.valueOf(cmpSelected));
        Campaign_CC campaign=null;
        campaign = pmsBeanId.getCampaign(Long.parseLong(cmpNo));
        if(campaign==null){
            session.removeAttribute("selectedCampaignKey");
        }else{
            session.setAttribute("selectedCampaignKey", cmpSelected);


        String _cmpNo;
        String _cmpName;
        String _cmpStatus;
        String _date;
        String _cmpLocked = "";
	String _status="";
//        for (int i = (originalCampaigns.size()-1); i >= 0; i--) {
//            aRec = (Vector)originalCampaigns.get(i);
//            cmpNo = (String)aRec.get(0);
////            cmpName = (String)aRec.get(1);
  //          cmpStatus = (String)aRec.get(2);
    //        cmpLocked = (String)aRec.get(3);
       _cmpNo = ""+campaign.getCampaignNumber();
       _cmpName = campaign.getCampaignName();
	String name = _cmpName.length()>24?_cmpName.substring(0,24):_cmpName;
       _cmpStatus = ""+campaign.getStatus();
       _cmpLocked = ""+campaign.getLocked();
       _date =  _cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_DRAFT)?campaign.getCreationDate():campaign.getScheduledDate();
            if(!_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_DELETED)) {

                      if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_COMPLETED)){
                          _status = "Completed";
                      }else if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_DRAFT)){
                          _status = "Draft";
                      }else if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_SCHEDULED)){
                          _status = "Scheduled";
                      }else{
                          _status = "Pending";
                      }

                	if(_cmpLocked.equals(PMSDefinitions.LOCK_TRUE)) {
                    if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_COMPLETED)
			||_cmpStatus.equals(PMSDefinitions.CAMPAIGN_TRANSMISSION_STATUS_PENDING)) {
	                       Vector stat = campaign.getCountData();
%>

					<tr><td class="mainPageButtonInnerCellDataHighlight" ><a href='/pms/PMSMainPage.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>&action=unlock'><img border="0" src="/pms/graphics/Added.gif" alt="click to unlock campaign"></a>&nbsp;<a href="/pms/publisher/EditCampaignOptions.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>&origin=../PMSMainPage.jsp"><%=name%></a>&nbsp;<a href="javascript:preview('<%=PMSEncoding.encode(_cmpNo)%>');"><img border="0" src="/pms/img/newui/magnify_sub.gif" alt="click to see preview"></a></td><td class="mainPageButtonInnerCellDataHighlight" ><%=_status%></td><td class="mainPageButtonInnerCellDataHighlight" >Sent:<%=stat.get(0)%>,Opened:<%=stat.get(1)%>,Clicked:<%=stat.get(2)%>&nbsp;&nbsp;
<a href="/pms/publisher/SelectCampaignName.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&action=copy&origin=../PMSMainPage.jsp&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>">Copy</a></td><td class="mainPageButtonInnerCellDataHighlight" >
<input type="checkbox" name="cmpCb" value="cno=<%=PMSEncoding.encode(_cmpNo)%>&cname=<%=_cmpName%>&"></td></tr>
<%		   }else{%>
					<tr><td class="mainPageButtonInnerCellDataHighlight" ><a href='/pms/PMSMainPage.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>&action=unlock'><img border="0" src="/pms/graphics/Added.gif" alt="click to unlock campaign"></a>&nbsp;<a href="/pms/publisher/EditCampaignOptions.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>&origin=../PMSMainPage.jsp"><%=name%></a>&nbsp;<a href="javascript:preview('<%=PMSEncoding.encode(_cmpNo)%>');"><img border="0" src="/pms/img/newui/magnify_sub.gif" alt="click to see preview"></a></td><td class="mainPageButtonInnerCellDataHighlight" ><%=_status%></td><td class="mainPageButtonInnerCellDataHighlight" ><%if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_SCHEDULED)) { out.println("ReSchedule"); } else if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_DRAFT)) { out.println("Schedule");} else { out.println("");}%>&nbsp;
<a href="/pms/publisher/SelectCampaignName.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&action=copy&origin=../PMSMainPage.jsp&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>"><%=_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_COMPLETED) ? "" : "Copy"%></a></td><td class="mainPageButtonInnerCellDataHighlight" >
						<input type="checkbox" name="cmpCb" value="cno=<%=PMSEncoding.encode(_cmpNo)%>&cname=<%=_cmpName%>&"></td></tr>
<%}
                	}else{
                    if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_COMPLETED)
			||_cmpStatus.equals(PMSDefinitions.CAMPAIGN_TRANSMISSION_STATUS_PENDING)) {
	                       Vector stat = campaign.getCountData();
%>

					<tr><td class="mainPageButtonInnerCellDataHighlight" ><a href="/pms/publisher/EditCampaignOptions.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>&origin=../PMSMainPage.jsp"><%=name%></a>&nbsp;<a href="javascript:preview('<%=PMSEncoding.encode(_cmpNo)%>');"><img border="0" src="/pms/img/newui/magnify_sub.gif" alt="click to see preview"></a></td><td class="mainPageButtonInnerCellDataHighlight" ><%=_status%></td><td class="mainPageButtonInnerCellDataHighlight" >Sent:<%=stat.get(0)%>,Opened:<%=stat.get(1)%>,Clicked:<%=stat.get(2)%>&nbsp;&nbsp;
<a href="/pms/publisher/SelectCampaignName.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&action=copy&origin=../PMSMainPage.jsp&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>">Copy</a></td><td class="mainPageButtonInnerCellDataHighlight" ><input type="checkbox" name="cmpCb" value="cno=<%=PMSEncoding.encode(_cmpNo)%>&cname=<%=_cmpName%>&"></td></tr>
<%		   }else{%>
					<tr><td class="mainPageButtonInnerCellDataHighlight" ><a href="/pms/publisher/EditCampaignOptions.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>&origin=../PMSMainPage.jsp"><%=name%></a>&nbsp;<a href="javascript:preview('<%=PMSEncoding.encode(_cmpNo)%>');"><img border="0" src="/pms/img/newui/magnify_sub.gif" alt="click to see preview"></a></td><td class="mainPageButtonInnerCellDataHighlight" ><%=_status%></td><td class="mainPageButtonInnerCellDataHighlight" >
<a href='/pms/schedule/ScheduleCampaign.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>&origin=../PMSMainPage.jsp'><%if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_SCHEDULED)) { out.println("ReSchedule"); } else if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_DRAFT)) { out.println("Schedule"); } else { out.println("");}%></a>&nbsp;<a href="/pms/publisher/SelectCampaignName.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&action=copy&origin=../PMSMainPage.jsp&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>"><%=_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_COMPLETED) ? "" : "Copy"%></a></td><td class="mainPageButtonInnerCellDataHighlight" ><input type="checkbox" name="cmpCb" value="cno=<%=PMSEncoding.encode(_cmpNo)%>&cname=<%=_cmpName%>&"></td></tr>
<%}

	}

        }
        }
    }
%>








<%
                if(request.getParameter("orderBy")!=null && !Default.secureInput(request.getParameter("orderBy")).equals("")){
			session.setAttribute("orderBy",Default.secureInput(request.getParameter("orderBy")));
		}
		if(request.getParameter("order")!=null && !Default.secureInput(request.getParameter("orderBy")).equals("")){
			session.setAttribute("order",Default.secureInput(request.getParameter("order")));
		}
                String order="desc";
		if(session.getAttribute("order")!=null){
			order = (String)session.getAttribute("order");

		}
		order =(order.equals("asc"))?"desc":"asc";

%>

<%
    Vector originalCampaigns = pmsBeanId.getCampaigns(userInfo.getUserID(), userInfo.getCustomerNumber(), userInfo.getUserRole(), PMSDefinitions.CAMPAIGN_TYPE_NORMAL, campStatus, offset, limit);
    Vector aRec;
    if(noOfRecords > 0) {
        String _cmpNo;
        String _cmpName;
        String _cmpStatus;
        String _date="";
        String _cmpLocked = "";
	String _status="";

        for (int i = 0; i <originalCampaigns.size(); i++) {
            aRec = (Vector)originalCampaigns.get(i);
            _cmpNo = (String)aRec.get(0);
	    if(evergreenCampNumVec.contains(_cmpNo))
		continue;
            _cmpName = (String)aRec.get(1);
            String name = _cmpName.length()>24?_cmpName.substring(0,24):_cmpName;
            _cmpStatus = (String)aRec.get(2);
            _cmpLocked = (String)aRec.get(3);
            _date = (String)aRec.get(5);
            if(!_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_DELETED)) {
%>

<%

                      if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_COMPLETED)){
                          _status = "Completed";
                      }else if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_DRAFT)){
                          _status = "Draft";
                      }else if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_SCHEDULED)){
                          _status = "Scheduled";
                      }else{
                          _status = "Pending";
                      }
	            if(!_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_DELETED)) {
                	if(_cmpLocked.equals(PMSDefinitions.LOCK_TRUE)) {
                    if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_COMPLETED)
			||_cmpStatus.equals(PMSDefinitions.CAMPAIGN_TRANSMISSION_STATUS_PENDING)) {
	                       Vector stat = (Vector)aRec.get(6);
%>

					<tr><td class="mainPageButtonInnerCellData" ><a href='/pms/PMSMainPage.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>&action=unlock'><img border="0" src="/pms/graphics/Added.gif" alt="click to unlock campaign"></a>&nbsp;<a href="/pms/publisher/EditCampaignOptions.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>&origin=../PMSMainPage.jsp"><%=name%></a>&nbsp;<a href="javascript:preview('<%=PMSEncoding.encode(_cmpNo)%>');"><img border="0" src="/pms/img/newui/magnify_sub.gif" alt="click to see preview"></a></td><td class="mainPageButtonInnerCellData" ><%=_status%></td><td class="mainPageButtonInnerCellData" >Sent:<%=stat.get(0)%>,Opened:<%=stat.get(1)%>,Clicked:<%=stat.get(2)%>&nbsp;&nbsp;
<a href="/pms/publisher/SelectCampaignName.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&action=copy&origin=../PMSMainPage.jsp&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>">Copy</a></td><td class="mainPageButtonInnerCellData" ><input type="checkbox" DISABLED name="cmpCb" value="cno=<%=PMSEncoding.encode(_cmpNo)%>&cname=<%=_cmpName%>&"></td></tr>
<%		   }else{%>
					<tr><td class="mainPageButtonInnerCellData" ><a href='/pms/PMSMainPage.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>&action=unlock'><img border="0" src="/pms/graphics/Added.gif" alt="click to unlock campaign"></a>&nbsp;
<a href="/pms/publisher/EditCampaignOptions.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>&origin=../PMSMainPage.jsp"><%=name%></a>&nbsp;<a href="javascript:preview('<%=PMSEncoding.encode(_cmpNo)%>');"><img border="0" src="/pms/img/newui/magnify_sub.gif" alt="click to see preview"></a></td><td class="mainPageButtonInnerCellData" ><%=_status%></td><td class="mainPageButtonInnerCellData" ><%if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_SCHEDULED)) { out.println("ReSchedule"); } else if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_DRAFT)) { out.println("Schedule");} else { out.println("");}%>&nbsp;<a href="/pms/publisher/SelectCampaignName.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&action=copy&origin=../PMSMainPage.jsp&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>"><%=_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_COMPLETED) ? "" : "Copy"%></a></td><td class="mainPageButtonInnerCellData" >
						<input type="checkbox" DISABLED name="cmpCb" value="cno=<%=PMSEncoding.encode(_cmpNo)%>&cname=<%=_cmpName%>&"></td></tr>
<%}
                	}else{
                    if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_COMPLETED)
			||_cmpStatus.equals(PMSDefinitions.CAMPAIGN_TRANSMISSION_STATUS_PENDING)) {
	                       Vector stat = (Vector)aRec.get(6);
%>

					<tr><td class="mainPageButtonInnerCellData" ><a href="/pms/publisher/EditCampaignOptions.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>&origin=../PMSMainPage.jsp"><%=name%></a>&nbsp;<a href="javascript:preview('<%=PMSEncoding.encode(_cmpNo)%>');"><img border="0" src="/pms/img/newui/magnify_sub.gif" alt="click to see preview"></a></td><td class="mainPageButtonInnerCellData" ><%=_status%></td><td class="mainPageButtonInnerCellData" >Sent:<%=stat.get(0)%>,Opened:<%=stat.get(1)%>,Clicked:<%=stat.get(2)%>&nbsp;&nbsp;
<a href="/pms/publisher/SelectCampaignName.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&action=copy&origin=../PMSMainPage.jsp&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>">Copy</a></td><td class="mainPageButtonInnerCellData" ><input type="checkbox" name="cmpCb" value="cno=<%=PMSEncoding.encode(_cmpNo)%>&cname=<%=_cmpName%>&"></td></tr>
<%		   }else{%>
					<tr><td class="mainPageButtonInnerCellData" ><a href="/pms/publisher/EditCampaignOptions.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>&origin=../PMSMainPage.jsp"><%=name%></a>&nbsp;<a href="javascript:preview('<%=PMSEncoding.encode(_cmpNo)%>');"><img border="0" src="/pms/img/newui/magnify_sub.gif" alt="click to see preview"></a></td><td class="mainPageButtonInnerCellData" ><%=_status%></td><td class="mainPageButtonInnerCellData" ><a href='/pms/schedule/ScheduleCampaign.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>&origin=../PMSMainPage.jsp'><%if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_SCHEDULED)) { out.println("ReSchedule"); } else if(_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_DRAFT)) { out.println("Schedule"); } else { out.println("");}%></a>&nbsp;
<a href="/pms/publisher/SelectCampaignName.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&action=copy&origin=../PMSMainPage.jsp&campaignNumber=<%=PMSEncoding.encode(_cmpNo)%>"><%=_cmpStatus.equals(PMSDefinitions.CAMPAIGN_STATUS_COMPLETED) ? "" : "Copy"%></a></td><td class="mainPageButtonInnerCellData" ><input type="checkbox" name="cmpCb" value="cno=<%=PMSEncoding.encode(_cmpNo)%>&cname=<%=_cmpName%>&"></td></tr>
<%}

	}

    }
            }
        }
    } else {
%>
        <tr>
          <td colspan="4" class="mainPageButtonInnerCellData">No Draft Campaigns Found</td>
        </tr>
<%
    }//end if-else
    } // end of campagin block
%>
					<tr><td class="mainPageButtonInnerCellData" colspan="4">&nbsp;</td></tr>
					<tr><td colspan="4" style="padding-top:5px; text-align:right"><a href="/pms/publisher/SelectCampaignTemplate.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>"><img src="/pms/img/newui/create_new_campaign.jpg"></a></td></tr>
					</table>
				</td>


				<td width="41%" style="padding-left:20px;">
					<table cellpadding="0" cellspacing="0" border="0" width="100%">
					<tr><td class="mainPageButtonCell noBottomPadding" colspan="3"><a href="/pms/list/listMgmtSeg.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>"><img src="/pms/img/newui/dashboard-my-lists-icon-small.png" align="absmiddle" width="36" height="32" /></a> <a href="/pms/list/listMgmtSeg.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>">Lists & Segments</a></td></tr>
<%
       String listLimitString = Default.secureInput(request.getParameter("listLimit"));

        if(listLimitString == null) {
            listLimitString = (String)session.getAttribute("listLimit");
            if(listLimitString == null) {
                listLimitString = "5";
            }
        } else {
            session.setAttribute("listLimit", listLimitString);
        }

        int pageNumber = 0;
        int noOfRecords = 0;
        if(listPageNumberString == null){
            pageNumber = 1;
        } else {
            pageNumber = Integer.parseInt(listPageNumberString);
        }


        int limit = Integer.parseInt(listLimitString);

//        int offset = ((pageNumber - 1) * limit) + 1;
        int offset = ((pageNumber - 1) * limit);

        noOfRecords = listsCount;
        int noOfRecordsToBeShown = noOfRecords / limit;
        int totalNoOfPagesToBeShown = 10;
        int noToBeAdded = (pageNumber % totalNoOfPagesToBeShown) == 0?1:0;
        int startingNoOfPage = ((pageNumber/(totalNoOfPagesToBeShown + noToBeAdded))*totalNoOfPagesToBeShown)+1;
        if((noOfRecords % limit) != 0) {
            noOfRecordsToBeShown = noOfRecordsToBeShown + 1;
        }

%>

					<tr><td class="mainPageButtonInnerCell" width="70%" colspan="3">
              <select name="listMenu" OnChange="javascript:findList();" style="width:250px;">
                <option value="" >Select a List</option>
		<option value="" >------------------</option>
                <%

    Vector listData = pmsBeanId.getAllLists(userInfo.getUserID(),
       	        userInfo.getUserRole(),
                userInfo.getCustomerNumber());

    	if(listData != null){
Vector dVec = new Vector();
           String lNo;
	   String lName;
           String lStatus;
	   String lLocked = "";
           String lAccessType;
	   String lCreationDate="";
           String lSubCount="";
           Vector listVec = null;
           for(int i=0; i<listData.size();i++){
                listVec = (Vector) listData.get(i);
 		lNo = ""+listVec.get(0);
dVec.add((String)listVec.get(0));           //inserting list number in vector for deletion of lists
                lName = ""+listVec.get(1);
	        String name = lName.length()>24?lName.substring(0,24):lName;
dVec.add((String)listVec.get(1));	    //inserting list name in vector for deletion of lists
		lSubCount = ""+listVec.get(2);
                lLocked = ""+listVec.get(3);
                lAccessType = ""+listVec.get(4);
                lStatus = ""+listVec.get(5);
                lCreationDate = listVec.get(6).equals("null")?"":""+listVec.get(6);
            %>
                <option value="<%=lNo%>~~~<%=name%>~~~<%=lCreationDate%>~~~<%=lSubCount%>~~~<%=lLocked%>~~~<%=lStatus%>"><%=lName%></option>
                <%
        }//for
session.setAttribute("v",dVec); // made for deleteList.jsp
    }
    /* -- */
%>
              </select>

					</td></tr>
					<tr><td class="mainPageButtonInnerCellData columnHeader" width="55%">Name</td><td class="mainPageButtonInnerCellData columnHeader" width="25%">Record Count</td><td class="mainPageButtonInnerCellData columnHeader" width="20%"><a href="javascript:deleteMultiList();">Delete</a></td></tr>
					<tr id='find2' style='display:none;'><td class="mainPageButtonInnerCellDataHighlight " width="55%"><span id="listL" style="width:100%"></span><span id="listN" style="width:100%"> </span></td><td class="mainPageButtonInnerCellDataHighlight" width="25%" align="center"><span id="listS" style="width:100%"></span></td><td class="mainPageButtonInnerCellDataHighlight" width="20%"><span id="listF" style="width:100%"> </span></td></tr>
<%
		String listOrder="desc";
		String listOrderBy = "d";
                if(request.getParameter("listOrderBy")!=null && !request.getParameter("listOrderBy").equals("")){
			listOrderBy = Default.secureInput(request.getParameter("listOrderBy"));
		}
		if(request.getParameter("listOrder")!=null && !request.getParameter("listOrder").equals("")){
			listOrder = Default.secureInput(request.getParameter("listOrder"));
		}
		Vector data = pmsBeanId.getListSubscribersCount(userInfo.getUserID(), userInfo.getCustomerNumber(), userInfo.getUserRole(), listOrder, listOrderBy, offset, limit);
		listOrder =(listOrder.equals("asc"))?"desc":"asc";

%>



<%
    Vector row = null;
    String listNumber = null;
    String listName = null;
    String subCount = "";
    String locked = "";
    String creationDate = "";
//Vector dVec = new Vector();
        for (int i = 0; data!=null && i<data.size(); i++) {
            row = (Vector)data.get(i);
            listNumber = (String)row.get(0);
//dVec.add((String)row.get(0));           //inserting list number in vector for deletion of lists
            listName = (String)row.get(1);
	        String name = listName.length()>24?listName.substring(0,24):listName;
//dVec.add((String)row.get(1));	    //inserting list name in vector for deletion of lists
            subCount = (String)row.get(2);
            locked = (String)row.get(3);
            creationDate = row.get(6).equals("null")?"":(String)row.get(6);
            if(locked.equals(PMSDefinitions.LOCK_TRUE)) {
%>
					<tr style="height:24px;" class=vam><td class="mainPageButtonInnerCellData" width="55%"><a href='/pms/PMSMainPage.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&listNumber=<%=PMSEncoding.encode(listNumber)%>&action=unlock'><img border="0" src="/pms/graphics/Added.gif" alt="click to unlock list"></a>&nbsp;<%=name%></td>
					<td class="mainPageButtonInnerCellData" width="25%" align="center"><a href="javascript:viewSubs('<%=PMSEncoding.encode(""+listNumber)%>');"><%=subCount%></a></td><td class="mainPageButtonInnerCellData" width="20%">

                                        <input type="checkbox" DISABLED>
					</td></tr>
<%}else{%>
					<tr style="height:24px;" class=vam><td class="mainPageButtonInnerCellData" width="55%" ><%=name%></td><td class="mainPageButtonInnerCellData" width="25%" align="center"><a href="javascript:viewSubs('<%=PMSEncoding.encode(""+listNumber)%>');"><%=subCount%></a></td><td class="mainPageButtonInnerCellData" width="20%">
<%
                  if(!listName.startsWith(PMSDefinitions.SUPRESS_LIST_NAME)){
                  %>
<input type="checkbox" name="listOne" value="<%=listNumber%>">
<!--                  <a href="javascript:deleteList('<%//=PMSEncoding.encode(listNumber)%>', '<%//=listName%>')">Delete</a>-->
                  <%
                   }
                  %></td></tr>
<%
        }
        }
%>
					<tr><td class="mainPageButtonInnerCellData" colspan="3">&nbsp;</td></tr>
					<tr><td colspan="3" style="padding-top:5px; text-align:right"><a href="/pms/list/AddSubscribers.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>"><img src="/pms/img/newui/add-subscribers.gif" width="94" height="22" /></a>&nbsp;<a href="/pms/list/CurrentLists.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>"><img src="/pms/img/newui/add-new-list.gif"/></a> <a href="/pms/seganalysis/newSegment.jsp?<%=WebSecurityManager.getCSRFToken_HREF(session)%>"><img src="/pms/img/newui/create_segment1.gif"></a></td></tr>
					</table>
				</tr>
				</table>
			</td></tr>
			</table>
			</div>


			<p class="linebreak">&nbsp;</p>


		</td>

	</tr>

</form>
</table>


<%
    } catch (Exception ex) {
        ex.printStackTrace();
        WebServerLogger.getLogger().log(ex);
    }
%>
<%@include file="newuifooter.jsp"%>
</body>
</html>
