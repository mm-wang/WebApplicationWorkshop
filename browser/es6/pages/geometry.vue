<template>
<div class="row">
  <div id="three-container"></div>
  <div class="col-md-4 offset-md-8 pt-2">
    <button class="btn btn-outline-secondary btn-block" v-if="uploadNew" v-on:click="reset(false)">Select Saved</button>
    <button class="btn btn-outline-primary btn-block" v-else v-on:click="reset(true)">Upload New</button>

    <geometryUploader v-if="uploadNew" class="mt-2" v-bind:model="model" v-on:parsedModel="addModelToScene"></geometryUploader>
    <savedSlices v-else class="mt-2" v-on:selectedSlice="addSelectedSaved"></savedSlices>
    <floorEntry v-if="model" class="mt-2" v-bind:model="model" v-bind:bounds="bounds" v-on:enteredFloors="setFloors" v-on:slicedCurves="addFloorsAndCurves" v-on:clearCurves="removeCurvesFromScene"></floorEntry>
    <areaData v-if="areas" class="mt-2" v-bind:model="model" v-bind:areas="areas" v-bind:floors="floors" v-bind:saved="saved"></areaData>
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
import savedSlices from "../components/savedSlices.vue";

export default {
  data() {
    return {
      uploadNew: true,
      model: null,
      areas: null,
      floors: null,
      bounds: null,
      slices: null,
      saved: false,
    }
  },
  components: {
    geometryUploader,
    floorEntry,
    areaData,
    savedSlices
  },
  methods: {
    reset(newUpload) {
      const component = this;
      component.uploadNew = newUpload;
      component.saved = !newUpload;
      component.areas = null;
      component.model = null;
      component.floors = null;
      THREE_Controller.resetScene();
    },
    addModelToScene(model) {
      const component = this;
      // console.log('model is here: ', model);
      component.model = model;
      THREE_Controller.resetScene();
      if (model) {
        if (model.breps) {
          model.breps.forEach((brep) => {
            brep.threeMeshes.forEach((threeMesh) => {
              THREE_Controller.addObjectToScene(threeMesh);
            });
          });
        }
        if (model.curves) {
          model.curves.forEach((curve) => {
            THREE_Controller.addObjectToScene(curve.threeLine);
          });
        }
        component.bounds = THREE_Controller.zoomExtents();
      }

    },
    setFloors(floors) {
      const component = this;
      component.saved = false;
      component.floors = floors;
    },
    addFloorsAndCurves(result) {
      const component = this;
      const curves = result.curves;
      const areas = result.areas;
      component.areas = areas;

      if (component.model) component.model.curves = curves;
      // console.log('curves are here: ', curves);
      if (curves) {
        curves.forEach((curve) => {
          THREE_Controller.addObjectToScene(curve.threeLine);
        });
        component.bounds = THREE_Controller.zoomExtents();
      }
    },
    removeCurvesFromScene() {
      const component = this;
      let curves = THREE_Controller.sceneObjs.filter((each) => {
        return each.type === "Line";
      });
      curves.forEach((curve) => {
        THREE_Controller.removeObjectFromScene(curve);
      });
      component.model.curves = [];
    },
    addSelectedSaved(slice) {
      const component = this;
      component.saved = true; // already a saved model that we're adding;
      component.model = slice.model;
      component.areas = slice.slices.areas;
      component.floors = slice.slices.floors;

      component.addModelToScene(component.model);
    }
  },
  created() {
    const component = this;
    $.get("/api/retrieve-something").then((data) => {
      console.log(data);
    });

  },
  mounted() {
    initThree();
  }
}
</script>
