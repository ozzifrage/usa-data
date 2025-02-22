/**
 * Load all data before doing anything else.
 */

Promise.all([
	d3.csv('data/Veterans.csv'),
	d3.json('data/counties-10m.json')
]).then(data => {

	// callback executed once all promised data is loaded.
	console.info("All data files have been loaded.")
	const veteransData = data[0]
	const geoData = data[1]

	// join "percent of adult pop is veteran" to geo data on county FIPS code
	geoData.objects.counties.geometries.forEach(element => {
		console.log(element)

		for (let i = 0; i < countyPopulationData.length; i++) {
			if (element.id === countyPopulationData[i].cnty_fips) {
				element.properties.vetpop = +countyPopulationData[i].Value;
			}
		}

	});

	// map of adult pop is veteran by county
	//const choroplethMap = new ChoroplethMap({
	//	parentElement: '.viz',
	//}, geoData);

})
.catch(error => console.error(error))