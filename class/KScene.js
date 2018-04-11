//----------------------------------------------------
// * Scene
//----------------------------------------------------
//
//----------------------------------------------------
function KScene() {
    this.gameObjects = {};
    this.threeScene = new THREE.Scene();
    this.loadCompleted = false;
    this.uiSprites = {};

    this.load = async function(fileName) {
        var jsonData = await KRequest.load(fileName);
        var sceneData = JSON.parse(jsonData);
        await this.buildScene(sceneData, this.threeScene);
        // load ui sprites
        if (sceneData.ui) {
            for (var key in sceneData.ui) {
                this.uiSprites[key] = await KUI.makeSprite(sceneData.ui[key]);
            }
        }
        this.loadCompleted = true;
    };

    this.buildScene = async function(sceneJson, root) {
        for (var i = 0; i < sceneJson.gameObjects.length; ++i) {
            var data = sceneJson.gameObjects[i];
            
            var go = {
                name : data.name,
                type : data.type
            };

            if (go.type == 'Mesh') {
                var mesh, material;


                var castShadow = typeof(data.castShadow) != "undefined" ? data.castShadow : false;
                var receiveShadow = typeof(data.receiveShadow) != "undefined" ? data.receiveShadow : false;

                switch (data.fileType) {
                    case 'obj':
                        mesh = await this.asyncLoad.OBJ(data.path);
                        go.entity = mesh;

                        mesh.traverse(function(child) {
                            if (child instanceof THREE.Mesh) {
                                child.castShadow = castShadow;
                                child.receiveShadow = receiveShadow;
                            }
                        });

                        if (typeof(data.oldschool) != "undefined") {
                            mesh.traverse(function(child) {
                                if (child instanceof THREE.Mesh) {
                                    child.material.map.magFilter = THREE.NearestFilter;
                                }
                            });
                        }

                        root.add(mesh);
                        break;
                    default:
                }
            }
            else if (go.type == "AmbientLight") {
                var config = this.convertHexInConfig(data.config);
                var light = new THREE.AmbientLight(config.color, config.intensity);
                //console.log(config, light.color, light.intensity);
                
                go.entity = light;
                
                root.add(light);
            }
            else if (go.type == "DirectionalLight") {
                var config = this.convertHexInConfig(data.config);
                var light = new THREE.DirectionalLight(config.color, config.intensity);
                light.position.set(data.forward.x, data.forward.y, data.forward.z);
                //console.log(config, light.color, light.intensity);
                light.castShadow = true; 

                go.entity = light;

                var shadowRange = 10;
                light.shadow.camera.left    = -shadowRange;
                light.shadow.camera.right   = shadowRange;
                light.shadow.camera.top     = shadowRange;
                light.shadow.camera.bottom  = -shadowRange;

                light.shadow.camera.near = -1; 
                light.shadow.camera.far = 10;

                light.shadow.mapSize.width = 1024;
                light.shadow.mapSize.height = 1024;

                root.add(light);
            }
            else if (go.type == "SpotLight") {

            }
            else if (go.type == "GameObject") {
                var o = new THREE.Object3D();
                go.entity = o;
                root.add(o);
            }
            else if (go.type == "Group") {
                var o = new THREE.Group();
                go.entity = o;
                root.add(o);
            }

            if (typeof(data.position) != "undefined") {
                go.entity.position.set(data.position.x, data.position.y, data.position.z);
            }

            if (typeof(data.scale) != "undefined") {
                go.entity.scale.set(data.scale.x, data.scale.y, data.scale.z);
            }

            if (typeof(data.rotation) != "undefined") {
                go.entity.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
            }

            if (typeof(data.gameObjects) != "undefined") {
                await this.buildScene(data, go.entity);
            }

            this.gameObjects[go.name] = go;
　　　　 };

        //Create a plane that receives shadows (but does not cast them)
        // var planeGeometry = new THREE.PlaneBufferGeometry( 100, 100, 32, 32 );
        // var planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } )
        // var plane = new THREE.Mesh( planeGeometry, planeMaterial );
        // plane.receiveShadow = true;
        // plane.rotation.set(-3.14159/2,0,0);
        // plane.position.set(0,0, 0);
        // this.threeScene.add( plane );
    };

    this.asyncLoad = {
        OBJ: function(filePath) {
            var self = this;
            return new Promise(async function (resolve, reject) {
                // 加载同名的纹理
                var materials = await self.MTL(filePath);
                materials.preload();
                // 加载模型
                var objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.load(filePath, function (object) { resolve(object); }, null, function (code) { reject(code); });
            });
        },
        MTL: function(filePath) {
             return new Promise(function (resolve, reject) {
                // MTL文件名
                var mtlPath = filePath.replace(/\.obj$/, '.mtl');
                // 获取贴图的路径
                var texturePath = filePath.substring(0, filePath.lastIndexOf('/') + 1);

                var mtlLoader = new THREE.MTLLoader();

                mtlLoader.setTexturePath(texturePath);
                mtlLoader.load(mtlPath, function (object) { resolve(object); }, null, function (code) { reject(code); });
            });
        },
        TEXTURE: function(filePath) {
            return new Promise(function (resolve, reject) {
                var textureLoader = new THREE.TextureLoader();
                textureLoader.load(filePath, function (object) { resolve(object); }, null, function (code) { reject(code); });
            });
        },
    };

    // loadMaterial: function(material) {

    //     var config = this.convertHexInConfig(material.config);

    //     switch (material.name) {
    //         case 'MeshPhongMaterial':
    //             return new THREE.MeshPhongMaterial(config);
    //         default:
    //             return null;
    //     }
    // },

    this.convertHexInConfig = function(config) {
        // 将0x开头的字符串（十六进制整数）转为整数
        for (var key in config) {
            var value = config[key];
            if (typeof(value) == 'string' && value.substring(0, 2) == '0x') {
                config[key] = parseInt(value.substring(2), 16);
            }
        };
        return config;
    };

    this.cleanUp = function() {
        this.gameObjects = {};
        this.uiSprites = {};
        this.loadCompleted = false;
        while(dispose(this.threeScene, true) > 0);
    };

    // this.update = function() {
    //     // var delta = KTime.getDeltaTime();
    //     // t.rotation.y += delta * 1;
    // };
}

