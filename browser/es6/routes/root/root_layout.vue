<template>
<div id="main-content">
    <appNavbar/>
    <div class="container-fluid content-container mt-2">
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
import appFooter from "../../components/appFooter.vue";
export default {
    components: {
        appNavbar: appNavbar,
        appFooter: appFooter
    }
}
</script>
