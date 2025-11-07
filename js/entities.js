import {EmptyValueException, InvalidValueException, ParamIsNotObjectException, InvalidAccessConstructorException} from "./exceptions.js";

// definición de clases

// Clase base de Vehicle
class Vehicle {
    constructor(license, brand, model, price, description = "", image = "", isRented = false) {

        if (new.target === Vehicle) throw new AbstractClassException("Vehicle");
        if (!license) {
            throw new EmptyValueException("license")
        } else if (!/^[0-9]{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/.test(license)) {
           throw new InvalidValueException("license", license)
        };
        if (!brand) throw new EmptyValueException("brand");
        if (!model) throw new EmptyValueException("model");
        if (!price) {
            throw new EmptyValueException("price")
        } else if (price < 0) {
            throw new InvalidValueException("price", price)
        };
        if (typeof isRented !== "boolean") throw new TypeError("the isRented attribute is not boolean");

        this._license = license;
        this._brand = brand;
        this._model = model;
        this._price = price;
        this._description = description;
        this._image = image;
        this._isRented = isRented;
    }

    get license() {
        return this._license;
    }

    get brand() {
        return this._brand;
    }

    get model() {
        return this._model;
    }

    get price() {
        return this._price;
    }
    
    get description() {
        return this._description;
    }

    get image() {
        return this._image;
    }

    get isRented() {
        return this._isRented;
    }

    set isRented(isRented) {
        if (typeof isRented !== "boolean") throw new TypeError("the isRented attribute is not boolean");
        this._isRented = isRented;
    }

    toString() {
        return `matrícula: ${this.license}, marca: ${this.brand}, modelo: ${this.model}, precio: ${this.price} €, ${this.description ? `descripción: ${this.description}, ` : ``}${this.isRented ? `rentado` : `sin rentar`}`;
    }
}

// Subclases de Vehicle
class Car extends Vehicle {
    constructor(license, brand, model, price, passengers, description = "", image = "", isRented = false) {
        super(license, brand, model, price, description, image, isRented);
        if (!passengers) {
            throw new EmptyValueException("passengers")
        } else if (passengers < 0) {
            throw new InvalidValueException("passengers", passengers)
        };
        this.passengers = passengers;
    }

    toString() {
        return `Pasajeros: ${this.passengers}, ${super.toString()}`;
    }
}

class Bike extends Vehicle {
    constructor(license, brand, model, price, engine, description = "", image = "", isRented = false) {
        super(license, brand, model, price, description, image, isRented);
        if (!engine) {
            throw new EmptyValueException("engine")
        } else if (engine < 0) {
            throw new InvalidValueException("engine", engine)
        };
        this.engine = engine;
    }

    toString() {
        return `Cilindrada: ${this.engine} CC, ${super.toString()}`;
    }
}

class Van extends Vehicle {
    constructor(license, brand, model, price, payload, description = "", image = "", isRented = false) {
        super(license, brand, model, price, description, image, isRented);
        if (!payload) {
            throw new EmptyValueException("payload")
        } else if (payload < 0) {
            throw new InvalidValueException("payload", payload)
        };
        this.payload = payload;
    }

    toString() {
        return `Carga útil: ${this.engine} Kg, ${super.toString()}`;
    }
}

// Clase Category
class Category {
    constructor(name, description = "") {
        if (!name) throw new EmptyValueException("name");
        this.name = name;
        this.description = description;
    }

    toString() {
        return `Nombre: ${this.name}, descripción ${this.description}`;
    }
}

// Clase Location
class Location {
    constructor(name, address, location = null, description = "") {
        if (!name) throw new EmptyValueException("name");
        if (!address) throw new EmptyValueException("address");
        if (location && !(location instanceof Coordinate)) {
            throw new TypeError("the location attribute is not a coordinate object")
        };
        this.name = name;
        this.address = address;
        this.location = location; // Objeto Coordinate
        this.description = description;
    }

    toString() {
        return `Nombre: ${this.name}, dirección: ${this.address}, ${this.location ? `coordenadas: ${this.location.toString()}, ` : ``}${this.description ? `descripción: ${this.description}` : ``}`;
    }
}

// Clase Coordinate
class Coordinate {
    constructor(latitude, longitude) {
        if (!latitude) throw new EmptyValueException("latitude");
        if (!longitude) throw new EmptyValueException("longitude");
        this.latitude = latitude;
        this.longitude = longitude;
    }

    toString() {
        return `Lat: ${this.latitude}, Long: ${this.longitude}`;
    }
}

// Class Customer
class Customer {
    constructor(id, name) {
        // Esto es lo único adicional que metí, una validación de DNI y NIE
        if (!id) {
            throw new EmptyValueException("id")
        } else if (!/^([XYZ][0-9]{7}[A-Z]|[0-9]{8}[A-Z])$/.test(id)) {
            throw new InvalidValueException("id", id)
        };
        if (!name) throw new EmptyValueException("name");
        this.id = id;
        this.name = name;
    }

    toString() {
        return `nombre: ${this.name}, id: ${this.id}`;
    }
}

// Clase Rental
class Rental {
    

    constructor(id, vehicle, customer, startRental) {
        if (!vehicle) {
            throw new EmptyValueException("vehicle")
        } else if (!(vehicle instanceof Vehicle)) {
            throw new ParamIsNotObjectException("vehicle","Vehicle")
        };

        if (!customer) {
            throw new EmptyValueException("customer")
        } else if (!(customer instanceof Customer)) {
            throw new ParamIsNotObjectException("customer","Customer")
        };

        if (!startRental) {
            throw new EmptyValueException("startRental")
        } else if (!(startRental instanceof Date)) {
            throw new ParamIsNotObjectException("startRental","Date")
        };

        Object.defineProperty(this, 'id', {
            value: id,
            enumerable: true,
            writable: false,
            configurable: false,
        });
        
        this.vehicle = vehicle;
        this.customer = customer;
        this.startRental = startRental;
        this.isFinished = false;
        this.price = 0;
    }

    toString() {
        return `Id: ${this.id}, ${this.customer.toString()} alquila ${this.vehicle.toString()} empezando el ${this.startRental.toString()}`;
    }
}

// Clase user

class User {
// Campos privados
    #username;
    #preferences;
    constructor(username) {
        if (!new.target) throw new InvalidAccessConstructorException();
        if (!username) throw new EmptyValueException('username');
        this.#username = username;
        Object.defineProperty(this, 'username', {
            enumerable: true,
            get() {
                return this.#username;
            },
        });
        Object.defineProperty(this, 'preferences', {
            enumerable: true,
            get() {
                return this.#preferences;
            },
            set(value) {
                if (!value) throw new EmptyValueException('preferences');
                this.#preferences = value;
            },
        });
    }  
}

export {
    Vehicle,
    Car,
    Bike,
    Van,
    Category,
    Location,
    Coordinate,
    Customer,
    Rental,
    User
}