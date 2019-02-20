<template>
<div class="row">
  <div id="three-container"></div>
  <div class="col-md-4 offset-md-8 pt-2">
    <geometryUploader v-bind:model="model" v-on:parsedModel="addModelToScene"></geometryUploader>
    <floorEntry class="mt-2" v-bind:model="model" v-on:slicedAreas="addFloorAreas"></floorEntry>
    <areaData v-if="areas" class="mt-2" v-bind:areas="areas" v-on:slicedAreas="addFloorAreas"></areaData>

  </div>

</div>
</template>

<script>
import {
  initThree,
  THREE_Controller
} from "../libraries/three/create";
import geometryUploader from "../components/geometryUploader.vue";
import floorEntry from "../components/floorEntry.vue";
import areaData from "../components/areaData.vue";

export default {
  data() {
    return {
      model: null,
      areas: null
    }
  },
  components: {
    geometryUploader,
    floorEntry,
    areaData
  },
  methods: {
    addModelToScene(model) {
      const component = this;
      console.log('model is here: ', model);
      component.model = model;
      THREE_Controller.resetScene();
      if (model && model.breps) {
        model.breps.forEach((brep) => {
          brep.threeMeshes.forEach((threeMesh) => {
            THREE_Controller.addObjectToScene(threeMesh);
          });
        });
        THREE_Controller.zoomExtents();
      }
    },
    addFloorAreas(areas) {
      const component = this;
      console.log("areas are here: ", areas);
      component.areas = areas;
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
