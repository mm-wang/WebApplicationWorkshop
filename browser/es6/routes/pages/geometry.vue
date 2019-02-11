<template>
<div class="row">
    <div class="col-md-4 order-md-12">
        <h3>Geometry Component</h3>
        <form id="geo-upload" ref="myGeoForm" enctype="multipart/form-data" novalidate @submit.prevent="clickTest">
            <div class="custom-file">
                <label for="geo-file" class="custom-file-label">Upload Geometry</label>
                <input type="file" id="geo-file" name="geo" class="custom-file-input" ref="myGeoFile" @change="fileUploaded($event.target.files)" />
            </div>
            <button class="btn btn-block">Submit</button>
        </form>
    </div>
    <div class="col-md-8 order-md-1">
        <div id="three-container">
            <span>THREE will go here</span>
        </div>
    </div>
</div>
</template>

<script>
import * as utilities from "../../utilities/utilities";

export default {
    data() {
        return {
            file: null,
            reader: null
        }
    },
    methods: {
        clickTest() {
            console.log($("form#geo-upload"));
        },
        fileUploaded(files) {
            const component = this;
            component.file = component.$refs.myGeoFile.files[0];
            // let form = component.$refs.myGeoForm;
            let formData = new FormData($("form#geo-upload")); //empty
            formData.append("geo", component.file);

            formData.forEach((value, key) => {
                console.log("key %s: value %s", key, value);
            });
            // See https://stackoverflow.com/questions/5392344/sending-multipart-formdata-with-jquery-ajax
            $.ajax({
                url: '/api/create-model',
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                method: 'POST',
                success: (response) => {
                    console.log("model? ", response);
                    console.log("file parsed? ", component.parseFile(response.model).then((array) => {
                        console.log("array? ", array);
                    }))
                }
            });
        },
        parseFile(file) {
            const component = this;
            return new Promise(function(resolve, reject) {
                // Modified from https://stackoverflow.com/questions/32556664/getting-byte-array-through-input-type-file/32556944
                component.reader.onload = function() {
                    let arrayBuffer = this.result;
                    let array = new Uint8Array(arrayBuffer);
                    resolve(array);
                }
                component.reader.readAsArrayBuffer(file);
            });
        }
    },
    created: function created() {
        const component = this;
        $.get("/api/retrieve-something").then((data) => {
            console.log(data);
        });
        //Initializing filereader for processing files sent here
        component.reader = new FileReader();
        // processRhino();
    }
}


// function processRhino() {
//     if (!rhino3dm) return setTimeout(processRhino, 500);
//     rhino3dm = rhino3dm("rhino3dm")();
//     console.log("rhino3dm? ", rhino3dm);
//     rhino3dm.then((module) => {
//         Module = module;
//         console.log("module exists now?", Module.File3dm);
//         loadModel("/3dm/massing_core_2.3dm").then((model) => {
//             setTimeout(function() {}, 500);
//             console.log("model here? ", model);
//         });
//     });
// }
//
// function loadModel(url) {
//     return new Promise(function(resolve, reject) {
//         fetch(url).then((data) => {
//             data.arrayBuffer().then(buffer => {
//                 const arr = new Uint8Array(buffer);
//                 const model = Module && Module.File3dm && Module.File3dm.fromByteArray(arr);
//                 resolve(model);
//             });
//         });
//     });
// }
</script>
