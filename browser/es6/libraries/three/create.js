let container, camera, scene, renderer, orbitControls;
const BACKGROUND_COLOR = "#004466";

const initThree = () => {
	/*
	  Set up scene and camera
	 */
	THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
	container = document.getElementById('three-container');
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000);
	camera.position.set(80, 120, 160);

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

	renderer.render(scene, camera);
	animate();

	function animate() {
		requestAnimationFrame(animate);
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

const THREE_Controller = {
	loader: new THREE.ObjectLoader(),
	sceneObjs: [],
	sceneExtents: {
		max: {
			x: Number.MIN_VALUE,
			y: Number.MIN_VALUE,
			z: Number.MIN_VALUE
		},
		min: {
			x: Number.MAX_VALUE,
			y: Number.MAX_VALUE,
			z: Number.MAX_VALUE
		}
	},
	resetScene: () => {
		const extents = {
			min: {},
			max: {}
		};
		["x", "y", "z"].forEach((dir) => {
			extents.min[dir] = Number.MAX_VALUE;
			extents.max[dir] = Number.MIN_VALUE;
		});
		THREE_Controller.sceneObjs.forEach(THREE_Controller.removeObjectFromScene);
		THREE_Controller.sceneObjs = [];
		THREE_Controller.sceneExtents = extents;
	},
	addObjectToScene: (obj) => {
		const curObj = THREE_Controller.loader.parse(obj);
		scene.add(curObj);
		THREE_Controller.computeBoundingBox(curObj);
	},
	removeObjectFromScene: (obj) => {
		scene.remove(obj);
	},
	computeBoundingBox: (obj) => {
		obj.geometry.computeBoundingBox();
		const boundingBox = obj.geometry.boundingBox.clone();
		const directions = ["x", "y", "z"];
		directions.forEach((direction) => {
			if (boundingBox.min[direction] < THREE_Controller.sceneExtents.min[direction]) {
				THREE_Controller.sceneExtents.min[direction] = boundingBox.min[direction];
			}
			if (boundingBox.max[direction] > THREE_Controller.sceneExtents.max[direction]) {
				THREE_Controller.sceneExtents.max[direction] = boundingBox.max[direction];
			}
		});
		THREE_Controller.sceneObjs.push(obj);
	},
	setCameraPosition: (boundingBox) => {
		const center = boundingBox.getCenter(new THREE.Vector3());
		const size = boundingBox.getSize(new THREE.Vector3());
		const offset = 1.25;

		// get the max side of the bounding box (fits to width OR height as needed )
		const maxDim = Math.max(size.x, size.y, size.z);
		console.log("max dimension: ", maxDim);
		const fov = camera.fov;
		let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
		cameraZ *= offset; // zoom out a little so that objects don't fill the screen

		camera.position.z = center.z + cameraZ;
		const minZ = boundingBox.min.z;
		const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

		camera.far = cameraToFarEdge * 3;
		camera.updateProjectionMatrix();

		if (orbitControls) {
			// set camera to rotate around center of loaded object
			orbitControls.target = center;
			// prevent camera from zooming out far enough to create far plane cutoff
			orbitControls.maxDistance = cameraToFarEdge * 2;
			orbitControls.saveState();
		} else {
			camera.lookAt(center);
		}
	},
	zoomExtents: () => {
		if (THREE_Controller.sceneObjs.length === 0) return;
		const minVector = new THREE.Vector3(THREE_Controller.sceneExtents.min.x,
			THREE_Controller.sceneExtents.min.y,
			THREE_Controller.sceneExtents.min.z);
		const maxVector = new THREE.Vector3(THREE_Controller.sceneExtents.max.x,
			THREE_Controller.sceneExtents.max.y,
			THREE_Controller.sceneExtents.max.z);
		const boxExtents = new THREE.Box3(minVector, maxVector);
		THREE_Controller.setCameraPosition(boxExtents);
	},
	zoomToObject: (obj) => {
		// obj.geometry.computeBoundingSphere();
		obj.geometry.computeBoundingBox();
		// const boundingSphere = obj.geometry.boundingSphere;

		const boundingBox = obj.geometry.boundingBox.clone();
		THREE_Controller.setCameraPosition(boundingBox);
	}
};

export {
	initThree,
	THREE_Controller
};
