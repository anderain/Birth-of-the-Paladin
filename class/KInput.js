//----------------------------------------------------
// * Input
//----------------------------------------------------
// 
//----------------------------------------------------

var KInput = {

    mousePosition: new THREE.Vector2(),
    mouseButtonStatus: {},
    keyStatus: {},

    init: function() {
        window.addEventListener('mousemove', this.onMouseMove, false);
        window.addEventListener('mousedown', this.onMouseDown, false);
        window.addEventListener('mouseup', this.onMouseUp, false);

        window.addEventListener('keypress', function (event) {
            const keyName = event.key;
            KInput.keyStatus[keyName] = true;
        });
        window.addEventListener('keyup', function (event) {
            const keyName = event.key;
            KInput.keyStatus[keyName] = false;
        });

        window.addEventListener('touchstart', function (e) {
            var self = KInput;
            if (e.targetTouches.length == 1) {
                var touch = e.targetTouches[0];
                self.mousePosition.x = (touch.pageX / window.innerWidth) * 2 - 1;
                self.mousePosition.y = -(touch.pageY / window.innerHeight) * 2 + 1;
            }
            self.mouseButtonStatus[0] = true;
        }, false);

        window.addEventListener('touchmove', function (e) {
            var self = KInput;
            if (e.targetTouches.length == 1) {
                var touch = e.targetTouches[0];
                self.mousePosition.x = (touch.pageX / window.innerWidth) * 2 - 1;
                self.mousePosition.y = -(touch.pageY / window.innerHeight) * 2 + 1;
            }
            console.log(self.mouseButtonStatus[0]);
        }, false);
        
        window.addEventListener('touchend', function (e) {
            var self = KInput;
            if (e.targetTouches.length == 1) {
                var touch = e.targetTouches[0];
                self.mousePosition.x = (touch.pageX / window.innerWidth) * 2 - 1;
                self.mousePosition.y = -(touch.pageY / window.innerHeight) * 2 + 1;
            }
            self.mouseButtonStatus[0] = false;
        }, false);
    },

    // update mouse position
    onMouseMove: function(event) {
        var self = KInput;
        self.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        self.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    },

    onMouseDown: function(event) {
        var self = KInput;
        self.mouseButtonStatus[event.button] = true;
    },

    onMouseUp: function(event) {
        var self = KInput;
        self.mouseButtonStatus[event.button] = false;
    }
}