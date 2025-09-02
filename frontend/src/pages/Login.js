import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

// Styled Components with Violet-Black Theme
const LoginContainer = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: ${props => props.theme?.colors?.shine || 'linear-gradient(45deg, transparent 30%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)'};
    animation: shine 8s linear infinite;
    pointer-events: none;
  }
  
  @keyframes shine {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoginCard = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  box-shadow: ${props => props.theme?.shadows?.xl || '0 24px 48px -8px rgba(139, 92, 246, 0.5)'};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: ${props => props.theme?.colors?.reflection || 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'};
  }
  
  &:hover {
    background: ${props => props.theme?.colors?.glassHover || 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 50%, rgba(236, 72, 153, 0.15) 100%)'};
    border-color: ${props => props.theme?.colors?.borderHover || 'rgba(139, 92, 246, 0.6)'};
    box-shadow: ${props => props.theme?.shadows?.glow || '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(99, 102, 241, 0.3), 0 0 60px rgba(236, 72, 153, 0.2)'};
  }
`;

const Logo = styled(motion.div)`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const LogoIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#8b5cf6'}, ${props => props.theme?.colors?.accent || '#ec4899'});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  box-shadow: ${props => props.theme?.shadows?.glow || '0 0 20px rgba(139, 92, 246, 0.4)'};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, ${props => props.theme?.colors?.primary || '#8b5cf6'}, ${props => props.theme?.colors?.secondary || '#6366f1'}, ${props => props.theme?.colors?.accent || '#ec4899'});
    border-radius: 50%;
    z-index: -1;
    filter: blur(8px);
    opacity: 0.7;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  margin: 0;
  text-align: center;
  background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#8b5cf6'}, ${props => props.theme?.colors?.accent || '#ec4899'});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: ${props => props.theme?.colors?.textSecondary || '#e2e8f0'};
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${props => props.theme?.colors?.textSecondary || '#e2e8f0'};
  font-weight: 500;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  background: ${props => props.theme?.colors?.surfaceLight || 'rgba(83, 52, 131, 0.8)'};
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &::placeholder {
    color: ${props => props.theme?.colors?.textMuted || '#cbd5e1'};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
    box-shadow: 0 0 0 3px ${props => props.theme?.colors?.primary || '#8b5cf6'}30;
    background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  }
  
  &:hover {
    border-color: ${props => props.theme?.colors?.borderHover || 'rgba(139, 92, 246, 0.6)'};
  }
`;

const PasswordInput = styled(Input)`
  padding-right: 3rem;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme?.colors?.textMuted || '#cbd5e1'};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
    background: ${props => props.theme?.colors?.hover || 'rgba(139, 92, 246, 0.15)'};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const LoginButton = styled(motion.button)`
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#8b5cf6'}, ${props => props.theme?.colors?.secondary || '#6366f1'});
  color: white;
  border: none;
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.theme?.shadows?.lg || '0 16px 32px -4px rgba(139, 92, 246, 0.4)'};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme?.shadows?.glow || '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(99, 102, 241, 0.3)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const DemoSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  text-align: center;
`;

const DemoTitle = styled.h3`
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`;

const DemoCredentials = styled.p`
  color: ${props => props.theme?.colors?.textSecondary || '#e2e8f0'};
  margin: 0.25rem 0;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
`;

const QuickLoginButton = styled(motion.button)`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  font-weight: 500;
  cursor: pointer;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: ${props => props.theme?.colors?.hover || 'rgba(139, 92, 246, 0.15)'};
    border-color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
    color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
`;

const RegisterText = styled.p`
  color: ${props => props.theme?.colors?.textSecondary || '#e2e8f0'};
  margin-bottom: 1rem;
`;

const RegisterButton = styled(Link)`
  color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme?.borderRadius?.md || '12px'};
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme?.colors?.text || '#f8f9ff'};
    background: ${props => props.theme?.colors?.hover || 'rgba(139, 92, 246, 0.15)'};
  }
`;

const ErrorMessage = styled(motion.div)`
  background: ${props => props.theme?.colors?.error || '#ef4444'}20;
  border: 1px solid ${props => props.theme?.colors?.error || '#ef4444'}40;
  color: ${props => props.theme?.colors?.error || '#ef4444'};
  padding: 1rem;
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  margin-top: 1rem;
  text-align: center;
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setEmail('demo@saferoute.com');
    setPassword('Demo123!');
    toast.success('Demo credentials filled! Click Login to continue.');
  };

  return (
    <LoginContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <LoginCard
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Logo>
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <LogoIcon>🛡️</LogoIcon>
          </motion.div>
          <Title>SafeRoute Navigator</Title>
          <Subtitle>Your Personal Safety Companion</Subtitle>
        </Logo>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <div style={{ position: 'relative' }}>
              <PasswordInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <ToggleButton
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </ToggleButton>
            </div>
          </InputGroup>

          <LoginButton
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </LoginButton>

          {error && (
            <ErrorMessage
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </ErrorMessage>
          )}
        </Form>

        <DemoSection>
          <DemoTitle>🚀 Quick Demo Access</DemoTitle>
          <DemoCredentials>📧 Email: demo@saferoute.com</DemoCredentials>
          <DemoCredentials>🔑 Password: Demo123!</DemoCredentials>
          <QuickLoginButton
            onClick={handleQuickLogin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Fill Demo Credentials
          </QuickLoginButton>
        </DemoSection>

        <RegisterLink>
          <RegisterText>Don't have an account?</RegisterText>
          <RegisterButton to="/register">
            Create Account
          </RegisterButton>
        </RegisterLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login; 