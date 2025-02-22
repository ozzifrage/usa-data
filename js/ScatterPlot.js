class ScatterPlot {

	constructor(_config, _data) {
		this.config = {
			parentElement: _config.parentElement,
			containerWidth: _config.containerWidth || 500,
			containerHeight: _config.containerHeight || 140,
			margin: { top: 40, right: 50, bottom: 80, left: 80 }
		}

		this.data = _data;

		this.initVis();
	}

	initVis() {

		let vis = this;

		// Width and height as the inner dimensions of the chart area- as before
		vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
		vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

		// Define 'svg' as a child-element (g) from the drawing area and include spaces
		// Add <svg> element (drawing space)
		vis.svg = d3.select(vis.config.parentElement)
			.attr('width', vis.config.containerWidth)
			.attr('height', vis.config.containerHeight)

		vis.chart = vis.svg.append('g')
			.attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

		// Initialize linear and ordinal scales (input domain and output range)
		vis.xScale = d3.scaleLinear()
			.domain([d3.min(vis.data, d => d.VetPct), d3.max(vis.data, d => d.VetPct)])
			.range([0, vis.width]);

		vis.yScale = d3.scaleLinear()
			.domain([d3.max(vis.data, d => d.Income), d3.min(vis.data, d => d.Income)])
			.range([0, vis.height]);
		
		// Initialize axes
		vis.xAxis = d3.axisBottom(vis.xScale);
		vis.yAxis = d3.axisLeft(vis.yScale);

		// Draw the axes
		vis.xAxisGroup = vis.chart.append('g')
			.attr('class', 'axis x-axis')
			.attr("transform", "translate(0," + vis.height + ")")
			.call(vis.xAxis);

		vis.yAxisGroup = vis.chart.append('g')
			.attr('class', 'axis y-axis')
			.call(vis.yAxis);

		// Add X axis label:
		vis.chart.append("text")
			.attr("text-anchor", "end")
			.attr("x", vis.width / 2 + vis.config.margin.left)
			.attr("y", vis.height + vis.config.margin.top)
			.text("% of Adults that are Veterans");

		// Y axis label:
		vis.chart.append("text")
			.attr("text-anchor", "end")
			.attr("transform", "rotate(-90)")
			.attr("y", -vis.config.margin.left+20)
			.attr("x", -vis.config.margin.top)
			.text("Median Household Income (USD)")

		//Add circles for each event in the data
		vis.chart.selectAll('circle')
			.data(vis.data)
			.enter()
			.append('circle')
			.attr('fill', "white")
			.attr('opacity', .8)
			.attr('stroke', "DarkSlateBlue")
			.attr('stroke-width', 1)
			.attr('r', 1)
			.attr('cx', (d) => vis.xScale(d.VetPct))
			.attr('cy', (d) => vis.yScale(d.Income));
	}

}