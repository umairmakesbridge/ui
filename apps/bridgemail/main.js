(function () {
   'use strict';
    require.config({  
       deps: ['main'], 
       waitSeconds:400,
       urlArgs: "bust=1.39" ,
       paths:{
           jquery:'shared/libs/jquery',
           underscore:'shared/libs/underscore',
           backbone:'shared/libs/backbone-min',
           text:'shared/libs/text',
           router: 'shared/router',
           async: 'shared/libs/async',
           goog: 'shared/libs/goog',
           propertyParser: 'shared/libs/propertyParser',
           'iframed-app': 'shared/iframed-app',           
           'jquery.bmsgrid': 'shared/libs/bmsgrid',
           'jquery.calendario': 'shared/libs/jquery.calendario',
           'jquery.icheck': 'shared/libs/jquery.icheck',
           'jquery.chosen': 'shared/libs/chosen.jquery',
           'jquery.highlight': 'shared/libs/jquery.highlight',           
           'jquery.searchcontrol': 'shared/searchcontrol',
           'jquery-ui': 'shared/libs/jquery-ui',
           'fileuploader': 'shared/libs/jquery.form',
           'bms-shuffle': 'shared/shuffle',
           'bms-filters': 'shared/filters',
           'bms-crm_filters': 'shared/crm_filters',
           'bms-tags': 'shared/tags',
           'bms-mapping': 'shared/mapping',
           'bms-addbox': 'shared/addbox',
           'moment': 'shared/libs/moment',
           'bootstrap': 'shared/libs/bootstrap.min',
           '_date': 'shared/libs/date',
           'daterangepicker': 'shared/libs/daterangepicker.jQuery',
           'bms-dragfile': 'shared/dragfile',
           'bms-mergefields':'shared/mergefields',
           'jquery.customScroll':'shared/libs/jquery.mCustomScrollbar',
           'datetimepicker':'shared/libs/jquery.datetimepicker',
           'jquery.isotope':'shared/libs/jquery.isotope',
           'mee-helper': 'shared/editor_common',
           'mincolors':'shared/libs/jquery.minicolors',
           'tinymce':'shared/libs/tinymce/tinymce.min'
       },
        shim: {
                backbone: {
                   deps: ['jquery', 'underscore'],
                   exports: 'Backbone'
                },
                underscore: {
                   exports: '_'
                },
                jquery: {
                   exports: 'jQuery'
               },
               'jquery-ui':{
                   deps: ['jquery']
               },
               'jquery.bmsgrid':{
                   deps: ['jquery'],
                   exports: 'jQuery.fn.bmsgrid'
               },
               'jquery.calendario':{
                   deps: ['jquery'],
                   exports: 'jQuery.fn.calendario'
               },
               'jquery.icheck':{
                   deps: ['jquery'],
                   exports: 'jQuery.fn.icheck'
               },
               'jquery.chosen':{
                   deps: ['jquery'],
                   exports: 'jQuery.fn.chosen'
               },
               'jquery.highlight':{
                   deps: ['jquery'],
                   exports: 'jQuery.fn.highlight'
               }
               ,
               'jquery.searchcontrol':{
                   deps: ['jquery']
               },
			   'fileuploader':{
                   deps: ['jquery']
               },
               bootstrap: ['jquery']
               ,
               'bms-filters':{
                   deps: ['jquery','bootstrap']
               },
               'bms-crm_filters':{
                   deps: ['jquery','bootstrap']
               },
               'bms-tags':{
                   deps: ['jquery']
               },
               'bms-addbox':{
                   deps: ['jquery']
               },
               'bms-mergefields':{
                   deps: ['jquery']
               },
               'bms-shuffle':{
                   deps: ['jquery']
               }
               ,
               'bms-mapping':{
                   deps: ['jquery']
               }
               ,
               'daterangepicker':{
                   deps: ['_date','jquery-ui','jquery']
               },
               'bms-dragfile':{
                   deps: ['jquery']
               },
               'datetimepicker':{
                   deps: ['jquery']
               }
               ,
               'jquery.isotope':{
                   deps: ['jquery']
               },
               'jquery.customScroll':{
                   deps: ['jquery']
               }
         }
    });
 
    define(['backbone', 'app', 'router', 'views/main_container'], function (Backbone, app, Router, MainContainer) {
        app.start(Router, MainContainer, function () {                
                Backbone.history.start({pushState: true}); //Start routing
        });
        return app;
    });  

})();