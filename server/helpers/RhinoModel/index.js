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
				threemeshes: null
			});
		}
	}
	// This for reference: https://flaviocopes.com/javascript-async-await-array-map/
	async computeMeshes() {
		let rM = this;

		let fetchMeshes = (m, brep, i) => {
			//RhinoCompute calls return promises!
			return RhinoCompute.Mesh.createFromBrep(brep).then(result => {
				var meshes = result.map(r => rhino3dm.CommonObject.decode(r));
				m.breps[i].meshes = meshes;
				return result;
			});
		}

		let asyncFetchMeshes = async (brep, i) => {
			let brepGeo = rM.breps[i]["geometry"];
			return await fetchMeshes(rM, brepGeo, i);
		}

		let fetchArr = rM.breps.map((brep, i) => asyncFetchMeshes(brep, i));

		return await Promise.all(fetchArr).then((results) => {
			return rM;
		}).catch((err) => {
			console.log("error in promise.all", err);
		});

	}
}

module.exports = RhinoModel;
