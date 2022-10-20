const express = require('express');
const router = express.Router();
const covidController = require('../controllers/covidController');

router.get('/info-covid', covidController.getCovid);
//post than nhiet
router.post('/hypothermia', covidController.postHypothermia);
router.post('/vaccine', covidController.postVaccine);
router.post('/covid', covidController.postCovid);
router.post('/deleteHypothermia', covidController.deleteHypothermia);
router.post('/deleteVaccine', covidController.deleteVaccine);
router.post('/deleteCovid', covidController.deleteCovid);

module.exports = router;