import {Vehicle, Car, Bike, Van, Category, Location, Coordinate, Customer, Rental} from './entities.js';
import {EmptyValueException, InvalidValueException, ParamIsNotObjectException} from "./exceptions.js";

"use strict";

// Implementación del sistema de alquiler de coches

// Clase RentalManager Singleton

const RentalManager = (function () {

	    // Generador de identificadores protegido por el cerramiento del Singleton
	function idsGenerator(){
		let index = 1;
		return {
			getNextId: function(){
				const id = index;
				++index;
				return id;
			}
		}
	}
		
	class RentalManager {
		#categories = [];
		#locations = [];
		#vehicles = [];
		#customers = [];
		#rentals = [];
		#ids;

		// Métodos de ordenación auxiliares

		#sortCategoriesFunc = (catA, catB) => (
			(catA.category.name.toLocaleLowerCase() < catB.category.name.toLocaleLowerCase())
				? -1 : 1
		);
		
		#sortLocationsFunc = (locA, locB) => (
			(locA.location.name.toLocaleLowerCase() < locB.location.name.toLocaleLowerCase())
				? -1 : 1
		);

		#sortVehiclesFunc = (vehicleA, vehicleB) => {
			if (vehicleA.brand.toLocaleLowerCase() < vehicleB.brand.toLocaleLowerCase()) {
				return -1;
			} if (vehicleA.brand.toLocaleLowerCase() > vehicleB.brand.toLocaleLowerCase()) {
				return 1;
			}
			return (vehicleA.model.toLocaleLowerCase() < vehicleB.model.toLocaleLowerCase()) ? -1 : 1;			
		};

		#sortCustomersFunc = (customerA, customerB) => {
			(customerA.name.toLocaleLowerCase() < customerB.name.toLocaleLowerCase())
				? -1 : 1		
		};

		#sortVehiclesInCategoryFunc = (vehicleA, vehicleB) => (
			(vehicleA.price > vehicleB.price) ? -1 : 1
		);

		#sortVehiclesInLocationFunc = (vehicleA, vehicleB) => (
			(vehicleA.license > vehicleB.license) ? -1 : 1
		);

		constructor(ids) {
			if (!new.target) throw new InvalidAccessConstructorException();
			
			Object.defineProperty(this, 'categories', {
				enumerable: true,
				get() {
					const array = this.#categories;
					return {
					* [Symbol.iterator]() {
						for (const arrayCat of array) {
						yield arrayCat.category;
						}
					},
					};
				},
				});

			Object.defineProperty(this, 'locations', {
			enumerable: true,
			get() {
				const array = this.#locations;
				return {
				* [Symbol.iterator]() {
					for (const arrayLoc of array) {
					yield arrayLoc.location;
					}
				},
				};
			},
			});
	
			Object.defineProperty(this, 'vehicles', {
			enumerable: true,
			get() {
				const array = this.#vehicles;
				return {
				* [Symbol.iterator]() {
					for (const vehicle of array) {
					yield vehicle;
					}
				},
				};
			},
			});

			Object.defineProperty(this, 'customers', {
			enumerable: true,
			get() {
				const array = this.#customers;
				return {
				* [Symbol.iterator]() {
					for (const customer of array) {
					yield customer;
					}
				},
				};
			},
			});

			Object.defineProperty(this, 'rentals', {
			enumerable: true,
			get() {
				const array = this.#rentals;
				return {
				* [Symbol.iterator]() {
					for (const rental of array) {
					yield rental;
					}
				},
				};
			},
			});

			this.#ids = ids();
		}

		#vehicleConstructors = {
			Car,
			Bike,
			Van,
		};

		// Métodos auxiliares getPosition

		#getCategoryPosition(category) {
			return this.#categories.findIndex((x) => x.category.name === category.name);
		}

		#getLocationPosition(location) {
			return this.#locations.findIndex((x) => x.location.name === location.name);
		}

		#getVehiclePosition(vehicle) {
			return this.#vehicles.findIndex((x) => x.license === vehicle.license);
		}

		#getVehiclePositionIn(vehicle, index) {
			return index.vehicles.findIndex((x) => x.license === vehicle.license);
		}

		#getCustomerPosition(customer) {
			return this.#customers.findIndex((x) => x.id === customer.id);
		}

		#getRentalPosition(rental) {
			return this.#rentals.findIndex((x) => x.id === rental.id);
		}

		#getRentalPositionWithCustomer(customer) {
			return this.#rentals.findIndex((x) => x.customer.id === customer.id);
		}
	
		// Métodos Add
		addCategory(...categories) {
			for (const category of categories) {
				if (!(category instanceof Category)) {
					throw new ParamIsNotObjectException("category", "Category");
				}
				const position = this.#getCategoryPosition(category);
				if (position === -1) {
					this.#categories.push({
					category,
					vehicles: [],
					});
					this.#categories.sort(this.#sortCategoriesFunc);
				} else {
					throw new ExistsException(category);
				}
				
			}
			return this;
		}
	
		addVehicle(...vehicles) {
			for (const vehicle of vehicles) {		
				if (!(vehicle instanceof Vehicle)) {
					throw new ParamIsNotObjectException("vehicle", "Vehicle");
				}
				const position = this.#getVehiclePosition(vehicle);
				if (position === -1) {
					this.#vehicles.push(vehicle);
					this.#vehicles.sort(this.#sortVehiclesFunc);
					} else {
					throw new ExistsException(vehicle);
					}
			}
		}

		addCustomer(...customers) {
			for (const customer of customers) {		
				if (!(customer instanceof Customer)) {
					throw new ParamIsNotObjectException("customer", "Customer");
				}
				const position = this.#getCustomerPosition(customer);
				if (position === -1) {
					this.#customers.push(customer);
					this.#customers.sort(this.#sortCustomersFunc);
					} else {
					throw new ExistsException(customer);
					}
			}
		}
		
		addLocation(...locations) {
			for (const location of locations) {
				if (!(location instanceof Location)) {
					throw new ParamIsNotObjectException("location", "Location");
				}
				const position = this.#getLocationPosition(location);
				if (position === -1) {
					this.#locations.push({
					location,
					vehicles: [],
					});
					this.#locations.sort(this.#sortLocationsFunc); 
				} else {
					throw new ExistsException(location);
				}
				
			}
			return this;
		}
	
		// Métodos Remove
		removeCategory(...categories) {
			for (const category of categories) {
				if (!(category instanceof Category)) {
				throw new ParamIsNotObjectException("category", "Category");
				}
				const position = this.#getCategoryPosition(category);
				if (position !== -1) {
				this.#categories.splice(position, 1);
				} else {
				throw new DoNotExistException(category);
				}
			}
			return this;
			}

		removeVehicle(...vehicles) {
			for (const vehicle of vehicles) {
				if (!(vehicle instanceof Vehicle)) {
					throw new ParamIsNotObjectException('vehicle', 'vehicle');
				}
				const position = this.#getVehiclePosition(vehicle);
				if (position !== -1) {
					const storedVehicle = this.#vehicles[position];
					if (storedVehicle.isRented) {
						throw new HasRentalException(vehicle);
					}

					for (const category of this.#categories) {
						let pVehicle = this.#getVehiclePositionIn(vehicle, category);
						if (pVehicle !== -1) {		
							category.vehicles.splice(pVehicle, 1);
						}
					}

					for (const location of this.#locations) {
						let pVehicle = this.#getVehiclePositionIn(vehicle, location);
						if (pVehicle !== -1) {
							location.vehicles.splice(pVehicle, 1);
						}
					}

					this.#vehicles.splice(position, 1);
				} else {
					throw new DoNotExistException(vehicle);
				}
				}
				return this;
			}

		removeLocation(...locations) {
			for (const location of locations) {
				if (!(location instanceof Location)) {
				throw new ParamIsNotObjectException("location", "Location");
				}
				const position = this.#getLocationPosition(location);
				if (position !== -1) {
					for (const vehicle of [...this.#locations[position].vehicles]) {
						this.removeVehicle(vehicle);
					}
					this.#locations.splice(position, 1);
				} else {
					throw new DoNotExistException(location);
				}
			}
			return this;
		}
	
		removeCustomer(...customers) {
			for (const customer of customers) {
				if (!(customer instanceof Customer)) {
					throw new ParamIsNotObjectException('customer', 'customer');
				}
				const pCustomer = this.#getCustomerPosition(customer);
				if (pCustomer !== -1) {
					//const storedCustomer = this.#customers[pCustomer];
					let pRental = this.#getRentalPositionWithCustomer(customer);
					if (pRental !== -1 && !(this.#rentals[pRentals].isFinished)) {
						throw new HasRentalException(customer);
					} 
					this.#customers.splice(pCustomer, 1)
				} else {
					throw new DoNotExistException(customer);
				}
				return this;
			}
		}
		
		// Métodos Create
		createVehicle(type, license, brand, model, price, variable, description = "", image = "", isRented = false){
			let vehicle = this.#vehicles.find((v) => v.license === license);
			if (!vehicle) {
				vehicle = new this.#vehicleConstructors[type](license, brand, model, price, variable, description, image, isRented);
			}
			return vehicle;
		}
	
		createLocation(name, address, location = null, description = "") {
			let loc = this.#locations.find((l) => l.name === name);
			if (!loc) {
				loc = new Location(name, address, location, description);
			}
			return loc;
		}
	
		createCustomer(id, name) {
			let customer = this.#customers.find((c) => c.id === id);
			if (!customer) {
				customer = new Customer(id, name);
			}
			return customer;
		}

		createCategory(name, description = "") {
			let category = this.#categories.find((c) => c.name === name);
			if (!category) {
				category = new Category(name, description);
			}
			return category;
		}
	
		// Métodos de asignación y desasignación

		assignCategoryToVehicle(category, ...vehicles) {
			if (!(category instanceof Category)) {
				throw new ParamIsNotObjectException("category","Category")
				}
				let pCategory = this.#getCategoryPosition(category);
				if (pCategory === -1) {
				this.addCategory(category);
				pCategory = this.#getCategoryPosition(category);
				}
			for (const vehicle of vehicles) {
				if (!(vehicle instanceof Vehicle)) {
					throw new ParamIsNotObjectException("vehicle","Vehicle")
				}
	
				let pVehicle = this.#getVehiclePosition(vehicle);
				
				if (pVehicle === -1) {
					this.addVehicle(vehicle);
					pVehicle = this.#getVehiclePosition(vehicle);
				}
				const position = this.#getVehiclePositionIn(vehicle, this.#categories[pCategory]);
				if (position === -1) {
				this.#categories[pCategory].vehicles.push(this.#vehicles[pVehicle]);
				this.#categories[pCategory].vehicles.sort(this.#sortVehiclesInCategoryFunc);
				}
			}

			return this;
		}
		
		deassignCategoryToVehicle(category, ...vehicles) {
			if (!(category instanceof Category)) {
				throw new ParamIsNotObjectException("category","Category")
				}
			let pCategory = this.#getCategoryPosition(category);
			if (pCategory === -1) {
				throw new DoNotExistException(category)
			}

			for (const vehicle of vehicles) {
				if (!(vehicle instanceof Vehicle)) {
					throw new ParamIsNotObjectException("vehicle","Vehicle")
				}
	
				let pVehicle = this.#getVehiclePosition(vehicle);
				
				if (pVehicle === -1) {
					throw new DoNotExistException(vehicle)
				}
				let pVehicleIn = this.#getVehiclePositionIn(vehicle, this.#categories[pCategory]);

				if (pVehicleIn !== -1) {
					this.#categories[pCategory].vehicles.splice(pVehicleIn, 1);
				}

				
			}

			return this;
		}

		assignLocationToVehicle(location, ...vehicles) {
			if (!(location instanceof Location)) {
				throw new ParamIsNotObjectException("location", "Location");
			}

			// Asegurarse de que la localización existe en el sistema
			let pLocation = this.#getLocationPosition(location);
			if (pLocation === -1) {
				this.addLocation(location);
				pLocation = this.#getLocationPosition(location);
				
			}

			for (const vehicle of vehicles) {
				// Validación de tipos
				if (!(vehicle instanceof Vehicle)) {
					throw new ParamIsNotObjectException("vehicle", "Vehicle");
				}
				
				// Asegurarse de que el vehículo existe en el sistema
				let pVehicle = this.#getVehiclePosition(vehicle);
				if (pVehicle === -1) {
					this.addVehicle(vehicle);
					pVehicle = this.#getVehiclePosition(vehicle);
				}
				// Quitar el vehículo de cualquier localización a la que ya esté asignado
				for (const loc of this.#locations) {
					let pos = this.#getVehiclePositionIn(vehicle, loc);
					if (pos !== -1) {
						loc.vehicles.splice(pos, 1); // Se elimina de esa localización
					}
				}
				// Asignar el vehículo a la nueva localización
				this.#locations[pLocation].vehicles.push(this.#vehicles[pVehicle]);
				// Si es necesario, se puede ordenar la lista de vehículos en la localización:
				this.#locations[pLocation].vehicles.sort(this.#sortVehiclesInLocationFunc);
			}
			return this;
		}
	
		deassignLocationToVehicle(location, ...vehicles) {
			if (!(location instanceof Location)) {
				throw new ParamIsNotObjectException("location", "Location");
			}

			// Asegurarse de que la localización existe en el sistema
			let pLocation = this.#getLocationPosition(location);
			if (pLocation === -1) {
				throw new DoNotExistException(location)
			}

			for (const vehicle of vehicles) {
				if (!(vehicle instanceof Vehicle)) {
					throw new ParamIsNotObjectException("vehicle","Vehicle")
				}
	
				let pVehicle = this.#getVehiclePosition(vehicle);
				
				if (pVehicle === -1) {
					throw new DoNotExistException(vehicle)
				}

				let pVehicleIn = this.#getVehiclePositionIn(vehicle, this.#locations[pLocation]);
				if (pVehicleIn !== -1) {
					this.#locations[pLocation].vehicles.splice(pVehicleIn, 1);
				}
				
			}

			return this;
		}

		// Iteradores y filtros

		* getVehiclesInCategory(category, sortFunction) {
			if (!(category instanceof Category)) {
				throw new ParamIsNotObjectException('category', 'Category');
			}
			const position = this.#getCategoryPosition(category);
			if (position !== -1) {
				let array = this.#categories[position].vehicles;
				if (sortFunction) {
					 array.sort(sortFunction);
				}
				for (const vehicle of array) {
					yield vehicle;
				}
			} else {
				throw new DoNotExistException(category);
			}
		}

		* getVehiclesInLocation(location, sortFunction) {
			if (!(location instanceof Location)) {
				throw new ParamIsNotObjectException('location', 'Location');
				}
				const position = this.#getLocationPosition(location);
				if (position !== -1) {
					let array = this.#locations[position].vehicles;
				if (sortFunction) {
					array.sort(sortFunction);
				}
				for (const vehicle of array) {
					yield vehicle;
				}
				} else {
				throw new ExistsException(location);
				}
		}
	
		* findVehicles(filterFunction, sortFunction) {
				let array = this.#vehicles;
				if (filterFunction) array = array.filter(filterFunction);
				if (sortFunction) array.sort(sortFunction);
				for (const vehicle of array) {
					yield vehicle;
				}
		}

		* getRentals (filterFunction, sortFunction) {
			let array = this.#rentals;
			if (filterFunction) array = array.filter(filterFunction);
			if (sortFunction) array.sort(sortFunction);
			for (const vehicle of array) {
				yield vehicle;
			}
		}
	
		* filterVehiclesInCategory(category, filterFunction, sortFunction) {
			if (!(category instanceof Category)) {
				throw new ParamIsNotObjectException('category', 'Category');
			}
			const position = this.#getCategoryPosition(category);
			if (position !== -1) {
				let array = this.#categories[position].vehicles;
				if (filterFunction) array = array.filter(filterFunction);
				if (sortFunction) array.sort(sortFunction);
				for (const vehicle of array) {
					yield vehicle;
				}
			} else {
				throw new ExistsException(category);
			}
		}
	
		* filterVehiclesInLocation(location, filterFunction, sortFunction) {
			if (!(location instanceof Location)) {
				throw new ParamIsNotObjectException('location', 'Location');
			}
			const position = this.#getLocationPosition(location);
			if (position !== -1) {
				let array = this.#locations[position].vehicles;
				if (filterFunction) array = array.filter(filterFunction);
				if (sortFunction) array.sort(sortFunction);
				for (const vehicle of array) {
					yield vehicle;
				}
			} else {
				throw new ExistsException(location);
			}
		}

		// Creé estos dos métodos para la tarea 5, creo que me hacían falta
		
		* getCategoriesWithVehicle(vehicle) {
			if (!(vehicle instanceof Vehicle)) {
				throw new ParamIsNotObjectException('vehicle', 'Vehicle');
			}
			const position = this.#getVehiclePosition(vehicle);
			if (position !== -1) {
				const selectedVehicle = this.#vehicles[position];
				for (const category of this.#categories) {
					const indicator = this.#getVehiclePositionIn(selectedVehicle, category);
					
					if (indicator !== -1) {
						const Pcategory = this.#getCategoryPosition(category.category);
						const selectedCategory = this.#categories[Pcategory].category;
						yield selectedCategory;
					}
				}
			} else {
				throw new DoNotExistException(vehicle);
			}
		}

		getLocationWithVehicle(vehicle) {
			if (!(vehicle instanceof Vehicle)) {
				throw new ParamIsNotObjectException('vehicle', 'Vehicle');
			}
			const position = this.#getVehiclePosition(vehicle);
			if (position !== -1) {
				const selectedVehicle = this.#vehicles[position];
				for (const location of this.#locations) {
					const indicator = this.#getVehiclePositionIn(selectedVehicle, location);
					
					if (indicator !== -1) {
						const Plocation = this.#getLocationPosition(location.location);
						const selectedLocation = this.#locations[Plocation].location;
						return selectedLocation;
					}
				}
			} else {
				throw new DoNotExistException(vehicle);
			}
		}

		// Métodos Rental
		rentVehicle(vehicle, customer, startRental) {

			if (!(vehicle instanceof Vehicle)) {
				throw new ParamIsNotObjectException("vehicle","Vehicle")
				}
			let pVehicle = this.#getVehiclePosition(vehicle);
			if (pVehicle === -1) {
				throw new DoNotExistException(vehicle)
			}

			let storedVehicle = this.#vehicles[pVehicle];

			if (storedVehicle.isRented) {
				throw new HasRentalException(storedVehicle);
			}

			if (!(customer instanceof Customer)) {
				throw new ParamIsNotObjectException("customer","Customer")
				}
			let pCustomer = this.#getCustomerPosition(customer);
			if (pCustomer === -1) {
				throw new DoNotExistException(customer)
			}

			let storedCustomer = this.#customers[pCustomer];


			storedVehicle.isRented = true;
			const rental = new Rental(this.#ids.getNextId(), storedVehicle, storedCustomer, startRental);
			this.#rentals.push(rental);
			return rental;
		}
	
		returnVehicle(rental, daysRented) {

			if (!(rental instanceof Rental)) {
				throw new ParamIsNotObjectException("rental","Rental")
				}
			let pRental = this.#getRentalPosition(rental);
			if (pRental === -1) {
				throw new DoNotExistException(rental)
			}
			let storedRental = this.#rentals[pRental];
			if (storedRental.isFinished) {
					throw new RentalFinishedException(rental);
			}

			if (!daysRented) {
				throw new EmptyValueException('daysRented');
			}

			storedRental.isFinished = true;
			storedRental.vehicle.isRented = false;
			const finalPrice = storedRental.vehicle.price * daysRented;
			storedRental.price = finalPrice;
			return  finalPrice;
		}
	
	}
	
	let instanciated;
	
	function init() {
		const manager = new RentalManager(idsGenerator);
		Object.freeze(manager);
		return manager;
	}

	return {
		getInstance: function () {
			if (!instanciated) instanciated = init();
			return instanciated
		},
		Car: Car.name,
		Bike: Bike.name,
		Car: Car.name,
	}
})()

export default RentalManager