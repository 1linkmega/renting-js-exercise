import { addCatValidation, assignCatValidation, addLocValidation, addVehicleValidation } from './validation.js';
import { setCookie } from './util.js';

const EXCECUTE_HANDLER = Symbol('excecuteHandler');

class RentalManagerView {
	constructor(){
		this.categories = document.getElementById('categories');
		this.header = document.getElementsByTagName('header')[0];
		this.main = document.getElementsByTagName('main')[0];
		this.menu = document.getElementById('menu');
		/* Este array lo uso para llevar control de todas las ventanas abiertas */
		this.vehicleWindows = [];
	}

	[EXCECUTE_HANDLER](handler, handlerArguments, scrollElement, data, url, event) {
		handler(...handlerArguments);
		const scroll = document.querySelector(scrollElement);
		if (scroll) scroll.scrollIntoView();
		history.pushState(data, null, url);
		event.preventDefault();
	}

	// Características de vehículos
		instance = {
			Car: this.CarCharacteristic,
			Bike: this.BikeCharacteristic,
			Van: this.VanCharacteristic,
		};

		CarCharacteristic(vehicle) {
			return (`<p class="text-nowrap"><i class="bi bi-people-fill"></i> ${vehicle.passengers}</p>`);
		}

		BikeCharacteristic(vehicle) {
			return (`<p class="text-nowrap"><i class="bi bi-speedometer"></i> ${vehicle.engine} CC</p>`);
		}

		VanCharacteristic(vehicle) {
			return (`<p class="text-nowrap"><i class="bi bi-minecart-loaded"></i> ${vehicle.payload} kg</p>`);
		}
	//
	
	// Binds
		// Elementos de inicio
		bindInit(handler) {
			document.getElementById('init').addEventListener('click', (event) => {
				this[EXCECUTE_HANDLER](handler, [], 'body', { action: 'init' }, '#', event);
			});
			document.getElementById('logo').addEventListener('click', (event) => {
				this[EXCECUTE_HANDLER](handler, [], 'body', { action: 'init' }, '#', event);
			});
		}
		
		// Enlaces a categorías
		bindVehiclesCategoryList(handler) {
			let links = [...document.querySelectorAll('[data-category]')];
			/* También recojo los elementos de las ventanas que estén abiertas */
			for (const win of this.vehicleWindows) {
				const winLinks = [...win.document.querySelectorAll('[data-category]')];
				links = links.concat(...winLinks);
			}
			for (const link of links) {
				link.addEventListener('click', (event) => {
					const { category } = event.currentTarget.dataset;
					this[EXCECUTE_HANDLER](
					handler,
					[category],
					'body',
					{ action: 'vehiclesCategoryList', category },
					'#',
					event,
					);
				})
			}
		}

		// Enlaces a localizaciones
		bindVehiclesLocationList(handler) {
			let links = [...document.querySelectorAll('[data-location]')];
			
			for (const win of this.vehicleWindows) {
				const winLinks = [...win.document.querySelectorAll('[data-location]')];
				links = links.concat(...winLinks);
			}
			for (const link of links) {
				link.addEventListener('click', (event) => {
					const { location } = event.currentTarget.dataset;
					this[EXCECUTE_HANDLER](
					handler,
					[location],
					'body',
					{ action: 'vehiclesLocationList', location },
					'#',
					event,
					);;
				})
			}
		}

		// Vehículos
		bindShowVehicle(handler) {
			const links = document.querySelectorAll('[data-vehicle]');
			for (const link of links) {
				link.addEventListener('click', (event) => {
					const { vehicle } = event.currentTarget.dataset;
					this[EXCECUTE_HANDLER](
					handler,
					[vehicle],
					'body',
					{ action: 'showVehicle', vehicle },
					'#',
					event,
					);
				})
			}
		}

		// Abrir vehículos en una nueva ventana
		bindShowVehicleInNewWindow(handler) {
			const bOpen = document.getElementById('b-open');
			bOpen.addEventListener('click', (event) => {
				const license = event.target.dataset.vehicle;
				const vehicleWindow = window.open('vehicle.html', `VehicleWindow-${license}`, 'width=1000, height=600, top=250, left=250, titlebar=yes, toolbar=no, menubar=no, location=no');
				vehicleWindow.addEventListener('DOMContentLoaded', () => {
				handler(license);
				});
				this.vehicleWindows.push(vehicleWindow);
			});
		}

		// Cerrar todas las ventanas
		bindCloseAllWindows(handler) {
			const bCloseAll = document.getElementById('b-close-all');
			if (bCloseAll) {
				bCloseAll.addEventListener('click', () => {
					handler();
				});
			}  
		}

		// Mostrar y ocultar la barra de búsqueda. Hace que haciendo click en el input de búsqueda se despliegue el resto, y haciendo click en el botón de buscar, se oculte.
		bindSearchToggle() {
			const searchForm = document.getElementById('search-form');
			const inputSearch = searchForm.querySelector('#search');
			const submit = document.getElementById('search-submit');
			const dropend = searchForm.querySelector('fieldset.dropdown-menu');
			inputSearch.addEventListener('hide.bs.dropdown', (event) => {
				event.preventDefault();
			}, dropend.classList.contains('show'));
			submit.addEventListener('show.bs.dropdown', (event) => {
				event.preventDefault();
			}, !dropend.classList.contains('show'));
		}

		// Búsqueda, también funciona con history.
		bindSearch(handler) {
			const search = document.getElementById('search-submit');
			search.addEventListener('click', (event) => {
				const text = document.querySelector('#search-form > input').value.toLowerCase();
				const min = document.querySelector('#search-form > fieldset > input:nth-child(2)').value;
				const max = document.querySelector('#search-form > fieldset > input:nth-child(3)').value;
				const showRented = document.querySelector('#showRented').checked;
				this[EXCECUTE_HANDLER](
					handler,
					[text, min, max, showRented],
					'body',
					{ action: 'Search', text, min, max, showRented},
					'#',
					event,
				);
			});
		}

		// Modal para vehículso
		bindVehicleModal(handler) {
			const button = document.getElementById('modalButton');
				button.addEventListener('click', (event) => {
					const category = event.currentTarget.dataset.modalCategory;
					const location = event.currentTarget.dataset.modalLocation;
					handler(category, location);
				});
		}

		// Mostrar el siguiente vehículo en el modal.
		bindVehicleModalNext(handler) {
			const next = document.getElementById('next');
				next.addEventListener('click', (event) => {
					handler();
				}); 
		}

		// Administración

			// Menú
			bindAdminMenu(addCat, delCat, assignCat, addLoc, delLoc, addVehicle, delVehicle, backup) {
				const addCatLink = document.getElementById('addCat');
				addCatLink.addEventListener('click', (event) => {
				this[EXCECUTE_HANDLER](addCat, [], 'body', { action:
				'addCat' }, '#', event);
				});

				const delCatLink = document.getElementById('delCat');
				delCatLink.addEventListener('click', (event) => {
				this[EXCECUTE_HANDLER](delCat, [], 'body', { action:
				'delCat' }, '#', event);
				});

				const assignCatLink = document.getElementById('assignCat');
				assignCatLink.addEventListener('click', (event) => {
				this[EXCECUTE_HANDLER](assignCat, [], 'body', { action:
				'assignCat' }, '#', event);
				});

				const addLocLink = document.getElementById('addLoc');
				addLocLink.addEventListener('click', (event) => {
				this[EXCECUTE_HANDLER](addLoc, [], 'body', { action:
				'addLoc' }, '#', event);
				});

				const delLocLink = document.getElementById('delLoc');
				delLocLink.addEventListener('click', (event) => {
				this[EXCECUTE_HANDLER](delLoc, [], 'body', { action:
				'delLoc' }, '#', event);
				});

				const addVehicleLink = document.getElementById('addVehicle');
				addVehicleLink.addEventListener('click', (event) => {
				this[EXCECUTE_HANDLER](addVehicle, [], 'body', { action:
				'addVehicle' }, '#', event);
				});

				const delVehicleLink = document.getElementById('delVehicle');
				delVehicleLink.addEventListener('click', (event) => {
				this[EXCECUTE_HANDLER](delVehicle, [], 'body', { action:
				'delVehicle' }, '#', event);
				});

				const backupLink = document.getElementById('backup');
				backupLink.addEventListener('click', (event) => {
					event.preventDefault;
					backup();
				});
			}

