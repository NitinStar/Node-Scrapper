
    exports.validUrl = function(url) {
        const isValidUrl = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
        return isValidUrl.test(url);
    }

    exports.findJsonLdImages = function(text) {
        const info = JSON.parse(text);
        return info ? info.logo : null;
    }

    exports.svgToDataURL = function(svgStr) {
        if (svgStr && svgStr.indexOf('svg') && svgStr.indexOf('href') === -1) {
            const encoded = encodeURIComponent(svgStr)
                .replace(/'/g, '%27')
                .replace(/"/g, '%22');

            const header = 'data:image/svg+xml,';
            return header + encoded;
        } else {
            return null;
        }

    }
