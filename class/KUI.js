//----------------------------------------------------
// * UI
//----------------------------------------------------
// 
//----------------------------------------------------

var KUI = {

    cameraOrtho:    null,
    sceneOrtho:     null,

    ResponsiveSize: {
        minHeight: 720,
        maxHeight: 1080,
    },

    Anchor: {
        leftTop: null,      top: null,      rightTop: null,
        left: null,         center:null,    right: null,
        leftBottom:null,    bottom:null,    rightBottom: null
    },

    uiObjects: {},
    detectableObjects: [],

    raycaster: new THREE.Raycaster(),
    mouseButtonStatus: {},

    init: async function() {

        var width = window.innerWidth;
        var height = window.innerHeight;

        this.cameraOrtho = new THREE.OrthographicCamera(
            -width / 2,
            width / 2,
            height / 2,
            -height / 2, -1, 10);
        
        this.cameraOrtho.position.z = 10;
        this.sceneOrtho = new THREE.Scene();

        // init anchors
        for(var k in this.Anchor) {
            var obj = new THREE.Group();
            this.Anchor[k] = obj;
            this.sceneOrtho.add(obj);
        }

        this.onWindowResize();
    },

    add: function(name, threeObject, anchor_name, hitable) {
        if (typeof hitable == 'undefined') hitable = false;
        if (hitable)
            this.detectableObjects.push(threeObject);
        this.uiObjects[name] = threeObject;
        if (this.Anchor[anchor_name])
            this.Anchor[anchor_name].add(threeObject);
    },

    loadTexture: function(filePath) {
        return new Promise(async function (resolve, reject) {
            var textureLoader = new THREE.TextureLoader();
            textureLoader.load(filePath, function (object) { resolve(object); }, null, function (code) { reject(code); });
        });
    },

    makeSprite: async function(filePath) {
        var mapA = await this.loadTexture(filePath);
        var material = new THREE.SpriteMaterial( { map: mapA } );

        var width = material.map.image.width;
        var height = material.map.image.height;

        var sprite = new THREE.Sprite(material);
        sprite.center.set(0.5, 0.5);
        sprite.scale.set(width, height, 1);

        return sprite;
    },

    makeTextSprite: function(message, parameters) {
        if ( parameters === undefined ) parameters = {};
        var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
        var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
        var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
        var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
        var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };
        var bold = parameters.hasOwnProperty("bold") ?parameters["bold"] : false;
        var round = parameters.hasOwnProperty("round") ?parameters["round"] : false;

        var canvas = document.createElement('canvas');
        
        canvas.width = 512;
        canvas.height = 128;

        var context = canvas.getContext('2d');
        context.font = ( bold ? "Bold " : " ") + fontsize + "px " + fontface;
        var metrics = context.measureText( message );
        var textWidth = metrics.width;

        // canvas.width = textWidth * 2;
        // canvas.height = fontsize * 2;

        // var out_of_range = false;
        // if (canvas.width < textWidth) {
        //     canvas.width = textWidth ;
        //     canvas.style.width = textWidth + "px";
        //     //out_of_range = true;
        // }

        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

        if (round) {
            context.lineWidth = borderThickness;
            this.roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1 , fontsize * 1.4 + borderThickness, 8);
        }

        context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
        context.fillText( message, borderThickness, fontsize + borderThickness);

        var texture = new THREE.CanvasTexture(canvas) 
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.center.set(textWidth / canvas.width / 2, 1 - fontsize / canvas.height );
        sprite.scale.set(canvas.width * fontsize / 18, canvas.height * fontsize / 18, 1);
        return sprite;  
    },

    roundRect: function(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.lineTo(x+w-r, y);
        ctx.quadraticCurveTo(x+w, y, x+w, y+r);
        ctx.lineTo(x+w, y+h-r);
        ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
        ctx.lineTo(x+r, y+h);
        ctx.quadraticCurveTo(x, y+h, x, y+h-r);
        ctx.lineTo(x, y+r);
        ctx.quadraticCurveTo(x, y, x+r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();   
    },

    render: function() {
        $renderer.render(this.sceneOrtho, this.cameraOrtho);
        this.update();
    },

    onWindowResize: function() {
        var c = this.cameraOrtho;

        var width = window.innerWidth;
        var height = window.innerHeight;

        if (height < this.ResponsiveSize.minHeight) {
            width = width * this.ResponsiveSize.minHeight / height;
            height = this.ResponsiveSize.minHeight;
        }
        else if (height > this.ResponsiveSize.maxHeight) {
            width = width * this.ResponsiveSize.maxHeight / height;
            height = this.ResponsiveSize.maxHeight;
        }

        c.left = - width / 2;
        c.right = width / 2;
        c.top = height / 2;
        c.bottom = - height / 2;
        c.updateProjectionMatrix();

        var anchor = this.Anchor;

        anchor.leftTop.     position.set(c.left, c.top, 0);
        anchor.top.         position.set(0, c.top, 0);
        anchor.rightTop.    position.set(c.right, c.top, 0);

        anchor.left.        position.set(c.left, 0, 0);
        anchor.center.      position.set(0, 0, 0);
        anchor.right.       position.set(c.right, 0, 0);

        anchor.leftBottom.  position.set(c.left, c.bottom, 0);
        anchor.bottom.      position.set(0, c.bottom, 0);
        anchor.rightBottom. position.set(c.right, c.bottom, 0);
    },

    cleanUp: function() {
        for (var idx in this.Anchor) {
            var a = this.Anchor[idx];
            while(dispose(a, true) > 0);
        }
        this.uiObjects = {};
        this.detectableObjects = [];
    },

    update: function() {
        
        // this.raycaster.setFromCamera(KInput.mousePosition, this.cameraOrtho);
        // // calculate objects intersecting the picking ray
        // var intersects = this.raycaster.intersectObjects(this.detectableObjects);

        // var click = false;

        // if (!this.mouseButtonStatus[0]) {
        //     if (KInput.mouseButtonStatus[0]) {
        //         this.mouseButtonStatus[0] = 1;
        //     }
        // } else {
        //     if (!KInput.mouseButtonStatus[0]) {
        //         this.mouseButtonStatus[0] = 0;
        //         click = true;
        //     }        
        // }

        // for (var i = 0; i < intersects.length; ++i) {
        //     var obj = intersects[i].object;
        //     if (click) {
        //         if (obj.onClick) obj.onClick();
        //     } else {
        //         if (obj.onHover) obj.onHover();
        //     }
        // }
    }
};