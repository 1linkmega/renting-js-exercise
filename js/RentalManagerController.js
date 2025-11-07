import { Coordinate } from "./entities.js";
import { getCookie } from './util.js';

const MODEL = Symbol('RentalManagerModel');
const VIEW = Symbol('RentalManagerView');
const LOAD_MANAGER_OBJECTS = Symbol('Load Manager Objects');
const AUTH = Symbol('AUTH');
const USER = Symbol('USER');
const LANGUAGE = Symbol('LANGUAGE');

class RentalManagerController {
	constructor(modelRentalManager, viewRentalManager, auth){
		this[MODEL] = modelRentalManager;
		this[VIEW] = viewRentalManager;
		this[AUTH] = auth;
		this[USER] = null;
		this[LANGUAGE] = 'es';
		this.onLoad();
		this.iterator;
	}

	async [LOAD_MANAGER_OBJECTS](){
		// Los archivos backup y data son compatibles, por lo que se pueden crear vehículos, categorías o ubicaciones
		// para utilizar el backup, se debe copiar el archivo a la carpeta data y cambiarle el nombre a data

		const response = await fetch('./js/data/data.json');
    	const data = await response.json();
		const vType = {
			passengers: "Car",
			engine: "Bike",
			payload: "Van"
		}
		// Creamos vehículos
		for (const literalVehicle of data.vehicles) {
			const keys = Object.keys(literalVehicle);
			const lastKey = keys[keys.length - 1];
			const lastValue = literalVehicle[lastKey];
			const vehicle = this[MODEL].createVehicle(
				vType[lastKey],
				literalVehicle._license,
				literalVehicle._brand,
				literalVehicle._model,
				literalVehicle._price,
				lastValue,
				literalVehicle._description,
				literalVehicle._image,
			);
			
			this[MODEL].addVehicle(vehicle);
		}

		// Creamos  y asignamos categorías
		for (const literalCat of data.categories) {
			const category = this[MODEL].createCategory(
				literalCat.category.name,
				literalCat.category.description
			);

			this[MODEL].addCategory(category);
			for (const license of literalCat.licenses) {
				const vehicle = [...this[MODEL].findVehicles((vehicle) => (vehicle.license === license))][0];
				this[MODEL].assignCategoryToVehicle(category, vehicle);
			}
		}

		// Creamos y asignamos localizaciones
		for (const literalLoc of data.locations) {
			const location = this[MODEL].createLocation(
				literalLoc.location.name,
				literalLoc.location.address,
				new Coordinate(literalLoc.location.location.latitude, literalLoc.location.location.longitude),
				literalLoc.location.description
			);

			this[MODEL].addLocation(location);
			for (const license of literalLoc.licenses) {
				const vehicle = [...this[MODEL].findVehicles((vehicle) => (vehicle.license === license))][0];
				this[MODEL].assignLocationToVehicle(location, vehicle);
			}
		}

		// Creamos clientes
		for (const literalCustomer of data.customers) {
			const customer = this[MODEL].createCustomer(literalCustomer.id, literalCustomer.name);
			this[MODEL].addCustomer(customer);
		}

		// Creamos alquileres

		for (const literalRental of data.rentals) {
			const vehicle = [...this[MODEL].findVehicles((vehicle) => (vehicle.license === literalRental.vehicle))][0];
			const customer = this[MODEL].createCustomer(literalRental.customer);
			this[MODEL].rentVehicle(vehicle, customer, new Date(literalRental.startRental));
		
		}

		this.onAddCategoryLocation();
		this.onInit();
		this[VIEW].bindInit(this.handleInit);
	}

