"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { useTheme } from "../../../context/ThemeContext"
import { apiFetch } from '../../../api/client'

export default function ChangePasswordModal({ open, close, onSuccess }) {
  const { darkMode } = useTheme();
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setProcessing(false);
      setError("");
      setSuccess("");
    }
  }, [open])

  if (!open) return null

  const inputClass = darkMode
    ? 'w-full rounded-lg px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100'
    : 'w-full rounded-lg px-3 py-2 border border-gray-300 bg-white text-gray-800'

  const validate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return "Completa todos los campos";
    }
    if (newPassword.length < 8) {
      return "La nueva contraseña debe tener al menos 8 caracteres";
    }
    if (newPassword === currentPassword) {
      return "La nueva contraseña no puede ser igual a la actual";
    }
    if (newPassword !== confirmPassword) {
      return "La confirmación no coincide";
    }
    return "";
  }

  const handleSave = async () => {
    if (processing) return;
    const v = validate();
    if (v) { setError(v); return; }
    setProcessing(true);
    setError("");
    setSuccess("");
    try {
      const resp = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword }
      });
      const data = resp.data ?? null;
      if (!resp.ok || !data?.ok) {
        setError(data?.msg || 'No se pudo cambiar la contraseña');
        setProcessing(false);
        return;
      }
      setSuccess('Contraseña actualizada con éxito');
      if (typeof onSuccess === 'function') onSuccess();
      setTimeout(() => { close(); }, 900);
    } catch (e) {
      setError('Error de red al cambiar la contraseña');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl w-full max-w-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Cambiar contraseña</h3>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Contraseña actual</label>
            <input type="password" className={inputClass} value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nueva contraseña</label>
            <input type="password" className={inputClass} value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
            <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mínimo 8 caracteres.</p>
          </div>
          <div>
            <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirmar nueva contraseña</label>
            <input type="password" className={inputClass} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={close} disabled={processing} className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} px-4 py-2 rounded-full text-sm font-medium ${processing ? 'opacity-60 cursor-not-allowed' : ''}`}>Cancelar</button>
          <button onClick={handleSave} disabled={processing} className={`bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-full text-sm font-medium ${processing ? 'opacity-60 cursor-not-allowed' : ''}`}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

ChangePasswordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
}

