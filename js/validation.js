function showFeedBack(input, valid, message) {
		const validClass = (valid) ? 'is-valid' : 'is-invalid';
		const messageDiv = (valid) ?
		input.parentElement.querySelector('div.valid-feedback') : input.parentElement.querySelector('div.invalid-feedback');
		for (const div of input.parentElement.getElementsByTagName('div')) {
				div.classList.remove('d-block');
		}
		messageDiv.classList.remove('d-none');
		messageDiv.classList.add('d-block');
		input.classList.remove('is-valid');
		input.classList.remove('is-invalid');
		input.classList.add(validClass);
		if (message) {
				messageDiv.innerHTML = message;
		}
}

function defaultCheckElement(event) {
	this.value = this.value.trim();
	if (!this.checkValidity()) {
		showFeedBack(this, false);
	} else {
		showFeedBack(this, true);
	}
}

function addCatValidation(handler) {
		const form = document.forms.addCat;
		form.setAttribute('novalidate', true);
		form.addEventListener('submit', function (event) {
			let isValid = true;
			let firstInvalidElement = null;
	
			this.acDescription.value = this.acDescription.value.trim();
			showFeedBack(this.acDescription, true);
	
			if (!this.acName.checkValidity()) {
				isValid = false;
				showFeedBack(this.acName, false);
				firstInvalidElement = this.acName;
			} else {
				showFeedBack(this.acName, true);
			}
	
			if (!isValid) {
				firstInvalidElement.focus();
			} else {
				handler(this.acName.value, this.acDescription.value);
			}
			event.preventDefault();
			event.stopPropagation();
		});
	
		form.addEventListener('reset', (function (event) {
			for (const div of this.querySelectorAll('div.valid-feedback, div.invalid-feedback')) {
				div.classList.remove('d-block');
				div.classList.add('d-none');
			}
			for (const input of this.querySelectorAll('input')) {
				input.classList.remove('is-valid');
				input.classList.remove('is-invalid');
			}
			this.acName.focus();
		}));
	
		form.acName.addEventListener('change', defaultCheckElement);
}

function assignCatValidation(handler) {
	const form = document.forms.assignCat;
	form.setAttribute('novalidate', true);
	form.addEventListener('submit', function (event) {
		let isValid = true;
		let firstInvalidElement = null;

		let vehicles = [...this.catVehicles.selectedOptions].map(opt => opt.value.trim());
		showFeedBack(this.catVehicles, true);

		if (!this.asCategories.checkValidity()) {
			isValid = false;
			showFeedBack(this.asCategories, false);
			firstInvalidElement = this.asCategories;
		} else {
			showFeedBack(this.asCategories, true);
		}

		if (!isValid) {
			firstInvalidElement.focus();
		} else {
			handler(this.asCategories.value, vehicles);
		}
		event.preventDefault();
		event.stopPropagation();
	});

	form.addEventListener('reset', (function (event) {
		for (const div of this.querySelectorAll('div.valid-feedback, div.invalid-feedback')) {
			div.classList.remove('d-block');
			div.classList.add('d-none');
		}
		for (const input of this.querySelectorAll('input')) {
			input.classList.remove('is-valid');
			input.classList.remove('is-invalid');
		}
		this.asCategories.focus();
	}));

	form.asCategories.addEventListener('change', defaultCheckElement);
}

function addLocValidation(handler) {
	const form = document.forms.addLoc;
	form.setAttribute('novalidate', true);
	form.addEventListener('submit', function (event) {
		let isValid = true;
		let firstInvalidElement = null;

		this.alDescription.value = this.alDescription.value.trim();
		showFeedBack(this.alDescription, true);

		if (!this.alName.checkValidity()) {
			isValid = false;
			showFeedBack(this.alName, false);
			firstInvalidElement = this.alName;
		} else {
			showFeedBack(this.alName, true);
		}

		if (!this.alAddress.checkValidity()) {
			isValid = false;
			showFeedBack(this.alAddress, false);
			firstInvalidElement = this.alAddress;
		} else {
			showFeedBack(this.alAddress, true);
		}

		if (!this.alLat.checkValidity()) {
			isValid = false;
			showFeedBack(this.alLat, false);
			firstInvalidElement = this.alLat;
		} else {
			showFeedBack(this.alLat, true);
		}

		if (!this.alLong.checkValidity()) {
			isValid = false;
			showFeedBack(this.alLong, false);
			firstInvalidElement = this.alLong;
		} else {
			showFeedBack(this.alLong, true);
		}

		if (!isValid) {
			firstInvalidElement.focus();
		} else {
			handler(this.alName.value, this.alAddress.value, this.alLat.value, this.alLong.value, this.alDescription.value);
		}
		event.preventDefault();
		event.stopPropagation();
	});

	form.addEventListener('reset', (function (event) {
		for (const div of this.querySelectorAll('div.valid-feedback, div.invalid-feedback')) {
			div.classList.remove('d-block');
			div.classList.add('d-none');
		}
		for (const input of this.querySelectorAll('input')) {
			input.classList.remove('is-valid');
			input.classList.remove('is-invalid');
		}
		this.alName.focus();
	}));

	form.alName.addEventListener('change', defaultCheckElement);
	form.alAddress.addEventListener('change', defaultCheckElement);
	form.alLat.addEventListener('change', defaultCheckElement);
	form.alLong.addEventListener('change', defaultCheckElement);
}

