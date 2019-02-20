<template>
<div class="card">
  <div class="card-body">
    <h4 class="card-title">Enter Floor Elevations</h4>
    <h6 class="card-subtitle text-muted">Enter values based on the document units</h6>
    <span v-if="!valid" class="text-danger">That is an invalid key, please change it</span>
    <span v-else class="text-muted">Enter numbers separated by commas</span>
    <div class="input-group mt-2">
      <div class="input-group-prepend">
        <span class="input-group-text">Floors</span>
      </div>
      <input type="text" class="form-control" placeholder="Start from base" v-model="floors" v-on:keydown="checkDelimiter($event)" />
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
      floors: null,
      valid: true,
    }
  },
  methods: {
    checkDelimiter(evt) {
      const component = this;
      const chars = {};
      const floors = component.floors || "";
      const backspaced = evt.keyCode === 8;
      const char = evt.key;
      let validEntry = true;

      // Set up valid characters, which are all numbers, ',' or ' '
      for (let i = 0; i < 10; i++) {
        chars[i.toString()] = true;
      }
      chars[","] = true;
      chars[" "] = true;
      // Check if the whole entry is valid
      let length = backspaced ? floors.length - 1 : floors.length;
      for (let i = 0; i < length; i++) {
        let cur = floors.charAt(i);
        if (!chars[cur]) validEntry = false;
      }

      component.valid = backspaced ? backspaced && validEntry : chars[char] && validEntry;
    },
    getAreas() {
      const component = this;
      let formData = new FormData();
      formData.append("model", component.model);
      formData.append("floors", component.floors);
      const floors = component.floors.split(",").map((char) => {
        return char.trim();
      });
      const data = {
        model: component.model,
        floors: floors
      };
      console.log("what are the floors?", floors);
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
