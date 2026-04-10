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

module.exports = {
    normalizeBase64Image
};
