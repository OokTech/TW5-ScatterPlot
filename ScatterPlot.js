/*\
title: $:/plugins/OokTech/ScatterPlot/ScatterPlot.js
type: application/javascript
module-type: widget

A widget that creates a scatter plot.

\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;
var widgets;
var container;

var ScatterPlot = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
ScatterPlot.prototype = new Widget();

/*
Render this widget into the DOM
*/
ScatterPlot.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	var domNode = this.document.createElement("div");
	parent.insertBefore(domNode,nextSibling);
	this.renderChildren(domNode,null);
	this.domNodes.push(domNode);
};

/*
Compute the internal state of the widget
*/
ScatterPlot.prototype.execute = function() {
	//Get widget attributes.
	var width = this.getAttribute("width", "200");
	var widthUnit = this.getAttribute("width-unit", "px");
	var height = this.getAttribute("height", "200");
	var heightUnit = this.getAttribute("height-unit", "px");
	var radius = this.getAttribute("radius", "3");
	var stroke = this.getAttribute("stroke", "black");
	var fill = this.getAttribute("fill", "yellow");
	var strokeWidth = this.getAttribute("strokeWidth", "1");
	var data = this.getAttribute("data");
	var mode = this.getAttribute("mode", "scatter");
	var symbol = this.getAttribute("symbol", "o");
	var scale = this.getAttribute("scale", 'false');

	//Get the data points
	//Data can be one or two dimensional
	//One dimensional data is given by a list of comma separated values
	//Data can take a string of x-y values in the form x1,y1;x2,y2;

	var ScatterPlotString = "<svg style='border:solid 1px' width=" + width + widthUnit + " height=" + height + heightUnit + ">";

	if (data) {
		//Figure out if it is one or two dimensional data
		var twoDimensions = true;
		if (data.indexOf(',') === -1 || data.indexOf(' ') === -1) {
			var twoDimensions = false;
		}

		//Get the values for each point
		var points = data.split(' ');
		console.log(points)
		//determine spacing for sequential data
		var valueWidth = width/(points.length-1);

		var coordinates = [];
		var value;
		var max = [0,0];
		var min = [99999,99999];
		for (var i = 0; i < points.length; i++) {
			if (twoDimensions) {
				value = points[i].split(',');
			} else {
				value = [i*valueWidth,points[i]];
			}
			//Keep track of the max and min values
			if (Number(value[0]) > max[0]) {
				max[0] = value[0];
			}
			if (Number(value[1]) > max[1]) {
				max[1] = value[1];
			}
			if (Number(value[0]) < min[0]) {
				min[0] = value[0];
			}
			if (Number(value[1]) < min[1]) {
				min[1] = value[1];
			}

			coordinates.push(value);
		}

		var outputs = [];
		for (var i = 0; i < coordinates.length; i++) {
			if (scale === 'auto') {
				var xScale = 0.9*width/(max[0]-min[0]);
				var yScale = 0.9*height/(max[1]-min[1]);
				outputs.push([xScale*(coordinates[i][0]-min[0]),height-yScale*(coordinates[i][1]-min[1])]);
			} else if (scale === 'size') {
				var xScale = width/(max[0]-min[0]);
				var yScale = height/(max[1]-min[1]);
				outputs.push([xScale*(coordinates[i][0]-min[0]),height-yScale*(coordinates[i][1]-min[1])]);
			} else {
				outputs.push([coordinates[i][0],height-coordinates[i][1]]);
			}
		}

		for (var i = 0; i < outputs.length; i++) {
			//Add the point
			ScatterPlotString += "<circle cx=" + outputs[i][0] + " cy=" + outputs[i][1] + " r=" + radius + " stroke=" + stroke + " fill=" + fill + " stroke-width=" + strokeWidth + "/>";
			//If the points are connected using lines, add the lines.
			if (mode === 'line') {
				if (i > 0) {
					ScatterPlotString += "<line x1=" + oldValue[0] + " y1=" + oldValue[1] + " x2=" + outputs[i][0] + " y2=" + outputs[i][1] + " stroke-width=1 stroke=black/>";
				}
				var oldValue = outputs[i];
			}
			if (mode === 'whisker') {
				ScatterPlotString += "<line x1=" + outputs[i][0] + " y1=" + height + " x2=" + outputs[i][0] + " y2=" + outputs[i][1] + " stroke-width=1 stroke=black/>";
			}
		}
	}

	//Close the outer divs
	ScatterPlotString += "</svg>";
	/*
	ScatterPlotString += "<div style='width:" + width + "px;position:relative;'><div style='text-align:left;'>" + min[0] + "</div><div style='width:100%;text-align:right;position:absolute;top:0px;'>" + max[0] + "</div></div>"
	*/

	//This is the part that actually displays the bar in the wiki
	var parser = this.wiki.parseText("text/vnd.tiddlywiki",ScatterPlotString,{parseAsInline: false});
	var parseTreeNodes = parser ? parser.tree : [];
	this.makeChildWidgets(parseTreeNodes);

};

/*
Refresh the widget by ensuring our attributes are up to date
*/
ScatterPlot.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(Object.keys(changedAttributes).length) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

exports["ScatterPlot"] = ScatterPlot;

})();
