/*
 *Created by : Umair Shahid
 *Version: 1 */

!function ($) {
  "use strict"; // jshint ;_;

  var Filters = function (element, options) {
    this.init(element, options)
  }

  Filters.prototype = {

    constructor: Filters

  , init: function (element, options) {           
      this.$element = $(element)
      this.options = this.getOptions(options)      
      this.$element.append($(this.options.template))
    }
  , getOptions: function (options) {
      options = $.extend({}, $.fn.filters.defaults, options)    
      return options
    }
  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    }
  }

 /* FILTER PLUGIN DEFINITION
  * ========================= */

  $.fn.filters = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('filters')
        , options = typeof option == 'object' && option
      if (!data) $this.data('filters', (data = new Filters(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.filters.Constructor = Filters

  $.fn.filters.defaults = {
    template: '<div class="timeline"><div class="filter-div"></div></div>'
  , title: ''
  }

}(window.jQuery);