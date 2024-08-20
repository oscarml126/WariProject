<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Facturas</h5>
                <DataView :value="invoices" :layout="layout" :paginator="true" :rows="9">
                    <template #grid="slotProps">
                        <div class="grid grid-nogutter">
                            <div v-for="(invoice, index) in slotProps.items" :key="index" class="col-12 sm:col-6 md:col-4 p-2">
                                <div class="p-4 border-1 surface-border surface-card border-round flex flex-column">
                                    <div class="pt-4">
                                        <div class="justify-content-between align-items-start gap-2">
                                            <div>
                                                <div class="text-lg font-medium text-900 mt-1">
                                                    Fecha: {{ formatDate(invoice.fecha) }}
                                                </div>
                                                <div class="text-lg font-medium text-900 mt-1">
                                                    Total a pagar: ${{ invoice.totalPagar }}
                                                </div>
                                                <div>
                                                    <h6>Productos:</h6>
                                                    <ul>
                                                        <li v-for="(product, pIndex) in invoice.productos" :key="pIndex">
                                                            <div class="text-lg font-medium text-900 mt-1">
                                                                Nombre: {{ product.nombreP }}
                                                            </div>
                                                            <div class="text-lg font-medium text-900 mt-1">
                                                                Precio: ${{ product.precio }}
                                                            </div>
                                                            <div class="text-lg font-medium text-900 mt-1">
                                                                Cantidad: {{ product.cantidad }}
                                                            </div>
                                                            <div class="text-lg font-medium text-900 mt-1">
                                                                Total por producto: ${{ product.totalPorProducto }}
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
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
import { ref, onMounted } from 'vue';
import { db } from '@/firebaseConfig'; // Ajusta la importación según tu estructura de archivos
import { collection, getDocs } from 'firebase/firestore';

const invoices = ref([]);
const layout = ref('grid');

const loadInvoices = async () => {
    try {
        const storedUser = sessionStorage.getItem('valor');
        if (!storedUser) {
            throw new Error('Usuario no encontrado en sesión');
        }

        const datosUser = JSON.parse(storedUser);
        const invoiceCollection = `factura${datosUser.idLocal}`;

        const querySnapshot = await getDocs(collection(db, invoiceCollection));
        querySnapshot.forEach(doc => {
            invoices.value.push(doc.data());
        });
    } catch (error) {
        console.error('Error al cargar facturas:', error);
    }
};

const formatDate = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleString(); // Formato legible para la fecha
};

onMounted(() => {
    loadInvoices();
});
</script>

<style scoped>
.product-nombre {
    display: inline-block;
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
