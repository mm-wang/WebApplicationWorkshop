const routes = [];

import { default as root_layout } from "./root/root_layout.vue";
import { default as children } from "./children";

routes.push({
	path: '/',
	name: 'root',
	component: root_layout,
	meta: { title: route => "Web Application" },
	watch: {
		'$route' (to, from) {
			console.log(to,from);
		}
	},
    children: children
});

export default routes;
