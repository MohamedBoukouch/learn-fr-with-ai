import React from 'react';
import LegalPageLayout from './LegalPageLayout';

const sections = [
  {
    titleKey: 'legal_terms_section_1_title',
    bodyKeys: ['legal_terms_section_1_body_1', 'legal_terms_section_1_body_2'],
  },
  {
    titleKey: 'legal_terms_section_2_title',
    bodyKeys: ['legal_terms_section_2_body_1'],
  },
  {
    titleKey: 'legal_terms_section_3_title',
    bodyKeys: ['legal_terms_section_3_body_1'],
  },
];

const TermsOfServicePage = () => (
  <LegalPageLayout
    pageKey="legal_terms_page"
    titleKey="legal_terms_title"
    descriptionKey="legal_terms_desc"
    sections={sections}
    type="terms"
  />
);

export default TermsOfServicePage;
