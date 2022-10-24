const Covid = require('../models/covidModel');
const moment = require('moment');

//get 
exports.getCovid = (req, res, next) => {
        Covid.findById(req.user.covidId)
            .then(covid => {
                res.render('covid/covid', { covid: covid, moment: moment, title: 'Thông tin Covid', name: req.user.name, isActive: 6 });
            })
            .catch(err => console.log(err));
    }
    //Post thong tin than nhiet
exports.postHypothermia = (req, res, next) => {
    const _id = req.body.txt_id;
    const _time = req.body.time;
    const _date = req.body.date;
    const _temperature = req.body.temperature;
    const _affection = req.body.affection;
    if (!_id) {
        let item = {
            date: _date,
            time: _time,
            temperature: _temperature,
            affection: _affection
        };
        //let _hypothermia=[...]
        Covid.findById(req.user.covidId)
            .then(covid => {
                let _hypothermia = [...covid.hypothermia]
                _hypothermia.push(item);
                covid.hypothermia = _hypothermia;
                return covid.save();
            })
            .then(result => {
                res.redirect('/info-covid');
            })
            .catch(err => console.log(err));
    } else {

        Covid.updateOne({ _id: req.user.covidId, 'hypothermia._id': _id }, {
                $set: {
                    'hypothermia.$.date': _date,
                    'hypothermia.$.time': _time,
                    'hypothermia.$.temperature': _temperature,
                    'hypothermia.$.affection': _affection
                }
            })
            .then(result => {
                res.redirect('/info-covid');
            })
            .catch(err => console.log(err));
    }

}

exports.deleteHypothermia = (req, res, next) => {
    const _id = req.body.remove_hypothermia;
    Covid.updateOne({ _id: req.user.covidId }, { $pull: { "hypothermia": { _id: _id } } }, { new: true })
        .then(result => {
            res.redirect('/info-covid');
        })
        .catch(err => console.log(err));
}

exports.postVaccine = (req, res, next) => {
    const _id = req.body.txt_id1;
    const _numVac = req.body.numVac;
    const _dateVac = req.body.dateVac;
    const _typeVac = req.body.typeVac;
    if (!_id) {
        let item = {
            numVac: _numVac,
            dateVac: _dateVac,
            typeVac: _typeVac
        };
        Covid.findById(req.user.covidId)
            .then(covid => {
                let _vaccine = [...covid.vaccine]
                _vaccine.push(item);
                covid.vaccine = _vaccine;
                return covid.save();
            })
            .then(result => {
                res.redirect('/info-covid');
            })
            .catch(err => console.log(err));
    } else {
        Covid.updateOne({ _id: req.user.covidId, 'vaccine._id': _id }, {
                $set: {
                    'vaccine.$.numVac': _numVac,
                    'vaccine.$.typeVac': _typeVac,
                    'vaccine.$.dateVac': _dateVac
                }
            })
            .then(result => {
                res.redirect('/info-covid');
            })
            .catch(err => console.log(err));
    }

}

exports.deleteVaccine = (req, res, next) => {
    const _id = req.body.remove_vaccine;
    Covid.updateOne({ _id: req.user.covidId }, { $pull: { "vaccine": { _id: _id } } }, { new: true })
        .then(result => {
            res.redirect('/info-covid');
        })
        .catch(err => console.log(err));
}


exports.postCovid = (req, res, next) => {
    const _id = req.body.txt_id2;
    const _numCovid = req.body.numCovid;
    const _dateCovid = req.body.dateCovid;
    const _symptom = req.body.symptom;
    const _statusCovid = req.body.statusCovid === 'true' ? true : false;
    if (!_id) {
        let item = {
            numCovid: _numCovid,
            symptom: _symptom,
            dateCovid: _dateCovid,
            statusCovid: _statusCovid

        };
        Covid.findById(req.user.covidId)
            .then(covid => {
                let _covid = [...covid.covid]
                _covid.push(item);
                covid.covid = _covid;
                return covid.save();
            })
            .then(result => {
                res.redirect('/info-covid');
            })
            .catch(err => console.log(err));
    } else {
        Covid.updateOne({ _id: req.user.covidId, 'covid._id': _id }, {
                $set: {
                    'covid.$.numCovid': _numCovid,
                    'covid.$.symptom': _symptom,
                    'covid.$.dateCovid': _dateCovid,
                    'covid.$.statusCovid': _statusCovid
                }
            })
            .then(result => {
                res.redirect('/info-covid');
            })
            .catch(err => console.log(err));
    }

}

exports.deleteCovid = (req, res, next) => {
    const _id = req.body.remove_covid;
    Covid.updateOne({ _id: req.user.covidId }, { $pull: { "covid": { _id: _id } } }, { new: true })
        .then(result => {
            res.redirect('/info-covid');
        })
        .catch(err => console.log(err));
}