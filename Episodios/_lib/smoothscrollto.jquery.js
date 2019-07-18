/*
 *  jquery-smoothScrollTo
 *
 *  ES5 version
 *
 *  Created by Bastiaan ten Klooster
 *  http://www.bastiaan.io
 *
 *  Under MIT License
 */
;(function ($, window, document) {

    'use strict';

    // Create the defaults once
    var pluginName = "smoothScrollTo",
        defaults = {
            offset: 0, // Scroll in addition to the elements top offset
            duration: function duration(distance) {
                return 0;
            },
            highlight: false,
            highlightClass: 'scroll-to-highlight',
            highlightStopEvent: 'transitionend',
            offsetFunction: 'offset', // [offset|position]
            limitScroll: false, // Requires html and body to have height 100%
            done: $.noop,
            fail: $.noop,
            always: $.noop
        };

    // Plugin constructor
    function Plugin(element, options) {
        this.element = element;

        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    $.extend(Plugin.prototype, {
        init: function init() {
            var plugin = this;

            var duration = this.duration();

            var scrollAnimation = this.scroll(duration);

            // Only fire promise callbacks, not animation callbacks to prevent duplicate events (html, body)
            scrollAnimation.promise().done(plugin.settings.done).fail(plugin.settings.fail).always(plugin.settings.always).done(function () {
                plugin.highlight.call(plugin);
            });
        },

        // Start scroll animation
        scroll: function scroll(duration) {
            return $('html, body').animate({
                scrollTop: this.limitScroll(this.offset())
            }, $.extend({}, this.settings, {
                duration: this.duration(),
                // Do not fire default callbacks
                done: $.noop, fail: $.noop, always: $.noop
            }));
        },

        highlight: function highlight() {
            var _this = this;

            var $element = $(this.element);

            $element.addClass(this.settings.highlightClass);

            $element.one(this.settings.highlightStopEvent, function (event) {
                $(event.currentTarget).removeClass(_this.settings.highlightClass);
            });
        },

        // Allow duration to be function or number
        duration: function duration() {
            if (typeof this.settings.duration === 'function') {
                return this.settings.duration.call(this, this.distance());
            }

            return this.settings.duration;
        },

        // Calculate absolute distance to scroll
        distance: function distance() {
            return Math.abs(this.limitScroll(this.offset()) - $('html, body').scrollTop());
        },

        limitScroll: function limitScroll(distance) {
            return this.settings.limitScroll ? Math.min(distance, $(document).height() - $(window).height()) : distance;
        },

        offset: function offset() {
            return $(this.element)[this.settings.offsetFunction]().top + this.settings.offset;
        }
    });

    $.fn[pluginName] = function (options) {
        return this.first().each(function () {
            $.data(this, "plugin_" + pluginName, new Plugin(this, options));
        });
    };
})(jQuery, window, document);
