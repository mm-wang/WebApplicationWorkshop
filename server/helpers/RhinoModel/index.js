// const Promise = require('bluebird');
const rhino3dm = require("rhino3dm")();
let RhinoCompute = require("server/external/RhinoCompute");

class RhinoModel {
	constructor(model) {
		this.model = model;
		this.breps = [];
		RhinoCompute.authToken = RhinoCompute.getAuthToken(true);
		if (model) {
			this.populate(model);
		}
	}
	populate(model) {
		var objectTable = model.objects();
		for (var i = 0; i < objectTable.count; i++) {
			var modelObj = objectTable.get(i);
			let geo = modelObj.geometry();
			let geoType = geo.constructor.name;
			switch (geoType) {
				case "Brep":
					pushBrep(this, modelObj);
					break;
				default:
					break;
			}
		}

		function pushBrep(instance, obj) {
			instance.breps.push({
				geometry: obj.geometry(),
				use: "",
				meshes: [],
				threeMeshes: null
			});
		}
	}
	/**
	 * Compute the meshes by querying RhinoCompute for the mesh representing the
	 * geometry, then using rhino3dm to decode the meshes, then sending all back
	 * asyncronously
	 * @return {Promise} Array of fetched meshes
	 */
	// This for reference: https://flaviocopes.com/javascript-async-await-array-map/
	async computeMeshes() {
		let rM = this;

		/**
		 * Fetch meshes from rhinoCompute
		 * @param  {RhinoModel} m    an instance of RhinoModel class
		 * @param  {Object} brep current brep
		 * @param  {Number} i    index of the brep
		 * @return {Object}      brep geometry
		 */
		let fetchMeshes = (m, brep, i) => {
			//RhinoCompute calls return promises!
			return RhinoCompute.Mesh.createFromBrep(brep).then(result => {
				var meshes = result.map(r => rhino3dm.CommonObject.decode(r));
				m.breps[i].meshes = meshes;
				return;
			});
		};

		/**
		 * Wait for each brep to fetch its meshes using RhinoCompute
		 * @param  {Object}  brep one brep at an index
		 * @param  {Number}  i    index of the brep
		 * @return {Promise}      the RhinoCompute meshes
		 */
		let asyncFetchMeshes = async (brep, i) => {
			let brepGeo = rM.breps[i]["geometry"];
			return await fetchMeshes(rM, brepGeo, i);
		};

		/**
		 * Iterate through all breps in the model and fetch the meshes
		 * asyncronously
		 */
		let fetchArr = rM.breps.map((brep, i) => asyncFetchMeshes(brep, i));

		/**
		 * Wait for the iteration and creating of those meshes, and
		 * then return the model
		 */
		return await Promise.all(fetchArr).then((results) => {
			return rM;
		}).catch((err) => {
			console.log("error in promise.all", err);
		});

	}
}

module.exports = RhinoModel;
