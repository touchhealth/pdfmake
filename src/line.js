/* jslint node: true */
'use strict';

/**
 * Creates an instance of Line
 *
 * @constructor
 * @this {Line}
 * @param {Number} Maximum width this line can have
 */
function Line(maxWidth) {
	this.maxWidth = maxWidth;
	this.leadingCut = 0;
	this.trailingCut = 0;
	this.inlineWidths = 0;
	this.inlines = [];
}

Line.prototype.getAscenderHeight = function () {
	var y = 0;

	this.inlines.forEach(function (inline) {
		y = Math.max(y, inline.font.ascender / 1000 * inline.fontSize);
	});
	return y;
};

Line.prototype.hasEnoughSpaceForInline = function (inline) {
	//if (this.inlines.length === 0) {
	//	return true;
	//}
	if (this.newLineForced) {
		return false;
	}

	return this.inlineWidths + inline.width - this.leadingCut - (inline.trailingCut || 0) <= this.maxWidth;
};

Line.prototype.addInline = function (inline) {
	if (this.inlines.length === 0) {
		this.leadingCut = inline.leadingCut || 0;
	}
	this.trailingCut = inline.trailingCut || 0;

	inline.x = this.inlineWidths - this.leadingCut;

	this.inlines.push(inline);
	this.inlineWidths += inline.width;

	if (inline.lineEnd) {
		this.newLineForced = true;
	}
};
Line.prototype.addPartInline = function(inline) {
  // guess number of characters ignoring kerning.  This could be better done by measuring perhaps
  var avgLengthPerChar = (inline.width - inline.leadingCut - inline.trailingCut) / inline.text.length;
  var useChars = Math.ceil(this.maxWidth / avgLengthPerChar, 0);

  // there should be a better way to clone an inline than this
  var newInline = {
    alignment: inline.alignment,
    background: inline.background,
    color: inline.color,
    decoration: inline.decoration,
    decorationColor: inline.decorationColor,
    decorationStyle: inline.decorationStyle,
    font: inline.font,
    fontSize: inline.fontSize,
    height: inline.height,
    leadingCut: inline.leadingCut,
    trailingCut: inline.trailingCut,
		//
		inlineEnd: true,
  };

  // divide the width between the two - also should really be measured properly if I knew how
  newInline.width = inline.width * useChars / inline.text.length;
  inline.width = inline.width - newInline.width;

  newInline.text = inline.text.substr(0,useChars);
  inline.text = inline.text.substr(useChars);

  // write the newly cloned inline to the line, leave the old inline to get picked up next iteration
	newInline.x = this.inlineWidths - this.leadingCut;

  this.inlines.push(newInline);
  this.inlineWidths += newInline.width;
	this.newLineForced = true;
};

Line.prototype.getWidth = function () {
	return this.inlineWidths - this.leadingCut - this.trailingCut;
};

/**
 * Returns line height
 * @return {Number}
 */
Line.prototype.getHeight = function () {
	var max = 0;

	this.inlines.forEach(function (item) {
		max = Math.max(max, item.height || 0);
	});

	return max;
};

module.exports = Line;