	// Eventos
		// Carga
		onLoad = () => {
			this[LOAD_MANAGER_OBJECTS]();
			if (getCookie('accetedCookieMessage') !== 'true') {
				this[VIEW].showCookiesMessage();
			}

			const userCookie = getCookie('activeUser');

			if (userCookie) {
			      const user = this[AUTH].getUser(userCookie);
				if (user) {
					this[USER] = user;
					this[VIEW].initHistory();
					this[VIEW].showAuthUserProfile(this[USER]);
					this[VIEW].showAdminMenu();
					this[VIEW].showFavMenu();
					this[VIEW].bindFavMenu(this.handleFavs);
					this[VIEW].bindCloseSession(this.handleCloseSession);
					this[VIEW].bindAdminMenu(
						this.handleAddCatForm, this.handleDelCatForm, 
						this.handleAssignCatForm, this.handleAddLocForm, 
						this.handleDelLocForm, this.handleAddVehicleForm, 
						this.handleDelVehicleForm, this.handleBackup);
				}
			} else {
				this.onCloseSession();
			}
			
			this[VIEW].bindLanguageSelection(this.handleChangeLanguage);
			this[VIEW].bindSearchToggle();
			this[VIEW].bindSearch(this.handleSearch);
			const language = this[VIEW].getLanguage();
			if (language) {
			this[LANGUAGE] = language;
			this.onChangeLanguage();
			}
		}

		// Inicio
		onInit = () => {
			
			this[VIEW].showCategoriesInMain(this[MODEL].categories);
			this[VIEW].showRandomVehiclesInMain(this[MODEL].vehicles);
			this[VIEW].bindVehiclesCategoryList(this.handleVehiclesCategoryList);
			this[VIEW].bindVehiclesLocationList(this.handleVehiclesLocationList);
			this[VIEW].bindShowVehicle(this.handleShowVehicle);
		}

		// Apertura de sesión
		onOpenSession(){
			this.onInit();
			this[VIEW].initHistory();
			this[VIEW].showAuthUserProfile(this[USER]);
			this[VIEW].showAdminMenu();
			this[VIEW].showFavMenu();
			this[VIEW].bindFavMenu(this.handleFavs);
			this[VIEW].bindCloseSession(this.handleCloseSession);
			this[VIEW].bindAdminMenu(
				this.handleAddCatForm, this.handleDelCatForm, 
				this.handleAssignCatForm, this.handleAddLocForm, 
				this.handleDelLocForm, this.handleAddVehicleForm, 
				this.handleDelVehicleForm, this.handleBackup);

		}

		
		// Sesión cerrada
		onCloseSession() {
			this[USER] = null;
			this[VIEW].deleteUserCookie();
			this[VIEW].showIdentificationLink();
			this[VIEW].bindIdentificationLink(this.handleLoginForm);
			this[VIEW].removeAdminMenu();
			this[VIEW].removeFavMenu();
		}

		// Idioma modificado
		onChangeLanguage() {
			this[VIEW].showSelectedLanguage(this[LANGUAGE]);
		}


		// Creación de categoría o ubicación
		onAddCategoryLocation = () => {
			this[VIEW].showContentInMenu(this[MODEL].categories, this[MODEL].locations);
			this[VIEW].bindVehiclesCategoryList(this.handleVehiclesCategoryList);
			this[VIEW].bindVehiclesLocationList(this.handleVehiclesLocationList);
		}

		onVehicleList = () => {
			this[USER] ? this[VIEW].favOption() : '';
		}

	//
	// Manejadores
		// Manejador de inicio
		handleInit = () => {
			this.onInit();	
		}

		// Manejador de búsqueda
		handleSearch = (text, min, max, showRented) => {
			
			const filterFunction = (vehicle) => (
				(text ? (vehicle.brand.toLowerCase().includes(text) ||
				vehicle.model.toLowerCase().includes(text) ||
				vehicle.description.toLowerCase().includes(text)) : true) &&
				((min ? vehicle.price >= min : true) && (max ? vehicle.price <= max : true)) &&
				(showRented ? true : vehicle.isRented == false)
			); // que si algún campo está vacío, lo ingnora.
			const vehicles = [...this[MODEL].findVehicles(filterFunction)];
			this[VIEW].listVehicles(vehicles, false);
			this[USER] ? this[VIEW].favOption() : '';
			this[VIEW].bindShowVehicle(this.handleShowVehicle);
		}
		
