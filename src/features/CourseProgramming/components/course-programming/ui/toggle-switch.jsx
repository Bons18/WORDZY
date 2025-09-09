"use client"

export default function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full ${checked ? "bg-green-500" : "bg-gray-200"}`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  )
}
