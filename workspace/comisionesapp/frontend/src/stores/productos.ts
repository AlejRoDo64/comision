import { defineStore } from 'pinia';
import { ref } from 'vue';
import { productosApi, type Producto, type CrearProductoDto } from '@/services/api';

export const useProductosStore = defineStore('productos', () => {
  const productos = ref<Producto[]>([]);
  const cargando = ref(false);
  const error = ref<string | null>(null);

  async function cargar() {
    cargando.value = true;
    error.value = null;
    try {
      productos.value = await productosApi.getAll();
    } catch (e) {
      error.value = 'Error al cargar productos';
    } finally {
      cargando.value = false;
    }
  }

  async function crear(dto: CrearProductoDto) {
    const nuevo = await productosApi.create(dto);
    productos.value.push(nuevo);
    return nuevo;
  }

  async function eliminar(id: number) {
    await productosApi.remove(id);
    productos.value = productos.value.filter((p) => p.id !== id);
  }

  async function actualizar(id: number, dto: Partial<CrearProductoDto>) {
    const actualizado = await productosApi.update(id, dto);
    const idx = productos.value.findIndex((p) => p.id === id);
    if (idx !== -1) productos.value[idx] = actualizado;
    return actualizado;
  }

  return { productos, cargando, error, cargar, crear, eliminar, actualizar };
});