		// Lista de vehículos por categoría o ubicación
			// Por categoría
			handleVehiclesCategoryList = (name) => {
				try {
					const category = [...this[MODEL].categories].find(cat => cat.name === name);
					this[VIEW].listVehicles([...this[MODEL].getVehiclesInCategory(category)], category);
					this[USER] ? this[VIEW].favOption() : '';
					this[VIEW].bindShowVehicle(this.handleShowVehicle);
					this[VIEW].bindVehicleModal(this.handleVehicleModal);
					this[VIEW].bindVehicleModalNext(this.handleVehicleModalNext);
				} catch (error) {
					console.error("Error:", error.message);
				}
			}
			// Por localización
			handleVehiclesLocationList = (name) => {
				
				try {
					const location = [...this[MODEL].locations].find(loc => loc.name === name);
					this[VIEW].listVehicles([...this[MODEL].getVehiclesInLocation(location)], location);
					this[USER] ? this[VIEW].favOption() : '';
					this[VIEW].bindShowVehicle(this.handleShowVehicle);
					this[VIEW].bindVehicleModal(this.handleVehicleModal);
					this[VIEW].bindVehicleModalNext(this.handleVehicleModalNext);
				} catch (error) {
					console.error("Error:", error.message);
				}
			}
		//
		// Manejado para mostrar un vehículo
		handleShowVehicle = (license) => {
			try {
				const vehicle = [...this[MODEL].findVehicles(vehicle => vehicle.license === license)][0];
				const categories = [...this[MODEL].getCategoriesWithVehicle(vehicle)];
				const location = this[MODEL].getLocationWithVehicle(vehicle);
				this[VIEW].showVehicle(vehicle, categories, location);
				this[VIEW].bindVehiclesCategoryList(this.handleVehiclesCategoryList);
				this[VIEW].bindVehiclesLocationList(this.handleVehiclesLocationList);
				this[VIEW].bindShowVehicleInNewWindow(this.handleShowVehicleInNewWindow);
				this[USER] ? this[VIEW].favOption() : '';
			} catch (error) {
				console.error("Error:", error.message);
				this[VIEW].showVehicle(null, null, null, "No existe este vehiculo en la página.");
			}
		}

