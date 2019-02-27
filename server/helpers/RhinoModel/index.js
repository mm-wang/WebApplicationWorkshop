// const Promise = require('bluebird');
const rhino3dm = require("rhino3dm")();
let RhinoCompute = require("server/external/RhinoCompute");
// let RhinoCompute = require("compute-rhino3d");
// RhinoCompute.authToken = "bearer <token>" ;

class RhinoModel {
	constructor(model) {
		this.model = model;
		this.unit = null;
		this.breps = model.breps || [];
		this.curves = model.curves || [];
		RhinoCompute.authToken = RhinoCompute.getAuthToken(true);
		if (model && this.breps.length === 0) {
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
					this.pushBrep(modelObj);
					break;
				default:
					break;
			}
		}
	}

	pushBrep(obj) {
		let instance = this;
		instance.breps.push({
			geometry: obj.geometry(),
			use: "",
			meshes: [],
			threeMeshes: null
		});
	}

	pushCurve(obj) {
		let instance = this;
		instance.curves.push({
			geometry: obj,
			threeLine: null
		});
	}

	computeIntersection(plane) {
		const rM = this;
		const breps = rM.breps.map((each) => {
			return rhino3dm.CommonObject.decode(each.geometry);
		});
		return RhinoCompute.Intersection.brepPlane(breps[0], plane, 0.01)
			.then((result) => {
				const intersection = result.reduce((intersect, r) => {
					if (r && r.length && r.length > 0) intersect = rhino3dm.CommonObject.decode(r[0]);
					return intersect;
				}, null);
				if (intersection) {
					rM.pushCurve(intersection);
					return RhinoCompute.AreaMassProperties.compute(intersection);
				}
				return Promise.resolve(1);
			}).then((result) => {
				return result;
			}).catch((err) => {
				console.log("error: ", err);
				return 0;
			});
	}

	/**
	 * Compute the meshes by querying RhinoCompute for the mesh representing the
	 * geometry, then using rhino3dm to decode the meshes, then sending all back
	 * asyncronously
	 * @return {Promise} Array of fetched meshes
	 */
	// This for reference: https://flaviocopes.com/javascript-async-await-array-map/
	async computeMeshes() {
		const rM = this;

		/**
		 * Fetch meshes from rhinoCompute
		 * @param  {RhinoModel} m    an instance of RhinoModel class
		 * @param  {Object} brep current brep
		 * @param  {Number} i    index of the brep
		 * @return {Object}      brep geometry
		 */
		const fetchMeshes = (m, brep, i) => {
			//RhinoCompute calls return promises!
			return RhinoCompute.Mesh.createFromBrep(brep).then(result => {
				const meshes = result.map(r => rhino3dm.CommonObject.decode(r));
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
		const asyncFetchMeshes = async (brep, i) => {
			const brepGeo = rM.breps[i]["geometry"];
			return await fetchMeshes(rM, brepGeo, i);
		};

		/**
		 * Iterate through all breps in the model and fetch the meshes
		 * asyncronously
		 */
		const fetchArr = rM.breps.map((brep, i) => asyncFetchMeshes(brep, i));

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
