import React from 'react';
import LegalPageLayout from './LegalPageLayout';

const sections = [
  {
    titleKey: 'legal_privacy_section_1_title',
    bodyKeys: ['legal_privacy_section_1_body_1', 'legal_privacy_section_1_body_2'],
  },
  {
    titleKey: 'legal_privacy_section_2_title',
    bodyKeys: ['legal_privacy_section_2_body_1', 'legal_privacy_section_2_body_2'],
  },
  {
    titleKey: 'legal_privacy_section_3_title',
    bodyKeys: ['legal_privacy_section_3_body_1'],
  },
];

const PrivacyPolicyPage = () => (
  <LegalPageLayout
    pageKey="legal_privacy_page"
    titleKey="legal_privacy_title"
    descriptionKey="legal_privacy_desc"
    sections={sections}
    type="privacy"
  />
);

export default PrivacyPolicyPage;
