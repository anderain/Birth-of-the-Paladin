var $camera      = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
var $renderer    = new THREE.WebGLRenderer({ antialias: true });

var devicePixelRatio = window.devicePixelRatio;
//-------------- BROWSER CHECK --------------
if (browser.type != 'pc') {
    devicePixelRatio /= 1.5;
}
//--------------------------------------------
$renderer.setPixelRatio(devicePixelRatio);
setResolution();
$renderer.autoClear = false;

$renderer.shadowMap.enabled = true;
$renderer.shadowMap.type = THREE.PCFShadowMap;

window.addEventListener('resize', onWindowResize, false);

document.body.appendChild($renderer.domElement);

function onWindowResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    $camera.aspect = width / height;
    $camera.updateProjectionMatrix();

    setResolution();

    KUI.onWindowResize();
}

function setResolution() {
    var width, height;

    width = window.innerWidth;
    height = window.innerHeight;

    $renderer.setSize(width, height);
}

function dispose(obj, onlyRemoveChild) {
    for (var i = 0; i < obj.children.length; ++i) {
        var child = obj.children[i];
        dispose(child, false);
        obj.remove(child);
    }

    if (!onlyRemoveChild) {
        if (obj.geometry) {
            obj.geometry.dispose();
        }
        if (obj.material) {
            if (obj.material instanceof THREE.MeshFaceMaterial) {
                for (var i = 0; i < obj.material.materials.length; ++i) {
                    obj.material.materials[i].dispose(); 
                };
            } else {
                obj.material.dispose();
            }
        }
        if (obj.dispose) {
            obj.dispose();
        }
        return 0;
    }
    else {
        return obj.children.length;
    }
}

function renderGameLoop(time) {
    var requestId = requestAnimationFrame(renderGameLoop);

    // if ($scene == null) {
    //     cancelAnimationFrame(requestId);
    //     return;
    // }
    
    if ($scene && $scene.loadCompleted) {
        $renderer.clear();
        $renderer.render($scene.threeScene, $camera);
        $renderer.clearDepth();
        if ($director.started) {
            $director.update();
        } else {
            $director.started = true;
            $director.start();
        }
    }

    KUI.render();
    stats.update();
    TWEEN.update(time);
    KTime.nextFrame();
};

//-------------- BROWSER CHECK --------------
if (!browser.landspace) {
    KUI.ResponsiveSize = {
        minHeight: 960,
        maxHeight: 1280
    };
}
//--------------------------------------------

KUI.init();
KInput.init();

var stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

$scene      = null;
$director   = null;

renderGameLoop();

changeScene('./assets/scene_game.json', DirectorGame);
//changeScene('./assets/scene_title.json', DirectorTitle);

function changeScene(sceneFileName, Director) {
    if ($scene) {
        $scene.cleanUp();
        KUI.cleanUp();
    }
    else {
        $scene = new KScene();
    }
    //---------- CREATE A LOADING SCENE ----------
    var loading = KUI.makeTextSprite("LOADING...", {fontsize :30, bold: true, textColor: {r:255, g:255, b:255, a:1}});
    KUI.Anchor.center.add(loading);
    //--------------------------------------------

    $director = new Director();
    $director.beforeLoad();
    
    (async function() {
        await $scene.load(sceneFileName);
        //------------ HIDE LOADING SCENE ------------
        KUI.Anchor.center.remove(loading);
        //--------------------------------------------
    })();
}
