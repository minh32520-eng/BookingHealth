import moment from "moment";

const parseScheduleStart = (value = "") => {
    const normalized = String(value).trim().toUpperCase();
    const match = normalized.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/);

    if (!match) {
        return null;
    }

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const meridiem = match[3];

    if (meridiem === "AM" && hours === 12) hours = 0;
    if (meridiem === "PM" && hours < 12) hours += 12;

    return { hours, minutes };
};

const getScheduleStartTimestamp = (dateValue, timeTypeData) => {
    const parsed =
        parseScheduleStart(timeTypeData?.valueEn) ||
        parseScheduleStart(timeTypeData?.valueVi);

    if (!parsed) {
        return moment(Number(dateValue)).valueOf();
    }

    return moment(Number(dateValue))
        .startOf("day")
        .hour(parsed.hours)
        .minute(parsed.minutes)
        .second(0)
        .millisecond(0)
        .valueOf();
};

module.exports = {
    parseScheduleStart,
    getScheduleStartTimestamp,
};
