<template>
  <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Estado de Permisos Actual</h3>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-green-500"></div>
        <span class="text-sm text-gray-600">{{ userRole }}</span>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Permiso: Gestionar Empresas -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-3">
          <i class="fas fa-building text-gray-600"></i>
          <span class="text-sm font-medium text-gray-700">Gestionar Empresas</span>
        </div>
        <div :class="[
          'w-6 h-6 rounded-full flex items-center justify-center',
          canManageEmpresas ? 'bg-green-100' : 'bg-red-100'
        ]">
          <i :class="[
            'text-xs',
            canManageEmpresas ? 'fas fa-check text-green-600' : 'fas fa-times text-red-600'
          ]"></i>
        </div>
      </div>

      <!-- Permiso: Gestionar Centros de Trabajo -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-3">
          <i class="fas fa-industry text-gray-600"></i>
          <span class="text-sm font-medium text-gray-700">Gestionar Centros de Trabajo</span>
        </div>
        <div :class="[
          'w-6 h-6 rounded-full flex items-center justify-center',
          canManageCentrosTrabajo ? 'bg-green-100' : 'bg-red-100'
        ]">
          <i :class="[
            'text-xs',
            canManageCentrosTrabajo ? 'fas fa-check text-green-600' : 'fas fa-times text-red-600'
          ]"></i>
        </div>
      </div>

      <!-- Permiso: Gestionar Trabajadores -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-3">
          <i class="fas fa-users text-gray-600"></i>
          <span class="text-sm font-medium text-gray-700">Gestionar Trabajadores</span>
        </div>
        <div :class="[
          'w-6 h-6 rounded-full flex items-center justify-center',
          canManageTrabajadores ? 'bg-green-100' : 'bg-red-100'
        ]">
          <i :class="[
            'text-xs',
            canManageTrabajadores ? 'fas fa-check text-green-600' : 'fas fa-times text-red-600'
          ]"></i>
        </div>
      </div>

      <!-- Permiso: Documentos de Diagnóstico -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-3">
          <i class="fas fa-stethoscope text-gray-600"></i>
          <span class="text-sm font-medium text-gray-700">Documentos de Diagnóstico</span>
        </div>
        <div :class="[
          'w-6 h-6 rounded-full flex items-center justify-center',
          canManageDocumentosDiagnostico ? 'bg-green-100' : 'bg-red-100'
        ]">
          <i :class="[
            'text-xs',
            canManageDocumentosDiagnostico ? 'fas fa-check text-green-600' : 'fas fa-times text-red-600'
          ]"></i>
        </div>
      </div>

      <!-- Permiso: Documentos de Evaluación -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-3">
          <i class="fas fa-clipboard-check text-gray-600"></i>
          <span class="text-sm font-medium text-gray-700">Documentos de Evaluación</span>
        </div>
        <div :class="[
          'w-6 h-6 rounded-full flex items-center justify-center',
          canManageDocumentosEvaluacion ? 'bg-green-100' : 'bg-red-100'
        ]">
          <i :class="[
            'text-xs',
            canManageDocumentosEvaluacion ? 'fas fa-check text-green-600' : 'fas fa-times text-red-600'
          ]"></i>
        </div>
      </div>

      <!-- Permiso: Documentos Externos -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-3">
          <i class="fas fa-file-upload text-gray-600"></i>
          <span class="text-sm font-medium text-gray-700">Documentos Externos</span>
        </div>
        <div :class="[
          'w-6 h-6 rounded-full flex items-center justify-center',
          canManageDocumentosExternos ? 'bg-green-100' : 'bg-red-100'
        ]">
          <i :class="[
            'text-xs',
            canManageDocumentosExternos ? 'fas fa-check text-green-600' : 'fas fa-times text-red-600'
          ]"></i>
        </div>
      </div>

      <!-- Permiso: Otros Documentos -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-3">
          <i class="fas fa-clipboard-list text-gray-600"></i>
          <span class="text-sm font-medium text-gray-700">Otros Documentos</span>
        </div>
        <div :class="[
          'w-6 h-6 rounded-full flex items-center justify-center',
          canManageOtrosDocumentos ? 'bg-green-100' : 'bg-red-100'
        ]">
          <i :class="[
            'text-xs',
            canManageOtrosDocumentos ? 'fas fa-check text-green-600' : 'fas fa-times text-red-600'
          ]"></i>
        </div>
      </div>

      <!-- Información adicional -->
      <div class="md:col-span-2 lg:col-span-3 p-3 bg-blue-50 rounded-lg">
        <div class="flex items-start gap-3">
          <i class="fas fa-info-circle text-blue-600 mt-0.5"></i>
          <div>
            <p class="text-sm text-blue-800 font-medium mb-1">Información de Permisos</p>
            <p class="text-xs text-blue-700">
              Los permisos se aplican automáticamente en toda la aplicación. 
              Si no tienes un permiso específico, los botones correspondientes estarán deshabilitados 
              y verás mensajes informativos cuando intentes realizar acciones restringidas.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePermissionRestrictions } from '@/composables/usePermissionRestrictions';

const { 
  userRole,
  canManageEmpresas,
  canManageCentrosTrabajo,
  canManageTrabajadores,
  canManageDocumentosDiagnostico,
  canManageDocumentosEvaluacion,
  canManageDocumentosExternos,
  canManageOtrosDocumentos
} = usePermissionRestrictions();
</script>
