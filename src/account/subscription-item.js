import '../../node_modules/@polymer/paper-item/paper-item.js';
import { Polymer } from '../../node_modules/@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
        <style include="shared-styles">
            :host {
                width: 100%;
            }

            paper-card {
                display: block;
            }

            .plan-action {
                color: var(--green-color);
            }

            .plan-end .plan-action {
                color: var(--red-color);
            }

            .flex-horizontal-with-ratios {
                @apply --layout-horizontal;
            }

            .flexchild {
                @apply --layout-flex;
            }
            paper-item {
                align-items: baseline;
            }
            paper-item.plan-end {
                border-bottom-width: 2px;
                border-color: #ccc;
            }
            h6.absolute-date {
                display: inline;
                opacity: 0.32;
            }
        </style>

        <paper-item class\$="info-item flex-horizontal-with-ratios plan-record [[isExpiringClass]] [[zebraClasses]]">
            <div class="flexchild plan-date">[[dateText]] <h6 class="absolute-date">[[absoluteDateText]]</h6></div>
            <div class="flexchild plan-title text-center"><div class="name">[[titleText]]</div></div>
            <div class="flexchild plan-action text-right">[[subscription.action]]</div>
        </paper-item>
`,

  is: 'subscription-item',

  properties: {
      subscription: {
          type: Object
      },
      index: {
          type: Number
      },
      count: {
          type: Number
      },
      titleText: {
          type: String,
          computed: '_computeTitleText(subscription.title, subscription)'
      },
      dateText: {
          type: String,
          computed: '_computeDateText(subscription.time)'
      },
      absoluteDateText: {
          type: String,
          computed: '_computeAbsoluteDDateText(subscription.time)'
      },
      isExpiringClass: {
          type: String,
          computed: '_computeIsExpiringClass(subscription.action)'
      },
      zebraClasses: {
          type: String,
          computed: '_computeZebraClasses(index, count)'
      }
  },

  ready: function() {

  },

  _computeZebraClasses: function(index, count) {
      var classes = [];
      classes.push(
          (index + 1) % 2 == 0 ? 'even' : 'odd',
          index + 1 == count ? 'last' : null
      );
      return classes.join(' ');
  },

  _computeTitleText: function(title, subscription) {
      var ret = title;
      if (subscription.promo_code)
          ret += ' (promo)';
      return ret;
  },

  _computeDateText: function(time) {
      var date = new Date(time * 1000);
      return moment(time *1000).fromNow();

  },

  _computeAbsoluteDDateText: function(time) {
      var date = new Date(time * 1000);
      return moment().format("MMMM") +' '+ date.getDate() +' '+ date.getFullYear();

  },

  _computeIsExpiringClass: function(action) {
      return action == 'started' ? null : 'plan-end';
  }
});
