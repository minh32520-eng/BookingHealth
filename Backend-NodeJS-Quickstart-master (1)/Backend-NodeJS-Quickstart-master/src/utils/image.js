const normalizeBase64Image = (value) => {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('data:image')) {
        const parts = trimmed.split(',');
        return parts.length > 1 ? parts[1] : trimmed;
    }
    return trimmed;
};

const convertBufferToBase64 = (value) => {
    if (value && Buffer.isBuffer(value)) {
        return value.toString('base64');
    }
    return value || '';
};

module.exports = {
    normalizeBase64Image,
    convertBufferToBase64
};
