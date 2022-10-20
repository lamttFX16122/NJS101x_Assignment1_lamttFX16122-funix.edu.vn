const express = require('express');
const router = express.Router();
const timeRecordingController = require('../controllers/timeRecordingController');


router.get('/', timeRecordingController.getTimeRecording);
router.get('/time-recording', timeRecordingController.getTimeRecording);
router.get('/start-time', timeRecordingController.getStartTime);
router.post('/start-time', timeRecordingController.postStartTime);
//end time
router.post('/end-time', timeRecordingController.postEndTime);
//AnnualLeave
router.get('/annualLeave', timeRecordingController.getAnnualLeave);
router.post('/annualLeave', timeRecordingController.postAnnualLeave);
router.post('/remove-annual', timeRecordingController.postDeleteAnnual);



module.exports = router;