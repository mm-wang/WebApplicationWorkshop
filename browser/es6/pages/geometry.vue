<template>
<div class="row">
  <div id="three-container"></div>
  <div class="col-md-4 offset-md-8 pt-2">
    <geometryUploader v-bind:model="model" v-on:parsedModel="viewModel"></geometryUploader>
  </div>

</div>
</template>

<script>
import {
  initThree
} from "../libraries/three/create";
import geometryUploader from "../components/geometryUploader.vue";

export default {
  data() {
    return {
      model: null,
    }
  },
  components: {
    geometryUploader
  },
  methods: {
    viewModel: (model) => {
      console.log('model is here: ', model);
      if (model && model.breps) {

      }
    }
  },
  created() {
    const component = this;
    $.get("/api/retrieve-something").then((data) => {
      console.log(data);
    });

    // processRhino();
  },
  mounted() {
    initThree();
  }
}
</script>
