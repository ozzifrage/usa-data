class BarChart {

	constructor(_config, _data) {
		this.config = {
			parentElement: _config.parentElement,
			containerWidth: _config.containerWidth || 500,
			containerHeight: _config.containerHeight || 500,
			margin: { top: 40, right: 50, bottom: 80, left: 70 },
			metricType: _config.metricType
		}

		this.data = _data;
		this.interestCategories = _config.interestCategories;
		this.barColor = _config.barColor;
		this.keyMetric = _config.keyMetric;
		this.xAxisLabel = _config.xAxisLabel;
		this.titleText = _config.chartTitle;

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
			.attr('class', vis.config.metricType)
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
		vis.xScale = d3.scaleBand()
			.domain(vis.interestCategories)
			.range([0, vis.width])
			.paddingInner(0.15);

		vis.yScale = d3.scaleLinear()
			.domain([0, vis.data.length])
			.range([vis.height, 0]);


		// Initialize axes
		const xAxis = d3.axisBottom(vis.xScale)

		const yAxis = d3.axisLeft(vis.yScale)

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
			.text(vis.xAxisLabel);

		// Y axis label:
		vis.chart.append("text")
			.attr("text-anchor", "end")
			.attr("transform", "rotate(-90)")
			.attr("y", -vis.config.margin.left + 20)
			.attr("x", -vis.config.margin.top - 100)
			.text("# Of Counties")

		// chart title
		vis.chart.append("text")
			.attr("x", (vis.width / 2))             
			.attr("y", 0 - (vis.config.margin.top / 2))
			.attr("text-anchor", "middle")  
			.style("font-size", "16px") 
			.style("text-decoration", "underline")  
			.text(vis.titleText);

		vis.updateVis()
	}

	updateVis() {

		console.log("called updateVis")
		let vis = this

		// determine how many of each applicable class are in the current dataset (with filter applied upstream)
		let aggrData = []
		console.log(vis.interestCategories)

		for (let category in vis.interestCategories) {
			console.log(vis.interestCategories[category])
			aggrData.push([vis.interestCategories[category], (d3.filter(vis.data, (d) => d[vis.keyMetric] == vis.interestCategories[category]).length)])
		}
		console.log(aggrData)

		// Add rectangles
		vis.bars = vis.svg.selectAll('rect')
			.data(aggrData)
			.join('rect')
			.attr('class', 'bar')
			.attr('fill', vis.barColor)
			.attr('width', vis.xScale.bandwidth() / 2 )
			.attr('height', d => vis.height - vis.yScale(d[1]))
			.attr('y', d => vis.yScale(d[1]) + 40)
			.attr('x', d => vis.xScale(d[0]) + 100);

		vis.bars.on('mousemove', (event, d) => {
			console.log("mouse over bar plot! ");
			console.log(d);
			console.log(event);

			d3.select('#tooltip')
				.style('display', 'block')
				.style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
				.style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
				.html(`
					<div class="tooltip-title">Total Counties: ${d[1]}</div>

				`);
		})
		.on('mouseleave', () => {
			d3.select('#tooltip').style('display', 'none');
		});
	}

}