			// Categorías
				// Añadir
				bindAddCatForm(handler){
					addCatValidation(handler);
					
				}
				
				// Eliminar
				bindDelCatForm(delHandler, getCategoryHandler) {
					const removeContainer = document.getElementById('remove-category');
					const buttons = removeContainer.querySelectorAll('button[data-category]');
					for (const button of buttons) {
						button.addEventListener('click', function (event) {
							delHandler(this.dataset.category);
						});
					}
					const categoryLinks = removeContainer.querySelectorAll('a[data-category]');
					for (const link of categoryLinks) {
					link.addEventListener('click', (event) => {
						this[EXCECUTE_HANDLER](
							getCategoryHandler,
							[link.dataset.category],
							'#vehicle-list',
							{ action: 'vehiclesCategoryList', category: link.dataset.category
							},
							'#category-list',
							event,
						);
					});
					}
				}

				// Asignar
				bindAssignCatForm(handler, vehiclesHandler) {
					assignCatValidation(handler);
					const select = document.getElementById('asCategories');
					select.addEventListener('change', (event) => {
						vehiclesHandler(select.value);
					});
				}

			// Ubicaciones
				// Añadir
				bindAddLocForm(handler){
					addLocValidation(handler);
				}

				// Eliminar
				bindDelLocForm(delHandler, getLocationHandler) {
					const removeContainer = document.getElementById('remove-location');
					const buttons = removeContainer.querySelectorAll('button[data-location]');
					for (const button of buttons) {
						button.addEventListener('click', function (event) {
							delHandler(this.dataset.location);
						});
					}
					const locationLinks = removeContainer.querySelectorAll('a[data-location]');
					for (const link of locationLinks) {
					link.addEventListener('click', (event) => {
						this[EXCECUTE_HANDLER](
							getLocationHandler,
							[link.dataset.location],
							'#vehicle-list',
							{ action: 'vehiclesLocationList', location: link.dataset.location
							},
							'#location-list',
							event,
						);
					});
					}

				}

			// Vehículos
				// Añadir
				bindAddVehicleForm(handler){
					addVehicleValidation(handler);
				}

				// Eliminar
				bindDelVehicleForm(delHandler, getVehicleHandler) {
					const removeContainer = document.getElementById('remove-vehicle');
					const buttons = removeContainer.querySelectorAll('button[data-vehicle]');
					for (const button of buttons) {
						button.addEventListener('click', function (event) {
							delHandler(this.dataset.vehicle);
						});
					}
					const vehicleLinks = removeContainer.querySelectorAll('a[data-vehicle]');
					for (const link of vehicleLinks) {
					link.addEventListener('click', (event) => {
					const { vehicle } = link.dataset;
						this[EXCECUTE_HANDLER](
							getVehicleHandler,
							[vehicle],
							'#single-vehicle',
							{ action: 'showVehicle', vehicle},
							'#single-vehicle',
							event,
						);
					});
					}

				}
		// Login
			// Login button
			bindIdentificationLink(handler) {
				const login = document.getElementById('login');
				login.addEventListener('click', (event) => {
					this[EXCECUTE_HANDLER](handler, [], 'body', { action: 'login' }, '#',
					event);
				});
			}

			// Formulario login
			bindLogin(handler) {
				const form = document.forms.fLogin;
				form.addEventListener('submit', (event) => {
					handler(form.username.value, form.password.value, form.remember.checked);
					event.preventDefault();
				});
			}
			
			// logout
			bindCloseSession(handler){
				document.getElementById('aCloseSession').addEventListener('click',
				(event) => {
					handler();
					event.preventDefault();
				});
			}
		//
		// Se que no era parte de la tarea, pero quise practicarlo
		// Lenguaje
			bindLanguageSelection(handler) {
				const lFlags = document.getElementById('language').querySelectorAll('ul.dropdown-menu li a');
				for (const link of lFlags) {
				link.addEventListener('click', (event) => {
					// decidí que prefería hacerlo con íconos svg a hacerlo con imágenes
					const { language } = event.currentTarget.querySelector('i').dataset;
					handler(language);
					localStorage.setItem('language', language);
					event.preventDefault();
				});
				}
			}
		//
		// Favoritos
			bindFavMenu(handler) {
				const favMenu = document.getElementById('favMenu');
				favMenu.addEventListener('click', (event) => {
					const favs = this.getFavs();
					this[EXCECUTE_HANDLER](handler, [favs], 'body', { action: 'favs', favs }, '#',
					event);
				});
			}
	//
	
	// Métodos de carga de elementos

		// Menu
			// Menú de administración
			showAdminMenu() {
				
				const menuOption = document.createElement('li');
				menuOption.classList.value = 'nav-item dropdown order-4';		
				menuOption.setAttribute("id", "adminMenu");
				menuOption.insertAdjacentHTML('afterbegin', `
						<a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
							Administración
						</a>`);
				const suboptions = document.createElement('ul');
				suboptions.classList.add('dropdown-menu');
				suboptions.classList.add('dropdown-menu-lg-end');
				suboptions.setAttribute('data', "menu: admin");
				suboptions.insertAdjacentHTML('beforeend', `<li><a class="dropdown-item" href="#" id="addVehicle">Crear vehículo</a></li>`);
				suboptions.insertAdjacentHTML('beforeend', `<li><a class="dropdown-item" href="#" id="delVehicle">Borrar vehículo</a></li>`);
				suboptions.insertAdjacentHTML('beforeend', `<li><hr class="dropdown-divider"></li>`);
				suboptions.insertAdjacentHTML('beforeend', `<li><a class="dropdown-item" href="#" id="addCat">Crear categoría</a></li>`);
				suboptions.insertAdjacentHTML('beforeend', `<li><a class="dropdown-item" href="#" id="delCat">Borrar categoría</a></li>`);
				suboptions.insertAdjacentHTML('beforeend', `<li><a class="dropdown-item" href="#" id="assignCat">Asignar categoría</a></li>`);
				suboptions.insertAdjacentHTML('beforeend', `<li><hr class="dropdown-divider"></li>`);
				suboptions.insertAdjacentHTML('beforeend', `<li><a class="dropdown-item" href="#" id="addLoc">Crear ubicación</a></li>`);
				suboptions.insertAdjacentHTML('beforeend', `<li><a class="dropdown-item" href="#" id="delLoc">Borrar ubicación</a></li>`);
				suboptions.insertAdjacentHTML('beforeend', `<li><hr class="dropdown-divider"></li>`);
				suboptions.insertAdjacentHTML('beforeend', `<li><a class="dropdown-item" href="#" id="backup">Crear Backup</a></li>`);
				menuOption.append(suboptions);
				this.menu.append(menuOption);

			}

			// Remover menu administración
			removeAdminMenu() {
				const adminMenu = document.getElementById('adminMenu');
				if (adminMenu) adminMenu.remove();
			}

			// Categorías y ubicaciones en el menú
			showContentInMenu(categories, locations) {
				const categoryMenus = document.querySelectorAll('[data-menu="category"]');
				const locationMenus = document.querySelectorAll('[data-menu="location"]');
				for (const categoryMenu of categoryMenus) {
					categoryMenu.replaceChildren();
					for (const category of categories) {
						categoryMenu.insertAdjacentHTML('beforeend', `<li><a class="dropdown-item" href="#vehicle-list" data-category="${category.name}" >${category.name}</a></li>`);
					}
				}
				for (const locationMenu of locationMenus) {
					locationMenu.replaceChildren();
					for (const location of locations) {
						locationMenu.insertAdjacentHTML('beforeend', `<li><a class="dropdown-item" href="#vehicle-list" data-location="${location.name}" >${location.name}</a></li>`);
					}
				}
			}

			// Favoritos
			showFavMenu() {
				const menuOption = document.createElement('a');
				menuOption.classList.add('nav-link');
				menuOption.setAttribute("id", "favMenu");
				menuOption.insertAdjacentHTML('beforeend', '<i class="bi bi-star-fill"></i> Favoritos');
				this.menu.append(menuOption);
			}

			// Remover favoritos
			removeFavMenu() {
				const favMenu = document.getElementById('favMenu');
				if (favMenu) favMenu.remove();
			}

