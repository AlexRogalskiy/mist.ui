import '../../node_modules/@polymer/paper-material/paper-material.js';
import '../../node_modules/@polymer/paper-button/paper-button.js';
import '../../node_modules/@polymer/paper-progress/paper-progress.js';
import '../../node_modules/@polymer/paper-styles/typography.js';
import '../app-form/app-form.js';
import { Polymer } from '../../node_modules/@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
SCHEDULEACTIONS = {
    'reboot': {
        'name': 'reboot',
        'icon': 'av:replay',
        'confirm': true,
        'multi': true
    },
    'start': {
        'name': 'start',
        'icon': 'av:replay',
        'confirm': true,
        'multi': true
    },
    'stop': {
        'name': 'stop',
        'icon': 'av:stop',
        'confirm': true,
        'multi': true
    },
    'suspend': {
        'name': 'suspend',
        'icon': 'av:stop',
        'confirm': true,
        'multi': true
    },
    'resume': {
        'name': 'resume',
        'icon': 'av:replay',
        'confirm': true,
        'multi': true
    },
    'undefine': {
        'name': 'undefine',
        'icon': 'image:panorama-fish-eye',
        'confirm': true,
        'multi': true
    },
    'destroy': {
        'name': 'destroy',
        'icon': 'delete',
        'confirm': true,
        'multi': true
    },
    'run-script': {
        'name': 'run script',
        'icon': 'image:movie-creation',
        'confirm': true,
        'multi': false
    }
};

