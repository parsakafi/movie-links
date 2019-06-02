document.addEventListener("click", function (e) {
    e.preventDefault();
    if (!e.target.classList.contains("dl-link")) {
        return;
    }
    let chosenLink = e.target.getAttribute('href');
    browser.tabs.create({
        url: chosenLink
    });
});

window.addEventListener("load", async (e) => {
    let query = browser.tabs.query({ currentWindow: true, active: true });
    let tab = query.then(getTab, onError);

    String.prototype.replaceAll = function (find, replace) {
        let str = this; 
        if (Array.isArray(find)) {
            for (let i = 0; i < find.length; i++)
                str = str.replaceAll(find[i], replace);
            return str;
        } else
            return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
    };

    function getTab(tabs) {
        for (let tab of tabs) {
            checkTab(tab.id);
        }
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    const checkTab = function (tab) {
        return browser.tabs.sendMessage(tab, { action: 'getDlLinks' }, async function (response) {
            let content = document.getElementById('popup-content');
            if (response === null) {
                content.innerHTML = '<div class="no-links">No movie link!</div>';
            } else {
                let displayFileSize = 0;
                let displayFileSizeOpt = browser.storage.sync.get('displayFileSize');
                await displayFileSizeOpt.then((res) => {
                    displayFileSize = parseInt(res.displayFileSize) || 0;
                });
                dlLinks = JSON.parse(response);
                dlLinks = Object.entries(dlLinks);
                let html = '', size = '', title = '', filename;
                for (let i = 0; i < dlLinks.length; i++) {
                    html += '<strong>' + UCWords(dlLinks[i][0]) + '</strong><ul>';
                    links = dlLinks[i][1];
                    for (let j = 0; j < links.length; j++) {
                        filename = getFileName(links[j]);
                        title = filename = filename.replaceAll(['.', '_'], ' ');
                        if (displayFileSize === 1) {
                            size = await getFileSize(links[j]);
                            size = humanFileSize(size, true);
                            title += "\nFile Size: " + size;
                            size = ', ' + size;
                        }
                        html += '<li><a href="' + links[j] + '" title="' + title + '" class="dl-link">' + filename + '</a>' + size + '</li>';
                    }
                    html += '</ul>';
                }
                content.innerHTML = html;
            }
        }).catch(console.error.bind(console));
    }

    function getFileName(url) {
        return url.substring(url.lastIndexOf('/') + 1);
    }

    function humanFileSize(bytes, si) {
        let thresh = si ? 1000 : 1024;
        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }
        let units = si
            ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(1) + ' ' + units[u];
    }

    async function getFileSize(url) {
        return await new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, true);
            xhr.onreadystatechange = function () {
                if (this.readyState == this.DONE) {
                    let status = xhr.status;
                    if (status == 200) {
                        fileSize = this.getResponseHeader('content-length');
                        resolve(fileSize);
                    } else {
                        reject(status);
                    }
                }
            };
            xhr.send();
        });
    }

    function UCWords(str) {
        strVal = '';
        str = str.split(' ');
        for (let chr = 0; chr < str.length; chr++) {
            strVal += str[chr].substring(0, 1).toUpperCase() + str[chr].substring(1, str[chr].length) + ' '
        }
        return strVal;
    }
});