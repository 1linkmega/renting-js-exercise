class BaseException extends Error {
    constructor(message = '', fileName, lineNumber) {
      super(message, fileName, lineNumber);
      this.name = 'BaseException';
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, BaseException);
      }
    }
}
class InvalidAccessConstructorException extends BaseException {
    constructor(fileName, lineNumber) {
        super('Constructor can’t be called as a function.', fileName, lineNumber);
        this.name = 'InvalidAccessConstructorException';
    }
}

// Excepción personalizada para indicar valores vacios.
class EmptyValueException extends BaseException {
    constructor(param, fileName, lineNumber) {
        super(`Error: The parameter ${param} can't be empty.`, fileName, lineNumber);
        this.param = param;
        this.name = 'EmptyValueException';
    }
}

// Excepción de valor inválido
class InvalidValueException extends BaseException {
    constructor(param, value, fileName, lineNumber) {
        super(`Error: The paramenter ${param} has an invalid value. (${param}: ${value})`, fileName, lineNumber);
        this.param = param;
        this.value = value;
        this.name = 'InvalidValueException';
    }
}

// Excepción personalizada para clases abstractas.
class AbstractClassException extends BaseException {
    constructor(className, fileName, lineNumber) {
        super(`Error: The class  ${className} is abstract.`, fileName, lineNumber);
        this.className = className;
        this.name = 'AbstractClassException';
    }
}

class RentalManagerException extends BaseException {
    constructor(message = 'Error: Manager Exception.', fileName, lineNumber) {
      super(message, fileName, lineNumber);
      this.name = 'RentalManagerException';
    }
  }

// Excepción para los objetos que ya existen
class ExistsException extends RentalManagerException {
    constructor(object, fileName, lineNumber) {
      super(`Error: The ${object.constructor.name} ${object[Object.keys(object)[0]]} already exists in the manager.`, fileName, lineNumber);
      this.object = object;
      this.name = 'ExistsException';
    }
}

class DoNotExistException extends RentalManagerException {
  constructor(object, fileName, lineNumber) {
    super(`Error: The ${object.constructor.name} ${object[Object.keys(object)[0]]} doesn't exist in the manager.`, fileName, lineNumber);
    this.object = object;
    this.name = 'DoNotExistsException';
  }
}

// Excepción para parametros que no son el objeto que deberían.
class ParamIsNotObjectException extends RentalManagerException {
    constructor(param, className, fileName, lineNumber) {
      super(`Error: The param ${param} is null or isn't a ${className} object.`, fileName, lineNumber);
      this.param = param;
      this.className = className;
      this.name = 'ParamIsNotObjectException';
    }
}

// Excepción personalizada para alquileres finalizados.
class RentalFinishedException extends RentalManagerException {
    constructor(rental, fileName, lineNumber) {
        super(`Error: The rental ${rental.id} is already finished.`, fileName, lineNumber);
        this.rental = rental;
        this.name = 'RentalFinishedException';
    }    
}

// Excepción personalizada para clientes con alquileres.
class HasRentalException extends RentalManagerException {
  constructor(object, fileName, lineNumber) {
      super(`Error: The ${object.constructor.name} with the ${Object.keys(object)[0]} ${object[Object.keys(object)[0]]} has a rental.`, fileName, lineNumber);
      this.object = object;
      this.name = 'HasRentalException';
  }    
}

export {
  BaseException,
  InvalidAccessConstructorException,
  EmptyValueException,
  InvalidValueException,
  AbstractClassException,
  RentalManagerException,
  ExistsException,
  DoNotExistException,
  ParamIsNotObjectException,
  RentalFinishedException,
  HasRentalException
}