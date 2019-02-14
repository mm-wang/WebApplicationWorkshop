let container, camera, scene, renderer, orbitControls, THREE_Controller;

// const BACKGROUND_COLOR = "#ffdd00";
const BACKGROUND_COLOR="#004466";

function initThree() {
	/*
	  Set up scene and camera
	 */
	THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
	container = document.getElementById('three-container');
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000);
	// camera.position.z = 50;
	camera.position.set(35, 70, 140);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);


	orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
	// orbitControls.update();

	scene = new THREE.Scene();
	scene.background = new THREE.Color(BACKGROUND_COLOR);

	var light = new THREE.AmbientLight(0xfff000); // soft white light
	scene.add(light);
	var sunLight = new THREE.DirectionalLight(0xffffff, 5);
	scene.add(sunLight);

	var geometry = new THREE.BoxGeometry(1, 1, 1);
	var material = new THREE.MeshNormalMaterial();

	// var cube = new THREE.Mesh(geometry, material);
	// cube.rotation.x += 0.5;
	// cube.rotation.y += 0.5;
	// scene.add(cube);

	renderer.render(scene, camera);
	animate();


	function animate() {
		requestAnimationFrame(animate);

		// cube.rotation.x += 0.01;
		// cube.rotation.y += 0.01;

		orbitControls.update();
		render();
	};

	function render() {
		renderer.render(scene, camera);
	}


	function onresize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	window.addEventListener('resize', onresize, false);
};

THREE_Controller = {
	loader: new THREE.ObjectLoader(),
  addObjectToScene: (obj) => {
		const curObj = THREE_Controller.loader.parse(obj);
		// console.log(curObj);
		scene.add(curObj);
  },
  zoomToObject: (obj) => {
    obj.geometry.computeBoundingSphere();
    obj.geometry.computeBoundingBox();

    const boundingSphere = obj.geometry.boundingSphere;

    const offset = 1.25;

    const boundingBox = obj.geometry.boundingBox.clone();
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    // get the max side of the bounding box (fits to width OR height as needed )
    const maxDim = Math.max(size.x, size.y, size.z);
    console.log("max dimension: ", maxDim);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));

    cameraZ *= offset; // zoom out a little so that objects don't fill the screen

    camera.position.z = cameraZ;

    const minZ = boundingBox.min.z;
    const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

    camera.far = cameraToFarEdge * 3;
    camera.updateProjectionMatrix();
  }
};

export {
	initThree, THREE_Controller
};
