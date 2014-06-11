var predefinedControls = [
{
    "type": "text",
    "html": "<div class='textcontent'>This is sample text</div>"
},

{
    "type": "image",
    "html": "<div class='imageContainer imagePlaceHolderAlone drapableImageContainer'>Drag image here</div>"
},

{
    "type": "textWithImage",
    "html": "<table class='MEE_TEXTWITHIMAGECONTENT' width='100%'><tr><td valign='top' width='50%'><div class='textcontent'>this is Text with Image</div></td><td width='50%'><div class='imageContainer imagePlaceHolderAlone'><div class='drapableImageContainer'>Drag image here</div></div></td></tr></table></div>"
},

{
    "type": "imageWithText",
    "html": "<table class='MEE_IMAGEWITHTEXTCONTENT' width='100%'><tr><td width='50%'><div class='imageContainer imagePlaceHolderAlone'><div class='drapableImageContainer'>Drag image here</div></div></td><td valign='top' width='50%'><div class='textcontent'>This is Image with Image</div></td></tr></table></div>"
},

{
    "type": "spacer5",
    "html": "<div style='height:5px; background:url(images/spacer.png);'></div>"
},

{
    "type": "spacer10",
    "html": "<div style='height:10px; background:url(images/spacer.png);'></div>"
},

{
    "type": "spacer15",
    "html": "<div style='height:15px; background:url(images/spacer.png);'></div>"
},

{
    "type": "spacer20",
    "html": "<div style='height:20px; background:url(images/spacer.png);'> </div>"
},

{
    "type": "oneColumnContainer",
    "html": "<table class='MEE_CONTAINER container' width='100%'><tr><td><ul class='sortable' style='list-style: none;'></ul></td></tr></table>"
},

{
    "type": "twoColumnContainer",
    "html": "<table class='MEE_CONTAINER container' width='100%'><tr><td><ul class='sortable' style='list-style: none; '></ul></td><td><ul class='sortable' style='list-style: none;'></ul></td></tr></table>"
},

{
    "type": "threeColumnContainer",
    "html": "<table class='MEE_CONTAINER container' width='100%'><tr><td><ul class='sortable' style='list-style: none;'></ul></td><td><ul class='sortable' style='list-style: none;'></ul></td><td><ul class='sortable' style='list-style: none; '></ul></td></tr></table>"
},

{
    "type": "fourColumnContainer",
    "html": "<table class='MEE_CONTAINER container' width='100%'><tr><td><ul class='sortable' style='list-style: none;'></ul></td><td><ul class='sortable' style='list-style: none;'></ul></td><td><ul class='sortable' style='list-style: none; '></ul></td><td><ul class='sortable' style='list-style: none; '></ul></td></tr></table>"
},
{
    
    "type": "dynamicContentContainer",
    "html": "<table class='MEE_DYNAMICCONTENTCONTAINER container dynamicContentContainer'><tr><td><div id='basic' class='well main_blocker' style='max-width:44em;'><div class='block_head'><input type='text' class='txtVariationName' name='content_name' placeholder='Name Dynamic Variation' /> <input type='button' class='dcSaveButton' value='Save' />&nbsp;<img src='images/ico-edit1.png' /></div><div class='block_body'><div class='block_controls'><img class='addDynamicRule' src='images/add-btn.png' style='float: left';/><ul class='dcContents'></ul></div></div></td></tr><tr><td><ul class='sortable dcInternalContents' style='list-style: none;'></ul></td></tr></table>"
}


];
