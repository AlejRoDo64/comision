<template>
  <div>
    <div class="page-header">
      <h2>Productos</h2>
      <button class="btn-primary" @click="mostrarFormulario = !mostrarFormulario">
        {{ mostrarFormulario ? 'Cancelar' : '+ Nuevo Producto' }}
      </button>
    </div>

    <div v-if="mostrarFormulario" class="formulario">
      <h3>Crear Producto</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.nombre" placeholder="Nombre del producto" />
        </div>
        <div class="form-group">
          <label>Precio (COP)</label>
          <input v-model.number="form.precio" type="number" placeholder="0" />
        </div>
        <div class="form-group" style="grid-column: span 2">
          <label>Descripción</label>
          <input v-model="form.descripcion" placeholder="Descripción corta" />
        </div>
        <div class="form-group">
          <label>Stock</label>
          <input v-model.number="form.stock" type="number" placeholder="0" />
        </div>
      </div>
      <button class="btn-primary" :disabled="guardando" @click="crearProducto">
        {{ guardando ? 'Guardando...' : 'Guardar' }}
      </button>
    </div>

    <div v-if="store.cargando" class="estado">Cargando...</div>
    <div v-else-if="store.error" class="estado error">{{ store.error }}</div>

    <div v-else class="tabla-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in store.productos" :key="p.id">
            <td>#{{ p.id }}</td>
            <td>{{ p.nombre }}</td>
            <td>{{ p.descripcion }}</td>
            <td>{{ formatPrecio(p.precio) }}</td>
            <td>
              <span :class="['badge-stock', p.stock > 10 ? 'ok' : 'bajo']">{{ p.stock }}</span>
            </td>
            <td>
              <button class="btn-danger" @click="eliminar(p.id)">Eliminar</button>
            </td>
          </tr>
          <tr v-if="store.productos.length === 0">
            <td colspan="6" style="text-align:center; color:#94a3b8">Sin productos</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useProductosStore } from '@/stores/productos';

const store = useProductosStore();
const mostrarFormulario = ref(false);
const guardando = ref(false);

const form = ref({ nombre: '', descripcion: '', precio: 0, stock: 0 });

onMounted(() => store.cargar());

function formatPrecio(v: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
}

async function crearProducto() {
  if (!form.value.nombre || !form.value.descripcion) return;
  guardando.value = true;
  try {
    await store.crear({ ...form.value });
    form.value = { nombre: '', descripcion: '', precio: 0, stock: 0 };
    mostrarFormulario.value = false;
  } finally {
    guardando.value = false;
  }
}

async function eliminar(id: number) {
  if (confirm('¿Eliminar este producto?')) await store.eliminar(id);
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.page-header h2 { font-size: 1.4rem; font-weight: 700; color: #1a1a2e; }

.formulario {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.formulario h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }

.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: #475569; }
.form-group input {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}
.form-group input:focus { border-color: #7c3aed; }

.tabla-wrapper { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: auto; }

table { width: 100%; border-collapse: collapse; }
thead { background: #f8fafc; }
th { padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; }
td { padding: 0.75rem 1rem; font-size: 0.875rem; border-bottom: 1px solid #f1f5f9; }

.badge-stock {
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}
.badge-stock.ok { background: #dcfce7; color: #166534; }
.badge-stock.bajo { background: #fef2f2; color: #991b1b; }

.estado { text-align: center; padding: 2rem; color: #64748b; }
.estado.error { color: #dc2626; }

.btn-primary {
  background: #7c3aed;
  color: #fff;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #6d28d9; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-danger {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-danger:hover { background: #fecaca; }
</style>
