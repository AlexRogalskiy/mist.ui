import { Polymer } from '../../node_modules/@polymer/polymer/lib/legacy/polymer-fn.js';
import { dom } from '../../node_modules/@polymer/polymer/lib/legacy/polymer.dom.js';
//import '../../../../color/one-color.js';
Polymer({
    is: 'theme-color',
    properties: {
        color: {
            type: String,
            notify: true
        },
        textColor: {
            type: String,
            notify: true,
            computed: 'computeTextColor(color)'
        },
        outline: {
            type: Boolean
        }
    },
    observers: [
        'colorContent(color)'
    ],
    computeTextColor: function(color) {
        return 'rgb(255,255,255)';
        /*if (this.color) {
            var lightness = one.color(this.color).lightness();
            return (lightness > 0.5) ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)';
        } else {
            return null;
        }*/
    },
    _color: function(node, bgColor, color) {
        node.style.color = color;
        node.style.backgroundColor = bgColor;
        if (this.outline) this._outline(node, bgColor);
    },
    _colorBorder: function(node, borderColor) {
        node.style.borderColor = borderColor;
    },
    _outline: function(node, bgColor) {
        if (one.color(bgColor).lightness() > 0.9) {
            node.style.outline = '1px solid rgba(0,0,0,.25)';
            node.style.outlineOffset = '-1px';
        }
    },
    colorContent: function() {
        if (this.hasAttribute('themed')) this._color(this, this.color, this.textColor);
        if (this.hasAttribute('themed-reverse')) this._color(this, this.textColor, this.color);
        if (this.hasAttribute('themed-border')) this._colorBorder(this, this.color);
        if (this.hasAttribute('themed-border-reverse')) this._colorBorder(this, this.textColor);

        var nodes = dom(this).querySelectorAll('[themed],[themed-reverse],[themed-border],[themed-border-reverse]');
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].hasAttribute('themed')) {
                this._color(nodes[i], this.color, this.textColor);
            } else if (nodes[i].hasAttribute('themed-reverse')) {
                this._color(nodes[i], this.textColor, this.color);
            } else if (nodes[i].hasAttribute('themed-border')) {
                this._colorBorder(nodes[i], this.color);
            } else if (nodes[i].hasAttribute('themed-border-reverse')) {
                this._colorBorder(nodes[i], this.textColor);
            }
        }
    }
});
