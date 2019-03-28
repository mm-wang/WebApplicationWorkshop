const rhino3dm = require("rhino3dm")();
let RhinoCompute = require("server/external/RhinoCompute");

/**
 * A data structure for the contents of a file to create a 3d visualization
 * using Rhino geometry
 */
class RhinoModel {
	/**
	 * Constructing this model
	 * @param {File3dm} model Rhino file containing massing representation
	 */
	constructor(model) {
		this.model = model;
		this.breps = model.breps || [];
		this.curves = model.curves || [];
		if (model && this.breps.length === 0) {
			this.populate(model);
		}
	}
	/**
	 * Populates the model based on the geometry coming in
	 * @param  {File3dm} model Rhino file containing massing representation
	 */
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
	/**
	 * Push a brep to the instance breps
	 * @param  {File3dmObject} obj Model object from File3dm
	 */
	pushBrep(obj) {
		let instance = this;
		instance.breps.push({
			geometry: obj.geometry(),
			use: "",
			meshes: [],
			threeMeshes: null
		});
	}

	/**
	 * Push a curve to the instance curves
	 * @param  {Polycurve} obj Curve object
	 */
	pushCurve(obj) {
		let instance = this;
		instance.curves.push({
			geometry: obj,
			threeLine: null
		});
	}

	/**
	 * Compute the intersections between a plane and the breps,
	 * returning the resultant areas and curves
	 * @param  {Plane} plane 				Horizontal plane at an elevation, has origin and X, Y, Z axes
	 * @return {AreaMassProperties}	Areas, centroid, moments, etc. of the intersected curves
	 */
	computeIntersection(plane) {
		const rM = this;
		/**
		 * Translate the breps
		 */
		const breps = rM.breps.map((each) => {
			return rhino3dm.CommonObject.decode(each.geometry);
		});

		/**
		 * Intersects the first brep with the horizontal planes at the elevations,
		 * then computes the intersecting curve area
		 */
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