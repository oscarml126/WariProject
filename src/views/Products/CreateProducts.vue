<template>
    <div>
        <div class="flex align-items-center justify-content-center">
            <Toast />
            <div v-if="form" class="surface-card p-4 shadow-2 border-round w-full md:w-8 lg:w-6 xl:w-4">
                <h2>{{ form.nameForm }}</h2>
                <form @submit.prevent="handleSubmit" class="flex flex-column">
                    <div v-for="(field, index) in form.form" :key="index">
                        <div class="field">
                            <label>{{ field.label }}</label>
                            <InputText v-if="['text', 'email', 'number', 'date', 'password'].includes(field.type)"
                                :type="field.type" :id="field.name" :name="field.name" v-model="formData[field.name]"
                                class="p-inputtext w-full" />
                            <Textarea v-if="field.type === 'textarea'" :id="field.name" :name="field.name"
                                v-model="formData[field.name]" class="p-inputtextarea w-full"></Textarea>
                        </div>
                    </div>
                    Input for image upload 
                    <div class="field">
                        <label>Upload Image</label>
                        <input type="file" @change="handleFileChange" accept="image/*" class="p-inputtext w-full" />
                    </div> 
                    <Button type="submit" label="Enviar" class="p-button w-full"></Button>
                </form>
            </div>
            <div v-else>
                <p>Loading...</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db, storage } from '@/firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from "primevue/usetoast";

const toast = useToast();

const form = ref(null);
const formData = ref({});
const imageFile = ref(null);

const fetchForm = async () => {
    const storedUser = sessionStorage.getItem('valor');
    const datosUser = JSON.parse(storedUser);
    const formId = datosUser.idLocal; // Simulando el ID del formulario
    const q = query(collection(db, 'forms'), where('idForm', '==', formId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        form.value = doc.data();
        form.value.id = doc.id;  // Guardar el id del documento
        form.value.form.forEach((field) => {
            formData.value[field.name] = '';
        });
    });
};

const handleFileChange = (event) => {
    const target = event.target;
    if (target.files && target.files[0]) {
        imageFile.value = target.files[0];
    }
};

const handleSubmit = async () => {
    try {
        const convertedData = {};
        form.value.form.forEach((field) => {
            if (field.type === 'number') {
                convertedData[field.name] = Number(formData.value[field.name]);
            } else if (field.type === 'date') {
                convertedData[field.name] = new Date(formData.value[field.name]).toISOString();
            } else {
                convertedData[field.name] = formData.value[field.name];
            }
        });
        if (imageFile.value) {
            const storageReference = storageRef(storage, `images/${imageFile.value.name}`);
            await uploadBytes(storageReference, imageFile.value);
            const downloadURL = await getDownloadURL(storageReference);
            convertedData.Image = downloadURL;
        }
        console.log(convertedData);

       const docRef = await addDoc(collection(db, form.value.idForm), convertedData);
        console.log('Document written with ID: ', docRef.id);

        // Restablecer los campos del formulario
        form.value.form.forEach((field) => {
            formData.value[field.name] = '';
        });

        // Restablecer el archivo de imagen
        
        imageFile.value = null;
        showSuccess()
    } catch (e) {
        showError()
        console.error('Error adding document: ', e);
    }
};
const showSuccess = () => {
    toast.add({ severity: 'success', summary: 'Guardado', detail: 'se guardo correctamente', life: 3000 });
};
const showError = () => {
    toast.add({ severity: 'error', summary: 'Error', detail: 'no se pudo guardar', life: 3000 });
};

onMounted(fetchForm);
</script>

<style scoped>
/* You can add additional custom styles here if needed */
</style>
