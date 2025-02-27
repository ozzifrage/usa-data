/**
 * Load all data before doing anything else.
 */

let data, mergedData, scatterPlot, incomeBarChart, vetBarChart;

Promise.all([
	d3.csv('data/adult-pop-vet-pct.csv'),
	d3.csv('data/median-hh-income.csv'),
	d3.json('data/counties-10m.json')
]).then(data => {

	// callback executed once all promised data is loaded.
	console.info("All data files have been loaded.")
	const veteranPctData = data[0]
	const hhIncomeData = data[1]
	const geoData = data[2]

	// zip data together for scatter plot
	mergedData = data[0]
	mergedData.forEach(element => {
		for (let i = 0; i < hhIncomeData.length; i++) {
			if (element.FIPS === hhIncomeData[i].FIPS) {
				element.VetPct = +element.VetPct
				element.Income = +hhIncomeData[i].MedIncome;

				// add binned data for representational graphs
				if (element.Income < 50000) {
					element.IncomeClass = "below-50k"
				} else if (element.Income < 70000) {
					element.IncomeClass = "50k-to-70k"
				} else {
					element.IncomeClass = "above-70k"
				}

				if (element.VetPct < 5) {
					element.VetClass = "below-5-pct"
				} else if (element.VetPct < 10) {
					element.VetClass = "5-to-10-pct"
				} else {
					element.VetClass = "above-10-pct"
				}
			}
		}


	})

	// make a scatter plot showing veteran pop percent vs household income
	scatterPlot = new ScatterPlot({
		parentElement: '#top-vis',
		containerHeight: 500,
		containerWidth: 600,
		titleText: 'County Veterancy Rate vs. Median Household Income'
	}, mergedData);

	incomeBarChart = new BarChart({
		parentElement: '#top-vis',
		interestCategories: ["below-50k", "50k-to-70k", "above-70k"],
		barColor: '#31a354',
		keyMetric: 'IncomeClass',
		xAxisLabel: 'Household Income Bracket',
		chartTitle: 'Distribution of County Median Household Incomes',
		metricType: 'income'
	}, mergedData)

	veteransBarChart = new BarChart({
		parentElement: '#top-vis',
		interestCategories: ["below-5-pct", "5-to-10-pct", "above-10-pct"],
		barColor: '#3182bd',
		keyMetric: 'VetClass',
		xAxisLabel: 'Adult Veterancy % Bracket',
		chartTitle: 'Distribution of County Veterancy Rates',
		metricType: 'veterans'
	}, mergedData)

	// join veteran percentage and median hh income to geo data on county FIPS code
	geoData.objects.counties.geometries.forEach(element => {

		for (let i = 0; i < mergedData.length; i++) {
			if (element.id === mergedData[i].FIPS) {
				element.properties.VetPct = mergedData[i].VetPct;
				element.properties.Income = mergedData[i].Income;
			}
		}
	});

	// map of adult pop is veteran by county
	const vetsMap = new ChoroplethMap({
		parentElement: '#vis',
		colorRange: ['#deebf7', '#3182bd'],
		tooltipString: `Adult Pop. Vet %: `,
		tooltipMetric: "VetPct",
		metricType: "veterans",
		titleText: "Veterancy Rate by County"
	}, geoData);

	// map of medium household income by county
	const incomeMap = new ChoroplethMap({
		parentElement: '#vis',
		colorRange: ['#e5f5e0', '#31a354'],
		tooltipString: `Median Household Income: $`,
		tooltipMetric: "Income",
		metricType: "income",
		titleText: "Median Household Income by County"
	}, geoData);

})
.catch(error => console.error(error))

/**
 * Event listener: use color legend as filter
 */
d3.selectAll('.legend-btn').on('click', function() {
	console.log("button! ");
	// Toggle 'inactive' class
	d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));
	
	// Check which categories are active
	let selectedCategories = [];
	d3.selectAll('.legend-btn:not(.inactive)').each(function() {
		selectedCategories.push(d3.select(this).attr('category'));
	});
	console.log(selectedCategories)
	console.log(mergedData)
  
	// Filter data accordingly and update vises
	filteredData = mergedData.filter(d => selectedCategories.includes(d.VetClass) && selectedCategories.includes(d.IncomeClass));
	console.log(filteredData)
	scatterPlot.data = filteredData;
	incomeBarChart.data = filteredData;
	veteransBarChart.data = filteredData;
	
	scatterPlot.updateVis();
	incomeBarChart.updateVis();
	veteransBarChart.updateVis();
  
  });

d3.selectAll('.visibility-btn').on('click', function() {
	console.log("visibility button!")

	// Toggle 'inactive' class
	d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));

	// Check which categories are active
	let activeViews = [];
	d3.selectAll('.visibility-btn:not(.inactive)').each(function() {
		activeViews.push(d3.select(this).attr('category'));
	});

	console.log(activeViews)
	// show all views in active categories, hide the rest
	if (activeViews.includes("median-household-income")) {
		console.log("showing the income graphs")
		d3.selectAll(".income").style('display', 'table-cell');

	} else {
		console.log("hiding the income graphs")
		console.log(d3.selectAll("income"))
		d3.selectAll(".income").style('display', 'none');
	}

	// show all views in active categories, hide the rest
	if (activeViews.includes("adult-veterancy-rate")) {
		console.log("showing the veterancy graphs")
		d3.selectAll(".veterans").style('display', 'table-cell');
	} else {
		console.log("hiding the income graphs")
		d3.selectAll(".veterans").style('display', 'none');
	}


});