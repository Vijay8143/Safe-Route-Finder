import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const SettingsContainer = styled(motion.div)`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  text-align: center;
  margin-bottom: 2rem;
`;

const SettingsPlaceholder = styled.div`
  width: 100%;
  height: 400px;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin-bottom: 2rem;
`;

const Settings = () => {
  return (
    <SettingsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title>⚙️ App Settings</Title>
      <SettingsPlaceholder>
        🔧 Configuration & Preferences
      </SettingsPlaceholder>
    </SettingsContainer>
  );
};

export default Settings; 