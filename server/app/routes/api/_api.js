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
router.get("/retrieve-something", (req, res) => {
	fs.readFile("3dm/massing_core_2.3dm", (err, data) => {
		let sphere = new rhino3dm.Sphere([1, 2, 3], 12);
		return res.json({
			buffer: data,
			sphere: sphere
		});
	});
});


router.post("/create-model", multerUpload.single("geo"), (req, res) => {
	fs.readFile("uploads/" + req.file.filename, (err, data) => {
		let array = new Uint8Array(data);
		let model = rhino3dm.File3dm.fromByteArray(array);
		let rhinoModel = new RhinoModel(model);
		// return res.json(rhinoModel);
		rhinoModel.computeMeshes().then((model) => {
			try {
				THREE_Parser.createThreeMeshes(rhinoModel.breps);
			} catch (err) {
				return res.status(500).send(err);
			}
			return res.json(rhinoModel);
		});
	});
});
