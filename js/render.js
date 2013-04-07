// set the scene size
var WIDTH = 1200,
    HEIGHT = 800;

// set some camera attributes
var VIEW_ANGLE = 45,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

// get the DOM element to attach to
// - assume we've got jQuery to hand
var $container = $('#container');

// create a WebGL renderer, camera
// and a scene
var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera(  VIEW_ANGLE,
                                ASPECT,
                                NEAR,
                                FAR  );
var scene = new THREE.Scene();

// the camera starts at 0,0,0 so pull it back
camera.position.y = -450;
camera.position.z = 400;
camera.rotation.x = 45 * (Math.PI / 180);

// start the renderer
renderer.setSize(WIDTH, HEIGHT);

var angle_x = 0;
var angle_y = Math.PI/10;


// attach the render-supplied DOM element
$container.append(renderer.domElement);

var group = new THREE.Object3D();
scene.add(group);

// plane
var plane = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({
    color: 0xcccccc
}));
plane.overdraw = true;

group.add(plane);

// create the sphere's material
var sphereMaterial = new THREE.MeshLambertMaterial(
{
    color: 0xFF0000
});

// set up the sphere vars
var radius = 20, segments = 16, rings = 16;

// create a new mesh with sphere geometry -
// we will cover the sphereMaterial next!
var sphere = new THREE.Mesh(
   new THREE.SphereGeometry(radius, segments, rings),
   sphereMaterial);

//sphere.position.x = -100;
//sphere.position.y = 0;
sphere.position.z = 10;

// add the sphere to the scene
group.add(sphere);

group.rotation.x += angle_x;
group.rotation.y += angle_y;

// and the camera
scene.add(camera);

// create a point light
var pointLight = new THREE.PointLight( 0xFFFFFF );

// set its position
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

// add to the scene
scene.add(pointLight);

// draw!
renderer.render(scene, camera);