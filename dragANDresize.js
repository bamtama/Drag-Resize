"use strict";
/*
 new dragWidget({
    dom: dom对象,
    parentClassName?: 包裹父层级class,
    resizable?: 是否可拉伸,
    handlers?: 操作边角'n','s','e','w','ne','nw','se','sw', 'all'则表示八方向都可
})
*/
var dragWidget = /** @class */ (function () {
    function dragWidget(opts) {
        var _this_1 = this;
        this._resizeHanlders = [
            'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'
        ];
        this._info = {
            left: 0,
            top: 0,
            height: 0,
            width: 0,
            x: 0,
            y: 0
        };
        this._pInfo = {
            width: 0,
            height: 0
        };
        this._mouseMoveFunc = function (ev) {
            var _a = [ev.clientX, ev.clientY], curx = _a[0], cury = _a[1];
            var _b = [curx - _this_1._info.x, cury - _this_1._info.y], movex = _b[0], movey = _b[1];
            if (_this_1._dom) {
                var cleft = movex + _this_1._info.left;
                var ctop = movey + _this_1._info.top;
                if (_this_1._opts.parentClassName) {
                    var _c = [_this_1._pInfo.height - _this_1._info.height, _this_1._pInfo.width - _this_1._info.width], maxtop = _c[0], maxleft = _c[1];
                    if (cleft < 0) {
                        cleft = 0;
                    }
                    if (ctop < 0) {
                        ctop = 0;
                    }
                    if (cleft > maxleft) {
                        cleft = maxleft;
                    }
                    if (ctop > maxtop) {
                        ctop = maxtop;
                    }
                }
                _this_1._dom.style.left = cleft + 'px';
                _this_1._dom.style.top = ctop + 'px';
            }
        };
        this._resizeByHandlerFunc = function (evt) {
            var changeh = evt.clientY - _this_1._info.y;
            var changew = evt.clientX - _this_1._info.x;
            _this_1._info.y = evt.clientY;
            _this_1._info.x = evt.clientX;
            // 根据父元素进行边界限制
            for (var i = 0; i < _this_1._currentHandler.length; i++) {
                _this_1._resizeChangFromHandler(changeh, changew, _this_1._currentHandler[i]);
            }
            _this_1._dom.style.top = _this_1._info.top + 'px';
            _this_1._dom.style.height = _this_1._info.height + 'px';
            _this_1._dom.style.left = _this_1._info.left + 'px';
            _this_1._dom.style.width = _this_1._info.width + 'px';
        };
        var _this = this;
        this._opts = opts;
        this._dom = this._opts.dom; //document.querySelector(`.${opts.className}`);
        this._id = new Date().getTime().toString();
        this._dom.dataset.id = this._id;
        if (this._opts.parentClassName) {
            var pDom = document.querySelector("." + this._opts.parentClassName);
            this._pInfo = {
                width: pDom ? pDom.clientWidth : 0,
                height: pDom ? pDom.clientHeight : 0
            };
        }
        document.addEventListener('mousedown', function (ev) {
            var isBlock = ev.target && ev.target === _this._dom;
            if (isBlock) {
                Object.assign(_this._info, _this.getDomInfo(_this._dom), {
                    x: ev.clientX,
                    y: ev.clientY
                });
                _this._registerDrag();
            }
        }, false);
        if (this._opts.resizable) {
            this._initResizable();
        }
        _this._unRegister();
    }
    dragWidget.prototype._registerDrag = function () {
        document.addEventListener('mousemove', this._mouseMoveFunc);
    };
    dragWidget.prototype._unRegister = function () {
        var _this = this;
        document.addEventListener('mouseup', function (ev) {
            _this._info = _this.getDomInfo(_this._dom);
            _this._info.x = ev.clientX;
            _this._info.y = ev.clientY;
            document.removeEventListener('mousemove', _this._mouseMoveFunc);
            document.removeEventListener('mousemove', _this._resizeByHandlerFunc);
        });
    };
    dragWidget.prototype._initResizable = function () {
        var _this_1 = this;
        console.log(this._dom);
        var h = [];
        if (this._opts.handlers) {
            if (this._opts.handlers.length === 1 && this._opts.handlers[0] === 'all') {
                h = this._resizeHanlders;
            }
            else {
                h = this._opts.handlers;
            }
        }
        h.forEach(function (val, index) {
            var div = document.createElement('div');
            div.classList.add("widget_resize_" + val);
            div.dataset.handler = val.toString();
            _this_1._dom && _this_1._dom.appendChild(div);
        });
        var _this = this;
        document.addEventListener('mousedown', function (ev) {
            Object.assign(_this._info, _this.getDomInfo(_this._dom), {
                x: ev.clientX,
                y: ev.clientY
            });
            var h = ev.target
                && ev.target.parentNode === _this._dom
                && ev.target.dataset.handler;
            if (h) {
                _this._currentHandler = h;
                _this._info.x = ev.clientX;
                _this._info.y = ev.clientY;
                document.addEventListener('mousemove', _this._resizeByHandlerFunc);
            }
        });
    };
    dragWidget.prototype._resizeChangFromHandler = function (changeh, changew, hanlder) {
        switch (hanlder) {
            case 'n':
                if (this._opts.parentClassName) {
                    if (this._info.top + changeh <= 0 || this._info.height - changeh <= 0) {
                        changeh = 0;
                    }
                }
                this._info.top += changeh;
                this._info.height -= changeh;
                break;
            case 's':
                if (this._opts.parentClassName) {
                    if (this._info.height + this._info.top + changeh >= this._pInfo.height) {
                        changeh = 0;
                    }
                }
                this._info.height += changeh;
                break;
            case 'w':
                if (this._opts.parentClassName) {
                    if (this._info.left + changew <= 0 || this._info.width - changew <= 0) {
                        changew = 0;
                    }
                }
                this._info.width -= changew;
                this._info.left += changew;
                break;
            case 'e':
                if (this._opts.parentClassName) {
                    if (this._info.width + this._info.left + changew >= this._pInfo.width) {
                        changew = 0;
                    }
                }
                this._info.width += changew;
                break;
        }
    };
    dragWidget.prototype.getDomInfo = function (dom) {
        if (dom) {
            var leftstr = getComputedStyle(dom, null)['left'] || '';
            var topstr = getComputedStyle(dom, null)['top'] || '';
            var left = Number(leftstr.replace('px', ''));
            var top_1 = Number(topstr.replace('px', ''));
            var height = dom.clientHeight;
            var width = dom.clientWidth;
            return {
                left: left,
                top: top_1,
                height: height,
                width: width,
                x: 0,
                y: 0
            };
        }
        else {
            return {
                left: 0,
                top: 0,
                height: 0,
                width: 0,
                x: 0,
                y: 0
            };
        }
    };
    return dragWidget;
}());
