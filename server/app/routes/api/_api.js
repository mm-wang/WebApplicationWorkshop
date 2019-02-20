const router = require("express").Router();
const fs = require("fs");
const rhino3dm = require("rhino3dm")();
const RhinoModel = require("server/helpers/RhinoModel");
const THREE_Parser = require("server/helpers/ThreeParser");
module.exports = router;

router.needleOpts = {
	username: process.env.EMBER_USER,
	password: process.env.EMBER_PASSWORD,
	headers: {
		connection: 'keep-alive'
	}
};

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
	fs.readFile("3dm/massing_core_2.3dm", (err, data) => {
		let sphere = new rhino3dm.Sphere([1, 2, 3], 12);
		return res.json({
			buffer: data,
			sphere: sphere
		});
	});
});

// Create THREEjs meshes from a Rhino model
router.post("/create-model", multerUpload.single("geo"), (req, res) => {
	fs.readFile("uploads/" + req.file.filename, (err, data) => {
		const array = new Uint8Array(data);
		const initModel = rhino3dm.File3dm.fromByteArray(array);
		const model = new RhinoModel(initModel);
		console.log(model instanceof RhinoModel);
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
	console.log("in slice model", req.body);
	if (!req.body.model) return res.status(406).send("No model provided");
	const model = new RhinoModel(req.body.model);
	const plane = {
		Origin: {
			X: 0.0,
			Y: 0.0,
			Z: 1.5
		},
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

	console.log(typeof model, model instanceof RhinoModel);
	console.log("the model is now a rhinomodel", model);
	model.computeIntersection(plane).then((computed) => {
		return res.json(computed);
	});


})
