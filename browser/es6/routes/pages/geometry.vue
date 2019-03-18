<template>
<div class="row">
    <div class="col">
        <h3>Geometry Component</h3>
    </div>
</div>
</template>

<script>
export default {
  created(){
    const component = this;
    $.get("/api/retrieve-something").then((data) => {
      console.log(data);
    });
  }
}
</script>
