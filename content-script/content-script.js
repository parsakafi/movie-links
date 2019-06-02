(function () {
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    browser.runtime.onMessage.addListener(notify);
    function notify(request, sender, sendResponse) {
        if (request.action === 'getDlLinks') {
            sendResponse(dlLinks());
        }
    }

    function dlLinks(e) {
        let allLinks = document.links;
        let dlLinks = [];
        let links = {};
        let allowedExt = ['mkv', 'mp4', 'avi', 'webm', 'flv', 'mov', 'wmv'];
        let qualities = ['trailer','dubbed', '1080p', '720p', '480p'];

        Object.keys(allLinks).forEach(function (key) {
            let ext = getUrlExtension(allLinks[key].href);
            let allow = allowedExt.includes(ext);
            if (allow) {
                dlLinks.push(allLinks[key].href);
            }
        });

        if (dlLinks.length === 0) return null;

        dlLinks.forEach(link => {
            let quality = qualities.filter(function (item) {
                return eval('/' + item + '/').test(link.toLowerCase());
            });

            quality = quality.length === 0 ? 'other' : quality[0];

            if (!(quality in links))
                links[quality] = [];

            links[quality].push(link);
        });

        links = customLinksSort(links, qualities);
        pageLinks = JSON.stringify(links);

        return pageLinks;
    }

    function customLinksSort(links, qualities) {
        links_ = {};
        qualities.shift();
        qualities.push('other', 'trailer');
        qualities.forEach(quality => {
            if (quality in links)
                links_[quality] = links[quality];
        });

        return links_;
    }

    function getUrlExtension(url) {
        return url.split(/\#|\?/)[0].split('.').pop().trim();
    }
})();