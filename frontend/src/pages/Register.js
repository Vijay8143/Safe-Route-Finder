import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const RegisterContainer = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
`;

const RegisterCard = styled(motion.div)`
  width: 100%;
  max-width: 500px;
  background: ${props => props.theme.colors.surface};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: 2.5rem;
  box-shadow: ${props => props.theme.shadows.xl};
  position: relative;
  overflow: hidden;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Logo = styled(motion.div)`
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: ${props => props.theme.shadows.glow};
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 2rem 0;
  font-size: 0.875rem;
`;

const ProgressBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
`;

const ProgressStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 16px;
    left: 60%;
    width: 80%;
    height: 2px;
    background: ${props => props.isCompleted ? props.theme.colors.primary : props.theme.colors.border};
    transition: all 0.3s ease;
  }
`;

const StepIndicator = styled(motion.div)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.isActive ? props.theme.colors.primary : 
               props.isCompleted ? props.theme.colors.success : props.theme.colors.border};
  color: ${props => props.isActive || props.isCompleted ? 'white' : props.theme.colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.isActive ? props.theme.colors.primary : 'transparent'};
`;

const StepLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => props.isActive ? props.theme.colors.primary : 
            props.isCompleted ? props.theme.colors.success : props.theme.colors.textMuted};
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormStep = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  color: ${props => props.theme.colors.textMuted};
  z-index: 1;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.surfaceLight};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const PasswordInput = styled(Input)`
  padding-right: 48px;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.hover};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled(motion.button)`
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: white;

  &:hover:not(:disabled) {
    box-shadow: ${props => props.theme.shadows.glow};
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled(Button)`
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.textSecondary};
  border: 1px solid ${props => props.theme.colors.border};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.text};
  }
`;

const ErrorMessage = styled(motion.div)`
  background: ${props => props.theme.colors.error}20;
  border: 1px solid ${props => props.theme.colors.error}40;
  color: ${props => props.theme.colors.error};
  padding: 12px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const LinkSection = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const StyledLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primaryHover};
    text-decoration: underline;
  }
`;

const steps = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Account' },
  { id: 3, label: 'Security' }
];

const Register = () => {
  const { theme } = useTheme();
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    emergencyContact: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.phone) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
      case 2:
        if (!formData.email) {
          setError('Please enter your email address');
          return false;
        }
        break;
      case 3:
        if (!formData.password || !formData.confirmPassword) {
          setError('Please enter and confirm your password');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        break;
      default:
        return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      emergency_contact: formData.emergencyContact,
      password: formData.password
    });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormStep
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <InputGroup>
              <Label htmlFor="name">Full Name *</Label>
              <InputWrapper>
                <InputIcon><UserIcon /></InputIcon>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <Label htmlFor="phone">Phone Number *</Label>
              <InputWrapper>
                <InputIcon><PhoneIcon /></InputIcon>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <InputWrapper>
                <InputIcon><ShieldCheckIcon /></InputIcon>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 987-6543"
                />
              </InputWrapper>
            </InputGroup>
          </FormStep>
        );

      case 2:
        return (
          <FormStep
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <InputGroup>
              <Label htmlFor="email">Email Address *</Label>
              <InputWrapper>
                <InputIcon><EnvelopeIcon /></InputIcon>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                />
              </InputWrapper>
            </InputGroup>
          </FormStep>
        );

      case 3:
        return (
          <FormStep
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <InputGroup>
              <Label htmlFor="password">Password *</Label>
              <InputWrapper>
                <InputIcon><ShieldCheckIcon /></InputIcon>
                <PasswordInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </PasswordToggle>
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <InputWrapper>
                <InputIcon><ShieldCheckIcon /></InputIcon>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </PasswordToggle>
              </InputWrapper>
            </InputGroup>
          </FormStep>
        );

      default:
        return null;
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Header>
          <Logo
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            🛡️
          </Logo>
          <Title>Join SafeRoute</Title>
          <Subtitle>Create your account to start your safety journey</Subtitle>
        </Header>

        <ProgressBar>
          {steps.map((step) => (
            <ProgressStep key={step.id} isCompleted={currentStep > step.id}>
              <StepIndicator
                isActive={currentStep === step.id}
                isCompleted={currentStep > step.id}
                whileHover={{ scale: 1.1 }}
              >
                {currentStep > step.id ? '✓' : step.id}
              </StepIndicator>
              <StepLabel
                isActive={currentStep === step.id}
                isCompleted={currentStep > step.id}
              >
                {step.label}
              </StepLabel>
            </ProgressStep>
          ))}
        </ProgressBar>

        {error && (
          <ErrorMessage
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {error}
          </ErrorMessage>
        )}

        <Form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          <ButtonGroup>
            {currentStep > 1 && (
              <SecondaryButton
                type="button"
                onClick={handleBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </SecondaryButton>
            )}
            
            {currentStep < 3 ? (
              <PrimaryButton
                type="button"
                onClick={handleNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Next
              </PrimaryButton>
            ) : (
              <PrimaryButton
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ display: 'inline-block' }}
                  >
                    ⚡
                  </motion.div>
                ) : (
                  'Create Account'
                )}
              </PrimaryButton>
            )}
          </ButtonGroup>
        </Form>

        <LinkSection>
          <p style={{ color: theme.colors.textSecondary, fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
            Already have an account?{' '}
            <StyledLink to="/login">Sign in here</StyledLink>
          </p>
        </LinkSection>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register; 