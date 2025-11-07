import AuthenticationService from './authentication.js';
import RentalManager from "./RentalManagerModel.js"; 
import RentalManagerView from "./RentalManagerView.js";
import RentalManagerController from "./RentalManagerController.js";

const RentalManagerApp = new RentalManagerController(RentalManager.getInstance(), new RentalManagerView(), AuthenticationService.getInstance());

export default RentalManagerApp;