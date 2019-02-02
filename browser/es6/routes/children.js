import {default as geometry} from "./pages/geometry.vue";

export default [{
    path: '/geometry',
    name: 'geometry',
    component: geometry,
    meta: { title: route => "Geometry View" },
    props: true
}];
