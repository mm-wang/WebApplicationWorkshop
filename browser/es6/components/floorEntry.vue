<template>
<div class="card">
  <div class="card-body">
    <h4 class="card-title">Enter Floor Elevations</h4>
    <h6 class="card-subtitle text-muted">Enter values based on the document units, separated by commas</h6>
    <div class="input-group mt-2">
      <div class="input-group-prepend">
        <span class="input-group-text">Floors</span>
      </div>
      <input type="text" class="form-control" placeholder="Start from base" v-model="floors">
      <div class="input-group-append">
        <button class="btn btn-outline-primary" type="button" v-on:click="getAreas">Get Areas</button>
      </div>
    </div>
  </div>
</div>
</div>
</template>
<script>
export default {
  props: ["model"],
  data: () => {
    return {
      floors: null
    }
  },
  methods: {
    getAreas() {
      const component = this;
      let formData = new FormData();
      formData.append("model", component.model);
      formData.append("floors", component.floors);

      const data = {
        model: component.model,
        floors: component.floors
      };
      console.log("what are the floors?", component.floors);
      console.log("do we have a model?", component.model);

      $.ajax({
        url: '/api/slice-model',
        data: JSON.stringify(data),
        cache: false,
        contentType: "application/json",
        processData: false,
        method: 'POST',
        success: (response) => {
          console.log('floor areas? ', response);
        }
      });

      // $.ajax({
      //   url: '/api/slice-model',
      //   data: formData,
      //   cache: false,
      //   contentType: false,
      //   processData: false,
      //   method: 'POST',
      //   success: (response) => {
      //     console.log('floor areas? ', response);
      //   }
      // });
    }
  }
}
</script>
