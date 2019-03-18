<template>
<div class="row">
  <div class="col">
    <h3>Geometry Component</h3>
    <div class="row">
      <div class="col-sm-4">
        <form>
          <h6>Sphere Origin</h6>
          <div class="input-group mb-1">
            <div class="input-group-prepend">
              <span class="input-group-text">X</span>
            </div>
            <input class="form-control" type="text" v-model="originX" />
          </div>
          <div class="input-group mb-1">
            <div class="input-group-prepend">
              <span class="input-group-text">Y</span>
            </div>
            <input class="form-control" type="text" v-model="originY" />
          </div>
          <div class="input-group mb-1">
            <div class="input-group-prepend">
              <span class="input-group-text">Z</span>
            </div>
            <input class="form-control" type="text" v-model="originZ" />
          </div>
          <h6 class="mt-2">Sphere Radius</h6>
          <div class="input-group mb-1">
            <div class="input-group-prepend">
              <span class="input-group-text">Radius</span>
            </div>
            <input class="form-control" type="text" v-model="radius" />
          </div>
        </form>

        <button class="btn btn-primary mt-2" v-on:click="saveSphere">Save Sphere Data</button>
        <p v-if="saved" class="text-success mt-2">Saved!</p>
      </div>
      <div class="col-sm-8">
        <p>We will create a sphere using the origin coordinates and a radius</p>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  data() {
    return {
      saved: false,
      originX: null,
      originY: null,
      originZ: null,
      radius: null
    }
  },
  methods: {
    saveSphere: function() {
      const component = this;
      const sphere = {
        origin: [+component.originX, +component.originY, +component.originZ],
        radius: +component.radius
      };
      $.ajax({
        url: '/api/save-sphere',
        data: JSON.stringify(sphere),
        cache: false,
        contentType: "application/json",
        processData: false,
        method: 'POST',
        success: (response) => {
          console.log(response);
          component.saved = true;
          setTimeout(function() {
            component.saved = false;
          }, 5000);
        }
      });
    }
  },
  created() {
    const component = this;
    $.get("/api/retrieve-something").then((data) => {
      console.log(data);
    });
  }
}
</script>
