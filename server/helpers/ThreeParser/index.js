const THREE = require("three");

const THREE_Options = {
	meshMaterial: new THREE.MeshNormalMaterial({
		opacity: 0.6
	}),
	lineMaterial: new THREE.LineDashedMaterial({
		color: 0x99dddd,
		linewidth: 1,
		scale: 1,
		dashSize: 3,
		gapSize: 1,
	})
}

/**
 * Iterate through all the breps in the model, get the meshes in the brep,
 * and create a THREEjs mesh from the mesh and mesh material specified in the
 * options
 * @param  {[Object]} breps 	array of breps from the model
 */
function createThreeMeshes(breps) {
	for (brepindex = 0; brepindex < breps.length; brepindex++) {
		let brep = breps[brepindex];
		if (brep.meshes.length > 0 && brep.threeMeshes == null && brep.use !== "staging") {
			const meshes = brep.meshes;
			brep.threeMeshes = [];
			let mesh, meshindex;
			for (meshindex = 0; meshindex < meshes.length; meshindex++) {
				mesh = meshes[meshindex];
				const threemesh = meshToThreeJS(mesh, THREE_Options.meshMaterial);
				const material = new THREE.MeshNormalMaterial({
					opacity: 0.3,
					transparent: true
				});
				threemesh.material = material;
				brep.threeMeshes.push(threemesh);
				mesh = null;
			}
		}
	}
}

/**
 * With a mesh description and material, creates a THREEjs mesh
 * @param  {Object} mesh     mesh as taken from the geometry
 * @param  {Object} material material as described by the options
 * @return {Object}          THREE mesh
 */
function meshToThreeJS(mesh, material) {
	const geometry = new THREE.BufferGeometry();
	const vertices = mesh.vertices();
	const vertexbuffer = new Float32Array(3 * vertices.count);
	for (var i = 0; i < vertices.count; i++) {
		pt = vertices.get(i);
		vertexbuffer[i * 3] = pt[0];
		vertexbuffer[i * 3 + 1] = pt[1];
		vertexbuffer[i * 3 + 2] = pt[2];
	}
	// itemSize = 3 because there are 3 values (components) per vertex
	geometry.addAttribute('position', new THREE.BufferAttribute(vertexbuffer, 3));
	const indices = [];
	const faces = mesh.faces();
	for (var i = 0; i < faces.count; i++) {
		face = faces.get(i);
		indices.push(face[0], face[1], face[2]);
		if (face[2] != face[3]) {
			indices.push(face[2], face[3], face[0]);
		}
	}
	geometry.setIndex(indices);
	const normals = mesh.normals();
	const normalBuffer = new Float32Array(3 * normals.count);
	for (var i = 0; i < normals.count; i++) {
		pt = normals.get(i);
		normalBuffer[i * 3] = pt[0];
		normalBuffer[i * 3 + 1] = pt[1];
		normalBuffer[i * 3 + 2] = pt[1];
	}
	geometry.addAttribute('normal', new THREE.BufferAttribute(normalBuffer, 3));
	return new THREE.Mesh(geometry, material);
}

module.exports = {
	createThreeMeshes
};
