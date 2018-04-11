function DirectorGame() {
    this.started = false;
    this.mapCollider = null;

    this.beforeLoad = function() {}

    this.start = async function() {
        $camera.position.set(5,5,5);
        $camera.lookAt(0,0,0);

        this.mapCollider = new RPGMapCollider();

        this.mapCollider.addPlayer();
        this.mapCollider.addCube(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 2));
        this.mapCollider.setCameraVisible(false);

        var spriteMap = await $scene.asyncLoad.TEXTURE('./assets/run.png');
        this.animatedMap = new AnimatedTexture(spriteMap, 10, 2, [{start:0, end:9},{start:10, end:19}], 0.075);
        var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
        var sprite = new THREE.Sprite(spriteMaterial);
        $scene.threeScene.add(sprite);
    }

    this.update = function() {
        var forward = null;

        if (KInput.keyStatus['w']) {
            forward = new THREE.Vector3(0, 0, -1);
        }
        if (KInput.keyStatus['s']) {
            forward = new THREE.Vector3(0, 0, 1);
        }
        if (KInput.keyStatus['a']) {
            forward = new THREE.Vector3(-1, 0, 0);
        }
        if (KInput.keyStatus['d']) {
            forward = new THREE.Vector3(1, 0, 0);
        }

        if (forward) {
            this.mapCollider.movePlayer(forward);
        }

        if (this.animatedMap) {
            this.animatedMap.update(KTime.getDeltaTime());
            if (KInput.keyStatus['z']) {
                this.animatedMap.playClip(1);
            }
        }
    }

    this.wait = function(time) {
        return new Promise(function (resolve, reject) {
            setTimeout(function() {
                resolve(0);
            }, time);
        });
    };
}