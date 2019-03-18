const router = require("express").Router();
const rhino3dm = require("rhino3dm")();
module.exports = router;

/*
Routes
 */
// Example route returning what you see using rhino3dm
router.get("/retrieve-something", (req, res) => {
	let sphere = new rhino3dm.Sphere([1, 2, 3], 12);
	return res.json({
		sphere: sphere
	});
});