			// Idioma
				showSelectedLanguage(language) {
					const selectedLanguage = document.querySelector('#languageDropdown i');
					// al trabajar con una librería, simplemente cambiamos class list por la correspondiente
					selectedLanguage.classList.value = `flag-icon flag-icon-${language}`;
				}

				getLanguage() {
					return localStorage.getItem('language');
				}
			//
		//
		// Para el inicio
			// Categorías en la página principal
			showCategoriesInMain(categories) {
				this.categories = document.getElementById('categories');
				if (!this.categories) {
					this.main.replaceChildren();
					this.main.insertAdjacentHTML('beforeend', `<div id="categories" class="container-fluid d-flex flex-wrap"></div>`);
					this.categories = document.getElementById('categories');
					for (const category of categories) {

						this.categories.insertAdjacentHTML('beforeend', `
							<div class="column col-12 col-sm-6 col-md-4">
								<div class="card init" data-category="${category.name}" style="background-image: url('https://fakeimg.pl/600x400/9b9b9b/525252?text=${category.name}&font=noto-serif&font_size=80');">
									<div class="txt">
										<h2>${category.name}</h2>
										<p>${category.description}</p>
									</div>
									<a href="#vehicle-list">Ver Más</a>
								</div>
							</div>`);
					}
				}


			}

			// 3 vehículos aleatorios en la página principal
			showRandomVehiclesInMain(vehicles) {
				const vehiclesArray = [...vehicles];
				let featuredVehicles = document.getElementById('featuredVehicles');
				if (!featuredVehicles) {
					this.main.insertAdjacentHTML('beforeend', `<div id="featuredVehicles" class="container-fluid d-flex flex-wrap mt-5 border-top"></div>`);
					featuredVehicles = document.getElementById('featuredVehicles');
					// Primero verificamos si tenemos algún vehículo.
					if (vehiclesArray.length === 0) {
						//alert('lo sentimos, no hay vehículos destacados');
					} else {
							
							let vehicleCards = '';
							const selectedVehicles =
							vehiclesArray.length < 3 // Si tenemos menos de 3 vehículos, devolvemos el array entero
								? vehiclesArray
								: Array.from(new Set( // Pero si tenemos más, los seleccionamos de forma aleatoria hasta llegar hasta 3
									(() => {
										const selected = [];
										while (selected.length < 3) {
											const rand = vehiclesArray[Math.floor(Math.random() * vehiclesArray.length)];
											if (!selected.includes(rand)) selected.push(rand);
										}
										return selected;
									})()
								));

					for (const vehicle of selectedVehicles) {
						vehicleCards += `
							<div class="column col-12 col-sm-6 col-md-4">
								<div class="card init" data-vehicle="${vehicle.license}" style="background-image: url('${vehicle.image}');">
									<div class="txt">
										<h2 data-vehicle="${vehicle.license}" class="d-inline">${vehicle.brand}</h2>
										<a href="#" class="btn btn-outline-dark float-end" data-vehicle="${vehicle.license}">Ver Más</a>
										<p data-vehicle="${vehicle.license}">${vehicle.model}</p>
										<p>${vehicle.description}</p>
									</div>
									
								</div>
							</div>`;
					}

					// Insertar todos los vehículos de una sola vez
					featuredVehicles.insertAdjacentHTML('beforeend', vehicleCards);
					}
				}
			}

			// Mensaje de cookies
			showCookiesMessage() {
				const toast = `
				<div class="fixed-bottom p-5">
					<div id="cookies-message" class="toast fade show w-75 text-bg-dark" role="alert" aria-live="assertive" aria-atomic="true">
						<div class="toast-header">
							<h4 class="me-auto text-dark">Aviso de uso de cookies</h4>
							<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close" id="btnDismissCookie"></button>
						</div>
						<div class="toast-body p-4 d-flex flex-column">
							<p>
								Este sitio web almacenda datos en cookies para activar su
								funcionalidad, entre las que se encuentra
								datos analíticos y personalización. Para poder utilizar este
								sitio, estás automáticamente aceptando
								que
								utilizamos cookies.
							</p>
							<div class="ml-auto">
								<button type="button" class="btn btn-light me-3" id="btnAcceptCookie" data-bs-dismiss="toast"> Aceptar </button>
								<button type="button" class="btn btn-danger" id="btnDenyCookie" data-bs-dismiss="toast"> Denegar </button>
							</div>
						</div>
					</div>
				</div>`;
				document.body.insertAdjacentHTML('afterbegin', toast);

				const cookiesMessage = document.getElementById('cookies-message');
				cookiesMessage.addEventListener('hidden.bs.toast', (event) => {
					event.currentTarget.parentElement.remove();
				});

				const btnAcceptCookie = document.getElementById('btnAcceptCookie');
				btnAcceptCookie.addEventListener('click', (event) => {
					setCookie('accetedCookieMessage', 'true', 1);
				});

				const denyCookieFunction = (event) => {
					this.main.replaceChildren();
					this.main.insertAdjacentHTML('afterbegin', `<div class="container my-3"><div class="alert alert-warning" role="alert">
							<strong>Para utilizar esta web es necesario aceptar el uso de cookies. Debe recargar la página y aceptar las condicones para seguir navegando. Gracias.</strong>
						</div></div>`);
					this.categories.remove();
					this.menu.remove();
				};
				const btnDenyCookie = document.getElementById('btnDenyCookie');
				btnDenyCookie.addEventListener('click', denyCookieFunction);
				const btnDismissCookie = document.getElementById('btnDismissCookie');
				btnDismissCookie.addEventListener('click', denyCookieFunction);
			}

			// Log in y sesión
				// Botón de login
				showIdentificationLink() {
					this.menu = document.getElementById('menu');
					const loginPlace = this.menu.querySelector('li.nav-item.order-5.d-flex.ms-3');
					if (loginPlace) loginPlace.remove();
					this.menu.insertAdjacentHTML('beforeend', `
						<li class="nav-item order-5 d-flex ms-3">
							<button id="login" class="btn btn-dark"><i class="bi bi-person-fill"></i> Identificate</button>
						</li>
					`);
				}

				// Formulario login
				showLogin() {
					this.main.replaceChildren();
					const login = `
						<h1 class="w-100 px-3 pt-3 d-inline align-middle">Login</h1>
						<form name="fLogin" class="row col-md-8 col-lg-6 col-xl-4 m-auto" role="form" novalidate>
							<div class="mb-3">
								<label class="form-label" for="username">Usuario</label>
								<div class="input-group ">
									<span class="input-group-text"><i class="bi bi-person-fill"></i></span>
									<input type="text" class="form-control rounded-end" id="username" name="username" placeholder="Usuario" required>
									<div class="invalid-feedback">Debes introducir tu nombre de usuario</div>
									<div class="valid-feedback"></div>
								</div>
							</div>
							<div class="mb-3">
								<label class="form-label" for="password">Contraseña</label>
								<div class="input-group">
									<span class="input-group-text"><i class="bi bi-key-fill"></i></span>
									<input type="password" class="form-control rounded-end" id="password" name="password" placeholder="Contraseña">
									<div class="invalid-feedback">Debes introducir una contraseña</div>
									<div class="valid-feedback"></div>
								</div>
							</div>
							<div class="form-group">
								<input class="form-check-input" type="checkbox" name="remember" id="remember">
								<label class="form-check-label" for="remember">Recuérdame</label>
							</div>
							<div class="mb-12 d-flex justify-content-center">
								<button class="btn btn-dark me-3" type="submit"><i class="bi bi-box-arrow-in-right"></i> Acceder</button>
							</div>
						</form>
					`;
					this.main.insertAdjacentHTML('beforeend', login);
				}

				// Mensaje de usuario inválido
				showInvalidUserMessage() {
					// añado esto para que no se repitan los mensajes
					const alertMessage = this.main.querySelector('div.container:has(div.alert-warning)');
					if (!alertMessage) {
					this.main.insertAdjacentHTML('beforeend', `
						<div class="container my-3">
							<div class="alert alert-warning" role="alert">
							<strong>El usuario y la contraseña no son válidos. Inténtelo nuevamente.</strong>
							</div>
						</div>
					`);
					}
					document.forms.fLogin.reset();
					document.forms.fLogin.username.focus();
				}

				// Iniciar historial
				initHistory() {
					history.replaceState({ action: 'init' }, null);
				}