		// Nuevas ventanas
			// Vehículo en nueva ventana
			handleShowVehicleInNewWindow = (license) => {
			try {
				const vehicle = [...this[MODEL].findVehicles(vehicle => vehicle.license === license)][0];
				const categories = [...this[MODEL].getCategoriesWithVehicle(vehicle)];
				const location = this[MODEL].getLocationWithVehicle(vehicle);
				this[VIEW].showVehicleInNewWindow(vehicle, categories, location);
				this[VIEW].bindVehiclesCategoryList(this.handleVehiclesCategoryList);
				this[VIEW].bindVehiclesLocationList(this.handleVehiclesLocationList);
				this[VIEW].bindCloseAllWindows(this.handleCloseAllWindows);
			} catch (error) {
				console.error("Error:", error.message);
				this[VIEW].showVehicleInNewWindow(null, null, null, 'No existe este vehiculo en la página.');
			}
			}
			// Cerrar todas las ventanas
			handleCloseAllWindows = () => {
				this[VIEW].closeAllWindows();
			}
		//
		// Modal de vehículo
				handleVehicleModal = (category, location) => {
				try {
					let vehicle;
					if (category) {
						const selectedCategory = [...this[MODEL].categories].find(cat => cat.name === category);
						this.iterator = this[MODEL].getVehiclesInCategory(selectedCategory);
						vehicle = this.iterator.next().value;
					} else if (location) {
						const selectedLocation = [...this[MODEL].locations].find(loc => loc.name === location);
						this.iterator = this[MODEL].getVehiclesInLocation(selectedLocation);
						vehicle = this.iterator.next().value;	
					}
					
					const finalCategories = [...this[MODEL].getCategoriesWithVehicle(vehicle)];
					const finalLocation = this[MODEL].getLocationWithVehicle(vehicle);
					this[VIEW].loadVehicleModal(false, vehicle, finalCategories, finalLocation);
					this[VIEW].bindVehiclesCategoryList(this.handleVehiclesCategoryList);
					this[VIEW].bindVehiclesLocationList(this.handleVehiclesLocationList);
				} catch (error) {
					console.error("Error:", error.message);
				}
				}
				handleVehicleModalNext = () => {
				try {
					let done = false, finalCategories, finalLocation, vehicle;
					const next = this.iterator.next();
						if (!next.done) { //Si no terminó, podemos seguir.
							vehicle = next.value;
							finalCategories = [...this[MODEL].getCategoriesWithVehicle(vehicle)];
							finalLocation = this[MODEL].getLocationWithVehicle(vehicle);
						} else { // Pero si terminó, enviará done = true y deshabilitará el botón. Esto último se ejecuta en la vista.
							done = true;
						}
					this[VIEW].loadVehicleModal(done, vehicle, finalCategories, finalLocation);
					this[VIEW].bindVehiclesCategoryList(this.handleVehiclesCategoryList);
					this[VIEW].bindVehiclesLocationList(this.handleVehiclesLocationList);
				} catch (error) {
					console.error("Error:", error.message);
				}
				}
		//
		// Administración
			// Categorías
				// Añadir
					handleAddCatForm = () => {
						if (!this[USER]) {
							this[VIEW].showErrorUserMessage();
						} else {
							this[VIEW].showAddCatForm();
							this[VIEW].bindAddCatForm(this.handleAddCat);
						}
						
					};

					handleAddCat = (name, desc) => {
						if (!this[USER]) {
							this[VIEW].showErrorUserMessage();
						} else {
							const cat = this[MODEL].createCategory(name, desc);
							let done, error;
							try {
								this[MODEL].addCategory(cat);
								done = true;
							} catch (exception) {
								done = false;
								error = exception;
							}
							this[VIEW].showAddCatModal(done, cat, error);
							this.onAddCategoryLocation();
						}
					};

				// Eliminar
					handleDelCatForm = () => {
						if (!this[USER]) {
							this[VIEW].showErrorUserMessage();
						} else {
							this[VIEW].showDelCatForm([...this[MODEL].categories]);
							this[VIEW].bindDelCatForm(this.handleDelCat, this.handleVehiclesCategoryList);
						}
						
					};

					handleDelCat = (name) => {
						if (!this[USER]) {
							this[VIEW].showErrorUserMessage();
						} else {
							let done, error, cat;
							try {
								cat = [...this[MODEL].categories].find(cat => cat.name === name);
								this[MODEL].removeCategory(cat);
								done = true;
								this.onAddCategoryLocation();
							} catch (exception) {
							done = false;
							error = exception;
							}

							
							this[VIEW].showDelCatModal(done, cat, error);
						}
						
					};

				// Asignar
					handleAssignCatForm = () => {
						if (!this[USER]) {
							this[VIEW].showErrorUserMessage();
						} else {
							this[VIEW].showAssignCatForm([...this[MODEL].categories]);
							this[VIEW].bindAssignCatForm(this.handleAssignCat, this.handleFeedAssignCat);
						}
						
					}
					
					handleAssignCat = (category, selectedVehicles) => {
						if (!this[USER]) {
							this[VIEW].showErrorUserMessage();
						} else {
							let done, error, cat;
							try {
								cat = [...this[MODEL].categories].find(cat => cat.name === category);
								const filterFunction = (vehicle) => {
									return selectedVehicles.includes(vehicle.license);
								}
								const fSelectedVehicles = this[MODEL].findVehicles(filterFunction);
								const vehicles = this[MODEL].vehicles;
								
								// Desasignamos todos los vehículos
								for (const vehicle of vehicles) {
									this[MODEL].deassignCategoryToVehicle(cat, vehicle);
								}

								// Asignamos sólo los que nos llegan del formulario
								for (const vehicle of fSelectedVehicles) {
									this[MODEL].assignCategoryToVehicle(cat, vehicle);
								}
								
								done = true;
							} catch (exception) {
								done = false;
								error = exception;
							}
							
							this[VIEW].showAssignCatModal(done, cat, error);
						}
						
					}

