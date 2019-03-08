let RhinoCompute = require("compute-rhino3d");
RhinoCompute.authToken = "bearer " + process.env.RHINOCOMPUTE_TOKEN;
RhinoCompute.Plane = {
		newPlane: function(pointO, vectorN, multiple = false) {
			let url = "rhino/geometry/plane/new";
			if (multiple) url = url + "?multiple=true"
			let args = RhinoCompute.zipArgs(multiple, pointO, vectorN);
			var promise = RhinoCompute.computeFetch(url, args);
			return promise;
		}
};

module.exports = RhinoCompute;
