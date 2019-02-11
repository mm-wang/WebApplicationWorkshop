<template>
<div class="row">
    <div class="col-md-4 order-md-12">
        <h3>Geometry Component</h3>
        <form id="geo-upload" ref="myGeoForm" enctype="multipart/form-data" novalidate>
            <div class="custom-file">
                <label for="geo-file" class="custom-file-label">Upload Geometry</label>
                <input type="file" id="geo-file" name="geo" class="custom-file-input" ref="myGeoFile" @change="fileUploaded($event.target.files)" />
            </div>
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
                }
            });
        },
        // parseFile(file) {
        //     const component = this;
        //     return new Promise(function(resolve, reject) {
        //         // Modified from https://stackoverflow.com/questions/32556664/getting-byte-array-through-input-type-file/32556944
        //         component.reader.onload = function() {
        //             let arrayBuffer = this.result;
        //             let array = new Uint8Array(arrayBuffer);
        //             resolve(array);
        //         }
        //         component.reader.readAsArrayBuffer(file);
        //     });
        // }
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
</script>
