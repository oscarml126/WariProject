<template>
    <div class="grid">
        <div class="col-12">
            <Toast />
            <div class="card">
                <h5>Productos</h5>
                <div class="grid grid-nogutter mb-4">AV
                </div>
                <DataView :value="filteredProducts" :layout="layout" :paginator="true" :rows="9" :sortOrder="sortOrder" :sortField="sortField">
                    <template #header>
                        <div class="grid grid-nogutter">
                            <div class="col-6 text-left">
                                <Dropdown v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Ordenar por Precio" @change="onSortChange($event)" />
                            </div>
                            <div class="col-6 text-right">
                                <IconField>
                            <InputIcon class="pi pi-search" />
                            <InputText v-model="searchQuery" placeholder="Buscar por Nombre del producto" />
                        </IconField>
                            </div>
                        </div>
                    </template>
                    <template #grid="slotProps">
                        <div class="grid grid-nogutter">
                            <div v-for="(item, index) in slotProps.items" :key="index" class="col-12 sm:col-6 md:col-4 p-2">
                                <div class="p-4 border-1 surface-border surface-card border-round flex flex-column">
                                    <div class="surface-50 flex justify-content-center border-round p-3">
                                        <div class="relative mx-auto">
                                            <img class="border-round w-full" :src="item.Image" :alt="item.name" style="max-width: 300px; max-height: 100px;" />
                                        </div>
                                    </div>
                                    <div class="pt-4">
                                        <div class="flex flex-row justify-content-between align-items-start gap-2">
                                            <div>
                                                <div class="text-lg font-medium text-900 mt-1 product-name"><strong>{{ item.NombreP }}</strong></div>
                                            </div>
                                            <div >
                                                    <div class="text-lg font-medium text-900 mt-1"> <strong>{{ item.Cantidad }}</strong></div>
                                            </div>
                                        </div>
                                        <div class="flex flex-row justify-content-between align-items-start gap-2">
                                            <div>
                                                <div class="text-lg font-medium text-900 mt-1">Bodega: <strong>{{ item.Bodega }}</strong></div>
                                            </div>
                                            <div >
                                                    <div class="text-lg font-medium text-900 mt-1">Bloque: <strong>{{ item.Bloque }}</strong></div>
                                            </div>
                                        </div>
                                        <div class="flex flex-row justify-content-between align-items-start gap-2">
                                            <div>
                                                <div class="text-lg font-medium text-900 mt-1">Fila: <strong>{{ item.Fila }}</strong></div>
                                            </div>
                                            <div >
                                                    <div class="text-lg font-medium text-900 mt-1">Columna: <strong>{{ item.Columna }}</strong></div>
                                            </div>
                                        </div>
                                        <div class="flex flex-column gap-4 mt-4">
                                            <span class="text-2xl font-semibold text-900">${{ item.Precio }}</span>
                                            <div class="flex gap-2">
                                                <Button icon="pi pi-shopping-cart" @click="guardarinfoproducto(item)" label="Comprar"  class="flex-auto white-space-nowrap"></Button>
                                                <Button icon="pi pi-heart" outlined></Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </DataView>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { db } from '@/firebaseConfig'; // Adjust the import based on your file structure
import { collection, getDocs } from 'firebase/firestore';
import { useToast } from "primevue/usetoast";

const toast = useToast();

const dataviewValue = ref([]);
const layout = ref('grid');
const sortKey = ref(null);
const sortOrder = ref(null);
const sortField = ref(null);
const sortOptions = ref([
    { label: 'Menor precio', value: 'Precio' },
    { label: 'Mayor precio', value: '!Precio' }
]);
const searchQuery = ref('');
onMounted(async () => {
    const storedUser = sessionStorage.getItem('valor');
    const datosUser = JSON.parse(storedUser);
    const q = collection(db, datosUser.idLocal);
    const querySnapshot = await getDocs(q);
    const products = [];
    querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
    });
    dataviewValue.value = products;
});
const guardarinfoproducto = (info) => {
    const storedProducts = JSON.parse(localStorage.getItem('productos')) || [];
    const existingProductIndex = storedProducts.findIndex(product => product.id === info.id);

    if (existingProductIndex >= 0) {
        if (storedProducts[existingProductIndex].cantidad >= info.Cantidad) {
            toast.add({ severity: 'error', summary: 'No hay suficiente stock', detail: 'No hay suficiente cantidad del producto en stock.', life: 3000 });
            return;
        }
        storedProducts[existingProductIndex].cantidad += 1; // Incrementar la cantidad si el producto ya existe
    } else {
        storedProducts.push({
            id: info.id,
            nombre: info.NombreP,
            precio: info.Precio,
            precioDes: info.PrecioDes || info.Precio, 
            cantidad:1,
            image: info.Image,
            cantidadTotal: info.Cantidad
        });
    }

    localStorage.setItem('productos', JSON.stringify(storedProducts));
    toast.add({ severity: 'success', summary: 'Producto agregado', detail: 'El producto ha sido agregado al carrito.', life: 3000 });
};
const filteredProducts = computed(() => {
    if (!searchQuery.value) {
        return dataviewValue.value;
    }
    return dataviewValue.value.filter((product) => {
        return (
            product.Referencia?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            product.Codigo?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            product.NombreP?.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    });
});
const onSortChange = (event) => {
    const value = event.value.value;
    const sortValue = event.value;

    if (value.indexOf('!') === 0) {
        sortOrder.value = -1;
        sortField.value = value.substring(1, value.length);
        sortKey.value = sortValue;
    } else {
        sortOrder.value = 1;
        sortField.value = value;
        sortKey.value = sortValue;
    }
};
</script>
<style scoped>
.product-name {
    display: inline-block;      
    max-width: 200px;          
    white-space: nowrap;       
    overflow: hidden;           
    text-overflow: ellipsis;   
}
</style>