					handleFeedAssignCat = (category) => {
						if (!this[USER]) {
							this[VIEW].showErrorUserMessage();
						} else {
							const selectedCategory = [...this[MODEL].categories].find(cat => cat.name === category);
							const assignedVehicles = [...this[MODEL].getVehiclesInCategory(selectedCategory)];
							const vehicles = this[MODEL].vehicles;
							this[VIEW].feedAssignCatForm(vehicles, assignedVehicles);
						}
						
					}

			// Ubicaciones
				// Añadir
				handleAddLocForm = () => {
					if (!this[USER]) {
							this[VIEW].showErrorUserMessage();
					} else {
						this[VIEW].showAddLocForm();
						this[VIEW].bindAddLocForm(this.handleAddLoc);
					}
					
				};

				handleAddLoc = (name, address, lat, long, desc) => {
					if (!this[USER]) {
							this[VIEW].showErrorUserMessage();
					} else {
						let coords, done, error;
						if (lat && long) {
							coords = new Coordinate(lat, long);
						}

						const loc = this[MODEL].createLocation(name, address, coords, desc);

						try {
							this[MODEL].addLocation(loc);
							done = true;
						} catch (exception) {
							done = false;
							error = exception;
						}
						this[VIEW].showAddLocModal(done, loc, error);
						this.onAddCategoryLocation();
					}
					
				};

				// Eliminar
				handleDelLocForm = () => {
					if (!this[USER]) {
							this[VIEW].showErrorUserMessage();
					} else {
						this[VIEW].showDelLocForm([...this[MODEL].locations]);
						this[VIEW].bindDelLocForm(this.handleDelLoc, this.handleVehiclesLocationList);
					}
					
				}

				handleDelLoc = (name) => {
					if (!this[USER]) {
							this[VIEW].showErrorUserMessage();
					} else {
					
					}
					let done, error, loc;
					try {
						loc = [...this[MODEL].locations].find(loc => loc.name === name);
						this[MODEL].removeLocation(loc);
						done = true;
						this.onAddCategoryLocation();
					} catch (exception) {
					done = false;
					error = exception;
					}

					
					this[VIEW].showDelLocModal(done, loc, error);
				}

			// Vehículos
				// Añadir
					handleAddVehicleForm = () => {
						if (!this[USER]) {
							this[VIEW].showErrorUserMessage();
						} else {
							this[VIEW].showAddVehicleForm([...this[MODEL].categories], [...this[MODEL].locations]);
							this[VIEW].bindAddVehicleForm(this.handleAddVehicle);
						}
						
					}

					handleAddVehicle = (type, license, brand, model, price, variable, description = "", image = "", categories = "", location = "") => {
						if (!this[USER]) {
							this[VIEW].showErrorUserMessage();
						} else {
							const vehicle = this[MODEL].createVehicle(type, license, brand, model, price, variable, description, image, false);
							let done, error;
							try {
								this[MODEL].addVehicle(vehicle);
								if (categories) {
									for (const category of categories) {
										const selectedCategory = [...this[MODEL].categories].find(cat => cat.name === category);
										this[MODEL].assignCategoryToVehicle(selectedCategory, vehicle);
									}
								}
								if (location) {
									const selectedLocation = [...this[MODEL].locations].find(loc => loc.name === location);
									this[MODEL].assignLocationToVehicle(selectedLocation, vehicle);
								}
								done = true;
							} catch (exception) {
								done = false;
								error = exception;
							}

							this[VIEW].showAddVehicleModal(done, vehicle, error);
						}
						
					}

