const buildUserDisplayName = (user = {}, language = "vi", fallback = "--") => {
    if (language === "vi") {
        return `${user.lastName || ""} ${user.firstName || ""}`.trim() || user.email || fallback;
    }

    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || fallback;
};

module.exports = {
    buildUserDisplayName,
};
