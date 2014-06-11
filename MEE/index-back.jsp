<%@page import="java.util.*" %>
<%@page import="com.PMSystems.*" %>
<%@page import="com.PMSystems.util.*" %>
<%@page import="com.PMSystems.logger.*" %>
<%@page import="com.PMSystems.dbbeans.*" %>
<%@page import="com.PMSystems.beans.*" %>


<!-- You can use this JSP snippet <=WebSecurityManager.getCSRFToken_HREF(session)> in your code also, but you will need to convert your .HTML file to .JSP file -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<title>Make Bridge Editor</title>
	<link href="css/bootstrap.css" rel="stylesheet">

    <link href="css/icons.css" rel="stylesheet" />
	<link href="css/style.css" rel="stylesheet" />
	<link href="css/changes.css" rel="stylesheet" />
	<link href="css/chosen.css" rel="stylesheet" />
	<link href="css/bmsgrid.css" rel="stylesheet" />
    <link href="css/jquery-ui.css" rel="stylesheet" />
    
    
	<link href="css/isotope.css" rel="stylesheet" />
	<link href="editorcss/skin.css" rel="stylesheet" />
	<link href="scripts/libs/miniColor/jquery.minicolors.css" rel="stylesheet" />
	<link href="editorcss/style.css" rel="stylesheet" />
    <link href="editorcss/editorstyle.css" rel="stylesheet" />
    
    
    <style type="text/css">
        .ui-dialog-titlebar
        {
            display:none !important;
            
        }
        
    </style>
	<script type="text/template" id="tmpMakeBridgeContainer">

<div id="imageTitleDialog" title="Basic dialog">
    <table style="width: 400px;">
        <tr>
            <td>
                <label id="imageTitleLabel">
                    Image
                </label>
            </td>
            <td>
                <input type="text" id="imageTitleText" />
            </td>
        </tr>
    </table>
</div>
<div class="addyHyperLinkDiv" style="display:none">

    <h4>Add a Hyperlink (Standard Link URL)</h4>

    <form enctype="multipart/form-data" method="post" action="#" name="submit_url">
        <div class="textAreaDivfortextLink" style="display:none;" >
            <label>Text</label>
            <textarea style=" text-decoration: underline; color: rgb(0, 0, 0); color:#000;"  class="text-areaLinkGUI linkTextArea" >

            </textarea>
        </div>
        <div class="linkImagePreview" style="display:none;">
            <img style="width:60px;max-height:100%;max-width:100%;vertical-align:top;">
        </div>
        <br>
        <label>Link (URL) </label>

        <div class="input-append" >
            <div class="inputcont ">
                <input type="text" class="header-info linkHyperLinkURL" placeholder="Type link here">
            </div>

            <button tabindex="-1" data-toggle="dropdown" id="" class="btn dropdown-toggle">
                Existing Link <span class="caret"></span>
            </button>

            <div class="existinglinksdd">
                <div id="copycampsearch" class="input-append search">
                    <span class="icon link"></span>
                    <input type="text" id="copy-camp-search" placeholder="Search links" class="search-control show-image">
                    <a class="close-icon" id="clearsearch" style="display:none"></a>
                    <div class="btn-group">
                        <button tabindex="-1" class="searchbtn" id="searchbtn">
                            <span class="icon-search icon-white"> </span>
                        </button>
                    </div>
                </div>
                <ul class="linkresults">
                    <li data-option-array-index="0" style="" class="result-selected">https://my.dotmailer.com/Campaigns/Step/EasyEditor.aspx?id=3644033</li>
                    <li data-option-array-index="1" style="" class="">https://my.dotmailer.com/Campaigns/Step/EasyEditor.aspx?id=3644033</li>
                    <li data-option-array-index="2" style="" class="">https://my.dotmailer.com/Campaigns/Step/EasyEditor.aspx?id=3644033</li>
                </ul>

            </div>
        </div>

        <a href="" target="_new" class="visitlink">
            <i class="icon preview"></i>
        </a>
        <br>

        <label>Link Name (For Tracking)</label>
        <input type="text" maxlength="200" class="textLinkGUI linkName">
        <br>
        <div class="inputlabel">
            <input type="checkbox" id="dont-track">
            <label>
                <span>Do not track this link</span>
            </label>
        </div>

        <br>


    </form>
</div>
<div class="addEmailLinkDiv" style="display:none;">
    <h4>Add a link to an email address</h4>

    <form enctype="multipart/form-data" method="post" action="#" name="submit_url">
        <div class="textAreaDivfortextLink" style="display:none;" >
            <label>Text</label>
            <textarea style=" text-decoration: underline; color: rgb(0, 0, 0); color:#000;"  class="text-areaLinkGUI linkTextArea" >

            </textarea>
        </div>
        <div class="linkImagePreview" style="display:none;">
            <img style="width:60px;max-height:100%;max-width:100%;vertical-align:top;">
        </div>
        <br>

        <label>Email address</label>
        <input type="text" maxlength="200" class="textLinkGUI" id="emailLinkName"/>
        <br>
        <label>Email subject</label>
        <input type="text" maxlength="200" class="textLinkGUI" id="emailLinkSubject"/>
        <br>

    </form>
</div>
<div class="addFrwdToFrndLinkDiv" style="display:none;">
    <h4>Add a 'Forward to a friend' link</h4>

    <form enctype="multipart/form-data" method="post" action="#" name="submit_url">
        <div class="textAreaDivfortextLink" style="display:none;" >
            <label>Text</label>
            <textarea style=" text-decoration: underline; color: rgb(0, 0, 0); color:#000;"  class="text-areaLinkGUI linkTextArea" >

            </textarea>
        </div>
        <div class="linkImagePreview" style="display:none;">
            <img style="width:60px;max-height:100%;max-width:100%;vertical-align:top;">
        </div>

    </form>
</div>
<div class="addUnsubscribeLinkDiv" style="display:none;">
    <h4>Add an unsubscribe link</h4>

    <form enctype="multipart/form-data" method="post" action="#" name="submit_url">
        <div class="textAreaDivfortextLink" style="display:none;" >
            <label>Text</label>
            <textarea style=" text-decoration: underline; color: rgb(0, 0, 0); color:#000;"  class="text-areaLinkGUI linkTextArea" >

            </textarea>
        </div>
        <div class="linkImagePreview" style="display:none;">
            <img style="width:60px;max-height:100%;max-width:100%;vertical-align:top;">
        </div>
        <br>
    </form>
</div>
<div class="addViewinBrowserLinkDiv" style="display:none;">
    <h4>Add a "Can't read email" link</h4>

    <form enctype="multipart/form-data" method="post" action="#" name="submit_url">
        <div class="textAreaDivfortextLink" style="display:none;" >
            <label>Text</label>
            <textarea style=" text-decoration: underline; color: rgb(0, 0, 0); color:#000;"  class="text-areaLinkGUI linkTextArea" >

            </textarea>
        </div>
        <div class="linkImagePreview" style="display:none;">
            <img style="width:60px;max-height:100%;max-width:100%;vertical-align:top;">
        </div>
        <br>

    </form>
</div>
<div class="addNewAnchorLinkDiv" style="display:none;">
    <h4>New # anchor</h4>

    <form enctype="multipart/form-data" method="post" action="#" name="submit_url">
        <div class="textAreaDivfortextLink" style="display:none;" >
            <label>Text</label>
            <textarea style=" text-decoration: underline; color: rgb(0, 0, 0); color:#000;"  class="text-areaLinkGUI linkTextArea" >

            </textarea>
        </div>
        <div class="linkImagePreview" style="display:none;">
            <img style="width:60px;max-height:100%;max-width:100%;vertical-align:top;">
        </div>
        <!--input type="text" maxlength="200" class="textLinkGUI" id="newAnchortext"/>
        <p>* Note that the anchor will be inserted at the beginning of the selected text </p-->
        <br>

        <label>Anchor name</label>
        <input type="text" id="newAnchortext" class="textLinkGUI" maxlength="200">

        <em class="note">* Note that the anchor will be inserted at the beginning of the selected text</em>

        <br>

    </form>
</div>


<div class="addNewSocialLinkDiv" style="display:none;">

    <h4>Social</h4>
        <ul class="socialbtns">
            <li class="facebook btnunchecked">
                <input type="radio" id="campaign_fb" class="radiopanel" value="facebook" name="social" />
                <label for="campaign_fb"><span class="social-icon fb"></span><strong>Facebook</strong></label>
            </li>
            <li class="twitter">
                <input type="radio" id="campaign_twitter"  class="radiopanel" value="twitter" name="social" />
                <label for="campaign_twitter"><span class="social-icon tw"></span><strong>Twitter</strong></label>
            </li>
            <li class="linkedin">
                <input type="radio" id="campaign_linkedin"  class="radiopanel" value="linkedin" name="social" />
                <label for="campaign_linkedin"><span class="social-icon in"></span><strong>Linkedin</strong></label>
            </li>
            <li class="pinterest">
                <input type="radio" id="campaign_pintrest"  class="radiopanel" value="pintrest" name="social" />
                <label for="campaign_pintrest"><span class="social-icon pi"></span><strong>Pinterest</strong></label>
            </li>
            <li class="googleplus">
                <input type="radio" id="campaign_gplus"  class="radiopanel" value="googleplus" name="social" />
                <label for="campaign_gplus"><span class="social-icon gp"></span><strong>Google Plus</strong></label>
            </li>
        </ul>
        <br class="clearfix"/><br/><br>
        <div class="textAreaDivfortextLink" style="display:none;" >
            <label>Text</label>
            <textarea style=" text-decoration: underline; color: rgb(0, 0, 0); color:#000;"  class="text-areaLinkGUI linkTextArea" >

            </textarea>
        </div>
        <div class="linkImagePreview" style="display:none;">
            <img style="width:60px;max-height:100%;max-width:100%;vertical-align:top;">
        </div>
        
        
        <br/>            

</div>


<div class="addDoubleOptLinkDiv" style="display:none;">
</div>
<div class="addSafeSenderLinkDiv" style="display:none;">
</div>

<div id="imageToolbar" class="imageToolbar-menu">
    <ul>
        <li title="Set Link" class="ImageToolbarLinkClass">
            <a href="#">
                <i class="mce-ico mce-i-link" style="margin-top: -5px;"></i>
            </a>
        </li>
        <li title="Left Align" class="ImageToolbarLeftAlignClass">
            <a href="#">
                <img src="images/Image-align-left-icon.png" />
            </a>
        </li>
        <li title="Center Align" class="ImageToolbarCenterAlignClass">
            <a href="#">
                <img src="images/Image-align-center-icon.png" />
            </a>
        </li>
        <li title="Right Align" class="ImageToolbarRightAlignClass">
            <a href="#">
                <img src="images/Image-align-right-icon.png" />
            </a>
        </li>
        <li title="Set Title" class="ImageToolbarTitleSetClass">
            <a href="#">
                <img src="images/Adobe_Premiere_Pro_Title.png" />
            </a>
        </li>
    </ul>
</div>

<div id="currTinyMCE" style="display:none;"></div>
<div id="linkTrack" style="display:none;"></div>
<div id="imageDataSavingObject" style="display:none;"></div>

<div class="overlay LinkGUIComplete" style="display:none;">
    <div class="modal in" style="width: 780px; margin-left: -380px;" aria-hidden="false">
        <div class="modal-header ws-notags">
            <div class="camp_header grayicons ">

                <div class="row c-name  ">
                    <h2>
                        <i class="icon link left"></i><span style="margin-left:5px;">Links GUI</span>
                    </h2>

                    <!--     -->

                </div>

                <ul class="toolbar">

                    <li>
                        <a title="" class="icon close showtooltip closeIconLinkGui" data-original-title="Close"></a>
                    </li>
                </ul>

            </div>

        </div>
        <div class="modal-body" style="min-height: 260px;">

            <div class="content_containerLinkGUI">
                <div class="left_columnLinkGUI flLinkGUI">
                    <div id="cssmenuLinkGUI">
                        <ul>
                            <li class="homeLinkGUI selected">
                                <a href="#">
                                    <i class="icon homelink"></i><span>Hyperlink</span>
                                </a>
                            </li>
                            <li class="emailLinkGUI ">
                                <a href="#" id="emailLinkGUI">
                                    <i class="icon emaillink"></i><span>Email</span>
                                </a>
                            </li>
                            <li class="forwardToFriendLinkGUI">
                                <a href="#">
                                    <i class="icon frwrdfriend"></i><span>Forward to a Friend</span>
                                </a>
                            </li>
                            <li class="unsubscribeLinkGUI">
                                <a href="#" class="noimage">
                                    <i class="icon unsubslink"></i><span>Unsubscribe</span>
                                </a>
                            </li>
                            <li class="viewInBrowserLinkGUI">
                                <a href="#" class="noimage">
                                    <i class="icon vbrsrlink"></i><span>View in Browser</span>
                                </a>
                            </li>
                            <li class="newAnchorLinkGUI">
                                <a href="#" class="noimage">
                                    <i class="icon newanchlink"></i><span>New # anchor</span>
                                </a>
                            </li>
                            <li class="newSocialLinkGUI">
                                <a href="#" class="noimage">
                                    <i class="icon sociallink"></i><span>Social</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="right_columnLinkGUI frLinkGUI" id="rightPanelArea">

                </div>

            </div>

        </div>
        <div class="modal-footer">
            <a style="display: inline;" class="btn btn-green right btn-save">
                <span>Insert</span><i class="icon next"></i>
            </a>
            <a data-dismiss="modal" class="btn btn-gray btn-close">
                <span>Close</span>
            </a>
        </div>
    </div>