				// Eliminar
					handleDelVehicleForm = () => {
						if (!this[USER]) {
							this[VIEW].showErrorUserMessage();
						} else {
							this[VIEW].showDelVehicleForm(this[MODEL].vehicles);
							this[VIEW].bindDelVehicleForm(this.handleDelVehicle, this.handleShowVehicle);
						}
						
					}

					handleDelVehicle = (license) => {
						if (!this[USER]) {
							this[VIEW].showErrorUserMessage();
						} else {
							let done, error, vehicle;
							try {
								vehicle = [...this[MODEL].vehicles].find(vehicle => vehicle.license === license);
								this[MODEL].removeVehicle(vehicle);
								done = true;
							} catch (exception) {
								done = false;
								error = exception;
							}

							this[VIEW].showDelVehicleModal(done, vehicle, error);
						}
						
					}

			// Backup
				handleBackup = () => {
					if (!this[USER]) {
						this[VIEW].showErrorUserMessage();
					} else {
						const categories = [...this[MODEL].categories];
						let catVehicles = [];
						for (const category of categories) {
						const vehicles = [...this[MODEL].getVehiclesInCategory(category)];
						const licenses = vehicles.map(v => v._license);
						const relation = {category, licenses};
						catVehicles.push(relation);
						}

						const locations = [...this[MODEL].locations];
						let locVehicles = [];
						for (const location of locations) {
						const vehicles = [...this[MODEL].getVehiclesInLocation(location)];
						const licenses = vehicles.map(v => v._license);
						const relation = {location, licenses}
						locVehicles.push(relation);
						}

						const rentals = [...this[MODEL].rentals];
						let rentalsMin = [];
						for (const rental of rentals) {
							const vehicle = rental.vehicle.license;
							const customer = rental.customer.id;
							const id = rental.id;
							const startRental = rental.startRental;
							const isFinished = rental.isFinished;
							const price = rental.price;
							const rentalMin = {id, vehicle, customer, startRental, isFinished, price};
							rentalsMin.push(rentalMin);
						}

						const data = {
							categories: catVehicles,
							locations: locVehicles,
							vehicles: [...this[MODEL].vehicles],
							customers: [...this[MODEL].customers],
							rentals: rentalsMin,
						};

						const formData = new FormData();
						formData.append('jsonObj', JSON.stringify(data, null, 2))
						fetch('./writeJSONBackup.php', {
							method: 'post',
							body: formData
						})
						.then(response => {
							if(!response.ok) {
							throw new Error(response.status);
							}
							return response.text() 
						})
						.then(title => {this[VIEW].showBackupOk(title)})
						.catch(err => {this[VIEW].showBackupError(err)});
					}	
				}
		//
		// Login
			handleLoginForm = () => {
				this[VIEW].showLogin();
				this[VIEW].bindLogin(this.handleLogin);
			};

			handleLogin = (username, password, remember) => {
				if (this[AUTH].validateUser(username, password)) {
					this[USER] = this[AUTH].getUser(username);
					this.onOpenSession();
					if (remember) {
						this[VIEW].setUserCookie(this[USER]);
					}
				} else {
					this[VIEW].showInvalidUserMessage();
				} 
			};

			// Cierre de sesión
			handleCloseSession = () => {
				this.onCloseSession();
				this.onInit();
				this[VIEW].initHistory();
			};

		//
		// Cambio de idioma
		handleChangeLanguage = (language) => {
			this[LANGUAGE] = language;
			this.onChangeLanguage();
		};
		
		// Favoritos
		handleFavs = (favVehicles) => {
			if (!this[USER]) {
				this[VIEW].showErrorUserMessage();
			} else {
				const filterFunction = (vehicle) => (favVehicles.includes(vehicle.license));
				const vehicles = [...this[MODEL].findVehicles(filterFunction)];
				this[VIEW].listVehicles(vehicles, false);
				this[VIEW].favOption();
				this[VIEW].bindShowVehicle(this.handleShowVehicle);
			}
		}

}

export default RentalManagerController;