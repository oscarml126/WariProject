<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img :src="logoUrl" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <span class="text-600 font-medium">Inicia sesión para continuar</span>
                    </div>

                    <div>
                        <label for="email1" class="block text-900 text-xl font-medium mb-2">Email</label>
                        <InputText id="email1" type="text" placeholder="Email address" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="email" />

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Password</label>
                        <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>

                        <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <Button @click="handleLogin" label="Iniciar sesión" class="w-full p-3 text-xl"></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { useToast } from 'primevue/usetoast';
import { db } from '@/firebaseConfig'; // Ajusta la importación según tu estructura
import { useLayout } from '@/layout/composables/layout'; // Asegúrate de importar esto

const { layoutConfig } = useLayout(); // Usa useLayout para obtener layoutConfig
const email = ref('');
const password = ref('');
const toast = useToast();
const router = useRouter();

const logoUrl = computed(() => {
    return `/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const handleLogin = async () => {
    try {
        // Consultar en Firestore si el correo existe
        const q = query(collection(db, 'users'), where('correoLocal', '==', email.value));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // Usuario no encontrado
            toast.add({ severity: 'error', summary: 'Error', detail: 'Correo no encontrado', life: 3000 });
            return;
        }

        // Verificar la contraseña
        const userDoc = querySnapshot.docs[0].data();
        const isPasswordMatch = await comparePassword(password.value, userDoc.contrasenaLocal);

        if (!isPasswordMatch) {
            // Contraseña incorrecta
            toast.add({ severity: 'error', summary: 'Error', detail: 'Contraseña incorrecta', life: 3000 });
            return;
        }

        // Login exitoso, guardar información en sessionStorage
        sessionStorage.setItem('valor', JSON.stringify(userDoc));
        router.push('/dashboard'); // Redirigir a una página de dashboard o inicio
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al iniciar sesión', life: 3000 });
    }
};

// Función para comparar contraseñas usando bcrypt
const comparePassword = async (password, hashedPassword) => {
    const bcrypt = (await import('bcryptjs')).default;
    return bcrypt.compare(password, hashedPassword);
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