				// Perfil de usuario
				showAuthUserProfile(user) {
					this.menu = document.getElementById('menu');
					const loginPlace = this.menu.querySelector('li.nav-item.order-5.d-flex.ms-3');
					if (loginPlace) loginPlace.remove();
					this.menu.insertAdjacentHTML('beforeend', `
						<li class="nav-item order-5 d-flex ms-3">
							<div class="d-flex mx-2 flex-column justify-content-center text-end text-nowrap">
								Hola, ${user.username}!
								<a id="aCloseSession" href="#"><i class="bi bi-box-arrow-left"></i> Cerrar sesión</a>
							</div>
							<img class="rounded-circle"alt="${user.username}" src="img/user.jpg" style="width: 60px; height: 60px"/>
						</li>
					`);
				}

				// Cookie de usuario
					setUserCookie(user) {
						setCookie('activeUser', user.username, 1);
					}

					deleteUserCookie() {
						setCookie('activeUser', '', 0);
					}
				//

				// Advertencia de seguridad
				showErrorUserMessage() {
					this.main.replaceChildren();
					this.main.insertAdjacentHTML('beforeend', `<div id="error" class="container my-3"><div class="alert alert-warning" role="alert">
						<strong>Para realizar esta acción es necesario estar autenticado.</strong>
					</div></div>`);
					document.getElementById('error').scrollIntoView();
				}
			//
		// Pintar lista de vehículos
			listVehicles(vehicles, catLoc) {
				this.main.replaceChildren();
				this.main.insertAdjacentHTML('beforeend', `<div id="vehicle-list" class="container-fluid d-flex flex-wrap"></div>`);
				const container = document.getElementById('vehicle-list');
				// Este if sive para verificar si recibimos alguna categoría o ubicacion. Sirve por si realizamos una búsqueda, que no nos envía esta información.
				// Igualmente se podría hacer que aparezca el modal para los resultados de búsqueda sin mucho más desarrollo.
				if (catLoc) {
					container.insertAdjacentHTML('beforeend', `
						<div class="w-100">
							<h1 class="px-3 pt-3 d-inline align-middle">${catLoc.name}</h1>
							<button id="modalButton" type="button" class="btn btn-dark d-inline" data-bs-toggle="modal" data-modal-${catLoc.constructor.name}="${catLoc.name}" data-bs-target="#vehicleModal">Modo teatro</button>
							<div class="modal fade" id="vehicleModal" tabindex="-1" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-xl">
								<div class="modal-content">
								<div class="modal-header border-bottom-0 ">
									<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
								</div>
								<div class="modal-body">
								</div>
								<div class="modal-footer">
									<button id="next" type="button" class="btn btn-dark"><i class="bi bi-arrow-right"></i></button>
								</div>
								</div>
							</div>
							</div>
						</div>
						`);
				}
				if (vehicles.length > 0) { // Este if nos ayuda a verificar si hay algún vehículo. Podríamos tener el problema de que nuestro resultado de búsqueda esté vacío.
					for (const vehicle of vehicles) {
						container.insertAdjacentHTML('beforeend', `
							<div class="col-12 col-sm-6 col-md-4 col-lg-3">
								<div class="card m-5">
									${vehicle.isRented ? '<p class="badge bg-danger align-self-start position-absolute m-3">Alquilado</p>' : ''}
									<img data-vehicle="${vehicle.license}" src="${vehicle.image}" class="card-img-top" data-vehicle="license" alt="${vehicle.brand} ${vehicle.model}">
									<div class="card-body">
										<div data-vehicle="${vehicle.license}" class="d-flex justify-content-between align-items-center mb-2">
											<h5 class="card-title">${vehicle.brand} ${vehicle.model}</h5>
											${this.instance[vehicle.constructor.name](vehicle)}
										</div>
										<div class="d-flex justify-content-between align-items-center mb-2">
											<span class="h5 mb-0">${vehicle.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} /día</span>
										</div>
										<div class="d-grid gap-2">
											<a href="#single-vehicle" data-vehicle="${vehicle.license}" class="btn btn-outline-dark" type="button">Más información</a>
											<button data-vehicle="${vehicle.license}" class="btn btn-dark" type="button" id="rent">Alquilar</button>
										</div>
									</div>
								</div>
							</div>`
						);
					}
				} else {
					container.insertAdjacentHTML('beforeend', `
						<div class="m-5 col-12 justify-content-center">
							<p>Lo sentimos, no se ha encontrado ningún vehículo</p>
						</div>`);
				}
				
			}
		// Añadir opción favorito
			favOption() {
				
				const vehicleCards = [...this.main.querySelectorAll('div.card:has(*[data-vehicle])')];
				const storedFavs = this.getFavs();
				if (vehicleCards) {
					for (const vehicle of vehicleCards) {
						const license = vehicle.querySelector('*[data-vehicle]').dataset.vehicle;
						const isFav = storedFavs.includes(license);
						vehicle.insertAdjacentHTML('afterbegin', `
							<a href="#" role="checkbox" aria-checked="${isFav ? 'true' : 'false'}" class="icon-link icon-link-hover align-self-end position-absolute m-2  ${isFav ? 'text-warning' : 'text-dark'} fs-2" style="--bs-icon-link-transform: scale(1.05)" data-fav-vehicle="${license}">
								<i class="bi ${isFav ? 'bi-bookmark-star-fill' : 'bi-bookmark-star'}" aria-expanded="true"></i>
							</a>
						`);

						const favButton = vehicle.querySelector(`a[data-fav-vehicle="${license}"]`);
    					const icon = favButton.querySelector('i');

						favButton.addEventListener('click', (event) => {
							event.preventDefault();
							const favs = this.getFavs();
							const pos = favs.indexOf(license);
							const changeFav = pos !== -1;
							if (changeFav) {
								favs.splice(pos, 1);
								favButton.setAttribute('aria-checked', 'false');
								favButton.classList.replace("text-warning", "text-dark");
								icon.classList.replace("bi-bookmark-star-fill", "bi-bookmark-star");
							} else {
								favs.push(license);
								favButton.setAttribute('aria-checked', 'true');
								favButton.classList.replace("text-dark", "text-warning");
								icon.classList.replace("bi-bookmark-star", "bi-bookmark-star-fill");
							}
							this.setFavs(favs);
						});
					}
				}
			}

			getFavs() {
					return JSON.parse(localStorage.getItem('favs')) || [];
			}

			setFavs(favs) {
				localStorage.setItem('favs', JSON.stringify(favs));
			}
		// Vehículo individual
			// Mostrar ficha de vehículo
			showVehicle(vehicle, categories, location, message) {
				// Sé que en la tutoría no se vacía el main, si no que se añade el vehículo debajo, pero hacerlo cómo lo hago a continuación me pareció más estético.
				this.main.replaceChildren();
				const container = document.createElement('div');
				container.classList.add('container');
				container.classList.add('mt-5');
				container.classList.add('mb-5');
			
				if (vehicle) {
				container.id = 'single-vehicle';
				container.classList.add(`${vehicle.constructor.name}-style`);
				container.insertAdjacentHTML('beforeend', `<div class="row d-flex justify-content-center">
					<div class="col-md-10">
					<div class="card">
						<div class="row">
						<div class="col-md-6">
							<div class="images p-3">
							<div class="text-center p-4">
							${vehicle.isRented ? '<p class="badge bg-danger align-self-start position-absolute m-3">Alquilado</p>' : ''}
							<img class="w-100" id="main-image" src="${vehicle.image}"/>
							</div>
							</div>
						</div>
						<div class="col-md-6">
							<div class="vehicle p-4">
							<div class="mt-4 mb-3"> <span class="text-uppercase brand">${vehicle.brand}</span>
								<h5 class="text-uppercase">${vehicle.model}</h5>
								<div class="price d-flex flex-row align-items-center">
								<span class="act-price">${vehicle.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
								</div>
							</div>
							<p class="about">${vehicle.description}</p>
							${this.instance[vehicle.constructor.name](vehicle)}
							<p id="listed-categories"></p>
							${/* Esto lo hago para mostrar la categoría a la que pertenece el vehículo. */""}
							${location ? `<p id="listed-location">Ubucación: <span role="button" data-location="${location.name}" class="text-white fw-light border border-secondary-subtle bg-secondary p-1 rounded">
							${location.name}
							</span></p>` : ""}
								<div class="cart mt-4 align-items-center">
									<button id="b-rent" data-vehicle="${vehicle.license}" class="btn btn-dark text-uppercase m-2 px-4">Alquilar</button>
									<button id="b-open" data-vehicle="${vehicle.license}" class="btn btn-outline-dark text-uppercase m-2 px-4">Abrir en nueva ventana</button>
								</div>
							</div>
						</div>
						</div>
					</div>
					</div>
				</div>`);
				} else {
				container.insertAdjacentHTML(
					'beforeend',
					`<div class="row d-flex justify-content-center">
					${message}
				</div>`,
				);
				}
				this.main.append(container);
				// Si tenemos categorías, también la mostramos en la ficha de vehículo.
				if (categories) {
					const listedCategories = document.getElementById('listed-categories');
					listedCategories.append('Categorías: ');
					for (const category of categories) {
						listedCategories.insertAdjacentHTML(
							'beforeend',
							`<span role="button" data-category="${category.name}" class="text-white fw-light border border-secondary-subtle bg-secondary p-1 rounded">
							${category.name}
							</span>`,
							); 
					}
				}

			}

