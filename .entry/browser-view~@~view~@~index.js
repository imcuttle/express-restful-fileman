
require('../browser-view/view/index.html');

require('../browser-view/view/index.js');

if (module.hot) {
    module.hot.accept('../browser-view/view/index.js', function () {
        require('../browser-view/view/index.js')
    })
}