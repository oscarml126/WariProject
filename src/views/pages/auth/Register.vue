<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <span class="text-600 font-medium">Registro</span>
                    </div>

                    <div>
                        <label for="nombreLocal" class="block text-900 text-xl font-medium mb-2">Nombre Local</label>
                        <InputText id="nombreLocal" v-model="nombreLocal" placeholder="Nombre del local" class="w-full md:w-30rem mb-5" />

                        <label for="idLocal" class="block text-900 text-xl font-medium mb-2">ID Local</label>
                        <InputText id="idLocal" v-model="idLocal" placeholder="ID del local" class="w-full md:w-30rem mb-5" />

                        <label for="correoLocal" class="block text-900 text-xl font-medium mb-2">Correo Electrónico</label>
                        <InputText id="correoLocal" v-model="correoLocal" placeholder="Correo electrónico" class="w-full md:w-30rem mb-5" />

                        <label for="contrasenaLocal" class="block text-900 font-medium text-xl mb-2">Contraseña</label>
                        <Password id="contrasenaLocal" v-model="contrasenaLocal" placeholder="Contraseña" :toggleMask="true" class="w-full mb-3" />

                        <label for="confirmContrasena" class="block text-900 font-medium text-xl mb-2">Confirmar Contraseña</label>
                        <Password id="confirmContrasena" v-model="confirmContrasena" placeholder="Confirmar Contraseña" :toggleMask="true" class="w-full mb-3" />

                        <Button type="submit" label="Registrar" class="w-full p-3 text-xl" @click="handleSubmit"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { db } from '@/firebaseConfig'; // Ajusta la ruta según tu estructura de archivos
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import bcrypt from 'bcryptjs'; // Usa bcryptjs en lugar de bcrypt

const router = useRouter();

const nombreLocal = ref('');
const idLocal = ref('');
const correoLocal = ref('');
const contrasenaLocal = ref('');
const confirmContrasena = ref('');

const handleSubmit = async () => {
    if (contrasenaLocal.value !== confirmContrasena.value) {
        alert('Las contraseñas no coinciden.');
        return;
    }

    try {
        // Encriptar la contraseña antes de almacenarla
        const hashedPassword = await bcrypt.hash(contrasenaLocal.value, 10);

        // Crear objeto con los datos del formulario
        const newUser = {
            nombreLocal: nombreLocal.value,
            idLocal: idLocal.value,
            correoLocal: correoLocal.value,
            contrasenaLocal: hashedPassword,
            permisos: 2 // Agregar permisos con valor por defecto
        };

        // Guardar en la base de datos
        const docRef = await addDoc(collection(db, 'users'), newUser);
        console.log('Usuario registrado con ID:', docRef.id);

        
        router.push('/'); // Redirige a la página de inicio de sesión o cualquier otra página
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
    }
};
</script>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>