			// Mostrar en nueva ventana
			showVehicleInNewWindow(vehicle, categories, location, message) {
				const windowName = `VehicleWindow-${vehicle.license}`;
				const vehicleWindow = this.vehicleWindows.find(win => win.name === windowName);
				const main = vehicleWindow.document.querySelector('main');
				const header = vehicleWindow.document.querySelector('header nav');
				main.replaceChildren();
				header.replaceChildren();
				let container;
				if (vehicle) {
					vehicleWindow.document.title = `${vehicle.brand} - ${vehicle.model}`;
					header.insertAdjacentHTML('beforeend', `<h1 data-vehicle="${vehicle.license}" class="display-5">${vehicle.brand} - ${vehicle.model}</h1>`)
					container = document.createElement('div');
					container.id = 'single-vehicle';
					container.insertAdjacentHTML('beforeend', `<div class="d-flex justify-content-center">
					<div class="col-md-10">
						<div class="card">
						<div class="row">
							<div class="col-md-6">
							<div class="images p-3">
								<div class="text-center p-4">
								${vehicle.isRented ? '<p class="badge bg-danger align-self-start position-absolute m-3">Alquilado</p>' : ''}
								<img class="w-100" id="main-image" src="${vehicle.image}"/>
								</div>
							</div>
							</div>
							<div class="col-md-6">
							<div class="vehicle p-4">
								<div class="mt-4 mb-3"> <span class="text-uppercase brand">${vehicle.brand}</span>
								<h5 class="text-uppercase">${vehicle.model}</h5>
								<div class="price d-flex flex-row align-items-center">
									<span class="act-price">${vehicle.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
								</div>
							</div>
							<p class="about">${vehicle.description}</p>
							${this.instance[vehicle.constructor.name](vehicle)}
							<p id="listed-categories"></p>
							${location ? `<p id="listed-location">Ubucación: <span role="button" data-location="${location.name}" class="text-white fw-light border border-secondary-subtle bg-secondary p-1 rounded">
							${location.name}
							</span></p>` : ""}
								<div class="cart mt-4 align-items-center">
									<button id="b-rent" data-vehicle="${vehicle.license}" class="btn btn-dark text-uppercase m-2 px-4">Alquilar</button>
									<button onClick="window.close()" class="btn btn-dark text-uppercase m-2 px-4" >Cerrar</button>
								</div>
							</div>
							</div>
						</div>
						</div>
					</div>
					</div>`);
					
				} else {
					container = document.createElement('div');
					container.insertAdjacentHTML('beforeend',`<div class="row d-flex justify-content-center">${message}</div>`,
					);
				}
				main.append(container);
				if (categories) {
					const listedCategories = vehicleWindow.document.getElementById('listed-categories');
					listedCategories.append('Categorías: ');
					for (const category of categories) {
						listedCategories.insertAdjacentHTML(
							'beforeend',
							`<span  role="button" data-category="${category.name}" class="text-white fw-light border border-secondary-subtle bg-secondary p-1 rounded">
							${category.name}
							</span>`,
							); 
					}
				}
				vehicleWindow.document.body.scrollIntoView();
				const buttonPlace = this.header.querySelector("nav > div > div:nth-child(1)");
				const button = buttonPlace.querySelector('#b-close-all');
				if (!button) {
					buttonPlace.insertAdjacentHTML(
						'beforeend',
						`<a href="#" id="b-close-all" class="btn btn-dark position-absolute">Cerrar todo</a>`,
						); 
				}

			}

			// Cerrar todads las ventanas
			closeAllWindows() {
				for (const win of  this.vehicleWindows) {
					if (!win.closed) {
						win.close();
					}
				}
				this.vehicleWindows = [];
				const bCloseAll = document.getElementById('b-close-all');
				if (bCloseAll) {
					bCloseAll.remove();
				} 
			}

			// Mostrar en modal
			loadVehicleModal(done, vehicle, categories, location) {
				// Si el iterador terminó, deshabilitamos el botón de next
				if (done) {
					document.getElementById('next').setAttribute('Disabled', '');
					return
				};
				document.getElementById('next').removeAttribute('Disabled', '');
				const modalBody = document.querySelector('#vehicleModal .modal-body');
				modalBody.replaceChildren();
				modalBody.insertAdjacentHTML('beforeend', `
						<div class="row">
						<div class="col-md-6">
							<div class="images p-3">
							<div class="text-center p-4"> <img class="w-100" id="main-image" src="${vehicle.image}"/> </div>
							</div>
						</div>
						<div class="col-md-6">
							<div class="vehicle p-4">
							<div class="mt-4 mb-3"> <span class="text-uppercase brand">${vehicle.brand}</span>
								<h5 class="text-uppercase">${vehicle.model}</h5>
								<div class="price d-flex flex-row align-items-center">
								<span class="act-price">${vehicle.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
								</div>
							</div>
							<p class="about">${vehicle.description}</p>
							${this.instance[vehicle.constructor.name](vehicle)}
							<p id="listed-categories"></p>
							${location ? `<p id="listed-location">Ubucación: <span data-bs-dismiss="modal" aria-label="Close" role="button" data-location="${location.name}" class="text-white fw-light border border-secondary-subtle bg-secondary p-1 rounded">
							${location.name}
							</span></p>` : ""}
								<div class="cart mt-4 align-items-center">
									<button id="b-rent" data-vehicle="${vehicle.license}" class="btn btn-dark text-uppercase m-2 px-4">Alquilar</button>
								</div>
							</div>
						</div>
						</div>`);
				if (categories) {
					const listedCategories = document.getElementById('listed-categories');
					listedCategories.append('Categorías: ');
					for (const category of categories) {
						listedCategories.insertAdjacentHTML(
							'beforeend',
							`<span data-bs-dismiss="modal" aria-label="Close" role="button" data-category="${category.name}" class="text-white fw-light border border-secondary-subtle bg-secondary p-1 rounded">
							${category.name}
							</span>`,
							); 
					}
				}
			}

		// Formularios de administración
			// Modal auxiliar para crear modal y titulo base
				createModal(container, title) {
					container.insertAdjacentHTML('afterbegin', `<h1 class="w-100 px-3 pt-3 d-inline align-middle">${title}</h1>
						<div class="modal fade" id="messageModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
							aria-labelledby="messageModalTitle" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialogscrollable">
								<div class="modal-content">
									<div class="modal-header">
										<h1 class="modal-title fs-5" id="messageModalTitle">${title}</h1>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
										<div class="modal-body">...</div>
									<div class="modal-footer">
										<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
									</div>
								</div>
							</div>
						</div>`
					);
				}

