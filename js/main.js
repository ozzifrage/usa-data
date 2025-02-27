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
				if (element.Income < 30000) {
					element.IncomeClass = "income-low"
				} else if (element.Income < 60000) {
					element.IncomeClass = "income-medium"
				} else {
					element.IncomeClass = "income-high"
				}

				if (element.VetPct < 5) {
					element.VetClass = "vet-low"
				} else if (element.VetPct < 10) {
					element.VetClass = "vet-medium"
				} else {
					element.VetClass = "vet-high"
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
		interestCategories: ["income-low", "income-medium", "income-high"],
		barColor: '#31a354',
		keyMetric: 'IncomeClass',
		xAxisLabel: 'Household Income Bracket',
		chartTitle: 'Distribution of County Median Household Incomes'
	}, mergedData)

	veteransBarChart = new BarChart({
		parentElement: '#top-vis',
		interestCategories: ["vet-low", "vet-medium", "vet-high"],
		barColor: '#3182bd',
		keyMetric: 'VetClass',
		xAxisLabel: 'Adult Veterancy % Bracket',
		chartTitle: 'Distribution of County Veterancy Rates'
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
		titleText: "Veterancy Rate by County"
	}, geoData);

	// map of medium household income by county
	const incomeMap = new ChoroplethMap({
		parentElement: '#vis',
		colorRange: ['#e5f5e0', '#31a354'],
		tooltipString: `Median Household Income: $`,
		tooltipMetric: "Income",
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