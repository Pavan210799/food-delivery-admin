import { motion } from 'framer-motion'
import DetailModal from '../ui/DetailModal.jsx'
import { DetailBody, DetailHighlightPanel, DetailSection, detailBodyItem } from '../ui/DetailModalParts.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'

const defaultCover =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=75'

function RegisterModalHero({ previewUrl, name }) {
  const src = previewUrl || defaultCover
  return (
    <div className="detail-modal-hero--flush relative h-44 sm:h-48">
      <motion.img
        key={src}
        src={src}
        alt=""
        className="detail-modal-hero-media h-full w-full object-cover"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/88 via-ink/45 to-ink/15" />
      <div className="detail-modal-hero-shine" aria-hidden="true" />
      <div className="absolute right-0 bottom-0 left-0 z-[1] p-5 sm:p-6">
        <p className="text-paper/75 text-[0.65rem] font-extrabold tracking-[0.16em] uppercase">Marlow onboarding</p>
        <h2 id="detail-modal-title" className="font-display mt-1 text-2xl font-bold tracking-tight text-paper sm:text-[1.75rem]">
          Register new kitchen
        </h2>
        <p className="text-paper/90 mt-1 text-sm font-medium">{name.trim() || 'Add a partner kitchen for admin review'}</p>
        <div className="modal-hero-status mt-3">
          <StatusBadge label="Pending approval" tone="gold" onPhoto />
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`register-field ${className}`}>
      <span className="register-field-label">{label}</span>
      {children}
    </label>
  )
}

export default function RegisterRestaurantModal({ open, form, onChange, onClose, onPickImage, onSubmit }) {
  const canSubmit =
    form.name.trim().length >= 2 &&
    form.cuisine.trim().length >= 2 &&
    form.neighborhood.trim().length >= 2 &&
    form.street.trim().length >= 3 &&
    form.ownerName.trim().length >= 2 &&
    form.phone.trim().length >= 8 &&
    form.blurb.trim().length >= 12

  return (
    <DetailModal
      open={open}
      onClose={onClose}
      hero={<RegisterModalHero previewUrl={form.imagePreview} name={form.name} />}
    >
      <DetailBody>
        <DetailSection title="Cover photo">
          <DetailHighlightPanel>
            <div className="register-cover-row">
              <button type="button" className="register-cover-drop" onClick={onPickImage}>
                <span className="register-cover-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M4 16l4.5-4.5a2 2 0 0 1 2.8 0L16 16" strokeLinecap="round" />
                    <path d="M14 7h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="register-cover-text">Upload cover</span>
                <span className="text-muted text-[0.65rem] font-semibold">JPG or PNG · matches customer cards</span>
              </button>
              <Field label="Or paste image URL">
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => onChange({ imageUrl: e.target.value, imagePreview: e.target.value.trim() || form.imagePreview })}
                  placeholder="https://images.unsplash.com/..."
                  className="register-input"
                />
              </Field>
            </div>
          </DetailHighlightPanel>
        </DetailSection>

        <DetailSection title="Kitchen profile">
          <div className="register-form-grid">
            <Field label="Restaurant name">
              <input
                type="text"
                value={form.name}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="e.g. Harbor & Hearth"
                className="register-input"
              />
            </Field>
            <Field label="Cuisine">
              <input
                type="text"
                value={form.cuisine}
                onChange={(e) => onChange({ cuisine: e.target.value })}
                placeholder="e.g. Modern American"
                className="register-input"
              />
            </Field>
            <Field label="Neighborhood">
              <input
                type="text"
                value={form.neighborhood}
                onChange={(e) => onChange({ neighborhood: e.target.value })}
                placeholder="e.g. West Village"
                className="register-input"
              />
            </Field>
            <Field label="Street address">
              <input
                type="text"
                value={form.street}
                onChange={(e) => onChange({ street: e.target.value })}
                placeholder="e.g. 21 Bedford Street"
                className="register-input"
              />
            </Field>
            <Field label="Owner name">
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => onChange({ ownerName: e.target.value })}
                placeholder="Kitchen operator"
                className="register-input"
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                placeholder="+1 212 555 0100"
                className="register-input"
              />
            </Field>
            <Field label="Short blurb" className="register-field--full">
              <textarea
                value={form.blurb}
                onChange={(e) => onChange({ blurb: e.target.value })}
                rows={3}
                placeholder="One or two lines shown on customer cards…"
                className="register-input register-textarea"
              />
            </Field>
          </div>
        </DetailSection>

        <DetailSection title="Commercial">
          <div className="register-form-grid">
            <Field label="Initial commission (%)">
              <input
                type="number"
                min={5}
                max={35}
                step={0.5}
                value={form.commissionPct}
                onChange={(e) => onChange({ commissionPct: e.target.value })}
                className="register-input register-input--narrow"
              />
            </Field>
            <Field label="Default hours">
              <input type="text" value="Mon – Sun · 11:00 – 23:00" readOnly className="register-input register-input--readonly" />
            </Field>
          </div>
        </DetailSection>

        <motion.div className="register-modal-footer" variants={detailBodyItem}>
          <button type="button" onClick={onClose} className="register-btn register-btn--ghost">
            Cancel
          </button>
          <button type="button" disabled={!canSubmit} onClick={onSubmit} className="register-btn register-btn--primary">
            Submit for review
          </button>
        </motion.div>
      </DetailBody>
    </DetailModal>
  )
}
