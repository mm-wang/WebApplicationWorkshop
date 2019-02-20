<template>
<div class="card">
  <div class="card-body">
    <h4 class="card-title">Floor Areas</h4>
    <h6 class="card-subtitle text-muted">Areas from the base upward</h6>
    <table class="table table-sm mt-2">
      <tr v-for="(area, i) in areas">
        <th>Elevation {{i}}</th>
        <td><span>{{area.toFixed(1)}}</span></td>
      </tr>
    </table>
  </div>
</div>
</div>
</template>
<script>
export default {
  props: ["areas"],
}
</script>
