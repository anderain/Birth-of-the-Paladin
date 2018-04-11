//----------------------------------------------------
// * Request
//----------------------------------------------------
// 
//----------------------------------------------------

var KRequest = {
    load: function (url) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();

            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        resolve(request.responseText);
                    } else {
                        reject(request.status);
                    }
                } else {

                }
            }

            request.open('GET', url);
            request.send();
        });
    }
}
