/*
 new dragWidget({
    dom: dom对象,
    parentClassName?: 包裹父层级class,
    resizable?: 是否可拉伸,
    handlers?: 操作边角'n','s','e','w','ne','nw','se','sw', 'all'则表示八方向都可
})
*/
class dragWidget {
    _resizeHanlders: Array<String> = [
        'n','s','e','w','ne','nw','se','sw'
    ];
    _currentHandler: String | undefined;
    _dom: HTMLElement | null;
    _id: string | undefined;
    _info: any = {
        left: 0,
        top: 0,
        height: 0,
        width: 0,
        x: 0,
        y: 0
    };
    _pInfo: any = {
        width: 0,
        height: 0
    }
    _opts: any | {
        dom: Element | null,
        parentClassName?: string | undefined,
        resizable?: boolean,
        handlers?: Array<string>
    };
    
    constructor(opts: any) {
        let _this = this;
        this._opts = opts;
        this._dom = this._opts.dom; //document.querySelector(`.${opts.className}`);
        this._id = new Date().getTime().toString();
        (<HTMLElement>this._dom).dataset.id = this._id;

        if (this._opts.parentClassName) {
            let pDom = document.querySelector(`.${this._opts.parentClassName}`)
            this._pInfo = {
                width: pDom ? pDom.clientWidth : 0,
                height: pDom ? pDom.clientHeight: 0
            }
        }
        document.addEventListener('mousedown', function (this, ev) {
            let isBlock = ev.target && (<HTMLElement>ev.target) === _this._dom;
            if (isBlock) {
                (<any>Object).assign(_this._info,_this.getDomInfo(_this._dom),{
                    x: ev.clientX,
                    y: ev.clientY
                })
                _this._registerDrag();
            }
        }, false)
        if (this._opts.resizable) {
            this._initResizable()
        }
        _this._unRegister();
    }

    _registerDrag() {
        document.addEventListener('mousemove', this._mouseMoveFunc)
    }
    _unRegister() {
        let _this = this;
        document.addEventListener('mouseup', function (ev) {
            _this._info = _this.getDomInfo(_this._dom);
            _this._info.x = ev.clientX;
            _this._info.y = ev.clientY;
            document.removeEventListener('mousemove', _this._mouseMoveFunc)
            document.removeEventListener('mousemove', _this._resizeByHandlerFunc)
        })
    }
    _initResizable () {
        console.log(this._dom)
        let h: Array<String> = [];
        if (this._opts.handlers) {
            if (this._opts.handlers.length === 1 && this._opts.handlers[0] === 'all') {
                h = this._resizeHanlders;
            }
            else {
                h = this._opts.handlers;
            }
        }
        h.forEach((val: String, index: number) => { 
            let div = document.createElement('div');
            div.classList.add(`widget_resize_${val}`)
            div.dataset.handler = val.toString();
            this._dom && this._dom.appendChild(div)
        })
        let _this = this;
        document.addEventListener('mousedown', function (ev) {
            
            (<any>Object).assign(_this._info,_this.getDomInfo(_this._dom),{
                x: ev.clientX,
                y: ev.clientY
            })
            var h = ev.target
                && (<HTMLElement>ev.target).parentNode === _this._dom
                && (<HTMLElement>ev.target).dataset.handler;
            if (h) {
                _this._currentHandler = h;
                _this._info.x = ev.clientX;
                _this._info.y = ev.clientY;
                document.addEventListener('mousemove', _this._resizeByHandlerFunc)
            }
        })
    }
    _mouseMoveFunc = (ev: MouseEvent) => {
        let [curx, cury] = [ev.clientX, ev.clientY];
        let [movex, movey] = [curx - this._info.x, cury - this._info.y]

        if (this._dom) {
            
            let cleft = movex + this._info.left;
            let ctop = movey + this._info.top;
            if (this._opts.parentClassName) {
                let [maxtop, maxleft] = [this._pInfo.height - this._info.height, this._pInfo.width - this._info.width]
                if (cleft < 0) {
                    cleft = 0;
                }
                if (ctop < 0) {
                    ctop = 0;
                }
                if (cleft > maxleft) {
                    cleft = maxleft
                }
                if (ctop > maxtop) {
                    ctop = maxtop
                }
            }
            this._dom.style.left = cleft + 'px'
            this._dom.style.top = ctop + 'px'
        }
    };
    _resizeChangFromHandler (changeh: number, changew: number, hanlder: String) {
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
                    if (this._info.left + changew <=0 || this._info.width - changew <= 0) {
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
    }
    _resizeByHandlerFunc = (evt: MouseEvent) => {
        let changeh = evt.clientY - this._info.y;
        let changew = evt.clientX - this._info.x;
        this._info.y = evt.clientY;
        this._info.x = evt.clientX;
        // 根据父元素进行边界限制
        for (var i = 0; i < (<String>this._currentHandler).length; i++) {
            this._resizeChangFromHandler(changeh, changew, (<String>this._currentHandler)[i])
        }
        
        (<HTMLElement>this._dom).style.top = this._info.top + 'px';
        (<HTMLElement>this._dom).style.height = this._info.height + 'px';
        (<HTMLElement>this._dom).style.left = this._info.left + 'px';
        (<HTMLElement>this._dom).style.width = this._info.width + 'px';
    }
    getDomInfo(dom: Element | null): any{
        if (dom) {
            let leftstr = getComputedStyle(dom, null)['left'] || '';
            let topstr = getComputedStyle(dom, null)['top'] || '';
            let left = Number(leftstr.replace('px', ''))
            let top = Number(topstr.replace('px', ''))
            let height = dom.clientHeight;
            let width = dom.clientWidth;
            return {
                left: left,
                top: top,
                height: height,
                width: width,
                x: 0,
                y: 0
            } 
        }
        else {
            return {
                left: 0,
                top: 0,
                height: 0,
                width: 0,
                x: 0,
                y: 0
            } 
        }
    }
}