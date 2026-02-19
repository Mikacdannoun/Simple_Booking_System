import type { ReactNode } from 'react'

type ModalProps = {
  onClose: () => void
  className: string
  children: ReactNode
}

export function Modal({ onClose, className, children }: ModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className={`card ${className}`} onClick={(event) => event.stopPropagation()}>
        {children}
      </section>
    </div>
  )
}
