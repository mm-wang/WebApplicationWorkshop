<template>
<div class="card">
  <div class="card-body">
    <h4 class="card-title">Floor Areas</h4>
    <h6 class="card-subtitle text-muted">Areas from the base upward</h6>
    <table class="table table-sm mt-2">
      <tr v-for="(area, i) in areas">
        <th>Elevation {{i}}: {{+floors[i]}}</th>
        <td><span v-if="area">{{area.toFixed(1)}}</span>
          <span v-else>Not in bounds of massing</span></td>
      </tr>
    </table>
    <button class="btn btn-primary btn-block" v-if="areas && !saved" v-on:click="saveData()">Save Data</button>
    <span class="text-success" v-else>Saved!</span>
  </div>
</div>
</div>
</template>
<script>
export default {
  props: ["model", "areas", "floors", "saved"],
  data() {
    return {
      // saved: false
    }
  },
  methods: {
    saveData() {
      const component = this;
      const slices = {
        areas: component.areas,
        floors: component.floors
      };
      const data = {
        model: component.model,
        slices: slices
      };

      $.ajax({
        url: '/api/save-slices',
        data: JSON.stringify(data),
        cache: false,
        contentType: "application/json",
        processData: false,
        method: 'POST',
        success: (response) => {
          component.saved = (response === true);
          setTimeout(() => {
            component.saved = false;
          }, 5000);
        }
      });
    }
  }
}
</script>
