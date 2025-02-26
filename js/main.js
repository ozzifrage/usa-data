/**
 * Load all data before doing anything else.
 */

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
	let mergedData = data[0]
	mergedData.forEach(element => {
		for (let i = 0; i < hhIncomeData.length; i++) {
			if (element.FIPS === hhIncomeData[i].FIPS) {
				element.VetPct = +element.VetPct
				element.Income = +hhIncomeData[i].MedIncome;

				if (element.Income < 30000) {
					element.IncomeClass = "low"
				} else if (element.Income < 60000) {
					element.IncomeClass = "medium"
				} else {
					element.IncomeClass = "high"
				}

				if (element.VetPct < 5) {
					element.VetClass = "low"
				} else if (element.VetPct < 10) {
					element.VetClass = "medium"
				} else {
					element.VetClass = "high"
				}
			}
		}


	})

	// make a scatter plot showing veteran pop percent vs household income
	let scatterPlot = new ScatterPlot({
		'parentElement': '#scatterplot',
		'containerHeight': 500,
		'containerWidth': 600
	}, mergedData);

	// join veteran percentage and median hh income to geo data on county FIPS code
	geoData.objects.counties.geometries.forEach(element => {

		for (let i = 0; i < mergedData.length; i++) {
			if (element.id === mergedData[i].FIPS) {
				element.properties.VetPct = mergedData[i].VetPct;
				element.properties.Income = mergedData[i].Income;
			}
		}
	});

	console.info("Data preprocessing complete.")


	// map of adult pop is veteran by county
	const vetsMap = new ChoroplethMap({
		parentElement: '#vis',
		colorRange: ['#deebf7', '#3182bd'],
		tooltipString: `Adult Pop. Vet %: `,
		tooltipMetric: "VetPct"
	}, geoData);



	// map of medium household income by county
	const incomeMap = new ChoroplethMap({
		parentElement: '#vis',
		colorRange: ['#e5f5e0', '#31a354'],
		tooltipString: `Median Household Income: $`,
		tooltipMetric: "Income"
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
	let selectedCategory = [];
	d3.selectAll('.legend-btn:not(.inactive)').each(function() {
	  selectedCategory.push(d3.select(this).attr('category'));
	});
  
	// Filter data accordingly and update vis
	//timelineCircles.data = data.filter(d => selectedCategory.includes(d.category)) ;
	//timelineCircles.updateVis();
  
  });