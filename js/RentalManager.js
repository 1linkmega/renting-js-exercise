import RentalManagerApp from "./RentalManagerApp.js";
const historyActions = {
	init: () => RentalManagerApp.handleInit(),
	vehiclesCategoryList: (event) => RentalManagerApp.handleVehiclesCategoryList(event.state.category),
	vehiclesLocationList: (event) => RentalManagerApp.handleVehiclesLocationList(event.state.location),
	showVehicle: (event) => RentalManagerApp.handleShowVehicle(event.state.vehicle), //arreglado ;)
	Search: (event) => RentalManagerApp.handleSearch(event.state.text, event.state.min, event.state.max, event.state.showRented),
	addCat: () => RentalManagerApp.handleAddCatForm(),
	delCat: () => RentalManagerApp.handleDelCatForm(),
	assignCat: () => RentalManagerApp.handleAssignCatForm(),
	addLoc: () => RentalManagerApp.handleAddLocForm(),
	delLoc: () => RentalManagerApp.handleDelLocForm(),
	addVehicle: () => RentalManagerApp.handleAddVehicleForm(),
	delVehicle: () => RentalManagerApp.handleDelVehicleForm(),
	login: () => RentalManagerApp.handleLoginForm(),
	favs: (event) => RentalManagerApp.handleFavs(event.state.favs),
};

  
  window.addEventListener('popstate', (event) => {
	if (event.state) {
	  	historyActions[event.state.action](event);
	}
});
  
history.replaceState({ action: 'init' }, null);
  