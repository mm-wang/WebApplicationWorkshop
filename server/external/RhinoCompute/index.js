let RhinoCompute = require("compute-rhino3d");
RhinoCompute.authToken = "bearer " + process.env.RHINOCOMPUTE_TOKEN;
/**
 * Additional functions related to planes
 * @type {Object}
 */
RhinoCompute.Plane = {
	/**
	 * Generating a new plane using a point and a vector normal
	 * @param  {Point3d}  	pointO        A point, described using X, Y, and Z
	 * @param  {Vector3d}  	vectorN       Vector3d referencing the orientation of the plane
	 * @param  {Boolean} [multiple=false] Whether multiple are being added
	 */
	newPlane: function(pointO, vectorN, multiple = false) {
		let url = "rhino/geometry/plane/new";
		if (multiple) url = url + "?multiple=true"
		let args = RhinoCompute.zipArgs(multiple, pointO, vectorN);
		var promise = RhinoCompute.computeFetch(url, args);
		return promise;
	}
};

module.exports = RhinoCompute;