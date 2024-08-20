<script setup>
import { ref, computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Todo',
        items: [
            { label: 'Agregar nuevos productos', icon: 'pi pi-fw pi-id-card', to: '/dashboard/newProducts' },
            { label: 'Todos los productos', icon: 'pi pi-fw pi-id-card', to: '/dashboard/allProducts' },
            { label: 'Carrito', icon: 'pi pi-fw pi-id-card', to: '/dashboard/productCar' },
            { label: 'Facturas', icon: 'pi pi-fw pi-id-card', to: '/dashboard/allFacturas' }
        ]
    }    
]);

const model1 = ref([
    {
        label: 'Todo',
        items: [
            { label: 'Agregar nuevos productos', icon: 'pi pi-fw pi-id-card', to: '/dashboard/newProducts' },
            { label: 'Todos los productos', icon: 'pi pi-fw pi-id-card', to: '/dashboard/allProducts' },
            { label: 'Carrito', icon: 'pi pi-fw pi-id-card', to: '/dashboard/productCar' }
        ]
    }    
]);

const storedUser = JSON.parse(sessionStorage.getItem('valor'));

const selectedModel = computed(() => {
    return storedUser.permisos == 3 ? model.value : model1.value;
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in selectedModel" :key="item.label">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
