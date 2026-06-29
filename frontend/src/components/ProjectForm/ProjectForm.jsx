import React, { useState, useMemo } from 'react';
import { FiTag, FiUser, FiMapPin, FiImage } from 'react-icons/fi';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import SelectField from './SelectField';
import DatePickerField from './DatePickerField';
import ImageUploader from './ImageUploader';
import ProgressBar from './ProgressBar';
import ActionButtons from './ActionButtons';
import './ProjectForm.css';

const CATEGORIES = ['Infrastructure', 'Education', 'Health', 'Culture', 'Environment'];
const STATUSES = ['Planned', 'Active', 'On Hold', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function ProjectForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    objectives: '',
    technologies: [],
    responsibles: '',
    location: '',
    category: '',
    startDate: '',
    endDate: '',
    status: '',
    priority: '',
    budget: '',
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const totalFields = 10; // for progress heuristics

  const filledCount = useMemo(() => {
    let n = 0;
    if (form.title) n++;
    if (form.description) n++;
    if (form.technologies.length) n++;
    if (form.location) n++;
    if (form.category) n++;
    if (form.startDate) n++;
    if (form.endDate) n++;
    if (form.status) n++;
    if (form.priority) n++;
    if (form.image) n++;
    return n;
  }, [form]);

  const percent = Math.round((filledCount / totalFields) * 100);

  const validateField = (name, value) => {
    let msg = '';
    if ((name === 'title' || name === 'description') && !value) {
      msg = 'Ce champ est requis.';
    }
    setErrors(prev => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleAddTag = tag => {
    if (!tag) return;
    setForm(prev => ({ ...prev, technologies: Array.from(new Set([...prev.technologies, tag])) }));
  };

  const handleRemoveTag = tag => {
    setForm(prev => ({ ...prev, technologies: prev.technologies.filter(t => t !== tag) }));
  };

  const handleImage = file => setForm(prev => ({ ...prev, image: file }));

  const canSubmit = form.title && form.description && !Object.values(errors).some(Boolean);

  const submit = async e => {
    e.preventDefault();
    if (!canSubmit) {
      validateField('title', form.title);
      validateField('description', form.description);
      return;
    }
    setLoading(true);
    try {
      // simulate submit
      await new Promise(r => setTimeout(r, 800));
      setLoading(false);
      onSubmit && onSubmit(form);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <form className="project-form-container" onSubmit={submit} noValidate>
      <div className="project-form-grid">
        <div className="form-column left">
          <div className="card glass">
            <FormInput
              label="Titre du projet"
              name="title"
              icon={<FiTag />}
              value={form.title}
              onChange={v => handleChange('title', v)}
              error={errors.title}
              required
            />

            <FormTextarea
              label="Description"
              name="description"
              value={form.description}
              onChange={v => handleChange('description', v)}
              error={errors.description}
              required
            />

            <FormTextarea
              label="Objectifs (optionnel)"
              name="objectives"
              value={form.objectives}
              onChange={v => handleChange('objectives', v)}
            />

            <div className="field">
              <label className="field-label">Technologies utilisées</label>
              <div className="tags-input">
                <input
                  className="tag-entry"
                  placeholder="Ajouter une technologie et appuyer sur Entrée"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const v = e.target.value.trim();
                      handleAddTag(v);
                      e.target.value = '';
                    }
                  }}
                  aria-label="Ajouter technologie"
                />
                <div className="tags-list">
                  {form.technologies.map(t => (
                    <button
                      key={t}
                      type="button"
                      className="tag"
                      onClick={() => handleRemoveTag(t)}
                      aria-label={`Supprimer ${t}`}>
                      {t} ×
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <FormInput
              label="Personnes responsables (optionnel)"
              name="responsibles"
              icon={<FiUser />}
              value={form.responsibles}
              onChange={v => handleChange('responsibles', v)}
            />
          </div>
        </div>

        <div className="form-column right">
          <div className="card glass">
            <FormInput
              label="Localisation"
              name="location"
              icon={<FiMapPin />}
              value={form.location}
              onChange={v => handleChange('location', v)}
            />

            <SelectField
              label="Catégorie"
              value={form.category}
              options={CATEGORIES}
              onChange={v => handleChange('category', v)}
            />

            <div className="two-columns">
              <DatePickerField
                label="Date de début"
                value={form.startDate}
                onChange={v => handleChange('startDate', v)}
              />
              <DatePickerField
                label="Date de fin"
                value={form.endDate}
                onChange={v => handleChange('endDate', v)}
              />
            </div>

            <SelectField
              label="Statut du projet"
              value={form.status}
              options={STATUSES}
              onChange={v => handleChange('status', v)}
            />

            <SelectField
              label="Priorité"
              value={form.priority}
              options={PRIORITIES}
              onChange={v => handleChange('priority', v)}
            />

            <FormInput
              label="Budget (optionnel)"
              name="budget"
              value={form.budget}
              onChange={v => handleChange('budget', v)}
              placeholder="Ex: 12000 €"
            />

            <ImageUploader
              label="Image du projet"
              icon={<FiImage />}
              file={form.image}
              onFileChange={handleImage}
            />
          </div>
        </div>
      </div>

      <div className="form-bottom card actions-row">
        <ProgressBar percent={percent} />
        <ActionButtons
          onCancel={onCancel}
          loading={loading}
          disabled={!canSubmit}
        />
      </div>
    </form>
  );
}
