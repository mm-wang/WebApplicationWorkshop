<template>
<div>
    <appNavbar/>
    <div class="container-fluid content-container">
        <div class="row">
            <div class="col">
                <h2>Base Application Is Here!</h2>
                <router-view></router-view>
            </div>
        </div>
    </div>
    <appFooter />
</div>
</template>

<script>
import appNavbar from "../../components/appNavbar.vue";
export default {
    components: {
        appNavbar: appNavbar
    }
}
</script>
