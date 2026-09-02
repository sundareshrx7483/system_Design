import {getCount} from '../controllers/counterController.js';
import express from 'express';
const router = express.Router();

const getCounterRoute = () => {
  router.get('/', getCount);
  return router;
};

export default getCounterRoute;