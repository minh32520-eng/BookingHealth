import bookingService from '../services/bookingServices';

let getAllBookingsForAdmin = async (req, res) => {
    try {
        let response = await bookingService.getAllBookingsForAdmin(req.query.statusId);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
};

let getAllPaymentsForAdmin = async (req, res) => {
    try {
        let response = await bookingService.getAllPaymentsForAdmin(req.query.paymentStatus);
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
    getAllBookingsForAdmin,
    getAllPaymentsForAdmin
};
