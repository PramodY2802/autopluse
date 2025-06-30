import express from 'express';
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getCustomerVehicleSearchData 
  //getServicesByVehicleId
} from '../controllers/serviceController.js';

const router = express.Router();

// Service routes
router.get('/search/customers-vehicles', getCustomerVehicleSearchData); 
router.post('/', createService);           
router.get('/', getAllServices);            
router.get('/:id', getServiceById);         
router.put('/:id', updateService);         
router.delete('/:id', deleteService);
// router.get('/:vehicleId', getServicesByVehicleId);


export default router;
