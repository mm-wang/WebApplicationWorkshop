<template>
<div id="main-content">
  <appNavbar />
  <div class="container-fluid content-container">
    <div class="row">
      <div class="col">
        <router-view></router-view>
      </div>
    </div>
  </div>
  <appFooter />
</div>
</template>

<script>
import appNavbar from "../../components/appNavbar.vue";
import appFooter from "../../components/appFooter.vue";
export default {
  components: {
    appNavbar: appNavbar,
    appFooter: appFooter
  }
}
</script>
