function DirectorGame() {
    this.started = false;
    this.mapCollider = null;

    this.beforeLoad = function() {}
    
    this.playerDir = 0;
    
    this.dropStart = {};

    this.start = async function() {
        $camera.position.set(4, 4, 4);
        $camera.lookAt(0, 1, 0);

        this.mapCollider = new RPGMapCollider();

        this.mapCollider.addPlayer();
        this.mapCollider.addCube(new THREE.Vector3(6, 0, -4), new THREE.Vector3(12.2, 2, 8.2));
        this.mapCollider.setCameraVisible(false);
        this.mapCollider.setPlayerColliderVisible(false);
        var spriteMap = await $scene.asyncLoad.TEXTURE('./assets/character_lxy.png');
        spriteMap.magFilter = THREE.NearestFilter;
        var clips = [
            // walk
            { start: 12, end: 15 },
            { start: 8, end: 11 },
            { start: 4, end: 7 },
            { start: 0, end: 3 },
            // idle
            { start: 12, end: 12 },
            { start: 8, end: 8 },
            { start: 4, end: 4 },
            { start: 0, end: 0 }
        ];
        this.animatedMap = new AnimatedTexture(spriteMap, 4, 4, clips, 0.1);
        var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
        this.spritePlayer = new THREE.Sprite(spriteMaterial);
        this.spritePlayer.scale.set(1.5, 3);
        this.spritePlayer.center.set(0.5, 0);
        $scene.threeScene.add(this.spritePlayer);

        var spriteControllerBack = $scene.uiSprites['controllerBackground'];
        spriteControllerBack.scale.set(256, 256, 1);
        spriteControllerBack.position.set(160, 160, 1);
        KUI.add('controllerback', spriteControllerBack, 'leftBottom');

        var spriteController = $scene.uiSprites['controllerSticker'];
        spriteController.scale.set(128, 128, 1);
        spriteController.position.set(160, 160, 1);
        KUI.add('controllersticker', spriteController, 'leftBottom', true);

        var self = this;

        spriteController.onMouseDown = function() {
            self.dropStart = {
                x: KInput.mousePosition.x * KUI.realSize.width,
                y: KInput.mousePosition.y * KUI.realSize.height
            }
        };

        this.spriteController = spriteController;
    }

    this.update = function() {
        var offset = {};

        if (this.spriteController) {
            if (this.spriteController.isMouseDown) {
                
                offset.x = (KInput.mousePosition.x * KUI.realSize.width - this.dropStart.x) / 2;
                offset.y = (KInput.mousePosition.y * KUI.realSize.height - this.dropStart.y) / 2;

                var distance = Math.sqrt(offset.x * offset.x + offset.y * offset.y);
                if (distance > 100) {
                    offset.x *= 100 / distance;
                    offset.y *= 100 / distance;
                }

                this.spriteController.position.set(160 + offset.x, 160 + offset.y, 1);
            }
            if (!KInput.mouseButtonStatus[0]) {
                this.spriteController.isMouseDown = false;
                this.spriteController.position.set(160, 160, 1);
            }
        } 

        if (this.spritePlayer){
            var p = this.mapCollider.player.position;
            this.spritePlayer.position.set(p.x + 0.7, p.y, p.z + 0.7);

            var np = p.clone().addScalar(6);
            np = $camera.position.lerp(np, 0.1);
        }
        var forward = null;

        if (KInput.keyStatus['w'] || (offset && offset.y > 70)) {
            forward = new THREE.Vector3(0, 0, -1);
            this.playerDir = 3;
        }
        if (KInput.keyStatus['s'] || (offset && offset.y < -70)) {
            forward = new THREE.Vector3(0, 0, 1);
            this.playerDir = 0;
        }
        if (KInput.keyStatus['a'] || (offset && offset.x < -70)) {
            forward = new THREE.Vector3(-1, 0, 0);
            this.playerDir = 1;
        }
        if (KInput.keyStatus['d'] || (offset && offset.x > 70)) {
            forward = new THREE.Vector3(1, 0, 0);
            this.playerDir = 2;
        }

        if (forward) {
            this.mapCollider.movePlayer(forward);
        }

        if (this.animatedMap) {
            this.animatedMap.update(KTime.getDeltaTime());
            if (forward) {
                this.animatedMap.playClip(this.playerDir);
            }
            else {
                this.animatedMap.playClip(this.playerDir + 4);
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