</div>
<div class="tools">
    <ul class="tabsnav">
        <li>
            <a href="#" class="tabs active builder-tab">
                <i class="icon build"></i><span>Builder</span>
            </a>
        </li>
        <li>
            <a href="#" class="tabs style-tab">
                <i class="icon styles"></i><span>Styles</span>
            </a>
        </li>
    </ul>

    <!--  tabsnav  -->

    <div class="tabcontent builder-panel">
        <div class="accordian">
            <h3 class="active">
                Building Blocks
            </h3>
            <div class="scrollarea">
            <div class="accordian-content ">
                <div class="clearfix">
                    <h4 class="">Rows</h4>
                    <ul class="b-blocks">
                        <li class="draggableControl ui-draggable" data-type="oneColumnContainer">
                            <i class="icon col1"></i>
                            <a href="#">
                                <span class=" font_75">1 Item</span>
                            </a>
                        </li>
                        <li class="draggableControl ui-draggable" data-type="twoColumnContainer">
                            <i class="icon col2"></i>
                            <a href="#">
                                <span class=" font_75">2 Items</span>
                            </a>
                        </li>
                        <li class="draggableControl ui-draggable" data-type="threeColumnContainer">
                            <i class="icon col3"></i>
                            <a href="#">
                                <span class=" font_75">3 Items</span>
                            </a>
                        </li>
                        <li class="draggableControl ui-draggable" data-type="fourColumnContainer">
                            <i class="icon col4"></i>
                            <a href="#">
                                <span class=" font_75">4 Items</span>
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="clearfix">
                    <h4 class="">Items</h4>
                    <ul class="b-blocks">
                        <li class="draggableControl ui-draggable" data-type="text">
                            <i class="icon txt"></i>
                            <a href="#">
                                <span class=" font_75">Text</span>
                            </a>
                        </li>
                        <li class="draggableControl ui-draggable" data-type="image">
                            <i class="icon imag"></i>
                            <a href="#">
                                <span class=" font_75">Image</span>
                            </a>
                        </li>
                        <li class="draggableControl ui-draggable" data-type="textWithImage">
                            <i class="icon txtimag"></i>
                            <a href="#">
                                <span class=" font_75">Text + Image</span>
                            </a>
                        </li>
                        <li class="draggableControl ui-draggable" data-type="imageWithText">
                            <i class="icon imagtxt"></i>
                            <a href="#">
                                <span class=" font_75">Image + Text</span>
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="clearfix">
                    <h4 class="">Spacer</h4>
                    <ul class="b-blocks">
                        <li class="draggableControl ui-draggable" data-type="spacer5">
                            <i class="icon spacer1"></i>
                            <a href="#">
                                <span class=" font_75">Spacer 1</span>
                            </a>
                        </li>
                        <li class="draggableControl ui-draggable" data-type="spacer10">
                            <i class="icon spacer2"></i>
                            <a href="#">
                                <span class=" font_75">Spacer 2</span>
                            </a>
                        </li>
                        <li class="draggableControl ui-draggable" data-type="spacer15">
                            <i class="icon spacer3"></i>
                            <a href="#">
                                <span class=" font_75">Spacer 3</span>
                            </a>
                        </li>
                        <li class="draggableControl ui-draggable" data-type="spacer20">
                            <i class="icon spacer4"></i>
                            <a href="#">
                                <span class=" font_75">Spacer 4</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            </div>
            <!--  accordian-content  -->

            <h3>
                <span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-s"></span>My Building Blocks
            </h3>
            <div class="scrollarea">
            <div class="accordian-content">

                <div class="dropblockpanel divLoading divBuildingBlockLoading buildingBlockDroppableOverlay" style="display: none;">
                    <div class="blockdrop">
                        <h3>Drop Block Here</h3>
                    </div>
                </div>

                <div class="accordianbar">
                    <div>
                        <div class="search" style="width: 223pxpx;">
                            <input type="text" value="" name="" style="width: 195px;" id="searchBB" />
                            <a href="#" class="search searchBBLink">
                                <i class="icon search"></i>
                            </a>
                        </div>
                    </div>

                </div>
                <div class="clearfix">
                    <div id="BBResultDiv" class="no-results"  style="display: none;"> No results Found </div>
                </div>
                <div class="clearfix">
                    <div class="buildingBlockDroppable">
                        <div>
                            <ul class="ulBuildingBlocks image-gallery b-blocks">
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            <!--  accordian-content  -->
            
            <h3 class="DCH3" >
                <span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-s"></span>
                Dynamic Content Blocks
            </h3>
            <div class="scrollarea">
            <div class="accordian-content active DCCC">
                <div class="accordianbar">
                    <div>
                        <h5></h5>
                        <div class="search" style="width:223pxpx;">
                            <input type="text" value="" name="" style="width:195px;" id="searchDC"/>
                            <a href="#" class="search searchDCLink">
                                <i class="icon search"></i>
                            </a>
                        </div>
                        <!--<a href="#" class="add"><i class="icon add"></i></a>

                        <div class="image-info" style="left: 199px; top: 33px;">
                        <a class="closebtn"></a>
                        <h5>Enter Name of new block</h5>
                        <h5 class="error">Name already exist, please enter a different name.</h5>
                        <input type="text" placeholder="Image URL" class="left tginput" style="width: 202px; margin-bottom: 10px; dis" value="Edit Block Name">
                        <a class="btn-green left" style="display:none;"><span>Save</span><i class="icon save"></i></a>
                        <a class="btn-green left saving"><span>Save</span></a>
                        <a class="btn-gray right"><span>Close</span><i class="icon cross"></i></a>
                        </div>
                        -->
                    </div>

                </div>
                <div class="clearfix">
                    <div id="DCResultDiv" class="no-results"  style="display: none;"> No results Found </div>
                </div>
                
                <div class="clearfix">
                    <ul class="b-blocks">
                        <li class="draggableControl ui-draggable newblock" data-type="dynamicContentContainer" data-isnew="true">
                            <i class="icon plus"></i>
                            <a href="#">
                                <span class=" font_75">New Dynamic Block</span>
                            </a>
                        </li>

                    </ul>
                    <ul class="b-blocks dynamicBlockDroppable ulDynamicBlocks">

                    </ul>
                </div>
            </div>
            </div>
            <!--  accordian-content  -->

            <h3 style="display:none;" class="formH3" >
                <span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-s"></span>
                Forms Library
            </h3>
            <div class="scrollarea">
            <div class="accordian-content active formContent" style="display:none;">
                <div class="accordianbar">
                    <div>
                        <h5></h5>
                        <div class="search" style="width:223pxpx;">
                            <input type="text" value="" name="" style="width:195px;" id="searchForm"/>
                            <a href="#" class="search searchFormLink">
                                <i class="icon search"></i>
                            </a>
                        </div>
                        
                    </div>

                </div>
                <div class="clearfix">
                    <div id="FBResultDiv" class="no-results"  style="display: none;"> No results Found </div>
                </div>
                <div class="clearfix">
                    <div class="formDroppable">
                        <div>
                            <ul class="ulFormBlocks image-gallery b-blocks">
                            </ul>
                        </div>
                    </div>
                    
                    
                </div>
            </div>
            </div>
            <!--  accordian-content  -->
            <h3>
                Image Library
            </h3>
            <div class="scrollarea">
            <div id="HTML5FileUploader">
            <div class="accordian-content active">
                <div class="dropblockpanel divLoading divBuildingBlockLoadingImages buildingBlockDroppableOverlay" style="display: none;">
                        <div class="blockdrop">
                            <h3>Drop Image Here</h3>
                        </div>
                    </div>                
                    <div class="accordianbar">
                    
                    
                        <div class="search" style="width:190px;">
                            <input class="searchimg-text" type="text" value="" name="" style="width:170px;" id="searchImg" />
                            <a href="#" class="search search-img">
                                <i class="icon search"></i>
                            </a>
                       
                        <form id="form1" enctype="multipart/form-data" action="/pms/io/publish/saveImagesData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=add" method="POST">
                            <input type="file" id="myUploadFile" name="fileName" style="display: none;" />
                            <input type="hidden" name="type" value="add" />
                            <input type="hidden" name="allowOverwrite" value="N" />
                            <input type="hidden" name="BMS_REQ_TK" value="" />

                        </form>

                       
                    </div>
                        <a href="#" class="upload uploadFile">
                            <i class="icon upload"></i>
                        </a>
                    </div>
                <!--  accordianbar  -->
                <div class="clearfix">
                    <div id="ILResultDiv" class="no-results"  style="display: none;"> No results Found </div>
                </div>
                <div class="clearfix">
                    <ul class="b-blocks imageLib">
                        <li class="draggableControl ui-draggable droppedImage" data-type="droppedImage">
                            <span class="img"> <img src="images/img1.png" alt="" data-id="imgId1" data-tags="tag1,tag2" data-name="imageName" /></span>
                            <a href="#">
                                <span class=" font_75">Image 1</span>
                            </a>
                            <div class="imageicons">
                                <i class="imgicons info action" data-actiontype="imageInfo" data-id="imgId1"></i>
                                <i class="imgicons link action" data-actiontype="imageLink" data-id="imgId1"></i>
                                <i class="imgicons preview action" data-actiontype="imagePreview" data-id="imgId1"></i>
                                <i class="imgicons tag action" data-actiontype="imageTag" data-id="imgId1"></i>
                                <i class="imgicons delete action" data-actiontype="imageDelete" data-id="imgId1"></i>

                                <div class="image-info info-window" style="left: -21px;">
                                    <a class="closebtn "></a>
                                    <h4>Image abcdef </h4>

                                    <h5>
                                        <em>Size: </em>300 x 500
                                    </h5>
                                    <h5>
                                        <em>Created on: </em>25 Feb 2014
                                    </h5>

                                    <!--   tagscont  -->
                                </div>
                                <!--   image-info  -->
                                <div class="image-info link-window" style="left: 0px;">
                                    <a class="closebtn"></a>
                                    <h4>Image URL</h4>
                                    <input type="text" placeholder="Image URL" class="left tginput" style="width: 202px;" value="file:///E:/makes%20bridge/MEE%20Editor%20HTML/editor.html#">

                                    <!--   tagscont  -->
                                </div>
                                <!--   image-info link  -->
                                <div class="image-info tag-window" style="left: 43px;">
                                    <a class="closebtn closebtn-imgtag" data-id="imgId1"></a>
                                    <div class="tagscont">
                                        <ul>
                                            <li>
                                                <a class="tag" href="#">
                                                    <span>Business</span><i class="icon cross remove-tag"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="#">
                                                    <span>marketing</span><i class="icon cross remove-tag"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="#">
                                                    <span>online shopping</span><i class="icon cross remove-tag"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="#">
                                                    <span>amazon</span><i class="icon cross remove-tag"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="#">
                                                    <span>Business</span><i class="icon cross remove-tag"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="#">
                                                    <span>marketing</span><i class="icon cross remove-tag"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="#">
                                                    <span>online shopping</span><i class="icon cross remove-tag"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="#">
                                                    <span>amazon</span><i class="icon cross remove-tag"></i>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <!--   tagscont  -->
                                    <input type="text" placeholder="Add tag" class="left tginput">
                                    <a class="btn-green left addtag" data-id="imgId1">
                                        <span>Add</span><i class="icon plus"></i>
                                    </a>

                                </div>
                                <!--   image-info  -->
                                <div class="image-info del-window" style="left: 63px;">
                                    <a class="closebtn"></a>
                                    <h5 style="padding-bottom: 10px;">Do you want to delete this Image?</h5>
                                    <a class="btn-red left confirm-del" data-id="imgId1">
                                        <span>Delete</span><i class="icon delete"></i>
                                    </a>
                                    <!--   tagscont  -->
                                </div>
                                <!--   image-info link  -->

                            </div>
                        </li>
                        <li class="draggableControl ui-draggable droppedImage" data-type="droppedImage">
                            <span class="img"> <img src="images/img2.png" alt="" /></span>
                            <a href="#">
                                <span class=" font_75">Image 2</span>
                            </a>
                            <div class="imageicons">
                                <i class="imgicons info"></i>
                                <i class="imgicons link"></i>
                                <i class="imgicons preview"></i>
                                <i class="imgicons tag"></i>
                                <i class="imgicons delete"></i>

                                <div class="image-info" style="left: -21px;">
                                    <a class="closebtn "></a>
                                    <h4>Image abcdef </h4>

                                    <h5>
                                        <em>Size: </em>300 x 500
                                    </h5>
                                    <h5>
                                        <em>Created on: </em>25 Feb 2014
                                    </h5>

                                    <!--   tagscont  -->
                                </div>
                                <!--   image-info  -->
                                <div class="image-info" style="left: 0px;">
                                    <a class="closebtn"></a>
                                    <h4>Image URL</h4>
                                    <input type="text" placeholder="Image URL" class="left tginput" style="width: 202px;" value="file:///E:/makes%20bridge/MEE%20Editor%20HTML/editor.html#">

                                    <!--   tagscont  -->
                                </div>
                                <!--   image-info link  -->
                                <div class="image-info" style="left: 43px;">
                                    <a class="closebtn"></a>
                                    <div class=" tagscont">
                                        <ul>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>Business</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>marketing</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>online shopping</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>amazon</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>Business</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>marketing</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>online shopping</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>amazon</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <!--   tagscont  -->
                                    <input type="text" placeholder="Add tag" class="left tginput">
                                    <a class="btn-green left">
                                        <span>Add</span><i class="icon plus"></i>
                                    </a>

                                </div>
                                <!--   image-info  -->
                                <div class="image-info" style="left: 63px;">
                                    <a class="closebtn"></a>
                                    <h5 style="padding-bottom: 10px;">Do you want to delete this Image?</h5>
                                    <a class="btn-red left">
                                        <span>Delete</span><i class="icon delete"></i>
                                    </a>
                                    <!--   tagscont  -->
                                </div>
                                <!--   image-info link  -->

                            </div>
                        </li>
                        <li class="draggableControl ui-draggable droppedImage" data-type="droppedImage">
                            <span class="img"> <img src="images/img3.png" alt="" /></span>
                            <a href="#">
                                <span class=" font_75">Image 3</span>
                            </a>
                            <div class="imageicons">
                                <i class="imgicons info"></i>
                                <i class="imgicons link"></i>
                                <i class="imgicons preview"></i>
                                <i class="imgicons tag"></i>
                                <i class="imgicons delete"></i>

                                <div class="image-info" style="left: -21px;">
                                    <a class="closebtn "></a>
                                    <h4>Image abcdef </h4>

                                    <h5>
                                        <em>Size: </em>300 x 500
                                    </h5>
                                    <h5>
                                        <em>Created on: </em>25 Feb 2014
                                    </h5>

                                    <!--   tagscont  -->
                                </div>
                                <!--   image-info  -->
                                <div class="image-info" style="left: 0px;">
                                    <a class="closebtn"></a>
                                    <h4>Image URL</h4>
                                    <input type="text" placeholder="Image URL" class="left tginput" style="width: 202px;" value="file:///E:/makes%20bridge/MEE%20Editor%20HTML/editor.html#">

                                    <!--   tagscont  -->
                                </div>
                                <!--   image-info link  -->
                                <div class="image-info" style="left: 43px;">
                                    <a class="closebtn"></a>
                                    <div class=" tagscont">
                                        <ul>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>Business</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>marketing</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>online shopping</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>amazon</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>Business</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>marketing</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>online shopping</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>amazon</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <!--   tagscont  -->
                                    <input type="text" placeholder="Add tag" class="left tginput">
                                    <a class="btn-green left">
                                        <span>Add</span><i class="icon plus"></i>
                                    </a>

                                </div>
                                <!--   image-info  -->
                                <div class="image-info" style="left: 63px;">
                                    <a class="closebtn"></a>
                                    <h5 style="padding-bottom: 10px;">Do you want to delete this Image?</h5>
                                    <a class="btn-red left">
                                        <span>Delete</span><i class="icon delete"></i>
                                    </a>
                                    <!--   tagscont  -->
                                </div>
                                <!--   image-info link  -->

                            </div>
                        </li>
                        <li class="draggableControl ui-draggable droppedImage" data-type="droppedImage">
                            <span class="img"> <img src="images/img4.png" alt="" /></span>
                            <a href="#">
                                <span class=" font_75">Image 4</span>
                            </a>
                            <div class="imageicons">
                                <i class="imgicons info"></i>
                                <i class="imgicons link"></i>
                                <i class="imgicons preview"></i>
                                <i class="imgicons tag"></i>
                                <i class="imgicons delete"></i>

                                <div class="image-info" style="left: -21px;">
                                    <a class="closebtn "></a>
                                    <h4>Image abcdef </h4>

                                    <h5>
                                        <em>Size: </em>300 x 500
                                    </h5>
                                    <h5>
                                        <em>Created on: </em>25 Feb 2014
                                    </h5>

                                    <!--   tagscont  -->
                                </div>
                                <!--   image-info  -->
                                <div class="image-info" style="left: 0px;">
                                    <a class="closebtn"></a>
                                    <h4>Image URL</h4>
                                    <input type="text" placeholder="Image URL" class="left tginput" style="width: 202px;" value="file:///E:/makes%20bridge/MEE%20Editor%20HTML/editor.html#">

                                    <!--   tagscont  -->
                                </div>
                                <!--   image-info link  -->
                                <div class="image-info" style="left: 43px;">
                                    <a class="closebtn"></a>
                                    <div class=" tagscont">
                                        <ul>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>Business</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>marketing</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>online shopping</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>amazon</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>Business</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>marketing</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>online shopping</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <a class="tag" href="">
                                                    <span>amazon</span><i class="icon cross"></i>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <!--   tagscont  -->
                                    <input type="text" placeholder="Add tag" class="left tginput">
                                    <a class="btn-green left">
                                        <span>Add</span><i class="icon plus"></i>
                                    </a>

                                </div>
                                <!--   image-info  -->
                                <div class="image-info" style="left: 63px;">
                                    <a class="closebtn"></a>
                                    <h5 style="padding-bottom: 10px;">Do you want to delete this Image?</h5>
                                    <a class="btn-red left">
                                        <span>Delete</span><i class="icon delete"></i>
                                    </a>
                                    <!--   tagscont  -->
                                </div>
                                <!--   image-info link  -->

                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            </div>
            </div>
            <!--  accordian-content  -->

        </div>
    </div>
    <!--  tabcontent  -->

    <div class="tabcontent style-panel" style="display: none;">
        <div class="accordian">

            <h3 class="">
                <span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-s"></span>Background Color
            </h3>
            <div class="scrollarea">
            <div class="accordian-content ">

                <div class="clearfix"  style="padding:5px;">
                    <h4 class="">Parent Layers</h4>
                    <select class="nosearch ddlBackgroundLayers">
                        <option value="">Select Parent Layers</option>

                    </select>
                    <br class="clearfix"/> <br/>
                    <div class="clearfix"></div>
                    <div class="minicolors minicolors-theme-default minicolors-position-bottom minicolors-position-left minicolors-inline" style="text-align:center;">
                        
                        <div class="divColorPicker"></div>
                    </div>
                    <input type="text" maxlength="15" size="15" class="txtColorCode acco-input">
                    <input type="button" style="float:right; margin:0;" value="Add to my Colors" class="addToMyColors">
                </div>
                <div class="clearfix">
                    <h4 class="">Template Colors</h4>
                    <ul class="color-box templateColors">
                        <li style="background-color:none;">

                        </li>

                    </ul>
                </div>
                <div class="clearfix">
                    <h4 class="">My Colors</h4>
                    <ul class="color-box myColors">
                        <li style="background-color:none;">

                        </li>

                    </ul>
                </div>
            </div>
            </div>
            <!--  accordian-content  -->
            <h3 class="active">
                <span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-s"></span> Borders & Paddings
            </h3>
            <div class="scrollarea">
            <div class="accordian-content active">
                <div class="clearfix">
                    <h4 class="">Borders</h4>
                    <div style="padding:5px;">

                        <div class="styletable clearfix">

                            <div class="stylebox">

                                <label class="acco-label grey-col fl width_140 ">Styles</label>

                                <select class="ddlBorderType acco-select margin_20 width_140 fl">
                                    <option value="solid">Solid</option>
                                    <option value="dashed">Dashed</option>
                                    <option value="double">Double</option>
                                </select>

                                <label class="acco-label grey-col fl  width_140">Weight</label>
                                <select class="ddlBorderWidth acco-select margin_20 width_140 fl">
                                    <option value="1">-----1px</option>
                                    <option value="2">-----2px</option>
                                    <option value="3">-----3px</option>
                                    <option value="4">-----4px</option>
                                    <option value="5">-----5px</option>
                                </select>

                                <label class="acco-label grey-col fl  width_140">Border Color</label>
                                <div class="minicolors minicolors-theme-default minicolors-position-top minicolors-position-left">
                                    <a class="fl colorPickerBorder acco-label minicolors-input" href="#"></a>
                                </div>

                            </div>
                            <div class="stylebox">

                                <div class="ddg-control ved-edges ddg-container borderControl" style=" top: 39px;">
                                    <div unselectable="on"  class="ddg-control ddg-button ved-edges-button ved-edges-top ddg-unselectable" >
                                        <div  data-type="Top" id="topBorder" class="ddg-unselectable sBorderLine" unselectable="on"></div>
                                    </div>
                                    <div unselectable="on"  class="ddg-control ddg-button ved-edges-button ved-edges-bottom ddg-unselectable" >
                                        <div data-type="Bottom" id="bottomBorder" class="ddg-unselectable sBorderLine" unselectable="on"></div>
                                    </div>
                                    <div unselectable="on" class="ddg-control ddg-button ved-edges-button ved-edges-left ddg-unselectable">
                                        <div data-type="Left" id="leftBorder" class="ddg-unselectable sBorderLine" unselectable="on"></div>
                                    </div>
                                    <div unselectable="on" class="ddg-control ddg-button ved-edges-button ved-edges-right ddg-unselectable">
                                        <div data-type="Right" id="rightBorder" class="ddg-unselectable sBorderLine" unselectable="on"></div>
                                    </div>
                                    <div class="ved-edge-control">
                                        <div class="edges-dotted-topbottom"></div>
                                        <div class="edges-dotted-leftright"></div>
                                        <div style="width: 48px; height: 48px; border-bottom: medium none; border-top: medium none;" class="ved-edge-inner"></div>
                                    </div>
                                </div>

                            </div>

                        </div>

                        <div class="clearfix" style="padding:0;">
                            <h4 class="">Alignment</h4>
                            <ul class="aligncol">
                                <li id="top" class="sVerticalAlign active">
                                    <a href="#." onclick="applyAlignment('top')";>
                                        <i class=" icon aligntop" data-type="Top"></i>Top
                                    </a>
                                </li>
                                <li id="middle" class="sVerticalAlign" >
                                    <a href="#." onclick="applyAlignment('middle');">
                                        <i class="icon alignmiddle" data-type="Middle"></i>Middle
                                    </a>
                                </li>
                                <li id="bottom" class="sVerticalAlign" >
                                    <a href="#." onclick="applyAlignment('bottom');">
                                        <i class="icon alignbottom" data-type="Bottom"></i>Bottom
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div class="styletable clearfix">

                            <div class="stylebox">

                                <label class="acco-label grey-col fl  width_140">Padding </label>

                                <select class="acco-select margin_20 width_140 fl ddlPadding">
                                    <option value="6">6px</option>
                                    <option value="8">8px</option>
                                    <option value="10">10px</option>
                                </select>

                            </div>
                            <div class="stylebox">

                                <div class="ddg-control ved-edges ved-padding-edges ddg-container paddingControl">
                                    <div unselectable="on" class="ddg-control ddg-button ved-edges-button ved-edges-top ddg-unselectable">
                                        <div data-type="Top" id="topPadding" class="ddg-unselectable sPadding" unselectable="on"></div>
                                    </div>
                                    <div unselectable="on" class="ddg-control ddg-button ved-edges-button ved-edges-bottom ddg-unselectable">
                                        <div data-type="Bottom" id="bottomPadding" class="ddg-unselectable sPadding" unselectable="on"></div>
                                    </div>
                                    <div unselectable="on" class="ddg-control ddg-button ved-edges-button ved-edges-left ddg-unselectable">
                                        <div data-type="Left" id="leftPadding" class="ddg-unselectable sPadding" unselectable="on"></div>
                                    </div>
                                    <div unselectable="on" class="ddg-control ddg-button ved-edges-button ved-edges-right ddg-unselectable">
                                        <div data-type="Right" id="rightPadding" class="ddg-unselectable sPadding" unselectable="on"></div>
                                    </div>
                                    <div class="ved-edge-control">
                                        <div class="edges-dotted-topbottom"></div>
                                        <div class="edges-dotted-leftright"></div>
                                        <div style="width: 48px; height: 48px;" class="ved-edge-inner">
                                            <div style="width: 48px; height: 48px;" class="edge-text-preview"></div>
                                        </div>

                                    </div>
                                </div>

                            </div>

                        </div> <!--  styletable -->
                    </div>
                </div>
            </div>
            </div>
            <!--  accordian-content  -->

            <h3 class="">
                <span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-s"></span> Email Width
            </h3>
            <div class="scrollarea">
            <div class="accordian-content active ">

                <div class="clearfix">
                    <h4>Choose a width for your email</h4>

                    <div style="padding:5px;">
                        <input type="button" id="700" value="LARGE (700px)" data-value="700" class="large-button acco-button btnContainerSize" onclick="applyEmailWidth('700');">
                        <input type="button" id="600" value="MEDIUM (600px)" data-value="600" class="medium-button acco-button btnContainerSize active " onclick="applyEmailWidth('600');">
                        <input type="button" id="500" value="SMALL (500px)" data-value="500" class="small-button acco-button btnContainerSize" onclick="applyEmailWidth('500');">

                        <label class="acco-label grey-col fl width_140 ">Custom width</label>
                        <input type="text" class="txtContSize txtContainerSize acco-input " size="15" maxlength="15"> pixels
                    </div>
                </div>

            </div>
            </div>
            <!--  accordian-content  -->

        </div>
    </div>
    <!--  tabcontent  -->