function addVehicleValidation(handler) {
	
	const form = document.forms.addVehicle;
	form.setAttribute('novalidate', true);
	form.addEventListener('submit', function (event) {
		event.preventDefault();
		event.stopPropagation();
		let isValid = true;
		let firstInvalidElement = null;
		let price;

		this.avDescription.value = this.avDescription.value.trim();
		showFeedBack(this.avDescription, true);
		
		let categories = [...this.avCategories.selectedOptions].map(opt => opt.value.trim());
		showFeedBack(this.avCategories, true);

		this.avLocation.value = this.avLocation.value.trim();
		showFeedBack(this.avLocation, true);

		if(!this.avType.value) {
			isValid = false;
			showFeedBack(this.querySelector('input[name="avType"]').parentElement, false);
			firstInvalidElement = this.querySelector('input[name="avType"]');
			const radios = this.querySelectorAll('input[name="avType"]');
			for (const input of radios) {
				input.classList.remove('is-valid');
				input.classList.add('is-invalid');
			}
		} else {
			showFeedBack(this.querySelector('input[name="avType"]').parentElement, true);
			const radios = this.querySelectorAll('input[name="avType"]');
			for (const input of radios) {
				input.classList.remove('is-invalid');
			}

			this.querySelector('input[name="avType"]:checked').classList.add('is-valid');
		}

		if (!this.avBrand.checkValidity()) {
			isValid = false;
			showFeedBack(this.avBrand, false);
			firstInvalidElement = this.avBrand;
		} else {
			showFeedBack(this.avBrand, true);
		}

		if (!this.avModel.checkValidity()) {
			isValid = false;
			showFeedBack(this.avModel, false);
			firstInvalidElement = this.avModel;
		} else {
			showFeedBack(this.avModel, true);
		}

		if (!this.avPrice.checkValidity()) {
			isValid = false;
			showFeedBack(this.avPrice, false);
			firstInvalidElement = this.avPrice;
		} else {
			showFeedBack(this.avPrice, true);
			price = Number(this.avPrice.value);
		}

		if (!this.avLicense.checkValidity()) {
			isValid = false;
			showFeedBack(this.avLicense, false);
			firstInvalidElement = this.avLicense;
		} else {
			showFeedBack(this.avLicense, true);
		}

		if (!this.avVariable.checkValidity()) {
			isValid = false;
			showFeedBack(this.avVariable, false);
			firstInvalidElement = this.avVariable;
		} else {
			showFeedBack(this.avVariable, true);
		}

		// Encontré esta forma de pasar la imagen a base64
		// Fuentes:
		// https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
		// https://www.youtube.com/watch?v=8K2ihr3NC40&ab_channel=dcode
		// https://www.w3schools.com/jsref/event_onload.asp

		const reader = new FileReader();
		reader.onload = () => {
			const img = reader.result;
			if (!isValid) {
				firstInvalidElement.focus();
			} else {
				handler(this.avType.value,  this.avLicense.value, 
					this.avBrand.value, this.avModel.value,
					price, this.avVariable.value,
					this.avDescription.value, img,
					categories, this.avLocation.value);
			}
		};

		if (form.avImage.files[0]) {
			reader.readAsDataURL(form.avImage.files[0]);
		}
		
	});

	form.addEventListener('reset', (function (event) {
		for (const div of this.querySelectorAll('div.valid-feedback, div.invalid-feedback')) {
			div.classList.remove('d-block');
			div.classList.add('d-none');
		}
		for (const input of this.querySelectorAll('input')) {
			input.classList.remove('is-valid');
			input.classList.remove('is-invalid');
		}
		this.avBrand.focus();
	}));

	

	const radios = form.querySelectorAll('input[name="avType"]');

	for (const input of radios) {
		input.addEventListener('change', (event) => {
			if(!input.value) {
				isValid = false;
				showFeedBack(input.parentElement, false);
				firstInvalidElement = input;
				for (const inputI of radios) {
					inputI.classList.remove('is-valid');
					inputI.classList.add('is-invalid');
				}
			} else {
				showFeedBack(input.parentElement, true);
				for (const inputI of radios) {
					inputI.classList.remove('is-invalid');
					inputI.classList.remove('is-valid');
				}
	
				form.querySelector('input[name="avType"]:checked').classList.add('is-valid');
			}
		});
	}
	
	form.avVariable.addEventListener('change', defaultCheckElement);
	form.avBrand.addEventListener('change', defaultCheckElement);
	form.avModel.addEventListener('change', defaultCheckElement);
	form.avPrice.addEventListener('change', defaultCheckElement);
	form.avLicense.addEventListener('change', defaultCheckElement);
}

export { addCatValidation, assignCatValidation, addLocValidation, addVehicleValidation };
