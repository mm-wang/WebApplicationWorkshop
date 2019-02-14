<template>
<div class="row">
  <div id="three-container"></div>
  <div class="col-md-4 offset-md-8 pt-2">
    <geometryUploader v-bind:model="model" v-on:parsedModel="addModelToScene"></geometryUploader>
  </div>

</div>
</template>

<script>
import {
  initThree,
  THREE_Controller
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
    addModelToScene: (model) => {
      console.log('model is here: ', model);
      if (model && model.breps) {
        model.breps.forEach((brep) => {
          brep.threeMeshes.forEach((threeMesh) => {
            THREE_Controller.addObjectToScene(threeMesh);
          });
        });
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