			// Categorías
				// Crear
					showAddCatForm() {
						this.main.replaceChildren();
						
						const container = document.createElement('div');
						container.classList.add('container-fluid');
						this.createModal(container, 'Nueva Categoría');
						container.insertAdjacentHTML('beforeend', `
						<form name="addCat" class="row col-md-8 col-lg-6 col-xl-4 m-auto" role="form" novalidate>
							<div class="mb-3">
								<label class="form-label" for="acName">Título *</label>
								<div class="input-group ">
									<span class="input-group-text"><i class="bi bi-type"></i></span>
									<input type="text" class="form-control rounded-end" id="acName" name="acName" placeholder="Título de categoría" required>
									<div class="invalid-feedback">El título es obligatorio.</div>
									<div class="valid-feedback">Correcto.</div>
								</div>
							</div>
							<div class="mb-3">
								<label class="form-label" for="acDescription">Descripción</label>
								<div class="input-group">
									<span class="input-group-text"><i class="bi bi-body-text"></i></span>
									<input type="text" class="form-control rounded-end" id="acDescription" name="acDescription">
									<div class="invalid-feedback"></div>
									<div class="valid-feedback">Correcto.</div>
								</div>
							</div>
							<div class="mb-12 d-flex justify-content-center">
								<button class="btn btn-dark me-3" type="submit">Enviar</button>
								<button class="btn btn-dark" type="reset">Cancelar</button>
							</div>
						</form>`);

						this.main.append(container);
					}

					showAddCatModal(done, cat, error) {
						const messageModalContainer = document.getElementById('messageModal');
						const messageModal = new bootstrap.Modal('#messageModal');
					
						const title = document.getElementById('messageModalTitle');
						title.innerHTML = 'Nueva Categoría';
						const body = messageModalContainer.querySelector('.modal-body');
						body.replaceChildren();
						if (done) {
						body.insertAdjacentHTML('afterbegin', `<div class="p-3">La categoría <strong>${cat.name}</strong> ha sido creada correctamente.</div>`);
						} else {
						body.insertAdjacentHTML(
							'afterbegin',
							`<div class="error text-danger p-3"><i class="bi bi-exclamation-triangle"></i> La categoría <strong>${cat.name}</strong> ya existe.</div>`,
						);
						}
						messageModal.show();
						
						const listener = (event) => {
						if (done) {
							document.addCat.reset();
						}
						document.addCat.acName.focus();
						};
						
						messageModalContainer.addEventListener('hidden.bs.modal', listener, { once: true });
					}

				// Eliminar
					showDelCatForm(categories) {
						this.main.replaceChildren();
						const container = document.createElement('div');
						container.classList.add('container-fluid');
						this.createModal(container, 'Eliminar Categoría');
						container.id = 'remove-category';
						const row = document.createElement('div');
						row.classList.add('row');
						row.classList.add('p-5');
						for (const category of categories) {
							row.insertAdjacentHTML('beforeend', `
								<div class="col-lg-3 col-md-4 col-sm-6 mt-5 d-flex flex-column">
									<div class="mb-2">
										<h3>${category.name}</h3>
										<div>${category.description}</div>
									</div>
									<div class="d-flex flex-nowrap align-items-center">
										<button class="btn btn-dark me-3" data-category="${category.name}" type='button'>Eliminar</button>
										<a data-category="${category.name}" href="#category-list" class="btn btn-outline-dark text-nowrap">Ver vehículos</a>
									</div>
								</div>
							`);
						}

						container.append(row);
						this.main.append(container);
					}

					showDelCatModal(done, cat, error) {
						const messageModalContainer = document.getElementById('messageModal');
						const messageModal = new bootstrap.Modal('#messageModal');
					
						const title = document.getElementById('messageModalTitle');
						title.innerHTML = 'Borrado de categoría';
						const body = messageModalContainer.querySelector('.modal-body');
						body.replaceChildren();
						if (done) {
							body.insertAdjacentHTML('afterbegin', `<div class="p-3">La categoría <strong>${cat.name}</strong> ha sido eliminada correctamente.</div>`);
						} else {
							body.insertAdjacentHTML(
								'afterbegin',
								`<div class="error text-danger p-3"><i class="bi bi-exclamation-triangle"></i> La categoría <strong>${cat.name}</strong> no se ha podido borrar.</div>`,
							);
						}
						messageModal.show();
						const listener = (event) => {
							if (done) {
								const removeCategory = document.getElementById('remove-category');
								const button = removeCategory.querySelector(`button.btn[data-category="${cat.name}"]`);
								button.parentElement.parentElement.remove();
							}
						};
						messageModalContainer.addEventListener('hidden.bs.modal', listener, { once: true });
					}
				
				// Asignar

					showAssignCatForm(categories) {
						this.main.replaceChildren();
						const container = document.createElement('div');
						container.classList.add('container-fluid');
						this.createModal(container, 'Asignar vehículo a Categoría');
						container.id = 'assign-category';
						let catOptions = '';
						for (const category of categories) {
							catOptions += `<option value="${category.name}">${category.name}</option>`;
						}
						// Se que no es la mejor interfaz para esto. Me hubiera gustado utilizar la siguiente librería https://www.virtuosoft.eu/code/bootstrap-duallistbox/
						// pero la verdad que se me complicó mucho. Lo hago de esta manera, que funciona y es relativamente usable.
						container.insertAdjacentHTML('beforeend', `
							<form name="assignCat" class="row col-md-8 col-lg-6 col-xl-4 m-auto" role="form" novalidate>
								<div class="row mb-3">
									<label class="form-label" for="asCategories">Categoría *</label>
									<div class="input-group">
										<span class="input-group-text"><i class="bi bi-tags-fill"></i></span>
										<select class="form-select rounded-end" name="asCategories" id="asCategories" required>
											<option disabled selected>Selecciona una categoría...</option>
											${catOptions}
										</select>
										<div class="invalid-feedback">Debes seleccionar al menos una categoría.</div>
										<div class="valid-feedback">Correcto.</div>
									</div>
								</div>
								<div class="row mb-3">
									<label class="form-label" for="catVehicles"><i class="bi bi-car-front-fill"></i> Vehículos seleccionados</label>
									<div class="input-group">
										<select class="form-select" name="catVehicles" id="catVehicles" multiple size="10">
										</select>
										<div class="invalid-feedback">Debes seleccionar al menos una categoría.</div>
										<div class="valid-feedback">Correcto.</div>
									</div>
								</div>
								<div class="mb-12 d-flex justify-content-center">
									<button class="btn btn-dark me-3" type="submit">Enviar</button>
									<button class="btn btn-dark" type="reset">Cancelar</button>
								</div>
							</form>	
						`);
						this.main.append(container);
					

					}

					showAssignCatModal(done, cat, error) {
						const messageModalContainer = document.getElementById('messageModal');
						const messageModal = new bootstrap.Modal('#messageModal');
					
						const title = document.getElementById('messageModalTitle');
						title.innerHTML = 'Asignación de categoría';
						const body = messageModalContainer.querySelector('.modal-body');
						body.replaceChildren();
						if (done) {
							body.insertAdjacentHTML('afterbegin', `<div class="p-3">Se han asignado los vehículos a <strong>${cat.name}</strong> correctamente.</div>`);
						} else {
							body.insertAdjacentHTML(
								'afterbegin',
								`<div class="error text-danger p-3"><i class="bi bi-exclamation-triangle"></i> Algo ha fallado al asignar vehículos a <strong>${cat.name}</strong></div>`,
							);
						}
						messageModal.show();
						const listener = (event) => {
							if (done) {
								document.assignCat.reset();
							}
							document.assignCat.asCategories.focus();
							};
						messageModalContainer.addEventListener('hidden.bs.modal', listener, { once: true });

						if (error) console.log(error);
					}

					feedAssignCatForm(vehicles, assignedVehicles) {
						const select = document.getElementById('catVehicles');
						select.innerHTML = '';
						const assignedLicenses = new Set(
							assignedVehicles.map(av => av.license)
						);

						for (const v of vehicles) {
							const opt = document.createElement('option');
							opt.value = v.license;
							opt.text = v.brand + ' ' + v.model + ' ' + v.license;
							opt.selected = assignedLicenses.has(v.license);
							
							select.appendChild(opt);
						}
					}
			
