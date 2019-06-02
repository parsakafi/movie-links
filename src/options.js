function restoreOptions() {
    // let storageItem = browser.storage.managed.get('displayFileSize');
    // storageItem.then((res) => {
    //     document.getElementById('displayFileSize' + res.displayFileSize).checked = true;
    // });

    let displayFileSize = browser.storage.sync.get('displayFileSize');
    displayFileSize.then((res) => {
        let display = res.displayFileSize || '0';
        document.getElementById('displayFileSize' + display).checked = true;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);

let rad = document.querySelector("form").display_file_size;
let prev = null;
for (let i = 0; i < rad.length; i++) {
    rad[i].addEventListener('change', function() {
        (prev) ? console.log(prev.value): null;
        if (this !== prev) {
            prev = this;
        }
        browser.storage.sync.set({
            displayFileSize: this.value
        });
    });
}
