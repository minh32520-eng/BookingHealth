class CommonUtils {
    static buildImageSrc(image) {
        if (!image || typeof image !== 'string') return '';

        const trimmed = image.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('data:image')) return trimmed;

        const mimeType = (() => {
            if (trimmed.startsWith('/9j/')) return 'image/jpeg';
            if (trimmed.startsWith('iVBORw0KGgo')) return 'image/png';
            if (trimmed.startsWith('R0lGOD')) return 'image/gif';
            if (trimmed.startsWith('UklGR')) return 'image/webp';
            if (trimmed.startsWith('PHN2Zy') || trimmed.startsWith('PD94bWwg') || trimmed.startsWith('PHN2Z')) return 'image/svg+xml';
            return 'image/jpeg';
        })();

        return `data:${mimeType};base64,${trimmed}`;
    }

    static parseJwtPayload(token) {
        if (!token || typeof token !== 'string') return null;
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const pad = base64.length % 4;
            const padded = base64 + (pad === 0 ? '' : '='.repeat(4 - pad));
            const json = decodeURIComponent(
                atob(padded)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    }

    static userInfoFromOAuthToken(token) {
        const p = CommonUtils.parseJwtPayload(token);
        if (!p || p.id == null) return null;
        return {
            id: p.id,
            email: p.email,
            firstName: p.firstName,
            lastName: p.lastName,
            roleId: p.roleId,
        };
    }

    static isNumber1(number) {
        if (number === 1) return true;
        return false;
    }
    static getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
}

export default CommonUtils;
