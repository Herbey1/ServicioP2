"use client"

import PropTypes from "prop-types"
import { useState, useRef } from "react"
import SkeletonList from "../../common/SkeletonList"
import { useTheme } from "../../../context/ThemeContext"
import { apiFetch } from "../../../api/client"
import { useToast } from "../../../context/ToastContext"

export default function UsuariosSection({
  usuarios,
  loading,
  onChangeRole,
  onToggleActive,
  onDeleteUser,
  busyUserId,
  deletingUserId,
  onAddUser,
  addingUser = false,
  onUploadComplete
}) {
  const { darkMode } = useTheme()
  const { showToast } = useToast()
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [parsedRows, setParsedRows] = useState([]) // { id, line, correo, nombre, valid, reason, duplicateExisting, duplicateInFile }
  const [selectedIds, setSelectedIds] = useState(new Set())

  if (loading) {
    return <SkeletonList items={6} />
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllValid = (select = true) => {
    setSelectedIds(() => {
      const s = new Set()
      if (select) {
        parsedRows.forEach(r => { if (r.valid && !r.duplicateExisting) s.add(r.id) })
      }
      return s
    })
  }

  const cancelPreview = () => {
    setPreviewOpen(false)
    setParsedRows([])
    setSelectedIds(new Set())
    try { if (fileInputRef.current) fileInputRef.current.value = null } catch {}
  }

  const confirmImport = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) {
      showToast('Seleccione al menos un usuario para importar', { type: 'error' })
      return
    }
    setUploading(true)
    try {
      const rowsToSend = parsedRows.filter(r => selectedIds.has(r.id))
      // Generar CSV seguro
      const escapeField = (v) => {
        if (v == null) return ''
        const s = String(v)
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
        return s
      }
      const lines = rowsToSend.map(r => `${r.correo},${escapeField(r.nombre)}`)
      const csv = lines.join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const file = new File([blob], 'import.csv', { type: 'text/csv' })
      const fd = new FormData()
      fd.append('file', file)

      const resp = await apiFetch('/api/usuarios/upload-csv', { method: 'POST', body: fd })
      if (!resp.ok) {
        throw new Error(resp.data?.msg || `Error ${resp.status}`)
      }
      const data = resp.data || {}
      const created = data.created_count || 0
      const skipped = Array.isArray(data.skipped) ? data.skipped.length : 0
      const invalid = Array.isArray(data.invalid) ? data.invalid.length : 0
      showToast(`Importación finalizada: ${created} creados, ${skipped} saltados, ${invalid} inválidos.`, { type: 'success' })
      cancelPreview()
      if (typeof onUploadComplete === 'function') onUploadComplete()
    } catch (err) {
      console.error('Error importando CSV', err)
      showToast(err?.message || 'Error importando CSV', { type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = async (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    try {
      const text = await f.text()
      const content = text.replace(/^\uFEFF/, '')
      const lines = content.split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0)

      if (lines.length === 0) {
        showToast('El archivo CSV está vacío', { type: 'error' })
        try { fileInputRef.current.value = null } catch {}
        return
      }

      let start = 0
      const first = lines[0].toLowerCase()
      if (first.includes('correo') || first.includes('email') || first.includes('nombre') || first.includes('name')) start = 1

      // Refrescar la lista de usuarios desde la API para detectar duplicados actualizados
      let existingEmails = new Set((usuarios || []).map(u => String(u.correo).toLowerCase()))
      try {
        const resp = await apiFetch('/api/usuarios')
        if (resp && resp.ok && Array.isArray(resp.data?.items)) {
          existingEmails = new Set((resp.data.items || []).map(u => String(u.correo).toLowerCase()))
        }
      } catch (err) {
        // si falla, seguimos con la lista que tenemos en props
        console.warn('No se pudo actualizar lista de usuarios para validación CSV', err)
      }
      const seenInFile = new Set()
      const rows = []
      for (let i = start; i < lines.length; i++) {
        const raw = lines[i]
        const idx = raw.indexOf(',')
        if (idx === -1) {
          rows.push({ id: i, line: i + 1, raw, correo: null, nombre: null, valid: false, reason: 'Formato inválido (se esperaba correo,nombre)', duplicateExisting: false, duplicateInFile: false })
          continue
        }
        let correo = raw.slice(0, idx).trim().replace(/^"|"$/g, '').toLowerCase()
        let nombre = raw.slice(idx + 1).trim().replace(/^"|"$/g, '')

        const emailRegex = /^[a-z0-9._%+-]+@uabc\.edu\.mx$/i
        const duplicateExisting = existingEmails.has(correo)
        const duplicateInFile = seenInFile.has(correo)
        if (!correo || !nombre) {
          rows.push({ id: i, line: i + 1, raw, correo, nombre, valid: false, reason: 'Correo o nombre vacío', duplicateExisting, duplicateInFile })
          seenInFile.add(correo)
          continue
        }
        if (!emailRegex.test(correo)) {
          rows.push({ id: i, line: i + 1, raw, correo, nombre, valid: false, reason: 'Correo no institucional o inválido', duplicateExisting, duplicateInFile })
          seenInFile.add(correo)
          continue
        }
        rows.push({ id: i, line: i + 1, raw, correo, nombre, valid: true, reason: null, duplicateExisting, duplicateInFile })
        seenInFile.add(correo)
      }

      setParsedRows(rows)
      const defaultSelected = new Set()
      rows.forEach(r => { if (r.valid && !r.duplicateExisting) defaultSelected.add(r.id) })
      setSelectedIds(defaultSelected)
      setPreviewOpen(true)
    } catch (err) {
      console.error('Error parseando CSV en cliente', err)
      showToast('Error leyendo el archivo CSV', { type: 'error' })
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Gestiona el acceso de la comunidad académica. Cambia roles, suspende cuentas o agrega nuevos usuarios.
        </p>
        <div className="flex items-center">
          {onAddUser && (
            <button
              onClick={onAddUser}
              disabled={addingUser}
              className={`self-start sm:self-auto px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                addingUser
                  ? 'bg-green-700/60 text-white cursor-not-allowed'
                  : 'bg-green-700 text-white hover:bg-green-800'
              }`}
            >
              {addingUser ? 'Guardando…' : '+ Agregar usuario'}
            </button>
          )}

          <div className="ml-3">
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileSelect} />
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={uploading}
              className={`self-start sm:self-auto ml-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${uploading ? 'bg-blue-700/60 text-white cursor-not-allowed' : 'bg-blue-700 text-white hover:bg-blue-800'}`}>
              {uploading ? 'Importando…' : 'Importar CSV'}
            </button>
          </div>
        </div>
      </div>

      {usuarios.length === 0 ? (
        <div className={`border rounded-lg p-8 text-center ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'}`}>
          No hay usuarios registrados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`min-w-full text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <thead>
              <tr className={darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}>
                <th className="text-left px-4 py-3 font-semibold">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold">Correo</th>
                <th className="text-left px-4 py-3 font-semibold">Ocupación</th>
                <th className="text-left px-4 py-3 font-semibold">Estado</th>
                <th className="text-right px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => {
                const isActive = !user.deleted_at
                const isBusy = busyUserId === user.id
                const isDeleting = deletingUserId === user.id
                return (
                  <tr key={user.id} className={darkMode ? 'border-b border-gray-700' : 'border-b border-gray-100'}>
                    <td className="px-4 py-3 align-middle">{user.nombre}</td>
                    <td className="px-4 py-3 align-middle">{user.correo}</td>
                    <td className="px-4 py-3 align-middle">
                      <select
                        value={user.rol}
                        onChange={(e) => onChangeRole(user.id, e.target.value)}
                        disabled={!isActive || isBusy}
                        className={`rounded-md border px-3 py-1 text-sm ${darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-800'}`}
                      >
                        <option value="DOCENTE">Docente</option>
                        <option value="ADMIN">Administrativo</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-600' : 'bg-gray-500'}`} />
                        {isActive ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onToggleActive(user.id, !isActive)}
                          disabled={isBusy || isDeleting}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            isActive
                              ? 'border border-red-600 text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed'
                              : 'border border-green-600 text-green-600 hover:bg-green-50 disabled:opacity-60 disabled:cursor-not-allowed'
                          }`}
                        >
                          {isActive ? 'Suspender' : 'Reactivar'}
                        </button>
                        <button
                          onClick={() => onDeleteUser(user.id)}
                          disabled={isDeleting || isBusy}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors border border-red-700 text-red-700 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                          {isDeleting ? 'Eliminando…' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} w-full max-w-3xl rounded-2xl shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Vista previa de importación</h3>
              <button onClick={cancelPreview} className={`text-2xl leading-none ${darkMode ? 'text-white hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>&times;</button>
            </div>
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Revisa las filas antes de confirmar. Se marcarán como duplicadas las cuentas ya registradas.
            </p>

            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm">
                <strong>{parsedRows.length}</strong> filas detectadas — <strong>{Array.from(selectedIds).length}</strong> seleccionadas
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => selectAllValid(true)} className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200">Seleccionar válidos</button>
                <button onClick={() => selectAllValid(false)} className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200">Limpiar selección</button>
              </div>
            </div>

            <div className="max-h-72 overflow-auto border rounded">
              <table className="min-w-full text-sm">
                <thead className={darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-700'}>
                  <tr>
                    <th className="px-3 py-2 text-left">OK</th>
                    <th className="px-3 py-2 text-left">Correo</th>
                    <th className="px-3 py-2 text-left">Nombre</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map(r => (
                    <tr key={r.id} className={darkMode ? 'border-b border-gray-700' : 'border-b border-gray-100'}>
                      <td className="px-3 py-2 align-middle">
                        <input type="checkbox" checked={selectedIds.has(r.id)} disabled={!r.valid || r.duplicateExisting} onChange={() => toggleSelect(r.id)} />
                      </td>
                      <td className="px-3 py-2 align-middle">{r.correo || <span className="text-red-500">(vacío)</span>}</td>
                      <td className="px-3 py-2 align-middle">{r.nombre || <span className="text-red-500">(vacío)</span>}</td>
                      <td className="px-3 py-2 align-middle">
                        {!r.valid ? <span className="text-red-500">{r.reason}</span>
                          : r.duplicateExisting ? <span className="text-yellow-600">Ya existe</span>
                          : r.duplicateInFile ? <span className="text-yellow-600">Duplicado en archivo</span>
                          : <span className="text-green-600">Válido</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={cancelPreview} disabled={uploading} className={`${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-4 py-2 rounded-full text-sm font-medium`}>Cancelar</button>
              <button onClick={confirmImport} disabled={uploading || selectedIds.size === 0} className={`bg-green-700 text-white px-5 py-2 rounded-full text-sm font-medium ${uploading || selectedIds.size === 0 ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-800'}`}>{uploading ? 'Importando…' : 'Confirmar importación'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

UsuariosSection.propTypes = {
  usuarios: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    correo: PropTypes.string.isRequired,
    rol: PropTypes.string.isRequired,
    deleted_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
      PropTypes.oneOf([null])
    ]),
    verificado: PropTypes.bool
  })).isRequired,
  loading: PropTypes.bool,
  onChangeRole: PropTypes.func.isRequired,
  onToggleActive: PropTypes.func.isRequired,
  onDeleteUser: PropTypes.func.isRequired,
  busyUserId: PropTypes.string,
  deletingUserId: PropTypes.string,
  onAddUser: PropTypes.func,
  addingUser: PropTypes.bool,
  onUploadComplete: PropTypes.func
}
