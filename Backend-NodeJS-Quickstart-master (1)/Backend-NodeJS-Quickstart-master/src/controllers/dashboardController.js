import dashboardService from '../services/dashboardServices';

let getRevenueDashboard = async (req, res) => {
    try {
        let response = await dashboardService.getRevenueDashboard(req.query.year, {
            doctorId: req.query.doctorId,
            clinicId: req.query.clinicId
        });
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
};

module.exports = {
    getRevenueDashboard
};
