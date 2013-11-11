(function () {
   'use strict';
    require.config({  
       deps: ['main'], 
       paths:{
           jquery:'../shared/libs/jquery',
           underscore:'../shared/libs/underscore',
           backbone:'../shared/libs/backbone-min',
           text:'../shared/libs/text',
           router: '../shared/router',
           
           'iframed-app': '../shared/iframed-app',
           'jquery.isotope': '../shared/libs/jquery.isotope.min',
           'jquery.bmsgrid': '../shared/libs/bmsgrid',
           'jquery.calendario': '../shared/libs/jquery.calendario',
           'jquery.chosen': '../shared/libs/chosen.jquery',
           'jquery.highlight': '../shared/libs/jquery.highlight',
           'tinymce': 'https://test.bridgemailsystem.com/tiny_mce/tiny_mce',
           'jquery.searchcontrol': '../shared/libs/jquery.searchcontrol',
           'jquery-ui': '../shared/libs/jquery-ui',
		   'fileuploader': '../shared/libs/jquery.form',
           'bms-filters': '../shared/filters',
           'bms-tags': '../shared/tags',
            bootstrap: '../shared/libs/bootstrap.min'
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
               'jquery.isotope':{
                   deps: ['jquery'],
                   exports: 'jQuery.fn.isotope'
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
               'jquery.chosen':{
                   deps: ['jquery'],
                   exports: 'jQuery.fn.chosen'
               },
               'jquery.highlight':{
                   deps: ['jquery'],
                   exports: 'jQuery.fn.highlight'
               },                                                           
                'tinymce':{
                   deps: ['jquery'],
                   exports: 'jQuery.fn.tinymce'
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
               'bms-tags':{
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