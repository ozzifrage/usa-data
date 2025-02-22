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
			}
		}
	})

	// make a scatter plot showing veteran pop percent vs household income
	let scatterPlot = new ScatterPlot({
		'parentElement': '#scatterplot',
		'containerHeight': 480,
		'containerWidth': 600
	}, mergedData);

	// join veteran percentage and median hh income to geo data on county FIPS code
	// there's a more optimized way to do this but shut up nerd
	geoData.objects.counties.geometries.forEach(element => {

		for (let i = 0; i < veteranPctData.length; i++) {
			if (element.id === veteranPctData[i].FIPS) {
				element.properties.vetpop = +veteranPctData[i].Value;
			}
		}

		for (let i = 0; i < hhIncomeData.length; i++) {
			if (element.id === hhIncomeData[i].FIPS) {
				element.properties.hhIncome = +hhIncomeData[i].Value;
			}
		}
	});

	console.info("Data preprocessing complete.")







	// map of adult pop is veteran by county
	//const choroplethMap = new ChoroplethMap({
	//	parentElement: '.viz',
	//}, geoData);

})
.catch(error => console.error(error))