</div>
<!--  tools  -->

<div class="editorpanel">
    <div class="editorbar">
        <ul>
            <li class="undo">
                <a href="#" class="btn-gray">
                    <i class="icon undo"></i>
                </a>
            </li>
            <li class="redo">
                <a href="#" class="btn-gray">
                    <i class="icon redo"></i>
                </a>
            </li>
            <li class="MenuCallPreview">
                <a href="#" class="btn-blue">
                    <i class="icon preview"></i><span>Preview</span>
                </a>
            </li>
            <li class="save MenuCallBackSave">
                <a href="#" class="btn-green ">
                    <i class="icon save"></i><span>Save</span>
                </a>
            </li>
        </ul>
    </div>
    <!--  tools  -->

    <div class="editorbox content" style="height: 1000px; overflow: scroll;">
        <table style="width: 600px; height: 100%; vertical-align: top;" align="center" class="mainTable">
            <tr>
                <td class="mainContentHtmlGrand" valign="top">
                    <ul class="sortable mainContentHtml" style="list-style: none; padding: 0; margin: 0;">
                    </ul>
                </td>
            </tr>
        </table>
    </div>
    <!--  editorpanel  -->

</div>
<!--  editorpanel  -->
<div class="ui-widget-overlay ui-front modalDialog" style="display:none; position:absolute;"></div>
<div class="ui-dialog ui-widget ui-widget-content ui-corner-all ui-front ui-dialog-buttons " id="ColorPickerpop" style="height: auto;  position: absolute;width: 300px; top:254px; left: 566px; display: none;" tabindex="-1" role="dialog" aria-describedby="fontColorDialog" aria-labelledby="ui-id-8">
    <div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix" style="display:none;">
        <span id="ui-id-8" class="ui-dialog-title">Font Color Picker</span>
        <button class="ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only ui-dialog-titlebar-close" role="button" aria-disabled="false" title="close">
            <span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span><span class="ui-button-text">close</span>
        </button>
    </div>

    <div style="width: auto; min-height: 0px; max-height: none; height: 305px; " id="fontColorDialog" class="ui-dialog-content ui-widget-content">
        <div id="CustomColorPicker">
            <label>
                <p class="grey-col background"> Pick a color</p>
            </label>
            <div class="divFontColorPicker"></div>

            <div class="mycolorFontPicker clearfix" style="margin-top: -20px; padding-left:10px;z-index:auto; position: relative;">
                <label>
                    <p class="grey-col background">My Colors</p>
                </label>
                <ul class="color-box myFontColors" >
                    <li style="background-color: none;"></li>
                </ul>
                <label>
                    <p class="grey-col"> Selected color</p>
                </label>
                <input type="text"  value="#fff34a" maxlength="15" size="15" class="selectedFontColor acco-input" readonly>
            </div>

        </div>
    </div>
    <div class="ui-dialog-buttonpane ui-widget-content ui-helper-clearfix">
        <div class="ui-dialog-buttonset">

            <button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only btn-gray" role="button" aria-disabled="false" id="fontDialogCancelButtonID">
                <span class="ui-button-text">Close</span>
            </button>
            <button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false" id="fontDialogOKButtonID">
                <span class="ui-button-text">OK</span>
            </button>
        </div>
    </div>
