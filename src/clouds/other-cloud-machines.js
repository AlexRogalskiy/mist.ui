import '../../node_modules/@polymer/polymer/polymer-legacy.js';
import '../../node_modules/@polymer/paper-styles/typography.js';
import '../../node_modules/@mistio/mist-list/mist-list.js';
import './other-cloud-machine-actions.js';
import { Polymer } from '../../node_modules/@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
        <h3>Hosts</h3>
        <p>Select any host to remove it from this cloud.</p>
        <other-cloud-machine-actions items="[[selectedMachineItems]]" actions="{{machineActions}}">
            <mist-list id\$="otherServerMachinesList_[[cloud.id]]" selectable="" column-menu="" multi-sort="" resizable="" searchable="" item-map="[[machines]]" name="Machines" selected-items="{{selectedMachineItems}}" frozen="[[_getFrozenLogColumn()]]" visible="[[_getVisibleColumns()]]" renderers="[[_getRenderers()]]" actions="[[machineActions]]">
            </mist-list>
        </other-cloud-machine-actions>
`,

  is: 'other-cloud-machines',

  properties: {
      cloud:  {
          type: Object
      },
      model:  {
          type: Object
      },
      machines: {
          type: Array,
          computed: '_computeMachines(cloud, model.machines, model.machines.*)'
      },
      machineActions: {
          type: Array
      },
      selectedMachineItems: {
          type: Array,
          value: function () { return []; }
      }
  },

  listeners: {
      'select-action': 'selectAction'
  },

  observers: [
      'machinesChanged(cloud.*, cloud.machines.*)'
  ],

  machinesChanged: function(c,m){
      if (this.shadowRoot.querySelector('mist-list'))
          this.shadowRoot.querySelector('mist-list').fire('resize');
  },

  _computeMachines: function (cloud) {
      if (cloud.provider != "libvirt") {
          return this.cloud.machines || {};
      } else {
          // filter kvm hosts and push back to object
          var ms = Object.values(this.cloud.machines).filter(function(m){
              return m.extra && m.extra.tags && m.extra.tags.type && m.extra.tags.type == "hypervisor";
          });
          var ret = {};
          for (var i=0; i<ms.length; i++) {
              ret[ms[i].id] = ms[i];
          }
          return ret;
      }
  },

  _getFrozenLogColumn: function(){
      return ['name'];
  },

  _getVisibleColumns: function(){
      return ['state', 'id', 'missing_since', 'public_ips', 'tags'];
  },

  _getRenderers: function() {
      var _this = this;
      return {
          'name': {
              'body': function(item) {
                  return '<strong class="name">' + item + '</strong>';
              }
          },
          'missing_since': {
              'title': function(item, row){
                  return 'missing since';
              },
              'body': function(item, row) {
                  return item;
              }
          },
          'public_ips': {
              'title': function(item, row){
                  return 'public IP';
              },
              'body': function(item, row) {
                  return item[0];
              }
          },
          'tags': {
              'body': function(item, row) {
                  var tags = item,
                      display = "";
                  for (var i=0; i<tags.length; i++){
                      display += "<span class='tag'>"+tags[i].key;
                      if (tags[i].value != undefined && tags[i].value != "")
                      display += "=" + tags[i].value;
                      display += "</span>";
                  }
                  return display;
              }
          }
      }
  },

  // redirect events
  selectAction: function(e) {
      e.stopImmediatePropagation();
      if (this.shadowRoot.querySelector('other-cloud-machine-actions')) {
          this.shadowRoot.querySelector('other-cloud-machine-actions').selectAction(e);
      }
  }
});