Polymer({
  _template: html`
        <style include="shared-styles forms single-page">
            #content {
                max-width: 900px;
            }

            paper-material {
                display: block;
                padding: 24px;
            }

            paper-progress {
                position: absolute;
                bottom: 85px;
                width: 100%;
                left: 0;
                right: 0;
            }

            app-form::slotted(#schedule_entry_interval_period) {
                width: 70px;
            }

            .single-head {
                @apply --schedule-page-head-mixin
            }
        </style>
        <div id="content">
            <paper-material class="single-head layout horizontal">
                <span class="icon">
                    <iron-icon icon="[[section.icon]]"></iron-icon>
                </span>
                <div class="title flex">
                    <h2>
                        Add Schedule
                    </h2>
                    <div class="subtitle">
                    </div>
                </div>
            </paper-material>
            <paper-material>
                <app-form id="scheduleAddForm" fields="{{fields}}" form="[[schedule]]" url="/api/v1/schedules" on-response="_handleAddScheduleResponse" on-error="_handleError"></app-form>
            </paper-material>
        </div>
`,

  is: 'schedule-add',

  properties: {
      section: {
          type: Object
      },
      model: {
          type: Object
      },
      schedule: {
          type: Object
      },
      currency: {
          type: Object
      },
      fields: {
          type: Array,
          computed: '_computeFields(currency)',
          notify: true
      },
      actions: {
          type: Array,
          computed: "_computeActions(model.machines)"
      },
      docs: {
          type: String,
          value: ''
      }
  },

  observers: [
      '_fieldsChanged(fields.*)',
      '_updateFields(fields, model.*)'
  ],

  listeners: {
      'add-input': 'addInput'
  },

  ready: function(){
      if (!this.docs && this.fields) {
          for (var i=0; i < this.fields.length; i++) {
              this.fields[i].helpHref = '';
          }
      }
  },

  _computeFields: function(currency) {
      if (currency) {
          return [{
              name: "name",
              label: "Name *",
              type: "text",
              value: "",
              defaultValue: "",
              placeholder: "",
              errorMessage: "Please enter schedule's name.",
              show: true,
              required: true,
              helptext: ""
          }, {
              name: "description",
              label: "Description",
              type: "text",
              value: "",
              defaultValue: "",
              show: true,
              required: false,
              helptext: "Optional. Helpful descriptions improve a team's workflows."
          }, {
              name: "task_enabled",
              label: "Enabled",
              type: "toggle",
              value: true,
              defaultValue: true,
              show: true,
              required: false,
              helptext: "You can save your schedule and enable it later."
          }, {
              name: "action",
              label: "Task",
              type: "dropdown",
              value: "",
              defaultValue: "",
              show: true,
              required: true,
              helptext: "Choose one from the available tasks to schedule.",
              options: [],
          }, {
              name: "script_id",
              label: "Script",
              type: "mist_dropdown",
              value: "",
              defaultValue: "",
              add: true,
              show: false,
              required: true,
              helptext: "Schedule an existing script to run.",
              options: [],
              showIf: {
                  fieldName: "action",
                  fieldValues: ["run script"]
              }
          }, {
              name: "params",
              label: "Parameters",
              type: "textarea",
              value: "",
              defaultValue: "",
              helptext: "",
              show: false,
              required: false,
              showIf: {
                  fieldName: "action",
                  fieldValues: ["run script"]
              }
          }, {
              name: "ids_or_tags",
              label: "Specific machines or machines with tags",
              type: "radio",
              value: "tags",
              defaultValue: "tags",
              show: true,
              required: false,
              excludeFromPayload: true,
              helptext: "The scheduled task can run either on specific machines, or on machines with the specified tags at the scheduled time",
              class: "bind-bottom radio-highight",
              options: [{
                  title: "Specific Machines",
                  val: "ids"
              }, {
                  title: "Machines with tags",
                  val: "tags"
              }]
          }, {
              name: "machines_uuids",
              label: "Machines",
              // type: "mist_dropdown",
              type: "checkboxes",
              value: "",
              defaultValue: "",
              show: true,
              required: true,
              excludeFromPayload: true,
              helptext: "Select specific machines to be included in scheduler.",
              options: [],
              class: "bind-both background",
              showIf: {
                  fieldName: "ids_or_tags",
                  fieldValues: ["ids"]
              }
          }, {
              name: "machines_tags",
              label: "Machines with tags",
              type: "textarea",
              value: "",
              defaultValue: "",
              show: true,
              required: true,
              excludeFromPayload: true,
              helptext: "Scheduler will include all machines with the specified tags. Alphanumerical only.",
              class: "bind-both background",
              showIf: {
                  fieldName: "ids_or_tags",
                  fieldValues: ["tags"]
              }
          }, {
              name: "machines_selectors_age_more_value",
              label: "which are older than",
              type: "text",
              value: "",
              defaultValue: "",
              show: true,
              required: false,
              pattern: "[0-9]*",
              errorMessage: "Please enter numbers only!",
              excludeFromPayload: true,
              helptext: "",
              class: "bind-both background",
          }, {
              name: "machines_selectors_age_more_unit",
              label: "",
              type: "radio",
              value: "days",
              defaultValue: "days",
              show: true,
              required: false,
              excludeFromPayload: true,
              helptext: "Apply an extra filter to apply the schedule to machines having been created longer than a time period ago",
              options: [{
                  val: 'minutes',
                  title: 'minutes'
              }, {
                  val: 'hours',
                  title: 'hours'
              }, {
                  val: 'days',
                  title: 'days'
              }],
              class: "bind-both background",
          }, {
              name: "machines_selectors_cost",
              label: "and cost more than",
              type: "text",
              value: null,
              defaultValue: "",
              show: true,
              required: false,
              suffix: this.currency.sign+'/month',
              pattern: "[0-9]*",
              errorMessage: "Please enter numbers only!",
              excludeFromPayload: true,
              helptext: "Apply an extra filter of costing more than a certain ammount of "+this.currency.sign+" per month",
              class: "bind-top background",
          }, {
              name: "selectors",
              label: "machines selectors",
              type: "text",
              value: [],
              defaultValue: [],
              show: false,
              required: true,
              excludeFromPayload: false
          }, {
              name: "schedule_type",
              label: "Schedule Type",
              type: "radio",
              value: "one_off",
              defaultValue: "one_off",
              helptext: "The scheduler type. Visit the docs ",
              helpHref: "http://docs.mist.io/article/151-scheduler",
              show: true,
              required: true,
              class: "bind-bottom radio-highight",
              options: [{
                  title: "Once",
                  val: "one_off"
              }, {
                  title: "Repeat",
                  val: "interval"
              }, {
                  title: "Crontab",
                  val: "crontab"
              }]
          }, {
              name: "schedule_entry",
              label: "Schedule time",
              type: "text",
              value: null,
              defaultValue: "",
              helptext: "",
              show: false,
              required: true
          }, {
              name: "schedule_entry_interval_every",
              label: "Interval",
              type: "text",
              value: "10",
              defaultValue: "",
              excludeFromPayload: true,
              pattern: "[0-9]*",
              errorMessage: "Please enter numbers only!",
              class: "bind-both background",
              show: true,
              required: true,
              helptext: "Example, every 10 minutes",
              showIf: {
                  fieldName: "schedule_type",
                  fieldValues: ["interval"]
              }
          }, {
              name: "schedule_entry_interval_period",
              type: "radio",
              value: "minutes",
              defaultValue: "minutes",
              excludeFromPayload: true,
              class: "bind-top background",
              show: true,
              required: false,
              showIf: {
                  fieldName: "schedule_type",
                  fieldValues: ["interval"]
              },
              options: [{ //days, hours, minutes, seconds, microseconds
                  title: "days",
                  val: "days"
              }, {
                  title: "hours",
                  val: "hours"
              }, {
                  title: "mins",
                  val: "minutes"
              }]
          }, {
              name: "schedule_entry_crontab",
              label: "Crontab",
              type: "text",
              value: "*/10 * * * *",
              defaultValue: "",
              helptext: "",
              excludeFromPayload: true,
              class: "bind-top background",
              show: true,
              required: false,
              helptext: "UTC Time only. Example: */10 * * 1 *, is every 10 minutes on the 1st of each month. Relative periods: Minute, Hour, Day of the Month, Month of the Year, Day of the Week.",
              helpHref: "http://docs.celeryproject.org/en/latest/userguide/periodic-tasks.html#crontab-schedules",
              showIf: {
                  fieldName: "schedule_type",
                  fieldValues: ["crontab"]
              }
          }, {
              name: "schedule_entry_one_off",
              label: "",
              type: "date",
              value: "",
              defaultValue: "",
              validate: "inFuture",
              class: "bind-top background",
              icon: "schedule",
              excludeFromPayload: true,
              show: true,
              required: false,
              showIf: {
                  fieldName: "schedule_type",
                  fieldValues: ["one_off"]
              }
          }, {
              name: "start_after",
              label: "Starts",
              type: "date",
              value: "",
              placeholder: "now",
              defaultValue: "",
              validate: "inFuture",
              helptext: "",
              icon: "schedule",
              show: false,
              required: false,
              disabled: false,
              showIf: {
                  fieldName: "schedule_type",
                  fieldValues: ["interval", "crontab"]
              }
          }, {
              name: "expires",
              label: "Expires",
              type: "date",
              value: "",
              placeholder: "never",
              excludeFromPayload: true,
              defaultValue: "",
              validate: "inFuture",
              helptext: "",
              icon: "schedule",
              show: true,
              required: false,
              disabled: true,
              showIf: {
                  fieldName: "schedule_type",
                  fieldValues: ["interval", "crontab"]
              }
          }, {
              name: "max_run_count",
              label: "Maximum Run Count",
              type: "text",
              value: "",
              defaultValue: "",
              excludeFromPayload: true,
              disabled: true,
              show: true,
              required: false,
              helptext: "Optional. Integers only. Define a maximum run count, unless it's an one_of schedule.",
              showIf: {
                  fieldName: "schedule_type",
                  fieldValues: ["interval", "crontab"]
              }
          }, {
              name: "run_immediately",
              label: "Run once immediately",
              type: "toggle",
              value: false,
              defaultValue: false,
              show: true,
              required: false,
              helptext: "Set to true to run the scheduled task once upon creation and then as scheduled.",
              showIf: {
                  fieldName: "schedule_type",
                  fieldValues: ["interval", "crontab"]
              }
          }]
      } else {
          return [];
      }
  },

  _computeActions: function (machines) {
      var ret = ['start', 'stop', 'reboot', 'destroy', 'run-script']; //'suspend', 'resume',

      var actions = [];
      for (var i = 0; i < ret.length; i++) {
          var act = SCHEDULEACTIONS[ret[i]];
          var transformRet = {
              title: act.name.toUpperCase(),
              val: act.name,
              icon: act.icon
          };
          actions.push(transformRet);
      }

      return actions;
  },

  _updateFields: function (fields, model) {
      if (this.model && this.fields) {
          var _this = this;
          this.fields.forEach(function (f, index) {
              if (f.name == "script_id") {
                  f.options = this.model.scriptsArray || [];
              }

              if (f.name == "machines_uuids") {
                  f.options = this.model && this.model.machines && Object.keys(this.model.machines).map(function(m) {
                          var machine = _this.model.machines[m];
                          if (machine && _this.model.clouds[machine.cloud]) {
                              return {
                                  id: m,
                                  name: machine.name,
                                  img: 'assets/providers/provider-' + _this.model.clouds[machine.cloud].provider.replace('_', '') + '.png'
                              }
                          }
                      }) || [];
                  this._updateCheckboxes();
              }

              if (f.name.startsWith("action")) {
                  f.options = this.actions;
              }
          }, this);
      }
  },

  _updateCheckboxes: function () {
      //check if any checkboxes are selected
      var checkedMachines = this.get('fields.' + this._fieldIndexByName("machines_uuids") +
          '.value');
      //if there are selected checkboxes, keep selection on update
      if (checkedMachines && checkedMachines.length) {
          var checkboxes = this.$.scheduleAddForm.shadowRoot.querySelectorAll('paper-checkbox[name="machines_uuids"]');
          [].forEach.call(checkboxes, function (el, index) {
              if (checkedMachines.indexOf(el.id) > -1)
                  el.checked = true;
              else
                  el.checked = false;
          });
      }
  },

  _fieldsChanged: function (changeRecord) {
      // console.log('changeRecord', changeRecord);
      if (changeRecord.path.endsWith('.value') && changeRecord.path.split('.value').length < 3) {

          // selecting action
          if (this.get(changeRecord.path.replace('.value', '')).name == "action") {
              var actionInd = this._fieldIndexByName("action"),
                  scriptInd = this._fieldIndexByName("script_id");
              if (changeRecord.value == "run script") {
                  this.set('fields.' + actionInd + '.excludeFromPayload', true);
                  this.set('fields.' + scriptInd + '.excludeFromPayload', false);
              }
              if (changeRecord.value != "run script") {
                  this.set('fields.' + actionInd + '.excludeFromPayload', false);
                  this.set('fields.' + scriptInd + '.excludeFromPayload', true);
              }
          }

          // selecting uuids or tags
          if (this.get(changeRecord.path.replace('.value', '')).name == "ids_or_tags") {
              var condsInd = this._fieldIndexByName("selectors"),
                  uuidsInd = this._fieldIndexByName("machines_uuids"),
                  tagstInd = this._fieldIndexByName("machines_tags");

              if (changeRecord.value == "ids") {
                  this._removeObjectFromSelectors('tags');
              } else if (changeRecord.value == "tags") {
                  this._removeObjectFromSelectors('machines');

                  // clear checkbox selection
                  this.set('fields.' + uuidsInd + '.value', []);
                  var checkboxes = this.$.scheduleAddForm.querySelectorAll('paper-checkbox');
                  [].forEach.call(checkboxes, function (el, index) {
                      el.checked = false;
                  });
              }
          }

          // changing uuids
          if (this.get(changeRecord.path.replace('.value', '')).name.startsWith("machines_uuids")) {
              // console.log('changeRecord.value', changeRecord.value);
              this._updateObjectInSelectors('machines', 'ids', changeRecord.value);
              this._removeObjectFromSelectors('tags');
          }

          // changing tags
          if (this.get(changeRecord.path.replace('.value', '')).name.startsWith("machines_tags")) {
              var textToArray = changeRecord.value.split(',');
              this._updateObjectInSelectors('tags', 'include', this._constructTagsValue(textToArray));
              this._removeObjectFromSelectors('machines');
          }

          // changing age selectors
          if (this.get(changeRecord.path.replace('.value', '')).name.startsWith(
                  "machines_selectors_age_more_")) {
              var condsInd = this._fieldIndexByName("selectors"),
                  perInd = this._fieldIndexByName("machines_selectors_age_more_unit"),
                  numInd = this._fieldIndexByName("machines_selectors_age_more_value"),
                  key = this.get('fields.' + perInd + '.value'),
                  num = parseInt(this.get('fields.' + numInd + '.value')),
                  value;

              if (!changeRecord.value.length || !key.length || !parseInt(num)) {
                  //clear selectors
                  this._removeObjectFromSelectors('age');
              } else {
                  this._updateAgeSelector(condsInd, key, num);
              }
          }

          // changing cost selectors
          if (this.get(changeRecord.path.replace('.value', '')).name.startsWith(
                  "machines_selectors_cost")) {
              var condsInd = this._fieldIndexByName("selectors"),
                  costInd = this._fieldIndexByName("machines_selectors_cost");

              if (!changeRecord.value.length || !parseInt(changeRecord.value)) {
                  //clear cost selector
                  this._removeObjectFromSelectors('cost__monthly')
              } else {
                  this._updateObjectInSelectors('cost__monthly', 'value', parseInt(changeRecord.value),
                      'gt')
              }
          }

          // initial values in shedule entry
          if (this.get(changeRecord.path.replace('.value', '')).name == "schedule_type") {
              var entryInd = this._fieldIndexByName("schedule_entry"),
                  expInd = this._fieldIndexByName("expires"),
                  entryCronTabInd = this._fieldIndexByName("schedule_entry_crontab"),
                  maxcountInd = this._fieldIndexByName("max_run_count"),
                  runImmediatelyInd = this._fieldIndexByName("run_immediately"),
                  entry;

              if (changeRecord.value == "interval") {
                  entry = this._processInterval();
                  this.set('fields.' + expInd + '.disabled', false);
                  this.set('fields.' + maxcountInd + '.disabled', false);
                  this.set('fields.' + maxcountInd + '.value', "");
              } else if (changeRecord.value == "crontab") {
                  entry = this._processCrontab(this.get('fields.' + entryCronTabInd + '.value'));
                  this.set('fields.' + expInd + '.disabled', false);
                  this.set('fields.' + maxcountInd + '.disabled', false);
                  this.set('fields.' + maxcountInd + '.value', "");
              } else if (changeRecord.value == "one_off") {
                  entry = this.get('fields.' + entryInd + '.value');
                  this.set('fields.' + expInd + '.disabled', true);
                  this.set('fields.' + maxcountInd + '.value', 1);
                  this.set('fields.' + maxcountInd + '.disabled', true);
                  this.set('fields.' + runImmediatelyInd + '.value', false);
                  entry = moment.unix(entry/1000).utc().format("MM/DD/YYYY HH:MM");
              }
              this.set('fields.' + entryInd + '.value', entry);
          }

          // date in shedule entry
          if (this.get(changeRecord.path.replace('.value', '')).name == "schedule_entry_one_off") {
              var entryInd = this._fieldIndexByName("schedule_entry");
              this.set('fields.' + entryInd + '.value', moment.unix(changeRecord.value/1000).utc().format("YYYY-MM-DD HH:mm:ss"));
          }

          // crontab in schedule entry
          if (this.get(changeRecord.path.replace('.value', '')).name == "schedule_entry_crontab") {
              var entryInd = this._fieldIndexByName("schedule_entry");
              this.set('fields.' + entryInd + '.value', this._processCrontab(changeRecord.value));
          }

          // interval changes in schedule entry
          if (this.get(changeRecord.path.replace('.value', '')).name.startsWith(
                  "schedule_entry_interval_")) {
              var entryInd = this._fieldIndexByName("schedule_entry");
              this.set('fields.' + entryInd + '.value', this._processInterval());
          }

          if (this.get(changeRecord.path.replace('.value', '')).name == "expires") {
              var expiresInd = this._fieldIndexByName("expires");
              var excludeFromPayload = changeRecord.value == "" && true || false;
              this.set('fields.' + expiresInd + '.excludeFromPayload', excludeFromPayload);
              if (!excludeFromPayload) {
                  this.set('fields.' + expiresInd + '.value', moment.unix(changeRecord.value/1000).utc().format("YYYY-MM-DD HH:mm:ss"));
              }
          }

          if (this.get(changeRecord.path.replace('.value', '')).name == "start_after") {
              var startAfterInd = this._fieldIndexByName("start_after");
              var excludeFromPayload = changeRecord.value == "" && true || false;
              this.set('fields.' + startAfterInd + '.excludeFromPayload', excludeFromPayload);
              if (!excludeFromPayload) {
                  this.set('fields.' + expiresInd + '.value', moment.unix(changeRecord.value/1000).utc().format("YYYY-MM-DD HH:mm:ss"));
              }
          }

          if (this.get(changeRecord.path.replace('.value', '')).name == "max_run_count") {
              var maxcountInd = this._fieldIndexByName("max_run_count");
              if (typeof (this.get('fields.' + maxcountInd + '.value')) != 'number') {
                  if (parseInt(changeRecord.value) == NaN) {
                      this.set('fields.' + maxcountInd + '.excludeFromPayload', true);
                      this.set('fields.' + maxcountInd + '.value', "");
                  } else {
                      this.set('fields.' + maxcountInd + '.excludeFromPayload', false);
                      this.set('fields.' + maxcountInd + '.value', parseInt(changeRecord.value));
                  }
              }
          }
      }
  },

  _updateAgeSelector: function (index, key, value) {
      var minutes;
      if (key == 'minutes')
          minutes = value;
      else if (key == 'hours')
          minutes = value * 60;
      else if (key == 'days')
          minutes = value * 60 * 24;

      if (minutes)
          this._updateObjectInSelectors('age', 'minutes', minutes);
      // this.set('fields.'+ index +'.value', [{'type': 'age', 'field': 'age', 'minutes': minutes}]);
  },

  _updateObjectInSelectors: function (field, attr, value, operator) {
      // console.log('_updateObjectInSelectors', field, attr, value, operator);
      var selectors = this.get('fields.' + this._fieldIndexByName("selectors") + '.value'),
          selectorsField = selectors.find(function (con) {
              return ['age', 'machines', 'tags'].indexOf(field) == -1 ? con.field == field :
                  con.type == field;
          }),
          index = selectors.indexOf(selectorsField);
      // console.log('index', index);
      if (index > -1) {
          this.set('fields.' + this._fieldIndexByName("selectors") + '.value.' + index + '.' +
              attr, value);
      } else {
          this._addObjectInSelectors(field, value, operator);
      }

  },

  _addObjectInSelectors: function (field, value, operator) {
      var newSelector;
      if (field == 'age') {
          newSelector = {
              type: 'age',
              minutes: value
          };
      } else if (field == 'machines') {
          newSelector = {
              type: 'machines',
              ids: value
          };
      } else if (field == 'tags') {
          newSelector = {
              type: 'tags',
              include: value
          };
      } else {
          newSelector = {
              type: 'field',
              field: field,
              value: value
          };
          if (operator)
              newSelector['operator'] = operator;
      }
      this.push('fields.' + this._fieldIndexByName("selectors") + '.value', newSelector);
  },

  _removeObjectFromSelectors: function (field) {
      var selectors = this.get('fields.' + this._fieldIndexByName("selectors") + '.value'),
          field = selectors.find(function (con) {
              return ['age', 'machines', 'tags'].indexOf(field) == -1 ? con.field == field :
                  con.type == field;
          }),
          index = selectors.indexOf(field);

      if (index > -1)
          this.splice('fields.' + this._fieldIndexByName("selectors") + '.value', index, 1);
  },

  _processInterval: function () {
      var everyInd = this._fieldIndexByName("schedule_entry_interval_every");
      var periodInd = this._fieldIndexByName("schedule_entry_interval_period");

      var interval = {
          'every': this.get('fields.' + everyInd + '.value'),
          'period': this.get('fields.' + periodInd + '.value')
      };

      return interval;
  },

  _processCrontab: function (entry) {
      var chunchs = entry.split(" ");
      // "minute" : "30", "hour" : "2", "day_of_week" : "*", "day_of_month" : "*", "month_of_year" : "*"
      // fill in missing
      for (var i = 0; i < 5; i++) {
          if (!chunchs[i])
              chunchs[i] = "*"
      }
      var diff = moment().utcOffset() / 60;
      var construct = {
          'minute': chunchs[0],
          'hour': chunchs[1],
          'day_of_month': chunchs[2],
          'month_of_year': chunchs[3],
          'day_of_week': chunchs[4],
      };
      if (construct.hour != "*" && parseInt(chunchs[1]) && diff) {
          construct.hour = ((parseInt(chunchs[1]) - diff) % 24).toString();
      }
      return construct;
  },

  _constructTagsValue: function (tagStringsArray) {
      var arr = {};
      tagStringsArray.forEach(function (string) {
          var chunks = string.split("=");
          if (chunks.length > 0 && chunks[0].trim().length > 0) {
              var key = chunks[0].trim();
              arr[key] = "";
              if (chunks.length > 1)
                  arr[key] = chunks[1].trim();
          }
      });
      return arr;
  },

  _handleAddScheduleResponse: function (e) {
      var response = YAML.parse(e.detail.xhr.response);
      this.async(function () {
          this.dispatchEvent(new CustomEvent('go-to', { bubbles: true, composed: true, detail: {
              url: '/schedules/' + response.id
          } }));

      }, 500)
  },

  _handleError: function (e) {
      // console.log(e);
      this.$.errormsg.textContent = e.detail.request.xhr.responseText;
      this.set('formError', true);
  },

  _fieldIndexByName: function (name) {
      return this.fields.findIndex(function (f) {
          return f.name == name;
      });
  },

  _goBack: function () {
      history.back();
  },

  updateScripts: function (e) {
      // console.log('updateScripts', e)
      var scriptInd = this._fieldIndexByName("script_id");
      this.async(function () {
          this.set('fields.' + scriptInd + '.options', this.model.scriptsArray);
          this.set('fields.' + scriptInd + '.value', e.detail.script);
      }.bind(this), 1000);
  },

  addInput: function (e) {
      if (e.detail.fieldname == 'script_id') {
          //set attribute origin
          var origin = window.location.pathname;
          var qParams = {
              'origin': origin
          }
          this.dispatchEvent(new CustomEvent('go-to', { bubbles: true, composed: true, detail: {
              url: '/scripts/+add',
              params: qParams
          } }));

      }
  }
});
