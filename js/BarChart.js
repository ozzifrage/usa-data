class BarChart {

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

		// Define size of SVG drawing area
		vis.svg = d3.select(vis.config.parentElement).append('svg')
		.attr('class', 'center-container')
		.attr('width', vis.config.containerWidth)
		.attr('height', vis.config.containerHeight);

		vis.svg.append('rect')
			.attr('class', 'background center-container')
			.attr('height', vis.config.containerWidth) //height + margin.top + margin.bottom)
			.attr('width', vis.config.containerHeight) //width + margin.left + margin.right)
			.on('click', vis.clicked);

		// All subsequent functions/properties can ignore the margins
		// Initialize linear + ordinal scales
		const xScale = d3.scaleLinear()
			.domain([0, d3.max(data, d => d.sales)])
			.range([0, width]);


		const yScale = d3.scaleBand()
			.domain(data.map(d => d.month))
			.range([0, height])
			.paddingInner(0.15);


		// Initialize axes
		const xAxis = d3.axisBottom(xScale)
			.ticks(6)
			.tickSizeOuter(0);


		const yAxis = d3.axisLeft(yScale)
			.tickSizeOuter(0);


		// Draw the axis (move xAxis to the bottom with 'translate')
		const xAxisGroup = svg.append('g')
			.attr('class', 'axis x-axis')
			.attr('transform', `translate(0, ${height})`)
			.call(xAxis);


		const yAxisGroup = svg.append('g')
			.attr('class', 'axis y-axis')
			.call(yAxis);


		// Add rectangles
		svg.selectAll('rect')
			.data(data)
			.enter()
			.append('rect')
			.attr('class', 'bar')
			.attr('width', d => xScale(d.sales))
			.attr('height', yScale.bandwidth())
			.attr('y', d => yScale(d.month))
			.attr('x', 0); a

	}


}