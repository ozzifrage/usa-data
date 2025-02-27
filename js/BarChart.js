class BarChart {

	constructor(_config, _data) {
		this.config = {
			parentElement: _config.parentElement,
			containerWidth: _config.containerWidth || 500,
			containerHeight: _config.containerHeight || 500,
			margin: { top: 40, right: 50, bottom: 80, left: 70 }
		}

		this.data = _data;
		this.interestCategories = _config.interestCategories;
		this.colorRange = _config.colorRange;

		this.initVis();
	}

	initVis() {

		let vis = this;

		// Width and height as the inner dimensions of the chart area- as before
		vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
		vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

		// Define size of SVG drawing area
		vis.svg = d3.select(vis.config.parentElement).append('svg')
			.attr('class', 'center-container')
			.attr('width', vis.config.containerWidth)
			.attr('height', vis.config.containerHeight);

		vis.chart = vis.svg.append('g')
			.attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

		//vis.chart = vis.svg.append('rect')
		//	.attr('class', 'background center-container')
		//	.attr('height', vis.config.containerWidth) //height + margin.top + margin.bottom)
		//	.attr('width', vis.config.containerHeight) //width + margin.left + margin.right)
		//	.on('click', vis.clicked)
		//	.attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

		// All subsequent functions/properties can ignore the margins
		// Initialize linear + ordinal scales
		const xScale = d3.scaleBand()
			.domain(vis.interestCategories)
			.range([0, vis.width])
			.paddingInner(0.15);

		const yScale = d3.scaleLinear()
			.domain([vis.data.length, 0])
			.range([0, vis.height]);


		// Initialize axes
		const xAxis = d3.axisBottom(xScale)

		const yAxis = d3.axisLeft(yScale)

		// Draw the axis (move xAxis to the bottom with 'translate')
		const xAxisGroup = vis.chart.append('g')
			.attr('class', 'axis x-axis')
			.attr('transform', `translate(0, ${vis.height})`)
			.call(xAxis);


		const yAxisGroup = vis.chart.append('g')
			.attr('class', 'axis y-axis')
			.call(yAxis);

		// Add X axis label:
		vis.chart.append("text")
			.attr("text-anchor", "end")
			.attr("x", vis.width / 2 + vis.config.margin.left + 20)
			.attr("y", vis.height + vis.config.margin.top)
			.text("Household Income Bracket");

		// Y axis label:
		vis.chart.append("text")
			.attr("text-anchor", "end")
			.attr("transform", "rotate(-90)")
			.attr("y", -vis.config.margin.left + 20)
			.attr("x", -vis.config.margin.top - 100)
			.text("# Of Counties")

		//vis.updateVis()
	}

	updateVis() {

		// determine how many of each applicable class are in the current dataset (with filter applied upstream)
		let vis = this

		// Add rectangles
		vis.svg.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('class', 'bar')
			.attr('width', d => xScale(d.sales))
			.attr('height', yScale.bandwidth())
			.attr('y', d => yScale(d.month))
			.attr('x', 0);
	}

}