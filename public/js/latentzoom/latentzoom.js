var ls = {

// Apply your own settings here, or override them in the html file.  
graphicsDir : '/sh/Public/js/latentzoom/',
restoreCursor : "zoomout.cur", // necessary for preload
fullExpandIcon : 'fullexpand.gif',
expandSteps : 10, // number of steps in zoom. Each step lasts for duration/step milliseconds.
expandDuration : 300, // milliseconds出现�?�?时间
restoreSteps : 10,
restoreDuration : 300,
allowMultipleInstances: true,
hideThumbOnExpand : true,
captionSlideSpeed : 1, // set to 0 to disable slide in effect
outlineWhileAnimating : false, // not recommended for image popups, animation gets jerky on slow systems.
outlineStartOffset : 3, // ends at 10
marginLeft : 10,
marginRight : 35, // leave room for scrollbars + outline
marginTop : 10,
marginBottom : 35, // leave room for scrollbars + outline
zIndexCounter : 1001, // adjust to other absolutely positioned elements
fullExpandTitle : 'Expand to actual size',
restoreTitle : '单击关闭(ESC/Enter)/拖动/方向键切�?.',
focusTitle : 'Click to bring to front',
loadingText : 'LOADING...',
loadingTitle : '取消加载',
loadingOpacity : 0.5,




// These settings can also be overridden inline for each image
anchor : 'auto', // where the image expands from
align : 'auto', // position in the client (overrides anchor)
targetX: null, // the id of a target element
targetY: null,
captionId : null,
captionTemplateId : null,
slideshowGroup : null, // defines groups for next/previous links and keystrokes
spaceForCaption : 30, // leaves space below images with captions
minWidth: 200,
minHeight: 200,
allowSizeReduction: true, // allow the image to reduce to fit client size. If false, this overrides minWidth and minHeight
outlineType : 'null', // set null to disable outlines
wrapperClassName : null, // for enhanced css-control
enableKeyListener : true,

		
// END OF YOUR SETTINGS


// declare internal properties
preloadTheseImages : new Array(),
continuePreloading: true,
expandedImagesCounter : 0,
expanders : new Array(),
overrides : new Array(
	'anchor',
	'align',
	'targetX',
	'targetY',
	'outlineType',
	'outlineWhileAnimating',
	'spaceForCaption', 
	'wrapperClassName',
	'minWidth',
	'minHeight',
	'captionId',
	'captionTemplateId',
	'allowSizeReduction',
	'slideshowGroup',
	'enableKeyListener'
),
overlays : new Array(),
pendingOutlines : new Array(),
origNodes : new Array(),
ie : (document.all && !window.opera),
safari : navigator.userAgent.indexOf("Safari") != -1,
hasFocused : false,

$$$ : function (id) {
	return document.getElementById(id);
},

push : function (arr, val) {
	arr[arr.length] = val;
},

createElement : function (tag, attribs, styles, parent) {
	var el = document.createElement(tag);
	if (attribs) ls.setAttribs(el, attribs);
	if (styles) ls.setStyles(el, styles);
	if (parent) parent.appendChild(el);	
	return el;
},

setAttribs : function (el, attribs) {
	for (var x in attribs) {
		el[x] = attribs[x];
	}
},

setStyles : function (el, styles) {
	for (var x in styles) {
		try { el.style[x] = styles[x]; }
		catch (e) {}
	}
},

ieVersion : function () {
	arr = navigator.appVersion.split("MSIE");
	return parseFloat(arr[1]);
},

clientInfo : function ()	{
	var iebody = document.compatMode && document.compatMode != "BackCompat" 
		? document.documentElement : document.body;
	
	this.width = ls.ie ? iebody.clientWidth : self.innerWidth;
	this.height = ls.ie ? iebody.clientHeight : self.innerHeight;
	this.scrollLeft = ls.ie ? iebody.scrollLeft : pageXOffset;
	this.scrollTop = ls.ie ? iebody.scrollTop : pageYOffset;
} ,

position : function(el)	{ 
	var parent = el;
	var p = { x: parent.offsetLeft, y: parent.offsetTop };
	while (parent.offsetParent)	{
		parent = parent.offsetParent;
		p.x += parent.offsetLeft;
		p.y += parent.offsetTop;
		if (parent != document.body && parent != document.documentElement) {
			p.x -= parent.scrollLeft;
			p.y -= parent.scrollTop;
		}
	}
	return p;
}, 

expand : function(a, params, contentType) {
	try {
		new LsExpander(a, params, contentType);
		return false;
		
	} catch (e) {
		return true;
	}
	
},

focusTopmost : function() {
	var topZ = 0;
	var topmostKey = -1;
	for (i = 0; i < ls.expanders.length; i++) {
		if (ls.expanders[i]) {
			if (ls.expanders[i].wrapper.style.zIndex && ls.expanders[i].wrapper.style.zIndex > topZ) {
				topZ = ls.expanders[i].wrapper.style.zIndex;
				
				topmostKey = i;
			}
		}
	}
	if (topmostKey == -1) ls.focusKey = -1;
	else ls.expanders[topmostKey].focus();
}, 


closeId : function(elId) { // for text links
	for (i = 0; i < ls.expanders.length; i++) {
		if (ls.expanders[i] && (ls.expanders[i].thumb.id == elId || ls.expanders[i].a.id == elId)) {
			ls.expanders[i].doClose();
			return;
		}
	}
},

close : function(el) {
	var key = ls.getWrapperKey(el);
	if (ls.expanders[key]) ls.expanders[key].doClose();
	return false;
},


toggleImages : function(closeId, expandEl) {
	if (closeId) ls.closeId(closeId);
	if (ls.ie) expandEl.href = expandEl.href.replace('about:(blank)?', ''); // mysterious IE thing
	ls.toggleImagesExpandEl = expandEl;
	return false;
},

getAdjacentAnchor : function(key, op) {
	var aAr = document.getElementsByTagName('A');
	var lsAr = new Array;
	var activeI = -1;
	var j = 0;
	for (i = 0; i < aAr.length; i++) {
		if (ls.isLsAnchor(aAr[i]) && ((ls.expanders[key].slideshowGroup == ls.getParam(aAr[i], 'slideshowGroup')))) {
			lsAr[j] = aAr[i];
			if (ls.expanders[key] && aAr[i] == ls.expanders[key].a) {
				activeI = j;
			}
			j++;
		}
	}
	return lsAr[activeI + op];
},

getParam : function (a, param) {
	try {
		var s = a.onclick.toString();
		var oneLine = s.replace(/\s/g, ' ');
		var sParams = oneLine.replace(/.*?ls.(htmlE|e)xpand\s*?\(\s*?this\s*?,\s*?\{(.*?)\}.*?$/, '$2');
		if (ls.safari) { // stupid bug
			for (var i = 0; i < ls.overrides.length; i++) {
				sParams = sParams.replace(ls.overrides[i] +':', ','+ ls.overrides[i] +':').replace(/^\s*?,/, '');
			}
		}	
		if (oneLine == sParams) return null;
		eval('var arr = {'+ sParams +'};');
		for (var x in arr) {
			if (x == param) return arr[x];
		}
	} catch (e) {
		return null;
	}
},

getSrc : function (a) {
	var src = ls.getParam(a, 'src');
	if (src) return src;
	return a.rel.replace(/_slash_/g, '/') || a.href;
},

cloneNode : function (id) {
	if (!ls.$$$(id) && !ls.origNodes[id]) return null;
	var clone;
	if (ls.origNodes[id]) {
		clone = ls.origNodes[id].cloneNode(1);
		ls.setId(clone, /-lsOrig$/, 1);
	} else {
		clone = ls.$$$(id).cloneNode(1);
		ls.origNodes[id] = ls.$$$(id);
		ls.setId(ls.$$$(id), '-lsOrig');
	}
	return clone;
},

setId : function (d, suff, remove) {
	if (d.id) d.id = remove ? d.id.replace(suff, '') : d.id + suff;
	if (d.name) d.name = remove ? d.name.replace(suff, '') : d.name + suff;
	if (ls.geckoBug && ls.geckoBug(d)) return;
	var a = d.childNodes;		
	for (var i = 0; i < a.length; i++) {
		if (a[i]) ls.setId(a[i], suff, remove);
	}
},

purge : function(d) {
	var a = d.attributes, i, l, n;
    if (a) {
        l = a.length;
        for (i = 0; i < l; i += 1) {
            n = a[i].name;
            if (typeof d[n] === 'function') {
                d[n] = null;
            }
        }
    }
    if (ls.geckoBug && ls.geckoBug(d)) return;
	a = d.childNodes;
    if (a) {
        l = a.length;
        for (i = 0; i < l; i += 1) {
            ls.purge(d.childNodes[i]);
        }
    }
},

previousOrNext : function (el, op) {
	if (typeof el == 'object') var activeKey = ls.getWrapperKey(el);
	else if (typeof el == 'number') var activeKey = el;
	if (ls.expanders[activeKey]) {
		//ls.toggleImagesExpandEl = ls.getAdjacentAnchor(activeKey, op);
		try { ls.getAdjacentAnchor(activeKey, op).onclick(); } catch (e) {}
		ls.expanders[activeKey].doClose();
	}
	
	return false;
},

previous : function (el) {
	return ls.previousOrNext(el, -1);
},

next : function (el) {
	return ls.previousOrNext(el, 1);	
},

keyHandler : function(e) {
	if (!e) e = window.event;
	if (!e.target) e.target = e.srcElement; // ie
	if (e.target.form) return; // form element has focus
	
	var op = null;
	switch (e.keyCode) {
		case 34: // Page Down
		case 39: // Arrow right
		case 40: // Arrow left
			op = 1;
			break;
		case 33: // Page Up
		case 37: // Arrow left
		case 38: // Arrow down
			op = -1;
			break;
		case 27: // Escape
		case 13: // Enter
			if (ls.expanders[ls.focusKey]) ls.expanders[ls.focusKey].doClose();
			return false;
	}
	if (op != null) {
		ls.removeEventListener(document, 'keydown', ls.keyHandler);
		if (ls.expanders[ls.focusKey] && !ls.expanders[ls.focusKey].enableKeyListener) return true;
		return ls.previousOrNext(ls.focusKey, op);
	}
	else return true;
},

registerOverlay : function (overlay) {
	ls.push(ls.overlays, overlay);
},

getWrapperKey : function (el) {
	var key = -1;
	while (el.parentNode)	{
		el = el.parentNode;
		if (el.id && el.id.match(/^latentzoom-wrapper-[0-9]+$/)) {
			key = el.id.replace(/^latentzoom-wrapper-([0-9]+)$/, "$1");
			break;
		}
	}
	return key;
},

cleanUp : function () {
	if (ls.toggleImagesExpandEl) { 
		ls.toggleImagesExpandEl.onclick();
		ls.toggleImagesExpandEl = null;
	} else {
		for (i = 0; i < ls.expanders.length; i++) {
			if (ls.expanders[i] && ls.expanders[i].isExpanded) ls.focusTopmost();
		}		
	}
},

mouseClickHandler : function(e) 
{
	if (!e) e = window.event;
	if (e.button > 1) return true;
	if (!e.target) e.target = e.srcElement;
	
	
	var fobj = e.target;
	while (fobj.parentNode
		&& !(fobj.className && fobj.className.match(/latentzoom-(image|move|html)/)))
	{
		fobj = fobj.parentNode;
	}

	if (!fobj.parentNode) return;
	
	ls.dragKey = ls.getWrapperKey(fobj);
	if (fobj.className.match(/latentzoom-(image|move)/)) {
		var isDraggable = true;
		var wLeft = parseInt(ls.expanders[ls.dragKey].wrapper.style.left);
		var wTop = parseInt(ls.expanders[ls.dragKey].wrapper.style.top);			
	}

	if (e.type == 'mousedown') {
		if (isDraggable) // drag or focus
		{
			ls.dragObj = ls.expanders[ls.dragKey].content;

			if (fobj.className.match('latentzoom-image')) ls.dragObj.style.cursor = 'move';
			
			ls.wLeft = wLeft;
			ls.wTop = wTop;
			
			ls.dragX = e.clientX;
			ls.dragY = e.clientY;
			ls.addEventListener(document, 'mousemove', ls.mouseMoveHandler);
			if (e.preventDefault) e.preventDefault(); // FF
			
			if (ls.dragObj.className.match(/latentzoom-(image|html)-blur/)) {
				ls.expanders[ls.dragKey].focus();
				ls.hasFocused = true;
			}
			return false;
		}
		else if (fobj.className.match(/latentzoom-html/)) { // just focus
			ls.expanders[ls.dragKey].focus();
			ls.expanders[ls.dragKey].redoShowHide();
			ls.hasFocused = false; // why??
		}
		
	} else if (e.type == 'mouseup') {
		ls.removeEventListener(document, 'mousemove', ls.mouseMoveHandler);
		if (isDraggable && ls.expanders[ls.dragKey]) {
			if (fobj.className.match('latentzoom-image')) {
				fobj.style.cursor = ls.styleRestoreCursor;
			}
			var hasMoved = wLeft != ls.wLeft || wTop != ls.wTop;
			if (!hasMoved && !ls.hasFocused && !fobj.className.match(/latentzoom-move/)) {
				ls.expanders[ls.dragKey].doClose();
			} else if (hasMoved || (!hasMoved && ls.hasHtmlExpanders)) {
				ls.expanders[ls.dragKey].redoShowHide();
			}
			ls.hasFocused = false;
		
		} else if (fobj.className.match('latentzoom-image-blur')) {
			fobj.style.cursor = ls.styleRestoreCursor;		
		}
	}
},

mouseMoveHandler : function(e)
{
	if (!ls.expanders[ls.dragKey] || !ls.expanders[ls.dragKey].wrapper) return;
	if (!e) e = window.event;

	var exp = ls.expanders[ls.dragKey];
	var w = exp.wrapper;
	w.style.left = ls.wLeft + e.clientX - ls.dragX +'px';
	w.style.top  = ls.wTop + e.clientY - ls.dragY +'px';
	
	if (exp.objOutline) {
		var o = exp.objOutline;
		o.outer.style.left = (parseInt(w.style.left) - o.offset) +'px';
		o.outer.style.top = (parseInt(w.style.top) - o.offset) +'px';
	}
	
	return false;
},

addEventListener : function (el, event, func) {
	if (document.addEventListener) el.addEventListener(event, func, false);
	else if (document.attachEvent) el.attachEvent('on'+ event, func);
	else el['on'+ event] = func;
},

removeEventListener : function (el, event, func) {
	if (document.removeEventListener) el.removeEventListener(event, func, false);
	else if (document.detachEvent) el.detachEvent('on'+ event, func);
	else el[event] = null;
},

isLsAnchor : function (a) {
	return (a.onclick && a.onclick.toString().replace(/\s/g, ' ').match(/ls.(htmlE|e)xpand/));
},

preloadFullImage : function (i) {
	if (ls.continuePreloading && ls.preloadTheseImages[i] && ls.preloadTheseImages[i] != 'undefined') {
		var img = document.createElement('img');
		img.onload = function() { ls.preloadFullImage(i + 1); };
		img.src = ls.preloadTheseImages[i];
	}
},

preloadImages : function (number) {
	if (number && typeof number != 'object') ls.numberOfImagesToPreload = number;
	var re, j = 0;
	
	var aTags = document.getElementsByTagName('A');
	for (i = 0; i < aTags.length; i++) {
		a = aTags[i];
		re = ls.isLsAnchor(a);
		if (re && re[0] == 'ls.expand') {
			if (j < ls.numberOfImagesToPreload) {
				ls.preloadTheseImages[j] = ls.getSrc(a); 
				j++;
			}
		}
	}
	
	// preload outlines
	new LsOutline(ls.outlineType, function () { ls.preloadFullImage(0)} );
	
	// preload cursor
	var cur = document.createElement('img');
	cur.src = ls.graphicsDir + ls.restoreCursor;
},

genContainer : function () {
	if (!ls.container) {
		ls.container = ls.createElement('div', 
			null, 
			{ position: 'absolute', left: 0, top: 0, width: '100%', zIndex: ls.zIndexCounter }, 
			document.body
		);
	}	
}
}; // end ls object

//-----------------------------------------------------------------------------
LsOutline = function (outlineType, onLoad) {
	if (!outlineType) return;
	if (onLoad) this.onLoad = onLoad;
	this.outlineType = outlineType;
	this.outline = new Array();
	var v = ls.ieVersion();
	
	ls.genContainer();
	
	this.hasAlphaImageLoader = ls.ie && v >= 5.5 && v < 8;
	this.hasPngSupport = !ls.ie || (ls.ie && v >= 8);
	this.hasOutline = this.outlineType && (this.hasAlphaImageLoader || this.hasPngSupport);
	
	this.outer = ls.createElement(
		'table',
		{	
			cellSpacing: 0 // saf
		},
		{
			visibility: 'hidden',
			position: 'absolute',
			zIndex: ls.zIndexCounter++,
			borderCollapse: 'collapse'
		},
		ls.container
	);
	this.tbody = ls.createElement('tbody', null, null, this.outer);
	
	this.preloadOutlineElement(1); // recursive
};

LsOutline.prototype.preloadOutlineElement = function (i) {	
	if (this.outline[i] && this.outline[i].onload) { // Gecko multiple onloads bug
		this.outline[i].onload = null;
		return;
	}
	
	this.offset = this.hasOutline ? 10 : 0;
	if (i == 1 || i == 4 || i == 6) this.tr = ls.createElement('tr', null, null, this.tbody);
	if (i == 5) this.inner = ls.createElement('td', null, { padding: 0, margin: 0, border: 0, position: 'relative' }, this.tr);
	
	var files = Array (0,8,1,2,7,3,6,5,4);
	var src = ls.graphicsDir +"/"+ files[i] +".png";
	
	if (this.hasAlphaImageLoader) {
		var bgKey = 'filter';
		var bgValue = "progid:DXImageTransform.Microsoft.AlphaImageLoader("
					+ "enabled=true, sizingMethod=scale src='"+ src + "') ";
	} else if (this.hasPngSupport || this.hasIe7Bug) {		
		var bgKey = 'background';
		var bgValue = 'url('+ src +')';
	}
	var styles = { lineHeight: 0, fontSize: 0, padding: 0, margin: 0, border: 0 };
	if (this.hasOutline) styles[bgKey] = bgValue;
		
	var td = ls.createElement('td', null, styles);
		
	var img = ls.createElement('img', null, { visibility: 'hidden', display: 'block', padding: 0, margin: 0, border: 0 }, td); // for onload trigger
	
	var dim = 2 * this.offset;
	ls.setStyles (td, { height: dim +'px', width: dim +'px'} );
		
	var pThis = this;
	if (i < 8) img.onload = function() { pThis.preloadOutlineElement(i + 1); };				
	else img.onload = function() { 
		ls.pendingOutlines[pThis.outlineType] = pThis;
		if (pThis.onLoad) pThis.onLoad(); 
	};
	
	this.tr.appendChild(td);
	if (this.hasOutline) img.src = src;
	else img.onload();
};

LsOutline.prototype.destroy = function() {
	ls.purge(this.outer);
	try { this.outer.parentNode.removeChild(this.outer); } catch (e) {}
};

//-----------------------------------------------------------------------------
// The expander object
LsExpander = function(a, params, contentType) {
	ls.continuePreloading = false;
		
	// override inline parameters
	for (i = 0; i < ls.overrides.length; i++) {
		var name = ls.overrides[i];
		if (params && typeof params[name] != 'undefined') this[name] = params[name];
		else this[name] = ls[name];
	}
	
	if (params && params.thumbnailId) {
		var el = ls.$$$(params.thumbnailId);
	
	} else { // first img within anchor
		for (i = 0; i < a.childNodes.length; i++) {
			if (a.childNodes[i].tagName && a.childNodes[i].tagName == 'IMG') {
				var el = a.childNodes[i];
				break;
			}			
		}
	}
	if (!el) el = a;
	
	
	// cancel other
	for (i = 0; i < ls.expanders.length; i++) {
		if (ls.expanders[i] && ls.expanders[i].thumb != el && !ls.expanders[i].onLoadStarted) {
			ls.expanders[i].cancelLoading();
		}
	}
	// check if already open
	for (i = 0; i < ls.expanders.length; i++) {
		if (ls.expanders[i] && ls.expanders[i].thumb == el) {
			ls.expanders[i].focus();
			return false;
		}		
	}

	if (!ls.allowMultipleInstances) {
		var prev = ls.expandedImagesCounter - 1;
		if (ls.expanders[prev]) ls.expanders[prev].doClose();
	}
	
	this.key = ls.expandedImagesCounter++;
	ls.expanders[this.key] = this;
	if (contentType == 'html') {
		this.isHtml = true;
		this.contentType = 'html';
	} else {
		this.isImage = true;
		this.contentType = 'image';
	}
	
	this.a = a;
	
	this.thumbsUserSetId = el.id || a.id;
	this.thumb = el;		
	
	this.overlays = new Array();

	var pos = ls.position(el); 
	
	// instanciate the wrapper
	this.wrapper = ls.createElement(
		'div',
		{
			id: 'latentzoom-wrapper-'+ this.key,
			className: this.wrapperClassName
		},
		{
			visibility: 'hidden',
			position: 'absolute',
			zIndex: ls.zIndexCounter++
		}
	);
	
	// store properties of thumbnail
	this.thumbWidth = el.width ? el.width : el.offsetWidth;		
	this.thumbHeight = el.height ? el.height : el.offsetHeight;
	this.thumbLeft = pos.x;
	this.thumbTop = pos.y;
	this.thumbClass = el.className;
	
	// thumb borders
	this.thumbOffsetBorderW = (this.thumb.offsetWidth - this.thumbWidth) / 2;
	this.thumbOffsetBorderH = (this.thumb.offsetHeight - this.thumbHeight) / 2;
	
	// get the wrapper
	ls.genContainer();
	if (ls.pendingOutlines[this.outlineType]) {
		this.connectOutline();
		this[this.contentType +'Create']();
	} else if (!this.outlineType) {
		this[this.contentType +'Create']();
	} else {
		this.displayLoading();
		var pThis = this;
		new LsOutline(this.outlineType, 
			function () { 
				pThis.connectOutline();
				pThis[pThis.contentType +'Create']();
			} 
		);
	}
	
};

LsExpander.prototype.connectOutline = function(x, y) {	
	var w = ls.pendingOutlines[this.outlineType];
	this.objOutline = w;
	ls.pendingOutlines[this.outlineType] = null;
};

LsExpander.prototype.displayLoading = function() {
	if (this.onLoadStarted || this.loading) return;
		
	this.originalCursor = this.a.style.cursor;
	this.a.style.cursor = 'wait';
	
	if (!ls.loading) {
		ls.loading = ls.createElement('a',
			{
				className: 'latentzoom-loading',
				title: ls.loadingTitle,
				innerHTML: ls.loadingText
			},
			{
				position: 'absolute'
			}, ls.container
		);
		if (ls.ie) ls.loading.style.filter = 'alpha(opacity='+ (100*ls.loadingOpacity) +')';
		else ls.loading.style.opacity = ls.loadingOpacity;
	}
	
	this.loading = ls.loading;
	this.loading.href = 'javascript:ls.expanders['+ this.key +'].cancelLoading()';
	this.loading.visibility = 'visible';		
	
	this.loading.style.left = (this.thumbLeft + this.thumbOffsetBorderW 
		+ (this.thumbWidth - this.loading.offsetWidth) / 2) +'px';
	this.loading.style.top = (this.thumbTop 
		+ (this.thumbHeight - this.loading.offsetHeight) / 2) +'px';
	setTimeout(
		"if (ls.expanders["+ this.key +"] && ls.expanders["+ this.key +"].loading) "
		+ "ls.expanders["+ this.key +"].loading.style.visibility = 'visible';", 
		100
	);
};

LsExpander.prototype.imageCreate = function() {
	var img = document.createElement('img');
	var key = this.key;

	var img = document.createElement('img');
    this.content = img;
    img.onload = function () { if (ls.expanders[key]) ls.expanders[key].onLoad();  };
    img.className = 'latentzoom-image '+ this.thumbClass;
    img.style.visibility = 'hidden'; // prevent flickering in IE
    img.style.display = 'block';
	img.style.position = 'absolute';
    img.style.zIndex = 3;
    img.title = ls.restoreTitle;
    img.onmouseover = function () { 
    	if (ls.expanders[key]) ls.expanders[key].onMouseOver(); 
    };
    img.onmouseout = function (e) { 
    	var rel = e ? e.relatedTarget : event.toElement;
		if (ls.expanders[key]) ls.expanders[key].onMouseOut(rel);
	};
    if (ls.safari) ls.container.appendChild(img);
    if (ls.ie) img.src = null;
	img.src = ls.getSrc(this.a);
	
	this.displayLoading();
};

LsExpander.prototype.onLoad = function() {	
	try { 
	
		if (!this.content) return;
		if (this.onLoadStarted) return; // old Gecko loop
		else this.onLoadStarted = true;
		
			   
		if (this.loading) {
			this.loading.style.visibility = 'hidden';
			this.loading = null;
			this.a.style.cursor = this.originalCursor || '';
		}
		if (this.isImage) {			
			this.newWidth = this.content.width;
			this.newHeight = this.content.height;
			this.fullExpandWidth = this.newWidth;
			this.fullExpandHeight = this.newHeight;
			
			this.content.width = this.thumbWidth;
			this.content.height = this.thumbHeight;
			
		} else if (this.htmlGetSize) this.htmlGetSize();
		
		// identify caption div		
		var modMarginBottom = ls.marginBottom;
		if (!this.captionId && this.thumbsUserSetId)  this.captionId = 'caption-for-'+ this.thumbsUserSetId;
		if (this.captionId) {
			this.caption = ls.cloneNode(this.captionId);
		}
		if (this.captionTemplateId) {
			var s = (this.caption) ? this.caption.innerHTML : '';
			this.caption = ls.cloneNode(this.captionTemplateId);
			if (this.caption) this.caption.innerHTML
				= this.caption.innerHTML.replace(/\s/g, ' ').replace('{caption}', s);
		}
		
		var modMarginBottom = ls.marginBottom;
		if (this.caption) modMarginBottom += this.spaceForCaption;
		
		this.wrapper.appendChild(this.content);
		this.content.style.position = 'relative'; // Saf
		if (this.caption) this.wrapper.appendChild(this.caption);
		this.wrapper.style.left = this.thumbLeft +'px';
		this.wrapper.style.top = this.thumbTop +'px';
		ls.container.appendChild(this.wrapper);
		
		// correct for borders
		this.offsetBorderW = (this.content.offsetWidth - this.thumbWidth) / 2;
		this.offsetBorderH = (this.content.offsetHeight - this.thumbHeight) / 2;
		var modMarginRight = ls.marginRight + 2 * this.offsetBorderW;
		modMarginBottom += 2 * this.offsetBorderH;
		
		var ratio = this.newWidth / this.newHeight;
		var minWidth = this.allowSizeReduction ? this.minWidth : this.newWidth;
		var minHeight = this.allowSizeReduction ? this.minHeight : this.newHeight;
		
		var justify = { x: 'auto', y: 'auto' };
		if (this.align == 'center') {
			justify.x = 'center';
			justify.y = 'center';
		} else {
			if (this.anchor.match(/^top/)) justify.y = null;
			if (this.anchor.match(/right$/)) justify.x = 'max';
			if (this.anchor.match(/^bottom/)) justify.y = 'max';
			if (this.anchor.match(/left$/)) justify.x = null;
		}
		
		client = new ls.clientInfo();		
		
		// justify
		this.x = { 
			min: parseInt(this.thumbLeft) - this.offsetBorderW + this.thumbOffsetBorderW,
			span: this.newWidth,
			minSpan: this.newWidth < minWidth ? this.newWidth : minWidth,
			justify: justify.x,
			target: this.targetX,
			marginMin: ls.marginLeft, 
			marginMax: modMarginRight,
			scroll: client.scrollLeft,
			clientSpan: client.width,
			thumbSpan: this.thumbWidth
		};
		var oldRight = this.x.min + parseInt(this.thumbWidth);
		this.x = this.justify(this.x);

		this.y = { 
			min: parseInt(this.thumbTop) - this.offsetBorderH + this.thumbOffsetBorderH,
			span: this.newHeight,
			minSpan: this.newHeight < minHeight ? this.newHeight : minHeight,
			justify: justify.y,
			target: this.targetY,
			marginMin: ls.marginTop, 
			marginMax: modMarginBottom, 
			scroll: client.scrollTop,
			clientSpan: client.height,
			thumbSpan: this.thumbHeight
		};
		var oldBottom = this.y.min + parseInt(this.thumbHeight);
		this.y = this.justify(this.y);
	
		if (this.isHtml) this.htmlSizeOperations();	
		if (this.isImage) this.correctRatio(ratio);

		var x = this.x;
		var y = this.y;	

		// Selectbox bug
		var imgPos = {x: x.min - 20, y: y.min - 20, w: x.span + 40, h: y.span + 40 + this.spaceForCaption};
		ls.hideSelects = (ls.ie && ls.ieVersion() < 7);
		if (ls.hideSelects) this.showHideElements('SELECT', 'hidden', imgPos);
		// Iframes bug
		ls.hideIframes = (window.opera || navigator.vendor == 'KDE' || (ls.ie && ls.ieVersion() < 5.5));
		if (ls.hideIframes) this.showHideElements('IFRAME', 'hidden', imgPos);
		
		// Make outline ready	
		if (this.objOutline && !this.outlineWhileAnimating) this.positionOutline(x.min, y.min, x.span, y.span);
		var o2 = this.objOutline ? this.objOutline.offset : 0;
		
		// Apply size change		
		this.changeSize(
			1,
			this.thumbLeft + this.thumbOffsetBorderW - this.offsetBorderW,
			this.thumbTop + this.thumbOffsetBorderH - this.offsetBorderH,
			this.thumbWidth,
			this.thumbHeight,
			x.min,
			y.min,
			x.span,
			y.span, 
			ls.expandDuration,
			ls.expandSteps,
			ls.outlineStartOffset,
			o2
		);

	} catch (e) {
		if (ls.expanders[this.key] && ls.expanders[this.key].a) 
			window.location.href = ls.getSrc(ls.expanders[this.key].a);
	}
};

LsExpander.prototype.justify = function (p) {
	
	var tgt, dim = p == this.x ? 'x' : 'y';
	if (p.target && p.target.match(/ /)) {
		tgt = p.target.split(' ');
		p.target = tgt[0];
	}
	if (p.target && ls.$$$(p.target)) {
		p.min = ls.position(ls.$$$(p.target))[dim];
		if (tgt && tgt[1] && tgt[1].match(/^[-]?[0-9]+px$/)) p.min += parseInt(tgt[1]);
		
	} else if (p.justify == 'auto' || p.justify == 'center') {
		var hasMovedMin = false;
		var allowReduce = true;
		
		// calculate p.min
		if (p.justify == 'center') p.min = Math.round(p.scroll + (p.clientSpan - p.span - p.marginMax) / 2);
		else p.min = Math.round(p.min - ((p.span - p.thumbSpan) / 2)); // auto
		
		if (p.min < p.scroll + p.marginMin) {
			p.min = p.scroll + p.marginMin;
			hasMovedMin = true;		
		}
		
		if (p.span < p.minSpan) {
			p.span = p.minSpan;
			allowReduce = false;
		}
		// calculate right/newWidth
		if (p.min + p.span > p.scroll + p.clientSpan - p.marginMax) {
			if (hasMovedMin && allowReduce) p.span = p.clientSpan - p.marginMin - p.marginMax; // can't expand more
			else if (p.span < p.clientSpan - p.marginMin - p.marginMax) { // move newTop up
				p.min = p.scroll + p.clientSpan - p.span - p.marginMin - p.marginMax;
			} else { // image larger than client
				p.min = p.scroll + p.marginMin;
				if (allowReduce) p.span = p.clientSpan - p.marginMin - p.marginMax;
			}
			
		}
		
		if (p.span < p.minSpan) {
			p.span = p.minSpan;
			allowReduce = false;
		}
		
	} else if (p.justify == 'max') {
		p.min = Math.floor(p.min - p.span + p.thumbSpan);
	}
		
	if (p.min < p.marginMin) {
		tmpMin = p.min;
		p.min = p.marginMin; 
		if (allowReduce) p.span = p.span - (p.min - tmpMin);
	}
	return p;
};

LsExpander.prototype.correctRatio = function(ratio) {
	var x = this.x;
	var y = this.y;
	var changed = false;
	if (x.span / y.span > ratio) { // width greater
		var tmpWidth = x.span;
		x.span = y.span * ratio;
		if (x.span < x.minSpan) { // below minWidth
			x.span = x.minSpan;	
			y.span = x.span / ratio;
		}
		changed = true;
	
	} else if (x.span / y.span < ratio) { // height greater
		var tmpHeight = y.span;
		y.span = x.span / ratio;
		changed = true;
	}
	
	if (changed) {
		x.min = parseInt(this.thumbLeft) - this.offsetBorderW + this.thumbOffsetBorderW;
		x.minSpan = x.span;
		this.x = this.justify(x);
		
		y.min = parseInt(this.thumbTop) - this.offsetBorderH + this.thumbOffsetBorderH;
		y.minSpan = y.span;
		this.y = this.justify(y);
	}
};

LsExpander.prototype.changeSize = function(dir, x1, y1, w1, h1, x2, y2, w2, h2, dur, steps, oo1, oo2) {
	dW = (w2 - w1) / steps;
	dH = (h2 - h1) / steps;
	dX = (x2 - x1) / steps;
	dY = (y2 - y1) / steps;
	dOo = (oo2 - oo1) /steps;
	for (i = 1; i <= steps; i++) {
		w1 += dW;
		h1 += dH;
		x1 += dX;
		y1 += dY;
		oo1 += dOo;
		
		var obj = "ls.expanders["+ this.key +"]";
		var s = "if ("+ obj +") {";
		if (i == 1) {
			s += obj +".content.style.visibility = 'visible';"
				+ "if ("+ obj +".thumb.tagName == 'IMG' && ls.hideThumbOnExpand) "+ obj +".thumb.style.visibility = 'hidden';"
		}
		if (i == steps) {
			w1 = w2;
			h1 = h2;
			x1 = x2;
			y1 = y2;
			oo1 = oo2;
		}
		s += obj +"."+ this.contentType +"SetSize("+ Math.round(w1) +", "+ Math.round(h1) +", "
			+ Math.round(x1) +", "+ Math.round(y1) +", "+ Math.round(oo1);
		if (i == steps) s += ', '+ dir;
		s += ");}";
		setTimeout(s, Math.round(i * (dur / steps)));
	}
};

LsExpander.prototype.imageSetSize = function (w, h, x, y, offset, end) {
	try {
		this.content.width = w;
		this.content.height = h;
		
		if (this.objOutline && this.outlineWhileAnimating) {
			var o = this.objOutline.offset - offset;
			this.positionOutline(x + o, y + o, w - 2 * o, h - 2 * o, 1);
		}
		
		ls.setStyles ( this.wrapper,
			{
				'visibility': 'visible',
				'left': x +'px',
				'top': y +'px'
			}
		);
		var exp = 'ls.expanders['+ this.key +']';
		if (end == 1) setTimeout('if ('+ exp +')'+ exp +'.onExpanded()', 0); // jerk in IE
		else if (end == -1) setTimeout('if ('+ exp +')'+ exp +'.onEndClose()', 0);
	} catch (e) {
		window.location.href = ls.getSrc(this.a);
	}
};

LsExpander.prototype.positionOutline = function(x, y, w, h, vis) {
	if (!this.objOutline) return;
	var o = this.objOutline;
	if (vis) o.outer.style.visibility = 'visible';
	o.outer.style.left = (x - o.offset) +'px';
	o.outer.style.top = (y - o.offset) +'px';
	o.outer.style.width = (w + 2 * (this.offsetBorderW + o.offset)) +'px';
	w += 2 * (this.offsetBorderW - o.offset);
	h += + 2 * (this.offsetBorderH - o.offset);
	o.inner.style.width = w >= 0 ? w +'px' : 0;
	o.inner.style.height = h >= 0 ? h +'px' : 0;
};

LsExpander.prototype.onExpanded = function() {
	if (this.objOutline) this.objOutline.outer.style.visibility = 'visible';
	this.isExpanded = true;
	this.focus();
	if (this.isHtml && this.objectLoadTime == 'after') this.writeExtendedContent();
	this.createCustomOverlays();
	
	if (this.caption) this.writeCaption();
	
	if (this.fullExpandWidth > this.x.span) this.createFullExpand();
	if (!this.caption) this.onDisplayFinished();
};

LsExpander.prototype.onDisplayFinished = function() {
	var key = this.key;
	var outlineType = this.outlineType;
	new LsOutline(outlineType, function () { if (ls.expanders[key]) ls.expanders[key].preloadNext();	});
};

LsExpander.prototype.preloadNext = function() {
	var nextA = ls.getAdjacentAnchor(this.key, 1);
	if (nextA) {
		var img = document.createElement('img');
		img.src = ls.getSrc(nextA);
	}
};

LsExpander.prototype.cancelLoading = function() {
	this.a.style.cursor = this.originalCursor;	
	if (this.loading) ls.loading.style.visibility = 'hidden';		
	ls.expanders[this.key] = null;
};

LsExpander.prototype.writeCaption = function() {
	try {
		this.wrapper.style.width = this.wrapper.offsetWidth +'px';	
		this.caption.style.visibility = 'hidden';
		this.caption.style.position = 'relative';
		if (ls.ie) this.caption.style.zoom = 1;  
		this.caption.className += ' latentzoom-display-block';
		
		var capHeight = this.caption.offsetHeight;
		var slideHeight = (capHeight < this.content.height) ? capHeight : this.content.height;
		this.caption.style.top = '-'+ slideHeight +'px';
		
		this.caption.style.zIndex = 2;
		
		var step = 1;
		if (slideHeight > 400) step = 4;
		else if (slideHeight > 200) step = 2;
		else if (slideHeight > 100) step = 1;
		if (ls.captionSlideSpeed) step = step * ls.captionSlideSpeed;
		else step = slideHeight;

		var t = 0;
		for (var top = -slideHeight; top <= 0; top += step, t += 10) {
			var end = (top >= 0) ? 1 : 0;
			var eval = "if (ls.expanders["+ this.key +"]) { "
				+ "ls.expanders["+ this.key +"].placeCaption("+ top +", "+ end +");"
				+ "}";			
			setTimeout (eval, t);
		}
	
	} catch (e) {}	
};

LsExpander.prototype.placeCaption = function(top, end) {
	if (!this.caption) return;
	this.caption.style.top = top +'px';
	this.caption.style.visibility = 'visible';
	if (this.objOutline) this.objOutline.inner.style.height 
		= (this.wrapper.offsetHeight + top - 2 * this.objOutline.offset) +'px';
	if (end) this.onDisplayFinished();
};

LsExpander.prototype.showHideElements = function (tagName, visibility, imgPos) {
	var els = document.getElementsByTagName(tagName);
	if (els) {			
		for (i = 0; i < els.length; i++) {
			if (els[i].nodeName == tagName) {  
				var hiddenBy = els[i].getAttribute('hidden-by');
				 
				if (visibility == 'visible' && hiddenBy) {
					hiddenBy = hiddenBy.replace('['+ this.key +']', '');
					els[i].setAttribute('hidden-by', hiddenBy);
					if (!hiddenBy) els[i].style.visibility = 'visible';				
					
				} else if (visibility == 'hidden') { // hide if behind
					var elPos = ls.position(els[i]);
					elPos.w = els[i].offsetWidth;
					elPos.h = els[i].offsetHeight;
				
					var clearsX = (elPos.x + elPos.w < imgPos.x || elPos.x > imgPos.x + imgPos.w);
					var clearsY = (elPos.y + elPos.h < imgPos.y || elPos.y > imgPos.y + imgPos.h);
					var wrapperKey = ls.getWrapperKey(els[i]);
					if (!clearsX && !clearsY && wrapperKey != this.key) { // element falls behind image
						if (!els[i].currentStyle || (els[i].currentStyle && els[i].currentStyle['visibility'] != 'hidden')) { // IE
							if (!hiddenBy) {
								els[i].setAttribute('hidden-by', '['+ this.key +']');
							} else if (!hiddenBy.match('['+ this.key +']')) {
								els[i].setAttribute('hidden-by', hiddenBy + '['+ this.key +']');
							}
							els[i].style.visibility = 'hidden';	  
						}
					} else if (hiddenBy == '['+ this.key +']' || ls.focusKey == wrapperKey) { // on move
						els[i].setAttribute('hidden-by', '');
						els[i].style.visibility = 'visible';
					} else if (hiddenBy && hiddenBy.match('['+ this.key +']')) {
						els[i].setAttribute('hidden-by', hiddenBy.replace('['+ this.key +']', ''));
					}
				}   
			}
		}
	}
};

LsExpander.prototype.focus = function() {
	// blur others
	for (i = 0; i < ls.expanders.length; i++) {
		if (ls.expanders[i] && i == ls.focusKey) {
			var blurExp = ls.expanders[i];
			blurExp.content.className += ' latentzoom-'+ blurExp.contentType +'-blur';
			if (blurExp.caption) {
				ls.setId(blurExp.caption, '-lsBlur'+i);
				blurExp.caption.className += ' latentzoom-caption-blur';
			}
			if (blurExp.isImage) {
				blurExp.content.style.cursor = ls.ie ? 'hand' : 'pointer';
				blurExp.content.title = ls.focusTitle;	
			} else { ls.setId(blurExp.innerContent, '-lsBlur'+i); }
		}
	}
	
	// focus this
	this.wrapper.style.zIndex = ls.zIndexCounter++;
	if (this.objOutline) this.objOutline.outer.style.zIndex = this.wrapper.style.zIndex;
	
	this.content.className = 'latentzoom-'+ this.contentType;
	if (this.caption) {
		ls.setId(this.caption, '-lsBlur' + this.key, 1);
		this.caption.className = this.caption.className.replace(' latentzoom-caption-blur', '');
	}
	
	if (this.isImage) {
		this.content.title = ls.restoreTitle;
		
		ls.styleRestoreCursor = window.opera ? 'pointer' : 'url('+ ls.graphicsDir + ls.restoreCursor +'), pointer';
		if (ls.ie && ls.ieVersion() < 6) ls.styleRestoreCursor = 'hand';
		this.content.style.cursor = ls.styleRestoreCursor;
	} else {
		ls.setId(this.innerContent, '-lsBlur' + this.key, 1);
	}
	
	ls.focusKey = this.key;	
	ls.addEventListener(document, 'keydown', ls.keyHandler);
};

LsExpander.prototype.doClose = function() {
	ls.removeEventListener(document, 'keydown', ls.keyHandler);
	try {
		if (!ls.expanders[this.key]) return;

		this.isClosing = true;
		
		var x = parseInt(this.wrapper.style.left);
		var y = parseInt(this.wrapper.style.top);
		var w = (this.isImage) ? this.content.width : parseInt(this.content.style.width);
		var h = (this.isImage) ? this.content.height : parseInt(this.content.style.height);
		
		if (this.objOutline && this.outlineWhileAnimating) this.positionOutline(x, y, w, h);
		else if (this.objOutline) this.objOutline.destroy();
		
		// remove children
		var n = this.wrapper.childNodes.length;
		for (i = n - 1; i >= 0 ; i--) {
			var child = this.wrapper.childNodes[i];
			if (child != this.content) {
				ls.purge(this.wrapper.childNodes[i]);
				this.wrapper.removeChild(this.wrapper.childNodes[i]);
			}
		}
		if (this.isHtml) this.htmlOnClose();
		
		this.wrapper.style.width = 'auto';
		this.content.style.cursor = 'default';
		var o2 = this.objOutline ? this.objOutline.offset : 0;
		
		this.changeSize(
			-1,
			x,
			y,
			w,
			h,
			this.thumbLeft - this.offsetBorderW + this.thumbOffsetBorderW,
			this.thumbTop - this.offsetBorderH + this.thumbOffsetBorderH,
			this.thumbWidth,
			this.thumbHeight, 
			ls.restoreDuration,
			ls.restoreSteps,
			o2,
			ls.outlineStartOffset
		);
		
	} catch (e) {
		ls.expanders[this.key].onEndClose();
	}
};

LsExpander.prototype.onEndClose = function () {
	this.thumb.style.visibility = 'visible';
	
	if (ls.hideSelects) this.showHideElements('SELECT', 'visible');
	if (ls.hideIframes) this.showHideElements('IFRAME', 'visible');
	
	if (this.objOutline && this.outlineWhileAnimating) this.objOutline.destroy();
	ls.purge(this.wrapper);
	this.wrapper.parentNode.removeChild(this.wrapper);
	ls.expanders[this.key] = null;

	ls.cleanUp();
};

LsExpander.prototype.createOverlay = function (el, position, hideOnMouseOut, opacity) {
	if (typeof el == 'string') el = ls.cloneNode(el);
	if (!el || typeof el == 'string' || !this.isImage) return;
	
	if (!position) var position = 'center center';
	var overlay = ls.createElement(
		'div',
		null,
		{
			'position' : 'absolute',
			'zIndex' : 3,
			'visibility': 'hidden'
		},
		this.wrapper
	);
	if (opacity && opacity < 1) {
		if (ls.ie) overlay.style.filter = 'alpha(opacity='+ (opacity * 100) +')';
		else overlay.style.opacity = opacity;
	}
	el.className += ' latentzoom-display-block';
	overlay.appendChild(el);	
	
	var left = this.offsetBorderW;
	var dLeft = this.content.width - overlay.offsetWidth;
	var top = this.offsetBorderH;
	var dTop = this.content.height - overlay.offsetHeight;
	
	if (position.match(/^bottom/)) top += dTop;
	if (position.match(/^center/)) top += dTop / 2;
	if (position.match(/right$/)) left += dLeft;
	if (position.match(/center$/)) left += dLeft / 2;
	
	ls.setStyles(overlay, { 'left': left+'px', 'top': top+'px', visibility: 'visible' } );
	
	if (hideOnMouseOut) overlay.setAttribute('hideOnMouseOut', true);
	
	ls.push(this.overlays, overlay);
};

LsExpander.prototype.createCustomOverlays = function() {
	for (i = 0; i < ls.overlays.length; i++) {
		var o = ls.overlays[i];
		if (o.thumbnailId == null || o.thumbnailId == this.thumbsUserSetId) {
			this.createOverlay(o.overlayId, o.position, o.hideOnMouseOut, o.opacity);
		}
	}
};

LsExpander.prototype.onMouseOver = function () {
	for (i = 0; i < this.overlays.length; i++) {
		this.overlays[i].style.visibility = 'visible';
	}
};

LsExpander.prototype.onMouseOut = function(rel) {
	var hideThese = new Array();
	var j = 0;
	for (i = 0; i < this.overlays.length; i++) {
		var node = rel;
		while (node && node.parentNode) {
			if (node == this.overlays[i]) return;
			node = node.parentNode;
		}
		
		if (this.overlays[i].getAttribute('hideOnMouseOut')) {
			hideThese[j] = this.overlays[i];
			j++;
		}
	}
	for (i = 0; i < hideThese.length; i++) {		
		hideThese[i].style.visibility = 'hidden';
	}
};

LsExpander.prototype.createFullExpand = function () {
	var a = ls.createElement(
		'a',
		{
			href: 'javascript:ls.expanders['+ this.key +'].doFullExpand();',
			title: ls.fullExpandTitle
		},
		{
			background: 'url('+ ls.graphicsDir + ls.fullExpandIcon+')',
			display: 'block',
			margin: '0 10px 10px 0',
			width: '45px',
			height: '44px'
		}
	);
	
	this.createOverlay(a, 'bottom right', true, 0.75);
	this.fullExpandIcon = a;
};

LsExpander.prototype.doFullExpand = function () {
	try {
		ls.purge(this.fullExpandIcon);
		this.fullExpandIcon.parentNode.removeChild(this.fullExpandIcon);
		this.focus();
		
		this.x.min = parseInt(this.wrapper.style.left) - (this.fullExpandWidth - this.content.width) / 2;
		if (this.x.min < ls.marginLeft) this.x.min = ls.marginLeft;		
		this.wrapper.style.left = this.x.min +'px';
		
		var borderOffset = this.wrapper.offsetWidth - this.content.width;		
		
		this.content.width = this.fullExpandWidth;
		this.content.height = this.fullExpandHeight;
		
		this.x.span = this.content.width;
		this.wrapper.style.width = (this.x.span + borderOffset) +'px';
		
		this.y.span = this.wrapper.offsetHeight - 2 * this.offsetBorderH;
		this.positionOutline(this.x.min, this.y.min, this.x.span, this.y.span);
		
		// reposition overlays
		for (x in this.overlays) {
			ls.purge(this.overlays[x]);
			this.overlays[x].parentNode.removeChild(this.overlays[x]);
		}		

		this.createCustomOverlays();
		
		this.redoShowHide();
	
	} catch (e) {
		window.location.href = ls.expanders[this.key].content.src;
	}
};

// on end move and resize
LsExpander.prototype.redoShowHide = function() {
	var imgPos = {
		x: parseInt(this.wrapper.style.left) - 20, 
		y: parseInt(this.wrapper.style.top) - 20, 
		w: this.content.offsetWidth + 40, 
		h: this.content.offsetHeight + 40 + this.spaceForCaption
	};
	if (ls.hideSelects) this.showHideElements('SELECT', 'hidden', imgPos);
	if (ls.hideIframes) this.showHideElements('IFRAME', 'hidden', imgPos);

};

// set handlers
ls.addEventListener(document, 'mousedown', ls.mouseClickHandler);
ls.addEventListener(document, 'mouseup', ls.mouseClickHandler);
//ls.addEventListener(window, 'load', ls.preloadImages);