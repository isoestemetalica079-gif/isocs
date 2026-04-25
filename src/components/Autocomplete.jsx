import { useState, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'

export default function Autocomplete({ label, options, value, onChange, onAddNew, placeholder = "Digite para buscar...", filterFn }) {
  const [filtrados, setFiltrados] = useState([])
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState(value || '')
  const ref = useRef(null)

  useEffect(() => {
    if (texto.length > 0) {
      // Se filterFn foi passada, usa ela; senão usa o filtro padrão
      const filtered = filterFn
        ? filterFn(texto)
        : options.filter(opt =>
            opt.toLowerCase().includes(texto.toLowerCase())
          )
      setFiltrados(filtered)
      setAberto(true)
    } else {
      setFiltrados([])
      setAberto(false)
    }
  }, [texto, options, filterFn])

  const handleSelect = (opt) => {
    onChange(opt)
    setTexto(opt) // Mostra a seleção no input
    setAberto(false)
  }

  const handleBlur = () => {
    // Só fecha se não selecionou nada
    setTimeout(() => setAberto(false), 200)
  }

  const handleAddNew = () => {
    if (texto.trim() && !options.includes(texto)) {
      onAddNew(texto)
      handleSelect(texto)
    }
  }

  return (
    <div className="relative">
      <label className="label">{label}</label>
      <div className="relative">
        <input
          ref={ref}
          type="text"
          className="input"
          placeholder={placeholder}
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onFocus={() => texto.length > 0 && setAberto(true)}
          onBlur={handleBlur}
          autoComplete="off"
        />
        {aberto && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {filtrados.length > 0 ? (
              <>
                {filtrados.map(opt => (
                  <div
                    key={opt}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                    onMouseDown={() => handleSelect(opt)}
                  >
                    {opt}
                  </div>
                ))}
                {onAddNew && !options.includes(texto) && texto.trim() && (
                  <div className="border-t border-slate-200 px-4 py-2 text-sm font-medium">
                    <button
                      type="button"
                      onClick={handleAddNew}
                      className="w-full flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus size={16} /> Adicionar "{texto}"
                    </button>
                  </div>
                )}
              </>
            ) : onAddNew && texto.trim() ? (
              <div className="border-t border-slate-200 px-4 py-2 text-sm font-medium">
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="w-full flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus size={16} /> Adicionar "{texto}"
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
