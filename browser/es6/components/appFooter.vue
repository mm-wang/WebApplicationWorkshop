<template>
<footer>
  <div class="fixed-bottom container-fluid bg-light">
    <div class="float-right">
      <a href="http://core.thorntontomasetti.com">
        <img class="logo" src="https://s3-us-west-2.amazonaws.com/core-weblibrary/libraries/core-logo.png" />
      </a>&nbsp;&nbsp;&copy; {{Date.now() | year}}
    </div>
  </div>
</footer>
</template>
<script>
import moment from "moment";
export default {
  filters: {
    year: function(date) {
      return moment(date).format('YYYY');
    }
  }
}
</script>