</div>


    <div class='image-info info-windowDiv' style='display:none;'></div>
    <div class='image-info link-windowDiv'  style='display:none;'></div>
    <div class='image-info tag-windowDiv'  style='display:none;'></div>
    <div class='image-info del-windowDiv'  style='display:none;'></div>
    <div class="image-info editBox BBEditDialog" style="display: none;"></div>
    <div class="image-info delBox BBDeleteDialog" style="display: none;" > </div>
    <div class="image-info editBox DCEditDialog" style="display: none;"></div>
    <div class="image-info delBox DCDeleteDialog" style="display: none;" > </div>

    <div class="moredd alertButtons" style="display: none;" > </div>


    <div class="image-info buildingBlock_name" style="display: none; left: 0px;top: 0px;box-shadow: none; ">
        <a class="closebtn"></a>
        <h5 style="padding-bottom:10px;">Block Name</h5> 
    
        <input type="text" placeholder="Buiding Block Name" class="left tginput txtPlaceHolder" style="width:202px; margin-bottom:10px; dis" value="Add Block Name">
     
        <h5 style="padding-bottom:10px;">Give your block a name that you will be able to recognise later. </h5>
     
        <a class="btn-green left addBBSave"><span>Save</span><i class="icon save"></i></a>
        <a class="btn-gray right addBBClose"><span>Cancel</span><i class="icon cross"></i></a>
    </div>  <!-- image-info   -->


<div class="buildingBlock_name_edit" style="display: none;">
    <div class="ddgwin-titlebar">
        <span class="ddgwin-title">Edit building block name</span>
    </div>
    <div style="height: 106px;">
        <br>
        <div style="width: 250px;">
            <div>
                <div style="width: 200px; font-size: 12px;">
                    Block name<br>
                </div>
            </div>
            <div>
                <input type="text" class='txtPlaceHolder editBlockInputName' placeholder="Provide a name for your building block"
                       style="width: 430px;" maxlength="255">
            </div>
        </div>
        <div style="font-size: 12px;">
            Give your block a name that you will be able to recognise later.
        </div>
    </div>
</div>
<div class="divActionButtonsForBuildingBlock" style="display: none;">
    <div class="imageicons">
        <i class="imgicons edit"></i>
        <i class="imgicons delete right"></i>

        <div class="image-info editBox" style="left: -21px; display: none;">
            <a class="closebtn"></a>
            <h5 style="padding-bottom: 10px;">Edit Block Name</h5>

            <input type="text" placeholder="Image URL" class="left tginput txtBlockName" style="width: 202px; margin-bottom: 10px; dis" value="Edit Block Name">
            <a class="btn-green left btnSave">
                <span>Save</span><i class="icon save"></i>
            </a>
        </div>
        <!-- image-info   -->

        <div style="left: 69px; display: none;" class="image-info delBox">
            <a class="closebtn"></a>
            <h5 style="padding-bottom: 10px;">Do you want to delete this Image?</h5>
            <a class="btn-red left btnDelete">
                <span>Delete</span><i class="icon delete"></i>
            </a>
            <!--   tagscont  -->
        </div>
        <!--   image-info link  -->
    </div>
</div>
<div class="divDCTemplate" style="display:none;">

    <table class="container dynamicContentContainer dataContainer" id="0">
        <tbody>
            <tr>
                <td>
            
            <div class="overlay dcContentName" style="display:none;">            
           				<div style="" class="image-info">                          
                     <input type="text" value="" style="width:202px; margin-bottom:10px; dis" class="left tginput txtContentName" placeholder="Content Name">
                     <a class="btn-green left btnSaveContent"><span>Save</span><i class="icon save"></i></a>
                     <a class="btn-gray right btnCancelContent"><span>Cancel</span><i class="icon cross"></i></a>
                  </div>
            </div>

          <div class="overlay dcContentNameUpdate" style="display:none;">            
           				<div style="" class="image-info">                          
                     <input type="text" value="" style="width:202px; margin-bottom:10px; dis" class="left tginput txtContentName" placeholder="Content Name">
                     <a class="btn-green left btnUpdateContent"><span>Save</span><i class="icon save"></i></a>
                     <a class="btn-gray right btnUpdateCancelContent"><span>Cancel</span><i class="icon cross"></i></a>
                  </div>
            </div>

            <div class="overlay dcVariationName" style="display:none;">            
                        <div style="" class="image-info">                          
                     <input type="text" value="" style="width:202px; margin-bottom:10px; dis" class="left tginput txtPlaceHolder" placeholder="Dynamic Variation Name">
                     <a class="btn-green left btnSaveVariation"><span>Save</span><i class="icon save"></i></a>
                     <a class="btn-gray right btnCancelVariation"><span>Cancel</span><i class="icon cross"></i></a>
                  </div>
            </div>

                    <div id="basic" class=" main_blocker">
                        <div class="block_head">

                            <h5 class="dcName">
                                <span>Dynamic Block 1</span>

                                 <a class="editname">
                                    <i class="icon edit"></i>
                                </a>
                            </h5>

                            <div style=" display: none; left: 20px; top: 30px;" class="tagbox editNameBox">

                                <input type="text" placeholder="Change Name" class="left txtVariationName">
                                <a class="btn-gray right btnCloseDCName">
                                    <span>Close</span><i class="icon cross"></i>
                                </a>
                                <a class="btn-green left btnSaveDCName">
                                    <span>Save</span><i class="icon save"></i>
                                </a>

                            </div>
                        </div>

                        <div class="block_body">
                            <div class="block_controls">
                                <ul class="dcContents">
                                    
                                </ul>

                                <i class="icon add addDynamicRule"></i>

                            </div>

                        </div>

                    </div>
                </td>
            </tr>
            <tr>
                <td style="height:200px">
                    <ul class="sortable dcInternalContents" ></ul>
                </td>
            </tr>
        </tbody>
    </table>

</div>

<div class="rulesdiv dcRulesDialog" style="display:none;">
            <div>
                                <a class="closebtn"></a>
                        
                    
                              
                            <div class="filter-div">
                                
                               <div class="match filter_start">If
                <div data-toggle="buttons-radio" class="btn-group all-any">
                  <button rule="A" class="btn active">All</button>
                  <button rule="1" class="btn">Any</button>
                </div>rule(s) matches </div>
                            <div class="dynamic_inputs_list">
                            
                             
                            
                            </div>
                              <br/> <br/>
                              <div class="filter-row filter-menu addfilter">
                                <a class="add_new_rule" href="javascript:addNewRule();"><img src="css/images/add-new-rule.png" width="111" height="30" border="0" /></a>
                                
                                
                                <a class="btn-green right ruleDialogSave"><span>Save</span> <i class="icon save"></i></a>
                                <a class="btn-gray right ruleDialogClose"><span>Close</span> <i class="icon cross"></i></a>
                                
                            </div>
                    </div>
</div></div>
<div style="display:none;" class="dcRuleRowTemplate">
                                
                             <div class="filter-row rule">
                                 
                                <div class="filter-cont">
                               
                                <select data-placeholder="Choose a Field" class="forms-box chosen-select firstChosen chosefields dcRuleFieldName" style="width:224px;">
                                       
                                        <optgroup label="Basic Fields">
                                          <option value="Email">Email</option>
                                          <option value="Address Line 1">Address Line 1</option>
                                          <option value="Address Line 2">Address Line 2</option>
                                          <option>City</option>
                                          <option>State</option>
                                          <option>Zip</option>
                                          <option>Country</option>
                                          <option>Telephone</option>
                                          <option>Subscribe Date</option>
                                          <option>Birth Date</option>
                                          <option>Occupation</option>
                                          <option>Industry</option>
                                          <option>Company</option>
                                          <option>Source</option>
                                          <option>Sales Rep</option>
                                          <option>Sales Status</option>
                                          
                                        </optgroup>
                                        <optgroup label="Custom Fields">
                                          <option>19mayCustfield</option>
                                          <option>7Apr2010</option>
                                          <option>ADJ_SGN</option>
                                          <option>AccountId</option>
                                          <option>AnnualRevenue</option>
                                          <option>AssistantName</option>
                                          <option>AssistantPhone</option>
                                        </optgroup>
                                      </select>
                                  
                                    
                                  <select class="nosearch conddd secondChosen dcRuleCondition" style="width:180px">
                                      <option value="Equal to">Equal to</option>
                                      <option value="Not Equal to">Not Equal to</option>
                                      <option>Contains</option>
                                      <option>Does not contain</option>
                                      
                                      <option>Birthday</option>
                                      <option>Day(s) prior birthday</option>

                </select>

                                   <select class=" nosearch thirdChosen dcRuleFormat" style="width:150px;">
                                      <option value="MM-DD-YY">MM-DD-YY</option>
                                      <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                                      <option>DD-MM-YY</option>
                                      <option>DD-MM-YYYY</option>
                                      <option>YYYY-MM-DD</option>
                                      
                                      <option>DD/MM/YYYY</option>
                                      <option>YYYY/MM/DD</option>
                </select>

                                   <input type="text" value="" style="max-width:120px;" class="dcRuleMatchValue">
                                     <div class="right-btns"><a title="" class="btn-red showtooltip" ><i class="icon delete "></i></a></div>
                                </div>
                            </div> <!-- filter-row  --> 
                            
</div>

