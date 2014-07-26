define(['text!autobots/html/targets.html', 'moment'],
        function(template, moment) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Target li view for nurture track 
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                tagName: 'tr',
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    'click .btn-red': 'removeLi'
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function() {
                    this.template = _.template(template);
                    this.parent = this.options.page
                    this.app = this.parent.app;
                    this.editable = this.options.editable;
                    this.target = null;
                    this.render();
                },
                /**
                 * Render view on page.
                 */
                render: function() {
                    this.$el.html(this.template({
                        model: this.model,
                        countDate: this.getDate()
                    }));

                },
                /**
                 * Render date as .
                 */
                getDate: function() {
                    var _date = moment(this.app.decodeHTML(this.model.get("updationDate")), 'YYYY-M-D');
                    return {date: _date.format("DD MMM, YYYY")};

                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function() {

                },
                removeLi: function() {
                    this.$el.remove();
                    if (this.parent.targets) {
                        _.each(this.parent.targets, function(val, key) {
                            if (val[0].checksum == this.model.get("filterNumber.checksum")) {
                                delete  this.parent.targets[key];
                                this.parent.targetsModelArray.splice(key, 1);
                                return {};
                            }
                        }, this);
                    }
                    this.parent.saveTargets();
                }

            });
        });