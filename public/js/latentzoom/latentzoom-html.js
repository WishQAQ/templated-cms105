
// These properties can be overridden in the function call for each expander:
ls.push(ls.overrides, 'contentId');
ls.push(ls.overrides, 'allowWidthReduction');
ls.push(ls.overrides, 'allowHeightReduction');
ls.push(ls.overrides, 'objectType');
ls.push(ls.overrides, 'objectWidth');
ls.push(ls.overrides, 'objectHeight');
ls.push(ls.overrides, 'objectLoadTime');
ls.push(ls.overrides, 'swfObject');

ls.allowWidthReduction = false;
ls.allowHeightReduction = true;
ls.objectLoadTime = 'before';

ls.htmlExpand = function(a, params) {
	if (!ls.$$$(params.contentId) && !ls.origNodes[params.contentId]) return true;
	try {
		ls.hasHtmlExpanders = true;
    	new LsExpander(a, params, 'html');
		return false;
	} catch (e) {
		return true; // script failed: try firing default href
	}	
};

ls.identifyContainer = function (parent, className) {
	for (i = 0; i < parent.childNodes.length; i++) {
    	if (parent.childNodes[i].className == className) {
			return parent.childNodes[i];
		}
	}
};
ls.geckoBug = function(d) { // freezes on DOM access to flash object
	return (!ls.ie && d.className && d.className == 'latentzoom-body' 
		&& ls.expanders[ls.getWrapperKey(d)] && ls.expanders[ls.getWrapperKey(d)].swfObject);	
};

LsExpander.prototype.htmlCreate = function () {
	this.origContent = ls.origNodes[this.contentId] ? ls.origNodes[this.contentId] : ls.$$$(this.contentId);
	ls.setStyles (this.origContent, { position: 'relative', visibility: 'hidden' });
	this.origContent.className += ' latentzoom-display-block';
    
    var div = ls.createElement('div', null,
		{
			padding: '0 '+ ls.marginRight +'px 0 '+ ls.marginLeft +'px',
			position: 'absolute',
			left: 0,
			top: 0
		},
		document.body
	);
	
	this.innerContent = ls.cloneNode(this.contentId);
	
    ls.setStyles(this.innerContent, { border: 'none', width: 'auto', height: 'auto' });
    
	this.setObjContainerSize(this.origContent);
	this.setObjContainerSize(this.innerContent, 1);
	div.appendChild(this.origContent); // to get full width
	
    this.content = ls.createElement(
    	'div',
    	{	className: 'latentzoom-html' },
		{
			position: 'relative',
			zIndex: 3,
			overflow: 'hidden',
			width: this.thumbWidth +'px',
			height: this.thumbHeight +'px'
		}
	);
    this.content.appendChild(this.innerContent);
    
	this.newWidth = this.origContent.offsetWidth;
    this.newHeight = this.origContent.offsetHeight;
    if (ls.ie && this.newHeight > parseInt(this.origContent.currentStyle.height)) { // ie css bug
		this.newHeight = parseInt(this.origContent.currentStyle.height);
	}
	// hide origContent
	this.origContent.className = this.origContent.className.replace(' latentzoom-display-block', '');	
	
	this.onLoad();
};

LsExpander.prototype.setObjContainerSize = function(parent, auto) {
	if (this.swfObject || this.objectType == 'iframe') {
		var c = ls.identifyContainer(parent, 'latentzoom-body');
		if (auto) {
			c.style.width = 'auto';
			c.style.height = 'auto';		
		} else {
			c.style.width = this.swfObject ? this.swfObject.attributes.width +'px' : this.objectWidth +'px';
			c.style.height = this.swfObject ? this.swfObject.attributes.height +'px' : this.objectHeight +'px';
		}
	}
	
};
LsExpander.prototype.writeExtendedContent = function () {
	if (this.objectType == 'iframe') {
		
		this.objContainer = ls.identifyContainer(this.innerContent, 'latentzoom-body');
		var key = this.key;
		this.iframe = ls.createElement('iframe',
			{
				frameBorder: 0,
				src: ls.getSrc(this.a)
			},
			{
				width: this.objectWidth +'px',
				height: this.objectHeight +'px'
			},
			this.objContainer
		);
		if (this.objectLoadTime == 'after') this.correctIframeSize();
				
	} else if (this.swfObject) {	
		this.objContainer = ls.identifyContainer(this.innerContent, 'latentzoom-body');
		this.objContainer.id = this.objContainer.id || 'ls-flash-id-' + this.key;
		
		this.swfObject.write(this.objContainer.id);
	}
};
LsExpander.prototype.correctIframeSize = function () {
	var wDiff = this.innerContent.offsetWidth - this.objContainer.offsetWidth;
	if (wDiff < 0) wDiff = 0;
	var hDiff = this.innerContent.offsetHeight - this.objContainer.offsetHeight;
	
	ls.setStyles(this.iframe, { width: (this.x.span - wDiff) +'px', height: (this.y.span - hDiff) +'px' });
    ls.setStyles(this.objContainer, { width: this.iframe.style.width, height: this.iframe.style.height });
    
    this.scrollingContent = this.iframe;
    this.scrollerDiv = 'scrollingContent';
};

