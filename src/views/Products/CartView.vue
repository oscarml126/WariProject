<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Carrito</h5>
                <DataView :value="cartProducts" :layout="layout" :paginator="true" :rows="9">
                    <template #grid="slotProps">
                        <div class="grid grid-nogutter">
                            <div v-for="(item, index) in slotProps.items" :key="index"
                                class="col-12 sm:col-6 md:col-4 p-2">
                                <div class="p-4 border-1 surface-border surface-card border-round flex flex-column">
                                    <div class="surface-50 flex justify-content-center border-round p-3">
                                        <div class="relative mx-auto">
                                            <img class="border-round w-full" :src="item.image" :alt="item.nombre"
                                                style="max-width: 300px; max-height: 100px;" />
                                        </div>
                                    </div>
                                    <div class="pt-4">
                                        <div class="justify-content-between align-items-start gap-2">
                                            <div>
                                                <div class="text-lg font-medium text-900 mt-1 product-nombre">{{
                                                    item.nombre }}</div>
                                            </div>
                                            <div class="text-lg font-medium text-900 mt-1">
                                                Precio:
                                                <span v-if="item.precioDes">
                                                    <input type="checkbox" v-model="item.useDiscount" />
                                                    <strong>${{ item.useDiscount ? item.precioDes : item.precio
                                                        }}</strong>
                                                </span>
                                                <span v-else>
                                                    <strong>${{ item.precio }}</strong>
                                                </span>
                                            </div>
                                            <div class="text-lg font-medium text-900 mt-1">
                                                Cantidad:
                                                <input type="number" v-model.number="item.cantidad" min="1"
                                                    class="p-inputtext" :max="item.cantidadTotal" />
                                            </div>
                                            <div v-if="item.cantidad > item.cantidadTotal"
                                                class="text-red-500 mt-1">
                                                No hay suficiente stock disponible.
                                            </div>
                                            <Button label="Eliminar" class="p-button-danger mt-2" @click="removeProduct(index)"></Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </DataView>
                <div class="flex justify-content-between mt-4">
                    <div>
                        <h5>Total por producto:</h5>
                        <div v-for="(item, index) in cartProducts" :key="index">
                            <div class="text-lg font-medium text-900 mt-1">
                                {{ item.nombre }}: ${{ calculateTotal(item) }}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h5>Total a pagar:</h5>
                        <div class="text-lg font-medium text-900 mt-1">
                            ${{ totalAmount }}
                        </div>
                    </div>
                </div>
                <Button label="Confirmar" class="w-full p-3 text-xl mt-4" @click="confirmOrder"></Button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { db } from '@/firebaseConfig'; // Ajusta la importación según tu estructura de archivos
import { collection, doc, updateDoc, addDoc, getDoc } from 'firebase/firestore';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const cartProducts = ref([]);
const layout = ref('grid');
const currentDate = new Date().toISOString(); // Fecha actual en formato ISO

const loadCartProducts = () => {
    const storedProducts = localStorage.getItem('productos');
    if (storedProducts) {
        cartProducts.value = JSON.parse(storedProducts);
    }
};

const calculateTotal = (item) => {
    const precio = item.useDiscount ? item.precioDes : item.precio;
    return (precio * item.cantidad).toFixed(2);
};

const totalAmount = computed(() => {
    return cartProducts.value.reduce((total, item) => {
        const precio = item.useDiscount ? item.precioDes : item.precio;
        return total + (precio * item.cantidad);
    }, 0).toFixed(2);
});

const removeProduct = (index) => {
    cartProducts.value.splice(index, 1);
    localStorage.setItem('productos', JSON.stringify(cartProducts.value));
    toast.add({ severity: 'info', summary: 'Producto eliminado', detail: 'El producto ha sido eliminado del carrito', life: 3000 });
};

const confirmOrder = async () => {
    try {
        const storedUser = sessionStorage.getItem('valor');
        if (!storedUser) {
            throw new Error('Usuario no encontrado en sesión');
        }

        const datosUser = JSON.parse(storedUser);

        // Actualiza las cantidades de productos en la base de datos
        for (const item of cartProducts.value) {
            const productRef = doc(db, datosUser.idLocal, item.id);
            const docSnapshot = await getDoc(productRef);
            const productData = docSnapshot.data();

            if (productData) {
                console.log('Datos del producto:', productData);
                if (item.cantidad <= productData.Cantidad) {
                    await updateDoc(productRef, {
                        Cantidad: productData.Cantidad - item.cantidad //,
                        //updateby: datosUser.correoLocal,
                        //dateupdate: currentDate
                    });
                } else {
                    toast.add({ severity: 'error', summary: 'Error', detail: `No hay suficientes ${item.nombre}`, life: 3000 });
                    return;
                }
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: `Producto ${item.nombre} no encontrado`, life: 3000 });
                return;
            }
        }


        // Crea una nueva factura
        const invoiceCollection = `factura${datosUser.idLocal}`;
        let totalValue = 0;
        const productDetails = []
        for (const item of cartProducts.value) {
            const totalPorProducto = parseFloat(calculateTotal(item)); // Calculate total per product
            totalValue += totalPorProducto; // Add to total value
            productDetails.push({
                nombreP: item.nombre,
                precio: item.useDiscount ? item.precioDes : item.precio,
                cantidad: item.cantidad,
                totalPorProducto: totalPorProducto
            });
        }
        await addDoc(collection(db, invoiceCollection), {
            productos: productDetails, // Save product details array
            totalPagar: totalValue.toFixed(2), // Save total value
            fecha: currentDate
        });

        // Limpia el carrito
        localStorage.removeItem('productos');
        cartProducts.value = [];
        toast.add({ severity: 'success', summary: 'Compra realizada', detail: 'Tu compra se ha realizado con éxito', life: 3000 });
    } catch (error) {
        console.error('Error en confirmOrder:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al procesar la compra', life: 3000 });
    }
};

loadCartProducts();
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
