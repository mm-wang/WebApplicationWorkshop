const router = require("express").Router();
const fs = require("fs");
const rhino3dm = require("rhino3dm")();
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
 // let upload = multer({dest: "uploads/"});
 let multerStorage = multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, process.cwd() + '/uploads')
   },
   filename: function (req, file, cb) {
     cb(null, file.originalname)
   }
 });
 let multerUpload = multer({storage: multerStorage});

router.get("/retrieve-something", (req, res) => {
	fs.readFile("3dm/massing_core_2.3dm", (err, data) => {
		let sphere = new rhino3dm.Sphere([1, 2, 3], 12);
		// console.log("data? ", data, "sphere", sphere);
		return res.json({
			buffer: data,
			sphere: sphere
		});
	});
});


router.post("/create-model", multerUpload.single("geo"), (req, res) => {
	fs.readFile("uploads/"+req.file.filename, (err, data) => {
		console.log("data: ", data);
		let array = new Uint8Array(data);
		let model = rhino3dm.File3dm.fromByteArray(array);
		console.log("model?", model);
		return res.json({model: model});
	});

	// console.log('did the buffer come through? ', req.body);
	// let array = new Uint8Array(req.body.buffer);
	// console.log("arraay?", array);
	// let model = rhino3dm.File3dm.fromByteArray(array);
	// return res.json({model: model});
});
