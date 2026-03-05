-- Architect template editor defaults and backfill
-- Run this after deploying the new editor fields to ensure existing rows include architect customization keys.

update public.business_public_sites
set
  editor_config = jsonb_build_object(
    'architect_show_grid_lines', true,
    'architect_show_shapes', true,
    'architect_motion_intensity', 'medium',
    'architect_contact_layout', 'split',
    'architect_contact_highlight', null,
    'architect_projects_label', null,
    'architect_projects_value', null,
    'architect_years_label', null,
    'architect_years_value', null,
    'architect_disciplines_label', null,
    'architect_disciplines_value', null,
    'architect_process_title', null,
    'architect_process_step1_title', null,
    'architect_process_step1_description', null,
    'architect_process_step2_title', null,
    'architect_process_step2_description', null,
    'architect_process_step3_title', null,
    'architect_process_step3_description', null
  ) || coalesce(editor_config, '{}'::jsonb),
  updated_at = now()
where true;
