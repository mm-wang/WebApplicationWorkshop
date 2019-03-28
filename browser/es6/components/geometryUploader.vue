<template>
<div class="card">
  <div class="card-body">
    <h4 class="card-title">Upload Geometry</h4>
    <form id="geo-upload" ref="myGeoForm" enctype="multipart/form-data" novalidate>
      <div class="custom-file">
        <label for="geo-file" class="custom-file-label">Select .3dm file</label>
        <input type="file" name="geo" ref="myGeoFile" class="custom-file-input" @change="fileUploaded($event.target.files)" />
      </div>
    </form>
  </div>
</div>
</template>
<script>
export default {
  props: ["model"],
  data() {
    return {
      file: null
    }
  },
  methods: {
    fileUploaded(files) {
      const component = this;
      component.file = component.$refs.myGeoFile.files[0];
      if (!component.file) return;
      let formData = new FormData($("form#geo-upload")); //empty
      formData.append("geo", component.file);

      // See https://stackoverflow.com/questions/5392344/sending-multipart-formdata-with-jquery-ajax
      $.ajax({
        url: '/api/create-model',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        method: 'POST',
        success: (response) => {
          component.$emit("parsedModel", response);
          component.$refs.myGeoFile.files = null;
          component.file = null;
        }
      });
    }
  },
  created() {
    const component = this;

  }
}
</script>
