const parseBase64Attachment = (fileData = "") => {
    if (!fileData || typeof fileData !== "string") {
        return null;
    }

    const match = fileData.match(/^data:(.+?);base64,(.+)$/);

    if (match) {
        return {
            contentType: match[1],
            content: match[2],
        };
    }

    return {
        contentType: "application/octet-stream",
        content: fileData,
    };
};

module.exports = {
    parseBase64Attachment,
};