<div class="dcLI" style="display:none;">
    <li>
        <span>Content 1</span>

        <i class="icon filter"></i>
        <i class="icon more">
            <div class="moredd">
                <ul>
                    <li>
                        <a class="btn-gray btnContentEditName" href="#">
                            <i class="icon edit"></i>
                        </a>
                    </li>
                    <li>
                        <a class="btn-red btnContentDelete" href="#">
                            <i class="icon delete"></i>
                        </a>
                    </li>
                </ul>
            </div>
        </i>

        

    </li>
</div>



       
<div class="DCNameDialog" style="display: none;">
    <div class="ddgwin-titlebar">
        <span class="ddgwin-title">Create a Dynamic Block</span>
    </div>
    <div style="height: 106px;">
        <br>
        <div style="width: 250px;">
            <div>
                <div style="width: 200px; font-size: 12px;">
                    Dynamic Block Name<br>
                </div>
            </div>
            <div>
                <input type="text" class='txtPlaceHolder' placeholder="Provide a name for your dynamic block"
                       style="width: 430px;" maxlength="255">
            </div>
        </div>
        <div style="font-size: 12px;">
            Give your dynamic control a name that you will be able to recognise later.
        </div>
    </div>
</div>

<div class="divPreviewCode" style="display: none;" title="Code Preview">
            <div id="previeCodeTabs">
                <ul>
                    <li><a class="tab1" href="#tabs-1">
                        Preview</a></li>
        <li><a class="tab2" href="#tabs-2">
                        Html Code</a></li>

                   
                </ul>

                    <div id="tabs-1">
                        <div class="divHtmlPreview">
                            
                        </div>
                    </div>
                    
                    <div id="tabs-2">
                        <textarea style="font-size:12px;width:900px;height:340px" class="divHtmlCode" cols="1000" rows="250">                            
                        </textarea>
                    </div>
            </div>
        </div>

    <div class="overlay imgpreview-container" style="display:none;">
        <div class="modal in" style="width: 518px; margin-left: -260px;" aria-hidden="false">
            <div class="modal-header ws-notags">
                <div class="camp_header grayicons ">
                    <div class="row c-name  ">
                        <h2><i class="icon preview  left"></i><span style="margin-left: 5px;">Image abc</span>               </h2>
                    </div>
                    <ul class="toolbar">
                        <li>
                            <!--<a  class="icon more showtooltip" title="More"></a>>
                            <ul id="more-tool-actions">
                                <li class=""><a title="" class="icon newwin showtooltip" data-original-title="Open in new window"></a></li>
                            </ul>-->
                        </li>
                        <li><a title="" class="icon close showtooltip closeImagePreview" data-original-title="Close"></a></li>
                    </ul>
                </div>
            </div>
            <div class="modal-body" style="min-height: 260px;">
                <img src="images/libimg.jpg" alt="" />
            </div>
            <div class="modal-footer"></div>
        </div>
    </div>

    </script>
	  <script type="text/javascript" src="scripts/libs/jquery/jquery.js"></script>
    <script type="text/javascript" src="scripts/libs/underscore/underscore.js"></script>
    <script type="text/javascript" src="scripts/libs/backbone/backbone.js"></script>
    <script type="text/javascript" src="scripts/libs/jquery/jquery_ui.js"></script>
    <script type="text/javascript" src="scripts/libs/custom/helper_methods.js"></script>
    <script type="text/javascript" src="scripts/libs/custom/makebridge_custom_methods.js"></script>
    <script type="text/javascript" src="scripts/libs/tinymce/tinymce.js"></script>
    <script type="text/javascript" src="scripts/libs/tinymce/tinymce_jquery.js"></script>
    <script type="text/javascript" src="scripts/libs/custom/linq.min.js"></script>
    <script type="text/javascript" src="scripts/libs/custom/MakeBridgeUndoRedoManager.js"></script>
    <script type="text/javascript" src="scripts/makebridge_data.js"></script>
    <script type="text/javascript" src="scripts/libs/miniColor/jquery.minicolors.js"></script>
    <script type="text/javascript" src="scripts/makebridge.js"></script>

    <script src="js/jquery.isotope.min.js" type="text/javascript"></script> 
    <script src="js/jquery.icheck.min.js?v=0.9.1" type="text/javascript"></script> 
    <script src="js/chosen.jquery.js" type="text/javascript"></script> 
    <script src="js/jquery.mCustomScrollbar.concat.min.js"></script> 
    
    <script src="js/daterangepicker.jQuery.min.js" type="text/javascript"></script> 
    
    <script src="js/script.js" type="text/javascript"></script>
    
		<script type="text/javascript">
			if (typeof String.prototype.startsWith != 'function') {
                // see below for better implementation!
                String.prototype.startsWith = function (str) {
                    return this.indexOf(str) == 0;
                };
            }

			$(document).ready(function () {


				//EXPOSED AJAX PROPERTIES FOR IMAGE GALLERY

			var _imageAjaxParameters = {
				Url: "/pms/io/publish/getImagesData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=list&offset=0",
				Data: "",
				DataType: "",
				Type: "",
				ContentType: ""
			};

			var _AddimageAjaxParameters = {
				Url: "/pms/io/publish/saveImagesData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=add",
				Data: "",
				DataType: "",
				Type: "",
				ContentType: ""
			};

			var _searchImagesAjaxParameters = {
				Url: "/pms/io/publish/getImagesData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=search&offset=0&searchText=",
				Data: "",
				DataType: "",
				Type: "",
				ContentType: ""
			};

			var _saveImageTagsAjaxParameters = {
				Url: "/pms/io/publish/saveImagesData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=tags&imageId=",
				Data: "",
				DataType: "",
				Type: "",
				ContentType: ""
			};

			var _deleteImageAjaxParameter = {
				Url: "/pms/io/publish/saveImagesData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=delete&imageId=",
				Data: "",
				DataType: "",
				Type: "",
				ContentType: ""
			};

				var _preDefinedHTML = "";

                // var _preDefinedHTML = "<!-- MEE_DOCUMENT --><div><div style='' class='MEE_DROPPABLE'></div><div style='' class='MEE_ELEMENT'><div class='MEE_ITEM' style='position: relative;'><p>This is sample text</p></div></div><div style='' class='MEE_DROPPABLE'></div></div> ";


                // var _preDefinedHTML = "<!-- MEE_DOCUMENT --><div><div style='' class='MEE_DROPPABLE'></div><div style='' class='MEE_ELEMENT'><table class='MEE_CONTAINER ' width='100%'><tbody><tr><td style='width: 50%;'><div class='sortable'><div style='' class='MEE_DROPPABLE'></div><div style='' class='MEE_ELEMENT'><div class='MEE_ITEM' style='position: relative;'><p>This is sample text</p></div></div><div style='' class='MEE_DROPPABLE'></div></div></td><td style='width: 50%;'><div class='sortable'><div style='' class='MEE_DROPPABLE'></div><div class='MEE_ELEMENT'><div class='MEE_ITEM' style='position: relative;'><p>This is sample text</p></div></div><div style='' class='MEE_DROPPABLE'></div></div></td></tr></tbody></table></div><div style='background-color: rgb(220, 238, 254);' class='MEE_DROPPABLE'></div></div>"; 



                // var _preDefinedHTML = "<!-- MEE_DOCUMENT --><div><div style='' class='MEE_DROPPABLE'></div><div style='' class='MEE_ELEMENT'><div class='MEE_ITEM'><img style='height: 200px; width: 200px; margin: 0px; resize: none; position: static; zoom: 1; display: block;' class='' src='images/img1.png'></div></div><div style='' class='MEE_DROPPABLE'></div></div> ";


                // var _preDefinedHTML = "<!-- MEE_DOCUMENT --><div><div style='background-color: rgb(220, 238, 254);' class='MEE_DROPPABLE'></div><div class='MEE_ELEMENT'><table class='MEE_CONTAINER container' width='100%'><tbody><tr><td style='width: 50%;'><div class='sortable'><div style='' class='MEE_DROPPABLE'></div><div style='' class='MEE_ELEMENT'><div class='MEE_ITEM' style='position: relative;'><p>This is sample text</p></div></div><div style='' class='MEE_DROPPABLE'></div></div></td><td style='width: 50%;'><div class='sortable'><div style='' class='MEE_DROPPABLE'></div><div class='MEE_ELEMENT'><div class='MEE_ITEM'><img style='height: 200px; width: 200px; margin: 0px; resize: none; position: static; zoom: 1; display: block;' class='' src='images/img2.png'></div></div><div style='' class='MEE_DROPPABLE'></div></div></td></tr></tbody></table></div><div style='background-color: rgb(220, 238, 254);' class='MEE_DROPPABLE'></div></div>";



                // for testing text items 
                // var _preDefinedHTML = "<!-- MEE_DOCUMENT --><table style='width:100%'> <tr><td><div  class=\"MEE_DROPPABLE\"></div><div style=\"\" class=\"MEE_ELEMENT\"><table class=\"MEE_CONTAINER sortable\" width=\"100%\"><tbody><tr><td style=\"width: 50%;\"><div class=\"sortable\"><div class=\"MEE_DROPPABLE\"></div><div style=\"\" class=\"MEE_ELEMENT\"><table class=\"MEE_TEXTCONTENT\" width=\"100%\"><tbody><tr><td><div class=\"textcontent\" style=\"position: relative;\"><p>This is sample text</p></div></td></tr></tbody></table></div><div class=\"MEE_DROPPABLE\"></div></div></td><td class=\"MEE_ITEM\" style=\"width: 50%;\">This is sample text</td></tr></tbody></table></div><div class=\"MEE_DROPPABLE\"></div></td></tr></table>";


                //for testing images
                // var _preDefinedHTML = "<table style=\"width: 600px; height: 100%; vertical-align: top;\" align=\"center\" class=\"MEE_DOCUMENT\"><tbody><tr><td class=\"MEE_DOCUMENT_CONTENTS\" valign=\"top\"><div class=\"MEE_CONTENTS\"><div style=\"visibility: hidden;\" class=\"MEE_DROPPABLE\"></div><div style=\"\" class=\"MEE_ELEMENT\"><table class=\"MEE_CONTAINER container\" width=\"100%\"><tbody><tr><td style=\"width: 50%;\"><div class=\"sortable\"><div style=\"visibility: hidden;\" class=\"MEE_DROPPABLE\"></div><div style=\"\" class=\"MEE_ELEMENT\"><table class=\"MEE_IMAGECONTENT\" width=\"100%\"><tbody><tr><td><div class=\"\"><div class=\"myImage\" align=\"left\"><div class=\"ui-wrapper\" style=\"overflow: hidden; width: 200px; height: 200px;\"><img style=\"height: 200px; width: 200px; margin: 0px; resize: none; position: static; zoom: 1; display: block;\" class=\"imageHandlingClass resizable clickEvent ui-resizable\" src=\"images/img2.png\"><div class=\"ui-resizable-handle ui-resizable-e\" style=\"z-index: 90; display: block;\"></div><div class=\"ui-resizable-handle ui-resizable-s\" style=\"z-index: 90; display: block;\"></div><div class=\"ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se\" style=\"z-index: 90; display: block;\"></div></div></div></div></td></tr></tbody></table></div><div style=\"visibility: hidden;\" class=\"MEE_DROPPABLE\"></div></div></td><td style=\"width: 50%;\"><div class=\"sortable\"><div style=\"visibility: hidden;\" class=\"MEE_DROPPABLE\"></div><div class=\"MEE_ELEMENT\"><table class=\"MEE_IMAGECONTENT\" width=\"100%\"><tbody><tr><td><div class=\"imageContainer imagePlaceHolderAlone ui-droppable\"><div class=\"drapableImageContainer\">Drag image here</div></div></td></tr></tbody></table></div><div style=\"visibility: hidden;\" class=\"MEE_DROPPABLE\"></div></div></td></tr></tbody></table></div><div style=\"visibility: hidden; background-color: rgb(220, 238, 254);\" class=\"MEE_DROPPABLE\"></div></div></td></tr></tbody></table>"; 







                // testing text With Image Container
                // var _preDefinedHTML = "<table style=\"width: 600px; height: 100%; vertical-align: top;\" align=\"center\" class=\"MEE_DOCUMENT\"><tbody><tr><<td class=\"MEE_DOCUMENT_CONTENTS\" valign=\"top\"><div class=\"MEE_CONTENTS\"><div style=\"visibility: hidden;\" class=\"MEE_DROPPABLE\"></div><div style=\"\" class=\"MEE_ELEMENT\"><table class=\"MEE_TEXTWITHIMAGECONTENT\" width=\"100%\"><tbody><tr><td valign=\"top\" width=\"50%\"><div class=\"textcontent\" style=\"position: relative;\"><p>this is Text with Image</p></div></td><td width=\"50%\"><div class=\"imageContainer imagePlaceHolderAlone ui-droppable\"><div class=\"drapableImageContainer\">Drag image here</div></div></td></tr></tbody></table></div><div style=\"visibility: hidden;\" class=\"MEE_DROPPABLE\"></div></div></td></tr></tbody></table>"; 



                // testing text With Image embeded
                // var _preDefinedHTML = "<table style=\"width: 600px; height: 100%; vertical-align: top;\" align=\"center\" class=\"MEE_DOCUMENT\"><tbody><tr<td class=\"MEE_DOCUMENT_CONTENTS\" valign=\"top\"><div class=\"MEE_CONTENTS\"><div style=\"visibility: hidden;\" class=\"MEE_DROPPABLE\"></div><div style=\"\" class=\"MEE_ELEMENT\"><table class=\"MEE_TEXTWITHIMAGECONTENT\" width=\"100%\"><tbody><tr><td valign=\"top\" width=\"50%\"><div class=\"textcontent\" style=\"position: relative;\"><p>this is Text with Image</p></div></td><td width=\"50%\"><div class=\"\"><div class=\"myImage\" align=\"left\"><div class=\"ui-wrapper\" style=\"overflow: hidden; width: 200px; height: 200px;\"><img style=\"height: 200px; width: 200px; margin: 0px; resize: none; position: static; zoom: 1; display: block;\" class=\"imageHandlingClass resizable clickEvent ui-resizable\" src=\"images/img2.png\"><div class=\"ui-resizable-handle ui-resizable-e\" style=\"z-index: 90; display: block;\"></div><div class=\"ui-resizable-handle ui-resizable-s\" style=\"z-index: 90; display: block;\"></div><div class=\"ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se\" style=\"z-index: 90; display: block;\"></div></div></div></div></td></tr></tbody></table></div><div style=\"visibility: hidden;\" class=\"MEE_DROPPABLE\"></div></div></td></tr></tbody></table>"; 








                // testing dynamic content

                // var _preDefinedHTML = "<table style=\"width: 600px; height: 100%; vertical-align: top;\" align=\"center\" class=\"MEE_DOCUMENT\"><tbody><tr><td class=\"MEE_DOCUMENT_CONTENTS\" valign=\"top\"><div class=\"MEE_CONTENTS\"><div style=\"visibility: hidden;\" class=\"MEE_DROPPABLE\"></div><div style=\"\" class=\"csDynamicData MEE_ELEMENT\"><table class=\"dataContainer DYNAMIC_VARIATION\" id=\"v123\"></table></div><div style=\"visibility: hidden;\" class=\"MEE_DROPPABLE\"></div></div></td></tr></tbody></table>"; 

                var _preDefinedHTML = "TEMPLATE";




				// var _preDefinedHTML = "<ul class=\"sortable mainContentHtml\"><li class=\"myDroppable ui-draggable ui-droppable\" style=\"visibility: hidden; background-color: rgb(220, 238, 254);\"></li><li class=\"ui-draggable ui-droppable csHaveData\"><table width=\"100%\"><tbody><tr><td><div class=\"textcontent mce-content-body\" id=\"mce_0\" tabindex=\"-1\" contenteditable=\"true\" spellcheck=\"false\" style=\"position: relative;\"><p>This is sample text</p></div></td></tr></tbody></table></li><li class=\"myDroppable ui-draggable ui-droppable\" style=\"visibility: hidden; background-color: rgb(220, 238, 254);\"></li></ul>" ;

				$("#myMakeBridge").MakeBridgeEditor({
					SaveImageTagsProperties: _saveImageTagsAjaxParameters,
					DeleteImageProperties: _deleteImageAjaxParameter,
					ImagesAjaxProperties: _imageAjaxParameters,
					SearchImagesProperties: _searchImagesAjaxParameters,
					AddImageProperties: _AddimageAjaxParameters,
					preDefinedHTML: _preDefinedHTML,
                    landingPage: false,
					sessionIDFromServer: "<%=WebSecurityManager.getCSRFToken_HREF(session)%>",
					OnDropElementOnBuildingBlock: function (args) {

						//Save to Server
						if (args.buildingBlock != null) {
							//args.buildingBlock.Name; 
							//args.buildingBlock.Html;

							$.ajax({
							url: "/pms/io/publish/saveEditorData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=addBlock&name="+ args.buildingBlock.Name + "&html=" + encodeURIComponent(args.buildingBlock.Html.html()) ,
							//data: "{ name: 'test', html: args.buildingBlock.Name }",
								type: "POST",
								contentType: "application/json; charset=utf-8",
								dataType: "json",
								cache: true,
								async: false,
								success: function (e) {

									console.log("InsertBuildingBlock success");
								}

							});

						}


					},
					LoadTemplate: function (args) {
                    //LoadTemplate

                        $.ajax({
                            // url: "/pms/io/campaign/getUserTemplate/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=html&templateNumber=jbKw21Ps30Uu33Kr26ja",
                            url: "/pms/io/campaign/getUserTemplate/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=html&templateNumber=BzAEqwsJp20In21Vr30Rk33BdTMyio",
                            
                            data: "{}",
                            type: "POST",
                            contentType: "application/json; charset=latin1",
                            dataType: "json",
                            cache: false,
                            async: false,
                            success: function (e) {
                              
                                args.HTMLTEXT = $('<div/>').html(e.htmlText).text().replace(/&line;/g,"");
                                console.log("LoadTemplate success:"+ args.HTMLTEXT);
                                
                            },
                            error: function (e) {
                                console.log("LoadTemplate Failed:"+ e);
                            }
                        });
                    },
                    LoadBuildingBlocks: function (args) {
    					//GetBuildingBlocks

    					$.ajax({
    						url: "/pms/io/publish/getEditorData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=listBlocks",
    						data: "{}",
    						type: "POST",
    						contentType: "application/json; charset=latin1",
    						dataType: "json",
    						cache: false,
    						async: false,
    						success: function (e) {
    						  if(e.count != "0") {
    							args.buildingBlocks = e.blocks[0];
    							console.log("GetBuildingBlocks success:"+ e);
    						  }
    						},
    						error: function (e) {
    							console.log("GetBuildingBlocks Failed:"+ e);
    						}
    					});
    				},
					OnEditBuildingBlock: function (args) {

						//Save to Server
						if (args != null) {
							//args.buildingBlock.Name; 
							//args.buildingBlock.Html;
							//console.log("/pms/io/publish/getEditorData/?BMS_REQ_TK==WebSecurityManager.getCSRFToken_HREF(session)%>&type=addBlock");
							console.log("Block Id:" + args.BlockID);
							console.log("Block Name:" + args.BlockName);
							// var URL = "/pms/io/publish/saveEditorData/?&type=renameBlock";
							// $.post(URL, {
							//    blockId: args.buildingBlock.Id,
							//    name: args.buildingBlock.Name,
							//    type: "renameBlock"
							// })
							// .done(function (data) {
							//    console.log("RenameBuilding block success:" + data);
							//    // your code go here. 
							// });

							$.ajax({
								url: "/pms/io/publish/saveEditorData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=renameBlock&name=" + args.BlockName + "&blockId=" + args.BlockID,
								//data: "{ name: 'test', html: args.buildingBlock.Name }",
								type: "POST",
								contentType: "application/json; charset=latin1",
								dataType: "json",
								cache: false,
								async: false,
								success: function (e) {
									console.log("RenameBuilding success:" + e);
									//LoadBuildingBlocks();
								},
								error: function (e) {
									console.log("RenameBuilding failed:" + e);
								}

							});

						}


					},
					OnDeleteBuildingBlock: function (args) {
						if (args != null) {
							console.log(args.BlockID);

							$.ajax({
								url: "/pms/io/publish/saveEditorData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=deleteBlock&blockId=" + args.BlockID,
								//data: "{ name: 'test', html: args.buildingBlock.Name }",
								type: "POST",
								contentType: "application/json; charset=latin1",
								dataType: "json",
								cache: false,
								async: false,
								success: function (e) {
									console.log("delete building block success:" + e);
									//LoadBuildingBlocks();
								},
								error: function (e) {
									console.log("delete building block failed:" + e);
								}

							});
						}
					},


					LoadMyColors: function (args) {
						//GetBuildingBlocks

						$.ajax({
						url: "/pms/io/publish/getEditorData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=listColors",
							data: "{}",
							type: "POST",
							contentType: "application/json; charset=latin1",
							dataType: "json",
							cache: false,
							async: false,
							success: function (e) {
								args.myColors = e.colors;
								console.log("MyColors success:" + e.colors);
							},
							error: function (e) {
								console.log("MyColors Failed:" + e);
							}
						});
					},

					OnColorAdded: function (args) {
						console.log("Color to be added:" + args.AddedColor);
						console.log("Color Already added:" + args.myColorsFromServiceGlobal);

						var saveColors = "";
						if (args.myColorsFromServiceGlobal == "") {
							saveColors = args.AddedColor;
						}
						else {
							saveColors = args.myColorsFromServiceGlobal + "," + args.AddedColor;
						}
						console.log("Color list to be added:" + saveColors);

						saveColors = encodeURIComponent(saveColors);
						console.log("Color list to be added after encoded:" + saveColors);
						var URL = "/pms/io/publish/saveEditorData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=saveColors&colors=" + saveColors ;
						$.post(URL)
						.done(function (data) {
							console.log("Insert My Color success:" + data);
							// your code go here. 
						});

					},
                    OnSaveDynamicContent: function (args)
                    {

                        var content = args.DynamicContent;
                        var dynamicNumber = content.DynamicVariationID;
                        var contentURL = "/pms/io/publish/saveDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=newContent&dynamicNumber="+ dynamicNumber+"&campaignSubject="+ content.Label + "&contents="+ encodeURIComponent(content.InternalContents) +"&contentLabel="+ content.Label +"&isDefault=" + (content.IsDefault ? "Y" : "N");
                        $.ajax({                                    
                            url: contentURL,
                             //data: "{ name: 'test', html: args.buildingBlock.Name }",
                             type: "POST",
                            contentType: "application/json; charset=latin1",
                            dataType: "json",
                            cache: false,
                            async: false,
                            success: function (ec) {
                                console.log("Insert Dynamic Variation Content success:"+ ec);  
                                console.log("Dynamic number Content is:" + ec[1]);
                                              
                            },
                            error: function (e) {
                                console.log("Insert Dynamic Variation Content failed:"+ e);
                            }
                        });

                    },
                    OnSaveDynamicRules: function (args)
                    {
                        var content = args.DynamicContent;
                        var dynamicNumber = content.DynamicVariationID;
                        var dynamicNumberContent = content.DynamicContentID;
                        var rules = content.ListOfDynamicRules;
                        var contentRuleURL = "/pms/io/publish/saveDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=updateContentRules&dynamicNumber="+ dynamicNumber+"&contentNumber=" + dynamicNumberContent + "&applyRuleCount=" + content.ApplyRuleCount + "&ruleCount=" + rules.length;
                        for (var j = 0; j < rules.length; j++) {
                            var rule = rules[j];
                            //contentRuleURL += "&"+ j +".spanInDays=";
                            contentRuleURL += "&"+ (j+1) +".matchValue=" + rule.RuleMatchValue;
                            contentRuleURL += "&"+ (j+1) +".fieldName=" + rule.RuleFieldName;
                            contentRuleURL += "&"+ (j+1) +".dateFormat=" + rule.RuleDefaultValue;
                            contentRuleURL += "&"+ (j+1) +".rule="+ rule.RuleCondition;
                            //contentRuleURL += "&"+ j +".listNumber=";
                        } 
                        $.ajax({                                    
                            url: contentRuleURL,
                             //data: "{ name: 'test', html: args.buildingBlock.Name }",
                             type: "POST",
                            contentType: "application/json; charset=latin1",
                            dataType: "json",
                            cache: false,
                            async: false,
                            success: function (e) {
                                console.log("Insert Dynamic Variation Content Rule success:"+ e);  
                                 
                            },
                            error: function (e) {
                                console.log("Insert Dynamic Variation Rule failed:"+ e);
                            }
                        });
                                
                    },
                    OnUpdateDynamicContent: function (args)
                    {
                        var content = args.DynamicContent;
                        var dynamicNumber = content.DynamicVariationID;
                        var dynamicNumberContent = content.DynamicContentID;
                       
                        var contentURL = "/pms/io/publish/saveDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=updateContent&dynamicNumber="+ dynamicNumber+"&campaignSubject="+ content.Label + "&contents="+ encodeURIComponent(content.InternalContents) +"&contentLabel="+ content.Label +"&contentNumber=" + dynamicNumberContent;
                        
                        $.ajax({                                    
                            url: contentURL,
                             //data: "{ name: 'test', html: args.buildingBlock.Name }",
                             type: "POST",
                            contentType: "application/json; charset=latin1",
                            dataType: "json",
                            cache: false,
                            async: false,
                            success: function (ec) {
                                console.log("Update Dynamic Variation Content success:"+ ec);  
                                //console.log("Dynamic number Content is:" + ec[1]);
                                   
                                                     
                            },
                            error: function (e) {
                                console.log("Insert Dynamic Variation Content failed:"+ e);
                            }
                        }); 
                    },
                    OnDeleteDynamicContent: function (args)
                    {
                        var content = args.DynamicContent;
                        var dynamicNumber = content.DynamicVariationID;
                        var dynamicNumberContent = content.DynamicContentID;
                        
                        var contentURL = "/pms/io/publish/saveDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=deleteContent&dynamicNumber="+ dynamicNumber+"&contentNumber=" + dynamicNumberContent;
                        
                        $.ajax({                                    
                            url: contentURL,
                             //data: "{ name: 'test', html: args.buildingBlock.Name }",
                             type: "POST",
                            contentType: "application/json; charset=latin1",
                            dataType: "json",
                            cache: false,
                            async: false,
                            success: function (ec) {
                                console.log("Delete Dynamic Content success:"+ ec);  
                                //console.log("Dynamic number Content is:" + ec[1]);
                                   
                                                     
                            },
                            error: function (e) {
                                console.log("Delete Dynamic Content failed:"+ e);
                            }
                        }); 
                    },
                    OnDynamicContentSwap: function (args)
                    {
                        var content = args.DynamicContent;
                        var dynamicNumber = content.DynamicVariationID;
                        var dynamicNumberContent = content.DynamicContentID;
                       
                        var contentURL = "/pms/io/publish/saveDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=updateContent&dynamicNumber="+ dynamicNumber+"&campaignSubject="+ content.Label + "&contents="+ encodeURIComponent(content.InternalContents) +"&contentLabel="+ content.Label +"&contentNumber=" + dynamicNumberContent;
                        
                        $.ajax({                                    
                            url: contentURL,
                             //data: "{ name: 'test', html: args.buildingBlock.Name }",
                             type: "POST",
                            contentType: "application/json; charset=latin1",
                            dataType: "json",
                            cache: false,
                            async: true,
                            success: function (ec) {
                                console.log("Update Dynamic  Content success:"+ ec);  
                                //console.log("Dynamic number Content is:" + ec[1]);
                                   
                                                     
                            },
                            error: function (e) {
                                console.log("update Dynamic  Content failed:"+ e);
                            }
                        }); 
                    },
                    OnDynamicControlSave: function (variation)
                    {
                        console.log("isUPdate on saving:" + variation.IsUpdate);                       
                        console.log("Variation ID on saving:" + variation.DynamicVariationID);
                        console.log("Variation Name on saving:" + variation.Label);
                        console.log(variation);
                        
                        if(variation.IsUpdate){

                            $.ajax({
                                url: "/pms/io/publish/saveDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=relabel&label="+ variation.Label + "&dynamicNumber=" + variation.DynamicVariationID ,
                               //data: "{ name: 'test', html: args.buildingBlock.Name }",
                               type: "POST",
                               contentType: "application/json; charset=latin1",
                               dataType: "json",
                               cache: false,
                               async: false,
                               success: function (e) {
                                   console.log("Rename Dynamic Variation success:"+ e);
                                   //LoadBuildingBlocks();
                               },
                               error: function (e) {
                                   console.log("Rename Dynamic Variation failed:"+ e);
                               }

                            });
                            var dynamicNumber = variation.DynamicVariationID;
                            var contents = variation.ListOfDynamicContents;
                            for (var i = 0; i < contents.length; i++) {
                                var content = contents[i];
                                var contentNumber = content.DynamicContentID;
                                console.log(content);
                                console.log("ContentNumebr:"+contentNumber);
                                var contentURL = "";
                                if(contentNumber != 0) {
                                    contentURL = "/pms/io/publish/saveDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=updateContent&dynamicNumber="+ dynamicNumber+"&campaignSubject="+ content.Label + "&contents="+ encodeURIComponent(content.InternalContents) +"&contentLabel="+ content.Label +"&contentNumber=" + contentNumber;
                                }
                                else {
                                    contentURL = "/pms/io/publish/saveDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=newContent&dynamicNumber="+ dynamicNumber+"&campaignSubject="+ content.Label + "&contents=&contentLabel="+ content.Label +"&isDefault=" + (content.IsDefault ? "Y" : "N");
                                }
                                
                                $.ajax({                                    
                                    url: contentURL,
                                     //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                     type: "POST",
                                    contentType: "application/json; charset=latin1",
                                    dataType: "json",
                                    cache: false,
                                    async: false,
                                    success: function (ec) {
                                        console.log("Update Dynamic Variation Content success:"+ ec);  
                                        //console.log("Dynamic number Content is:" + ec[1]);
                                        if(contentNumber == 0){
                                            contentNumber = ec[1];
                                        }
                                        var rules = content.ListOfDynamicRules;
                                        var contentRuleURL = "/pms/io/publish/saveDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=updateContentRules&dynamicNumber="+ dynamicNumber+"&contentNumber=" + contentNumber + "&applyRuleCount=" + content.ApplyRuleCount + "&ruleCount=" + rules.length;
                                        for (var j = 0; j < rules.length; j++) {
                                            var rule = rules[j];
                                            //contentRuleURL += "&"+ j +".spanInDays=";
                                            contentRuleURL += "&"+ (j+1) +".matchValue=" + rule.RuleMatchValue;
                                            contentRuleURL += "&"+ (j+1) +".fieldName=" + rule.RuleFieldName;
                                            contentRuleURL += "&"+ (j+1) +".dateFormat=" + rule.RuleDefaultValue;
                                            contentRuleURL += "&"+ (j+1) +".rule="+ rule.RuleCondition;
                                            //contentRuleURL += "&"+ j +".listNumber=";
                                        } 
                                        $.ajax({                                    
                                            url: contentRuleURL,
                                             //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                             type: "POST",
                                            contentType: "application/json; charset=latin1",
                                            dataType: "json",
                                            cache: false,
                                            async: false,
                                            success: function (e) {
                                                console.log("Update Dynamic Variation Content Rule success:"+ e);  
                                                 
                                            },
                                            error: function (e) {
                                                console.log("Update Dynamic Variation Rule failed:"+ e);
                                            }
                                        });
                                           
                                                             
                                    },
                                    error: function (e) {
                                        console.log("Insert Dynamic Variation Content failed:"+ e);
                                    }
                                });
                            }
                        }
                        else {

                            var URL = "/pms/io/publish/saveDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=new&contentType=H&label=" + variation.Label ;
                            
                            $.ajax({
                                url: URL,
                                //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                type: "POST",
                                contentType: "application/json; charset=latin1",
                                dataType: "json",
                                cache: false,
                                async: false,
                                success: function (e) {
                                    console.log("Insert Dynamic Variation success:"+ e);
                                    //var results = e.split(",");
                                    console.log("Dynamic number is:" + e[1]);

                                    var dynamicNumber = e[1];
                                    if(dynamicNumber != "err") {  
                                        variation.DynamicVariationID = dynamicNumber;  
                                        var contents = variation.ListOfDynamicContents;
                                        for (var i = 0; i < contents.length; i++) {
                                            var content = contents[i];
                                            var contentURL = "/pms/io/publish/saveDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=newContent&dynamicNumber="+ dynamicNumber+"&campaignSubject="+ content.Label + "&contents="+ encodeURIComponent(content.InternalContents) +"&contentLabel="+ content.Label +"&isDefault=" + (content.IsDefault ? "Y" : "N");
                                             $.ajax({                                    
                                                url: contentURL,
                                                 //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                                 type: "POST",
                                                contentType: "application/json; charset=latin1",
                                                dataType: "json",
                                                cache: false,
                                                async: false,
                                                success: function (ec) {
                                                    console.log("Insert Dynamic Variation Content success:"+ ec);  
                                                    console.log("Dynamic number Content is:" + ec[1]);
                                                    var dynamicNumberContent = ec[1];
                                                    if(dynamicNumberContent != "err") {    
                                                        var rules = content.ListOfDynamicRules;
                                                        var contentRuleURL = "/pms/io/publish/saveDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=updateContentRules&dynamicNumber="+ dynamicNumber+"&contentNumber=" + dynamicNumberContent + "&applyRuleCount=" + content.ApplyRuleCount + "&ruleCount=" + rules.length;
                                                        for (var j = 0; j < rules.length; j++) {
                                                            var rule = rules[j];
                                                            //contentRuleURL += "&"+ j +".spanInDays=";
                                                            contentRuleURL += "&"+ (j+1) +".matchValue=" + rule.RuleMatchValue;
                                                            contentRuleURL += "&"+ (j+1) +".fieldName=" + rule.RuleFieldName;
                                                            contentRuleURL += "&"+ (j+1) +".dateFormat=" + rule.RuleDefaultValue;
                                                            contentRuleURL += "&"+ (j+1) +".rule="+ rule.RuleCondition;
                                                            //contentRuleURL += "&"+ j +".listNumber=";
                                                        } 
                                                        $.ajax({                                    
                                                            url: contentRuleURL,
                                                             //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                                             type: "POST",
                                                            contentType: "application/json; charset=latin1",
                                                            dataType: "json",
                                                            cache: false,
                                                            async: false,
                                                            success: function (e) {
                                                                console.log("Insert Dynamic Variation Content Rule success:"+ e);  
                                                                 
                                                            },
                                                            error: function (e) {
                                                                console.log("Insert Dynamic Variation Rule failed:"+ e);
                                                            }
                                                        });
                                                       
                                                    }                      
                                                },
                                                error: function (e) {
                                                    console.log("Insert Dynamic Variation Content failed:"+ e);
                                                }
                                            });
                                        }    
                                    }                           
                                },
                                error: function (e) {
                                   console.log("Insert Dynamic Variation failed:"+ e);
                                }

                            });
                        }

                    },
                    OnEditDynamicVariation: function (args) {
                        //Save to Server
                        if (args.DCID != null) {
                            console.log("Block Id:" + args.DCID);
                            console.log("Block Name:" + args.DCName);
                            
                            $.ajax({
                                url: "/pms/io/publish/saveDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=relabel&label="+ args.DCName + "&dynamicNumber=" + args.DCID ,
                               //data: "{ name: 'test', html: args.buildingBlock.Name }",
                               type: "POST",
                               contentType: "application/json; charset=latin1",
                               dataType: "json",
                               cache: false,
                               async: false,
                               success: function (e) {
                                   console.log("Rename Dynamic Variation success:"+ e);
                                   //LoadBuildingBlocks();
                               },
                               error: function (e) {
                                   console.log("Rename Dynamic Variation failed:"+ e);
                               }

                            });

                         }


                    },
                    OnDynamicVariationName: function (variation) {
                        //Save to Server
                        if (variation != null) {
                            console.log("Block Id:" + variation.DynamicVariationID);
                            console.log("Block Name:" + variation.Label);
                            
                            $.ajax({
                                url: "/pms/io/publish/saveDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=relabel&label="+ variation.Label + "&dynamicNumber=" + variation.DynamicVariationID ,
                               //data: "{ name: 'test', html: args.buildingBlock.Name }",
                               type: "POST",
                               contentType: "application/json; charset=latin1",
                               dataType: "json",
                               cache: false,
                               async: false,
                               success: function (e) {
                                   console.log("Rename Dynamic Variation success:"+ e);
                                   //LoadBuildingBlocks();
                               },
                               error: function (e) {
                                   console.log("Rename Dynamic Variation failed:"+ e);
                               }

                            });

                         }


                    },
                    OnDeleteDynamicVariation: function (args) {
                        if (args != null) {
                            console.log(args.DCID);
                        
                         $.ajax({
                                url: "/pms/io/publish/saveDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=delete&dynamicNumber=" + args.DCID ,
                               //data: "{ name: 'test', html: args.buildingBlock.Name }",
                               type: "POST",
                               contentType: "application/json; charset=latin1",
                               dataType: "json",
                               cache: false,
                               async: false,
                               success: function (e) {
                                   console.log("delete dynamicVariation success:"+ e);
                                   //LoadBuildingBlocks();
                               },
                               error: function (e) {
                                   console.log("delete dynamicVariation failed:"+ e);
                               }

                            });
                         }
                    },
					LoadDynamicBlocks: function (args) {
						//GetDynamicBlocks

						$.ajax({
						url: "/pms/io/publish/getDynamicVariation/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=list",
							data: "{}",
							type: "POST",
							contentType: "application/json; charset=latin1",
							dataType: "json",
							cache: false,
							async: false,
							success: function (e) {
								if (e.variations != undefined) {
									args.dynamicBlocks = e.variations[0];
									console.log("GetDynamicBlocks success:" + e.data);
								}
							},
							error: function (e) {
								console.log("GetDynamicBlocks Failed:" + e);
							}
						});
					},
					LoadDynamicBlockFields: function (args) {
						//GetDynamicBlocks

						$.ajax({
						url: "/pms/io/getMetaData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=fields_all",
							data: "{}",
							type: "POST",
							contentType: "application/json; charset=latin1",
							dataType: "json",
							cache: false,
							async: false,
							success: function (e) {
								args.dynamicBlockFields = e;
								console.log("LoadDynamicBlockFields success:" + e);

							},
							error: function (e) {
								console.log("LoadDynamicBlockFields Failed:" + e);
							}
						});
					},
					LoadDynamicBlockRuleConditions: function (args) {
						//GetDynamicBlocks

						$.ajax({
						url: "/pms/io/getMetaData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=rules",
							data: "{}",
							type: "POST",
							contentType: "application/json; charset=latin1",
							dataType: "json",
							cache: false,
							async: false,
							success: function (e) {
								args.dynamicBlockRuleConditions = e;
								console.log("LoadDynamicBlockRuleConditions success:" + e);

							},
							error: function (e) {
								console.log("LoadDynamicBlockRuleConditions Failed:" + e);
							}
						});
					},
					LoadDynamicBlockFormats: function (args) {
						//GetDynamicBlocks

						$.ajax({
						url: "/pms/io/getMetaData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=formats",
							data: "{}",
							type: "POST",
							contentType: "application/json; charset=latin1",
							dataType: "json",
							cache: false,
							async: false,
							success: function (e) {
								args.dynamicBlockFormats = e;
								console.log("LoadDynamicBlockFormats success:" + e);

							},
							error: function (e) {
								console.log("LoadDynamicBlockFormats Failed:" + e);
							}
						});
					},
					LoadPersonalizeTags: function (args) {
						//GetDynamicBlocks

						$.ajax({
						url: "/pms/io/getMetaData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=merge_tags",
							data: "{}",
							type: "POST",
							contentType: "application/json; charset=latin1",
							dataType: "json",
							cache: false,
							async: false,
							success: function (e) {
								args.personalizeTags = e;
								console.log("LoadPersonalizeTags success:" + e);

							},
							error: function (e) {
								console.log("LoadPersonalizeTags Failed:" + e);
							}
						});
					},
					CallBackSaveMethod: function (templateHTML, outputHTML) {
						console.log("TemplateHTML:" + templateHTML);
						console.log("OutputHTML:" + outputHTML);

                        $.post('/pms/io/campaign/saveUserTemplate/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>', 
                            {type:'update',
                                templateNumber:'jbKw21Ps30Uu33Kr26ja',
                                imageId:'',
                                isFeatured:'N',
                                isReturnPath:'N',
                                isMobile:'N',
                                categoryID:'',
                                templateHtml:outputHTML
                            }
                        )
                        .done(function(data) {                  
                            console.log("Saving done with response:"+data);
                        });

					},
                    LoadFormBlocks: function (args) {
                    //LoadFormBlocks

                        $.ajax({
                            url: "/pms/io/form/getSignUpFormData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=list",
                            data: "{}",
                            type: "POST",
                            contentType: "application/json; charset=latin1",
                            dataType: "json",
                            cache: false,
                            async: false,
                            success: function (e) {
                              if(e.count != "0") {
                                args.formBlocks = e.forms[0];
                                console.log("LoadFormBlocks success:"+ e);
                              }
                            },
                            error: function (e) {
                                console.log("LoadFormBlocks Failed:"+ e);
                            }
                        });
                    },
                    LoadFormContents: function (args) {
                    //LoadFormContents

                        $.ajax({
                            url: "/pms/io/form/getSignUpFormData/?<%=WebSecurityManager.getCSRFToken_HREF(session)%>&type=snippet&formId="+args.FormId,
                            data: "{}",
                            type: "POST",
                            contentType: "application/json; charset=latin1",
                            dataType: "json",
                            cache: false,
                            async: false,
                            success: function (e) {
                                args.formContents = e.formPreviewURL;
                                console.log("LoadFormContents success:"+ e);
                              
                            },
                            error: function (e) {
                                console.log("LoadFormContents  Failed:"+ e);
                            }
                        });
                    }, 
                    OnExistingDynamicControlDropped: function () {

					}


				});
			});
		</script>
