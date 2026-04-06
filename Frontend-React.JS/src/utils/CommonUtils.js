class CommonUtils {
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