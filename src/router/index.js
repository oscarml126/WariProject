import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/registro',
            name: 'registro',
            component: () => import('@/views/pages/auth/Register.vue')
        },
        {
            path: '/dashboard',
            component: () => import('@/layout/AppLayout.vue'),
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('@/views/Products/CreateProducts.vue')
                },
                {
                    path: 'newProducts',
                    name: 'createProduct',
                    component: () => import('@/views/Products/CreateProducts.vue')
                },
                {
                    path: 'allProducts',
                    name: 'allProduct',
                    component: () => import('@/views/Products/ProductsView.vue')
                },
                {
                    path: 'productCar',
                    name: 'productCar',
                    component: () => import('@/views/Products/CartView.vue')
                },
                {
                    path: 'allFacturas',
                    name: 'allFacturas',
                    component: () => import('@/views/Products/FacturasView.vue')
                }
            ]
        }
    ]
});

router.beforeEach((to, from, next) => {
    const storedUser = sessionStorage.getItem('valor');
    if (storedUser) {
        const userData = JSON.parse(storedUser);
        const userPermissions = parseInt(userData.permisos, 10);

        if (to.path.startsWith('/dashboard')) {
            // Check for permission level 2
            if (userPermissions == 3) {
                next();
            } 
            // Check for permission level 3
            else if (userPermissions == 2 && to.name !== 'allFacturas') {
                next();
            } 
            else {
                next({ name: 'dashboard/newProducts' }); // Redirect to login if not authorized
            }
        } else {
            next(); // Allow access to public routes
        }
    } else {
        if (to.path == '/' || to.path == '/registro') {
            next();
        } else {
            next({ name: 'login' }); // Redirect to login if not logged in
        }
    }
});

export default router;
