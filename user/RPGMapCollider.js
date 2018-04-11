function RPGMapCollider() {

    this.COLLIDER_LAYER = 11;
    this.PLAYER_COLLIDER_LAYER = 12;
    
    this.collider = [];

    this.invisibleMaterial = new THREE.MeshPhongMaterial( {color: 0x00ff00} );

    this.addCube = function(p, size) {
        var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        var cube = new THREE.Mesh(geometry, this.invisibleMaterial);
        $scene.threeScene.add(cube);
        this.collider.push(cube);

        cube.position.set(p.x, p.y, p.z);
        cube.layers.set(this.COLLIDER_LAYER);
    };

    this.player = null;
    this.playerWidth = 0.5;
    this.playerSpeed = 5;

    this.addPlayer = function() {
        var playerMaterial = new THREE.MeshPhongMaterial( {color: 0x2222ff} );
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        this.player = new THREE.Mesh(geometry, playerMaterial);
        this.player.position.set(2,0,2);
        $scene.threeScene.add(this.player);
    }

    this.setCameraVisible  = function(flag) {
        if (flag) {
            $camera.layers.enable(this.COLLIDER_LAYER);
        }
        else {
            $camera.layers.disable(this.COLLIDER_LAYER);
        }
    };

    this.setPlayerColliderVisible  = function(flag) {
        if (flag) {
            this.player.layers.set(0);
        }
        else {
            this.player.layers.set(this.PLAYER_COLLIDER_LAYER);
        }
    };

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = this.playerWidth;
    this.raycaster.near = 0;

    this.movePlayer = function(forward) {
        var delta = KTime.getDeltaTime();
        forward = forward.normalize();

        var moveDistance = this.playerSpeed * delta;
        var width = this.playerWidth;

        this.player.translateOnAxis(forward, moveDistance);

        var p = [
            this.player.position.clone()
        ];

        p[0].y += 0.5;
        p[1] = new THREE.Vector3(p[0].x + forward.z * width, p[0].y, p[0].z  - forward.x * width);
        p[2] = new THREE.Vector3(p[0].x - forward.z * width, p[0].y, p[0].z  + forward.x * width);

        var hit = false;

        for (var i = 1; i < 3; ++i) {
            var position = p[i];
            this.raycaster.set(position, forward);
            var intersects = this.raycaster.intersectObjects(this.collider);
            if (intersects.length > 0) {
                hit = true;
                break;
            }
        }

        if (hit) {
            this.player.translateOnAxis(forward, -moveDistance);
        }
    };

}