</head>
<body>
	<div id="myMakeBridge">
	</div>
</body>
</html>

<script type="text/javascript">

    function applyAlignment(align_of) {
        if (align_of == "none") {
            $(".aligncol #top").removeClass("active");
            $(".aligncol #top").siblings().removeClass("active");
            $(".aligncol #middle").removeClass("active");
            $(".aligncol #middle").siblings().removeClass("active");
            $(".aligncol #bottom").removeClass("active");
            $(".aligncol #botom").siblings().removeClass("active");
        }
        if (align_of == "top") {
            $(".aligncol #top").addClass("active");
            $(".aligncol #top").siblings().removeClass("active");
        }
        if (align_of == "middle") {
            $(".aligncol #middle").addClass("active");
            $(".aligncol #middle").siblings().removeClass("active");
        }
        if (align_of == "bottom") {
            $(".aligncol #bottom").addClass("active");
            $(".aligncol #bottom").siblings().removeClass("active");
        }
        return false;
    }
    
    function applyEmailWidth(width) {
        console.log("Email width:"+ width);
        if (width == "700") {
            $("input#700").addClass("active");
            $("input#700").siblings().removeClass("active");
        }
        if (width == "600") {
            $("input#600").addClass("active");
            $("input#600").siblings().removeClass("active");
        }
        if (width == "500") {
            $("input#500").addClass("active");
            $("input#500").siblings().removeClass("active");
        }
        //return false;
    }



    function applyPadding(padding_of) {

        $element = $(".paddingControl .ved-edge-inner");
        $elementH = $element.height();
        $elementW = $element.width();

        if (padding_of == "topNone") {
            $(".paddingControl #top").removeClass('borderselected');
            return;
        }
        if (padding_of == "bottomNone") {
            $(".paddingControl #bottom").removeClass('borderselected');
            return;
        }
        if (padding_of == "leftNone") {
            $(".paddingControl #left").removeClass('borderselected');
            return;
        }
        if (padding_of == "rightNone") {
            $(".paddingControl #right").removeClass('borderselected');
            return;
        }

        //$elementPreview = $(".edge-text-preview");

        //var paddingInt = Number($(".ddlPadding").val());

        //console.log("PaddingInt Value:"+ paddingInt);



        if (padding_of == "top") {

            if($(".paddingControl #top").hasClass('borderselected')){
                $(".paddingControl #top").removeClass('borderselected');
			}
            else {
                $(".paddingControl #top").addClass('borderselected');
		}
            // var elementPaddingTop = $element.css("paddingTop");
            // console.log(elementPaddingTop);
            // elementPaddingTop = elementPaddingTop.split("px");
            // console.log(elementPaddingTop);
            // elementPaddingTop = Number(elementPaddingTop[0]);

            // // $elementPaddingTop = $element.attr('padding-top');
            // console.log(elementPaddingTop);

            /*if (elementPaddingTop == 0) {
                console.log("in zoro");
                var paddingValue = paddingInt + "px";
                console.log("new Padding value is:"+ paddingValue);
                console.log($element);
                $element.attr("style", "padding-top:"+ paddingValue);
                console.log($element);
                elementPaddingTop = $element.css("paddingTop");
                console.log(elementPaddingTop);
                elementPaddingTop = elementPaddingTop.split("px");
                console.log(elementPaddingTop);
                elementPaddingTop = Number(elementPaddingTop[0]);

                // $elementPaddingTop = $element.css("padding-top").split("px");
                // $elementPaddingTop = Number($elementPaddingTop[0]);

                var elementPaddingBottom = $element.css("padding-bottom").split("px");
                elementPaddingBottom = Number(elementPaddingBottom[0]);

                var elementPaddingTobBottom = elementPaddingTop + elementPaddingBottom;

                $element.css("height", 48 - elementPaddingTobBottom + "px");
                $elementPreview.css("height", 48 - elementPaddingTobBottom + "px");

                $(".paddingControl #top").addClass('borderselected');
                // $(".paddingControl #top").css("background-color", "#ccc");

			} else {
                console.log("in not zoro");
                var elementPaddingTop = $element.css("padding-top").split("px");
                elementPaddingTop = Number(elementPaddingTop[0]);
                $element.removeAttr("padding-top", "0px");

                $element.css("height", $elementH + elementPaddingTop + "px");
                $elementPreview.css("height", $elementH + elementPaddingTop + "px");

                $(".paddingControl #top").removeClass('borderselected');
                // $(".paddingControl #top").css("background-color", "transparent");
            }*/

			}

        if (padding_of == "bottom") {

            if($(".paddingControl #bottom").hasClass('borderselected')){
                $(".paddingControl #bottom").removeClass('borderselected');
		}
            else {
                $(".paddingControl #bottom").addClass('borderselected');
            }
/*
            $elementPaddingBottom = $element.css("padding-bottom").split("px");
            $elementPaddingBottom = Number($elementPaddingBottom[0]);


            if ($elementPaddingBottom == 0) {

                $element.css("padding-bottom", paddingInt + "px");

                $elementPaddingTop = $element.css("padding-top").split("px");
                $elementPaddingTop = Number($elementPaddingTop[0]);

                $elementPaddingBottom = $element.css("padding-bottom").split("px");
                $elementPaddingBottom = Number($elementPaddingBottom[0]);

                $elementPaddingTobBottom = $elementPaddingTop + $elementPaddingBottom;

                $element.css("height", 48 - $elementPaddingTobBottom + "px");
                $elementPreview.css("height", 48 - $elementPaddingTobBottom + "px");

                $(".paddingControl #bottom").addClass('borderselected');
                // $(".paddingControl #bottom").css("background-color", "#ccc");

			} else {

                $elementPaddingTop = $element.css("padding-bottom").split("px");
                $elementPaddingTop = Number($elementPaddingTop[0]);
                $element.css("padding-bottom", "0px");
				
                $element.css("height", $elementH + $elementPaddingTop + "px");
                $elementPreview.css("height", $elementH + $elementPaddingTop + "px");

                $(".paddingControl #bottom").removeClass('borderselected');
                // $(".paddingControl #bottom").css("background-color", "transparent");
			}
            */
        }

        if (padding_of == "left") {

            if($(".paddingControl #left").hasClass('borderselected')){
                $(".paddingControl #left").removeClass('borderselected');
		}
            else {
                $(".paddingControl #left").addClass('borderselected');
            }
            /*
            $elementPaddingLeft = $element.css("padding-left").split("px");
            $elementPaddingLeft = Number($elementPaddingLeft[0]);


            if ($elementPaddingLeft == 0) {

                $element.css("padding-left", paddingInt + "px");

                $elementPaddingLeft = $element.css("padding-left").split("px");
                $elementPaddingLeft = Number($elementPaddingLeft[0]);

                $elementPaddingRight = $element.css("padding-right").split("px");
                $elementPaddingRight = Number($elementPaddingRight[0]);

                $elementPaddingLeftRight = $elementPaddingLeft + $elementPaddingRight;

                $element.css("width", 48 - $elementPaddingLeftRight + "px");
                $elementPreview.css("width", 48 - $elementPaddingLeftRight + "px");

                $(".paddingControl #left").addClass('borderselected');
                // $(".paddingControl #left").css("background-color", "#ccc");
				
			} else {

                $elementPaddingLeft = $element.css("padding-left").split("px");
                $elementPaddingLeft = Number($elementPaddingLeft[0]);
                $element.css("padding-left", "0px");

                $element.css("width", $elementW + $elementPaddingLeft + "px");
                $elementPreview.css("width", $elementW + $elementPaddingLeft + "px");

                $(".paddingControl #left").removeClass('borderselected');
                // $(".paddingControl #left").css("background-color", "transparent");
	}
            */

        }

        if (padding_of == "right") {

            if($(".paddingControl #right").hasClass('borderselected')){
            $(".paddingControl #right").removeClass('borderselected');
        }
            else {
                $(".paddingControl #right").addClass('borderselected');
            }
            /*
            $elementPaddingRight = $element.css("padding-right").split("px");
            $elementPaddingRight = Number($elementPaddingRight[0]);

 
            if ($elementPaddingRight == 0) {

                $element.css("padding-right", paddingInt + "px");

                $elementPaddingLeft = $element.css("padding-left").split("px");
                $elementPaddingLeft = Number($elementPaddingLeft[0]);

                $elementPaddingRight = $element.css("padding-right").split("px");
                $elementPaddingRight = Number($elementPaddingRight[0]);

                $elementPaddingLeftRight = $elementPaddingLeft + $elementPaddingRight;

                $element.css("width", 48 - $elementPaddingLeftRight + "px");
                $elementPreview.css("width", 48 - $elementPaddingLeftRight + "px");

                $(".paddingControl #right").addClass('borderselected');
                // $(".paddingControl #right").css("background-color", "#ccc");

            } else {

                $elementPaddingRight = $element.css("padding-right").split("px");
                $elementPaddingRight = Number($elementPaddingRight[0]);
                $element.css("padding-right", "0px");

                $element.css("width", $elementW + $elementPaddingLeft + "px");
                $elementPreview.css("width", $elementW + $elementPaddingRight + "px");

				$(".paddingControl #right").removeClass('borderselected');
                // $(".paddingControl #right").css("background-color", "transparent");
			}
            */

		}

	}

	function addNewRule() {

        var ruleTemplate = $($(".dcRuleRowTemplate").html());        
    
        ruleTemplate.find(".firstChosen").chosen({width:"224px"});
        ruleTemplate.find(".secondChosen").chosen({ disable_search_threshold: 10 , width:"180px"});
        ruleTemplate.find(".thirdChosen").chosen({ disable_search_threshold: 10 , width:"150px"});
        
        //Delete Event
        ruleTemplate.find(".delete").click(function () {
            ruleTemplate.remove();
        });
        ////////////////////////////////////

        $(".dynamic_inputs_list").append(ruleTemplate);


    }


</script>