			// Ubicaciones
				// Crear
					showAddLocForm() {
						this.main.replaceChildren();
						
						const container = document.createElement('div');
						container.classList.add('container-fluid');
						this.createModal(container, 'Nueva Ubicación');
						container.insertAdjacentHTML('beforeend', `
						<form name="addLoc" class="row col-md-8 col-lg-6 col-xl-4 m-auto" role="form" novalidate>
							<div class="mb-3">
								<label class="form-label" for="alName">Título *</label>
								<div class="input-group ">
									<span class="input-group-text"><i class="bi bi-type"></i></span>
									<input type="text" class="form-control rounded-end" id="alName" name="alName" placeholder="Título de ubicación" required>
									<div class="invalid-feedback">El título es obligatorio.</div>
									<div class="valid-feedback">Correcto.</div>
								</div>
							</div>
							<div class="mb-3">
								<label class="form-label" for="alAddress">Dirección *</label>
								<div class="input-group ">
									<span class="input-group-text"><i class="bi bi-geo-alt-fill"></i></span>
									<input type="text" class="form-control rounded-end" id="alAddress" name="alAddress" placeholder="Dirección" required>
									<div class="invalid-feedback">La dirección es obligatoria.</div>
									<div class="valid-feedback">Correcto.</div>
								</div>
							</div>
							<div class="mb-3">
								<label class="form-label" for="alLat">Coordenadas</label>
								<div class="input-group">
									<span class="input-group-text"><i class="bi bi-pin-map-fill"></i></span>
									<!-- Me hubiera gustado utilizar la api del mapa de Google, pero me está costando mas de lo que creía -->
									<!-- Para estas expresiones regulares me basé en https://stackoverflow.com/questions/3518504/regular-expression-for-matching-latitude-longitude-coordinates , pero lo hice por separado -->
									<!-- Añadí una doble barra invertida antes del - porque si no me salta un bug https://github.com/angular/angular/issues/52325 -->
									<input type="text" inputmode="decimal" pattern="^[\\-+]?([1-8]?\\d(\\.\\d+)?|90(\\.0+)?)$" class="form-control" id="alLat" name="alLat" placeholder="Latitud">
									<input type="text" inputmode="decimal" pattern="^[\\-+]?((1[0-7]\\d)|([1-9]?\\d)|180)(\\.\\d+)?$" class="form-control rounded-end" id="alLong" name="alLong" placeholder="Longitud">
									<div class="invalid-feedback"></div>
									<div class="valid-feedback">Correcto.</div>
								</div>
							</div>
							<div class="mb-3">
								<label class="form-label" for="alDescription">Descripción</label>
								<div class="input-group">
									<span class="input-group-text"><i class="bi bi-body-text"></i></span>
									<input type="text" class="form-control rounded-end" id="alDescription" name="alDescription">
									<div class="invalid-feedback"></div>
									<div class="valid-feedback">Correcto.</div>
								</div>
							</div>
							<div class="mb-12 d-flex justify-content-center">
								<button class="btn btn-dark me-3" type="submit">Enviar</button>
								<button class="btn btn-dark" type="reset">Cancelar</button>
							</div>
						</form>`);

						this.main.append(container);
					}

					showAddLocModal(done, loc, error) {
						const messageModalContainer = document.getElementById('messageModal');
						const messageModal = new bootstrap.Modal('#messageModal');
					
						const title = document.getElementById('messageModalTitle');
						title.innerHTML = 'Nueva Ubicación';
						const body = messageModalContainer.querySelector('.modal-body');
						body.replaceChildren();
						if (done) {
							body.insertAdjacentHTML('afterbegin', `<div class="p-3">La ubicación <strong>${loc.name}</strong> ha sido creada correctamente.</div>`);
						} else {
							body.insertAdjacentHTML(
							'afterbegin',
							`<div class="error text-danger p-3"><i class="bi bi-exclamation-triangle"></i> La ubicación <strong>${loc.name}</strong> ya existe.</div>`,
							);
						}
						messageModal.show();
						
						const listener = (event) => {
							if (done) {
							document.addLoc.reset();
							}
							document.addLoc.alName.focus();
						};
						
						messageModalContainer.addEventListener('hidden.bs.modal', listener, { once: true });
					}

					
				
				// Eliminar
					showDelLocForm(locations) {
						this.main.replaceChildren();
						const container = document.createElement('div');
						container.classList.add('container-fluid');
						this.createModal(container, 'Eliminar Ubicación');
						container.id = 'remove-location';
						const row = document.createElement('div');
						row.classList.add('row');
						row.classList.add('p-5');
						for (const location of locations) {
						row.insertAdjacentHTML('beforeend', `<div class="col-lg-3 col-md-4 col-sm-6 mt-5 d-flex flex-column">
							<div class="mb-2">
								<h3>${location.name}</h3>
								<div>${location.description}</div>
							</div>
							<div class="d-flex flex-nowrap align-items-center">
								<button class="btn btn-dark me-3" data-location="${location.name}" type='button'>Eliminar</button>
								<a data-location="${location.name}" href="#location-list" class="btn btn-outline-dark text-nowrap">Ver vehículos</a>
							</div>
							</div>`);
						}

						container.append(row);
						this.main.append(container);
					}

					showDelLocModal(done, loc, error) {
						const messageModalContainer = document.getElementById('messageModal');
						const messageModal = new bootstrap.Modal('#messageModal');
					
						const title = document.getElementById('messageModalTitle');
						title.innerHTML = 'Borrado de Ubicación';
						const body = messageModalContainer.querySelector('.modal-body');
						body.replaceChildren();
						if (done) {
							body.insertAdjacentHTML('afterbegin', `<div class="p-3">La ubicación <strong>${loc.name}</strong> ha sido eliminada correctamente.</div>`);
						} else {
							body.insertAdjacentHTML(
								'afterbegin',
								`<div class="error text-danger p-3"><i class="bi bi-exclamation-triangle"></i> La ubicación <strong>${loc.name}</strong> no se ha podido borrar. Es posible que haya vehículos en alquiler en <strong>${loc.name}</strong>.</div>`,
							);
						}
						messageModal.show();
						const listener = (event) => {
							if (done) {
								const removeLocation = document.getElementById('remove-location');
								const button = removeLocation.querySelector(`button.btn[data-location="${loc.name}"]`);
								button.parentElement.parentElement.remove();
							}
						};
						messageModalContainer.addEventListener('hidden.bs.modal', listener, { once: true });

					}

