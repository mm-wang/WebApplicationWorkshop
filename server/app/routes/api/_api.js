const router = require("express").Router();
const fs = require("fs");
const rhino3dm = require("rhino3dm")();
const RhinoModel = require("server/helpers/RhinoModel");
const THREE_Parser = require("server/helpers/ThreeParser");
const Slice = require("server/db/Slice");
module.exports = router;

/*
Multer Configuration
 */
const multer = require("multer");
let multerStorage = multer.diskStorage({
	destination: function(req, file, cb) {
		// This will send the files to the uploads folder at the root of the directory
		cb(null, process.cwd() + '/uploads')
	},
	filename: function(req, file, cb) {
		// This will replace the original file each time
		cb(null, file.originalname);
	}
});
let multerUpload = multer({
	storage: multerStorage
});

/*
Routes
 */
// Example route returning what you see using rhino3dm
router.get("/retrieve-something", (req, res) => {
	// fs.readFile("3dm/box.3dm", (err, data) => {
	let sphere = new rhino3dm.Sphere([1, 2, 3], 12);
	return res.json({
		buffer: data,
		sphere: sphere
	});
	// });
});

router.get("/retrieve-slices", (req, res) => {
	Slice.find({}).then((results) => {
		console.log("found slices: ", results);
		return res.json(results);
	});
});

// Create THREEjs meshes from a Rhino model
router.post("/create-model", multerUpload.single("geo"), (req, res) => {
	fs.readFile("uploads/" + req.file.filename, (err, data) => {
		const array = new Uint8Array(data);
		const initModel = rhino3dm.File3dm.fromByteArray(array);
		const model = new RhinoModel(initModel);
		// console.log(model instanceof RhinoModel, unit);
		model.name = req.file.filename;
		model.computeMeshes().then((computed) => {
			try {
				THREE_Parser.createThreeMeshes(model.breps);
			} catch (err) {
				return res.status(500).send(err);
			}
			return res.json(model);
		});
	});
});

// Slice a Rhino model using the floors
router.post("/slice-model", (req, res) => {
	// console.log("in slice model", req.body);
	if (!req.body.model) return res.status(406).send("No model provided");
	const model = new RhinoModel(req.body.model);
	const plane = {
		XAxis: {
			X: 1.0,
			Y: 0.0,
			Z: 0.0
		},
		YAxis: {
			X: 0.0,
			Y: 1.0,
			Z: 0.0
		},
		ZAxis: {
			X: 0.0,
			Y: 0.0,
			Z: 1.0
		},
		Normal: {
			X: 0.0,
			Y: 0.0,
			Z: 1.0
		}
	};

	const planes = req.body.floors.map((floor) => {
		let cur = {
			Origin: {
				X: 0,
				Y: 0,
				Z: +floor
			},
			XAxis: Object.assign({}, plane.XAxis),
			YAxis: Object.assign({}, plane.YAxis),
			ZAxis: Object.assign({}, plane.ZAxis),
			Normal: Object.assign({}, plane.Normal)
		};
		return model.computeIntersection(cur);
	});

	Promise.all(planes).then((result) => {
		const areas = result.map((each) => {
			return each.Area;
		});
		let curves = model.curves.map((each) => {
			if (each && each.geometry && each.geometry.data) return rhino3dm.CommonObject.decode(each.geometry);
			else return each;
		});

		try {
			THREE_Parser.createThreeCurves(curves);
		} catch (err) {
			console.log("error in curves: ", err);
			return res.status(500).send(err);
		}

		return res.json({
			areas: areas,
			curves: curves
		});
	});
});

// Save your slices to the database;
router.post("/save-slices", (req, res) => {
	let slice = new Slice(req.body);
	slice.save((err, saved) => {
		if (!err) return res.status(200).send(true);
		else return res.status(500).send(err);
	});
});

// Delete slices in the database;
router.delete("/delete-slice", (req, res) => {
	Slice.deleteOne({
		_id: req.body._id
	}, (err, results) => {
		if (!err) return res.status(200).send(true);
		else return res.status(500).send(err);
	});
});