LsExpander.prototype.htmlSizeOperations = function () {
	this.setObjContainerSize(this.innerContent);
	
	if (this.objectLoadTime == 'before') this.writeExtendedContent();		

	// store for resize
    this.finalLeft = this.x.min;
    this.finalTop = this.y.min;    	
    
    // handle minimum size   
    if (this.x.span < this.newWidth && !this.allowWidthReduction) this.x.span = this.newWidth;
    if (this.y.span < this.newHeight && !this.allowHeightReduction) this.y.span = this.newHeight;
    this.scrollerDiv = 'innerContent';
    
    this.mediumContent = ls.createElement('div', null, 
    	{ 
    		width: this.x.span +'px',
    		position: 'relative',
    		left: (this.finalLeft - this.thumbLeft) +'px',
    		top: (this.finalTop - this.thumbTop) +'px'
    	}, this.content);
	
    this.mediumContent.appendChild(this.innerContent);
    
    var node = ls.identifyContainer(this.innerContent, 'latentzoom-body');
    if (node && !this.swfObject && this.objectType != 'iframe') {    	
		var cNode = node.cloneNode(true); // to get true width
    	
    	node.innerHTML = '';
    	node.id = null;
    	
    	ls.setStyles ( node, 
    		{
    			margin: 0,
    			border: 'none',
    			padding: 0,
    			overflow: 'hidden'
			}
    	);
    	node.appendChild(cNode);
    	var wDiff = this.innerContent.offsetWidth - node.offsetWidth;
    	var hDiff = this.innerContent.offsetHeight - node.offsetHeight;
    	
    	var kdeBugCorr = ls.safari || navigator.vendor == 'KDE' ? 1 : 0; // KDE repainting bug
    	ls.setStyles(node, { width: (this.x.span - wDiff - kdeBugCorr) +'px', height: (this.y.span - hDiff) +'px', overflow: 'auto', position: 'relative' } );
    	if (cNode.offsetHeight > node.offsetHeight)	{
    		if (kdeBugCorr) node.style.width = (parseInt(node.style.width) + kdeBugCorr) + 'px';
		}
    	this.scrollingContent = node;
    	this.scrollerDiv = 'scrollingContent';
	} 
	
    if (this.iframe && this.objectLoadTime == 'before') this.correctIframeSize();
    if (!this.scrollingContent && this.y.span < this.mediumContent.offsetHeight) this.scrollerDiv = 'content';
	
	if (this.scrollerDiv == 'content' && !this.allowWidthReduction && this.objectType != 'iframe') {
		this.x.span += 17; // room for scrollbars
	}
	if (this.scrollerDiv && this[this.scrollerDiv].offsetHeight > this[this.scrollerDiv].parentNode.offsetHeight) {
		setTimeout("ls.expanders["+ this.key +"]."+ this.scrollerDiv +".style.overflow = 'auto'",
			 ls.expandDuration);
	}
};

LsExpander.prototype.htmlSetSize = function (w, h, x, y, offset, end) {
	try {
		ls.setStyles(this.content, { width: w +'px', height: h +'px' });
		ls.setStyles(this.wrapper, { visibility: 'visible', left: x +'px', top: y +'px'});
		ls.setStyles(this.mediumContent, { left: (this.finalLeft - x) +'px', top: (this.finalTop - y) +'px' });
		
		this.innerContent.style.visibility = 'visible';
		
		if (this.objOutline && this.outlineWhileAnimating) {
			var o = this.objOutline.offset - offset;
			this.positionOutline(x + o, y + o, w - 2*o, h - 2*o, 1);
		}
		
		if (end == 1) this.onExpanded();
		else if (end == -1) this.onEndClose();
		
	} catch (e) {
		window.location.href = ls.expanders[key].a.href;
	}
};
/*
LsExpander.prototype.resize = function () {
	var h1, h2, dh;
	h1 = this[this.scrollerDiv].offsetHeight;
	this[this.scrollerDiv].style.overflow = 'visible';
	this[this.scrollerDiv].style.height = 'auto';
	h2 = this[this.scrollerDiv].offsetHeight;
	dh = h2 - h1;
	this.htmlSetSize(parseInt(this.content.style.width), parseInt(this.content.style.height) + dh, parseInt(this.wrapper.style.left), parseInt(this.wrapper.style.top), 10);
};*/

LsExpander.prototype.htmlOnClose = function() {
	if (this.objectLoadTime == 'after') this.destroyObject();		
	if (this.scrollerDiv && this.scrollerDiv != 'scrollingContent') 
		this[this.scrollerDiv].style.overflow = 'hidden';
	if (this.swfObject) ls.$$$(this.swfObject.getAttribute('id')).StopPlay();
};

LsExpander.prototype.destroyObject = function () {
	this.objContainer.innerHTML = '';
};