			// Vehículos
				// Crear
					showAddVehicleForm(categories, locations) {
						this.main.replaceChildren();
						
						const container = document.createElement('div');
						container.classList.add('container-fluid');
						this.createModal(container, 'Nuevo vehículo');
						let catOptions = '', locOptions = '';
						for (const category of categories) {
							catOptions += `<option value="${category.name}">${category.name}</option>`;
						}
						for (const location of locations) {
							locOptions += `<option value="${location.name}">${location.name}</option>`;
						}
						container.insertAdjacentHTML('beforeend', `
							<form name="addVehicle" class="row col-md-8 col-lg-6 col-xl-4 m-auto" role="form" novalidate>
								<div class="row mb-3">
									<div class="col-sm">
										<div class="form-check form-check-inline">
											<input class="form-check-input" type="radio" name="avType" id="avType1" value="Car" required>
											<label class="form-check-label" for="avType1"><i class="bi bi-car-front-fill"></i> Coche</label>
										</div>
										<div class="form-check form-check-inline">
											<input class="form-check-input" type="radio" name="avType" id="avType2" value="Bike" required>
											<label class="form-check-label" for="avType2"><i class="bi bi-bicycle"></i> Motocicleta</label>
										</div>
										<div class="form-check form-check-inline">
											<input class="form-check-input" type="radio" name="avType" id="avType3" value="Van" required>
											<label class="form-check-label" for="avType3"><i class="bi bi-truck"></i> Van</label>
										</div>
										<div class="invalid-feedback">Debe seleccionar un tipo</div>
										<div class="valid-feedback">Correcto.</div>
									</div>
								</div>
								<div class="row mb-3">
									<label class="form-label" for="avVariable"></label>
									<div class="input-group ">
										<span class="input-group-text"><i class="bi bi-question-circle-fill"></i></span>
										<input type="number" min="1" steps="any" class="form-control rounded-end" id="avVariable" name="avVariable" required>
										<div class="invalid-feedback">La característica es obligatoria</div>
										<div class="valid-feedback">Correcto.</div>
									</div>
								</div>
								<div class="row mb-3">
									<label class="form-label" for="avBrand">Marca y modelo *</label>
									<div class="input-group ">
										<span class="input-group-text"><i class="bi bi-badge-tm-fill"></i></span>
										<input type="text" class="form-control" id="avBrand" name="avBrand" placeholder="Marca" required>
										<input type="text" class="form-control rounded-end" id="avModel" name="avModel" placeholder="Modelo" required>
										<div class="invalid-feedback">La marca y el modelo son oblicatirios</div>
										<div class="valid-feedback">Correcto.</div>
									</div>
								</div>
								<div class="row mb-3">
									<div class="col-sm">
										<label class="form-label" for="avPrice">Precio *</label>
										<div class="input-group ">
											<span class="input-group-text"><i class="bi bi-currency-euro"></i></span>
											<input type="number" step="any" min="1" class="form-control rounded-end" id="avPrice" name="avPrice" required>
											<div class="invalid-feedback">El precio es obligatorio.</div>
											<div class="valid-feedback">Correcto.</div>
										</div>
									</div>
									<div class="col-sm-7">
										<label class="form-label" for="avLicense">Matrícula *</label>
										<div class="input-group ">
											<span class="input-group-text fw-semibold">1234-BCD</span>
											<input type="text" pattern="^[0-9]{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$" class="form-control rounded-end" id="avLicense" name="avLicense" required>
											<div class="invalid-feedback">La matrícula es obligatoria y no puede contener vocales ni signos.</div>
											<div class="valid-feedback">Correcto.</div>
										</div>
									</div>
								</div>
								<div class="row mb-3">
									<div class="col-sm-6">
										<label class="form-label" for="avCategories">Categorías</label>
										<div class="input-group">
											<span class="input-group-text"><i class="bi bi-tags-fill"></i></span>
											<select class="form-select rounded-end" name="avCategories" id="avCategories" multiple>
												${catOptions}
											</select>
											<div class="invalid-feedback">Debes seleccionar al menos una categoría.</div>
											<div class="valid-feedback">Correcto.</div>
										</div>
									</div>
									<div class="col-sm-6">
										<label class="form-label" for="avLocation">Ubicación</label>
										<div class="input-group">
											<span class="input-group-text"><i class="bi bi-geo-alt-fill"></i></span>
											<select class="form-select rounded-end" name="avLocation" id="avLocation">
												${locOptions}
											</select>
											<div class="invalid-feedback">Debes seleccionar una ubicación.</div>
											<div class="valid-feedback">Correcto.</div>
										</div>
									</div>
								</div>
								<div class="row mb-3">
									<label class="form-label" for="avImage">Imagen</label>
									<div class="input-group ">
										<span class="input-group-text"><i class="bi bi-image"></i></span>
										<input type="file" class="form-control rounded-end" id="avImage" name="avImage" accept="image/png, image/jpeg, image/webp">
										<div class="invalid-feedback"></div>
										<div class="valid-feedback">Correcto.</div>
									</div>
								</div>
								<div class="row mb-3">
									<label class="form-label" for="avDescription">Descripción</label>
									<div class="input-group">
										<span class="input-group-text"><i class="bi bi-body-text"></i></span>
										<input type="text" class="form-control rounded-end" id="avDescription" name="avDescription">
										<div class="invalid-feedback"></div>
										<div class="valid-feedback">Correcto.</div>
									</div>
								</div>
								<div class="mb-12 d-flex justify-content-center">
									<button class="btn btn-dark me-3" type="submit">Enviar</button>
									<button class="btn btn-dark" type="reset">Cancelar</button>
								</div>
							</form>
						`);

						this.main.append(container);
					}

					showAddVehicleModal(done, vehicle, error) {
						const messageModalContainer = document.getElementById('messageModal');
						const messageModal = new bootstrap.Modal('#messageModal');
					
						const title = document.getElementById('messageModalTitle');
						title.innerHTML = 'Nuevo vehículo';
						const body = messageModalContainer.querySelector('.modal-body');
						body.replaceChildren();
						if (done) {
							body.insertAdjacentHTML('afterbegin', `<div class="p-3">El vehículo <strong>${vehicle.brand} ${vehicle.model} ${vehicle.license}</strong> ha sido creado correctamente.</div>`);
						} else {
							body.insertAdjacentHTML(
							'afterbegin',
							`<div class="error text-danger p-3"><i class="bi bi-exclamation-triangle"></i> El vehículo <strong>${vehicle.brand} ${vehicle.model} ${vehicle.license}</strong> ya existe.</div>`,
							);
						}
						messageModal.show();
						
						const listener = (event) => {
							if (done) {
							document.addVehicle.reset();
							}
							document.addVehicle.avBrand.focus();
						};
						
						messageModalContainer.addEventListener('hidden.bs.modal', listener, { once: true });
						if(error){console.log(error)}
					}
				// Eliminar
					showDelVehicleForm(vehicles) {
						this.main.replaceChildren();
						const container = document.createElement('div');
						container.classList.add('container-fluid');
						this.createModal(container, 'Eliminar Vehículo');
						container.id = 'remove-vehicle';
						const row = document.createElement('div');
						row.classList.add('row');
						row.classList.add('p-5');
						// He visto en el ejemplo de mitienda 5.0 se hace con un filtro muy guay,
						// pero no lo ví hasta hoy y no tengo más tiempo. Lo hago de esta manera para realizar una entrega funcional
						for (const vehicle of vehicles) {
						row.insertAdjacentHTML('beforeend', `<div class="col-lg-3 col-md-4 col-sm-6 mt-5 d-flex flex-column">
							<div class="mb-2">
								<h3>${vehicle.brand}</h3>
								<div>${vehicle.model}</div>
							</div>
							<div class="d-flex flex-nowrap align-items-center">
								<button class="btn btn-dark me-3" data-vehicle="${vehicle.license}" type='button'>Eliminar</button>
								<a data-vehicle="${vehicle.license}" href="#single-vehicle" class="btn btn-outline-dark text-nowrap">Ver detalles</a>
							</div>
							</div>`);
						}

						container.append(row);
						this.main.append(container);
					}

					showDelVehicleModal(done, vehicle, error) {
						const messageModalContainer = document.getElementById('messageModal');
						const messageModal = new bootstrap.Modal('#messageModal');
					
						const title = document.getElementById('messageModalTitle');
						title.innerHTML = 'Borrado de Vehículo';
						const body = messageModalContainer.querySelector('.modal-body');
						body.replaceChildren();
						if (done) {
							body.insertAdjacentHTML('afterbegin', `<div class="p-3">El vehículo <strong>${vehicle.brand} ${vehicle.model} ${vehicle.license}</strong> ha sido eliminado correctamente.</div>`);
						} else {
							body.insertAdjacentHTML(
								'afterbegin',
								`<div class="error text-danger p-3"><i class="bi bi-exclamation-triangle"></i> El vehículo <strong>${vehicle.brand} ${vehicle.model} ${vehicle.license}</strong> no se ha podido borrar. Es posible que esté en alquilado</div>`,
							);
						}
						messageModal.show();
						const listener = (event) => {
							if (done) {
								const removeVehicle = document.getElementById('remove-vehicle');
								const button = removeVehicle.querySelector(`button.btn[data-vehicle="${vehicle.license}"]`);
								button.parentElement.parentElement.remove();
							}
						};
						messageModalContainer.addEventListener('hidden.bs.modal', listener, { once: true });

					}

			// Backup
				showBackupOk(title) {
					this.main.insertAdjacentHTML('afterend', `
					<div class="toast fade z-3 text-bg-success position-fixed bottom-0 end-0 m-5" role="status"  aria-live="polite" aria-atomic="true">
						<div class="toast-header">
							<strong class="me-auto">Backup OK!</strong>
							<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
						</div>
						<div class="toast-body">
							El backup se ha realizado en la dirección: <br>
							${title}
						</div>
					</div>
					`);
					const toastElement = document.querySelector('body > div.toast.text-bg-success');
					const toast = new bootstrap.Toast(toastElement);
					toast.show();
					setTimeout(() => {toastElement.remove()}, 6000);
				}

				showBackupError(error) {
					this.main.insertAdjacentHTML('afterend', `
					<div class="toast fade z-3 text-bg-danger position-fixed bottom-0 end-0 m-5" role="status"  aria-live="polite" aria-atomic="true">
						<div class="toast-header">
							<strong class="me-auto">Backup ERROR!</strong>
							<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
						</div>
						<div class="toast-body">
							No se ha podido realizar el backup.<br>
							<strong>${error}</strong>
						</div>
					</div>
					`);
					const toastElement = document.querySelector('body > div.toast.text-bg-danger');
					const toast = new bootstrap.Toast(toastElement);
					toast.show();
					setTimeout(() => {toastElement.remove()}, 6000);
				}
			
	//


}

export default RentalManagerView