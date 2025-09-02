import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ArrowLeftIcon,
  UserIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Styled Components
const AnalyticsContainer = styled(motion.div)`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const BackButton = styled(motion.button)`
  padding: 0.75rem 1rem;
  background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme?.colors?.hover || 'rgba(139, 92, 246, 0.15)'};
    border-color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
    transform: translateX(-2px);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#8b5cf6'}, ${props => props.theme?.colors?.accent || '#ec4899'});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const AnalyticsGrid = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-bottom: 2rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme?.shadows?.glow || '0 0 20px rgba(139, 92, 246, 0.4)'};
  }
`;

const MetricIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => {
    if (props.variant === 'danger') return `linear-gradient(135deg, ${props.theme?.colors?.error || '#ef4444'}, #dc2626)`;
    if (props.variant === 'warning') return `linear-gradient(135deg, ${props.theme?.colors?.warning || '#f59e0b'}, #d97706)`;
    if (props.variant === 'success') return `linear-gradient(135deg, ${props.theme?.colors?.success || '#10b981'}, #059669)`;
    return `linear-gradient(135deg, ${props.theme?.colors?.primary || '#8b5cf6'}, ${props.theme?.colors?.secondary || '#6366f1'})`;
  }};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 1rem;
  
  svg {
    width: 30px;
    height: 30px;
  }
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#8b5cf6'}, ${props => props.theme?.colors?.accent || '#ec4899'});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

const MetricLabel = styled.div`
  color: ${props => props.theme?.colors?.textSecondary || '#e2e8f0'};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ChartSection = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
  }
`;

const SimpleChart = styled.div`
  height: 300px;
  background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  padding: 1.5rem;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    right: 1.5rem;
    height: 1px;
    background: ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  }
`;

const ChartBar = styled(motion.div)`
  background: linear-gradient(180deg, ${props => props.theme?.colors?.primary || '#8b5cf6'}, ${props => props.theme?.colors?.secondary || '#6366f1'});
  border-radius: 4px 4px 0 0;
  min-width: 40px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .bar-value {
    position: absolute;
    top: -25px;
    color: ${props => props.theme?.colors?.text || '#f8f9ff'};
    font-size: 0.8rem;
    font-weight: 600;
  }
  
  .bar-label {
    position: absolute;
    bottom: -25px;
    color: ${props => props.theme?.colors?.textMuted || '#cbd5e1'};
    font-size: 0.75rem;
    white-space: nowrap;
  }
`;

const InsightsSection = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 2rem;
`;

const InsightCard = styled(motion.div)`
  background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  padding: 1.5rem;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InsightTitle = styled.h4`
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 20px;
    height: 20px;
    color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
  }
`;

const InsightDescription = styled.p`
  color: ${props => props.theme?.colors?.textSecondary || '#e2e8f0'};
  margin: 0;
  line-height: 1.5;
`;

const Analytics = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [metrics, setMetrics] = useState({});
  const [chartData, setChartData] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    // Generate realistic analytics data
    const generateAnalytics = () => {
      // Safety metrics
      const safetyMetrics = {
        totalTrips: 47,
        safeRoutes: 42,
        alertsReceived: 23,
        emergencyCalls: 0,
        avgSafetyScore: 87,
        timeSpent: 125, // minutes
        distanceTraveled: 32.5, // km
        incidentsAvoided: 8
      };

      // Weekly safety data for chart
      const weeklyData = [
        { day: 'Mon', safety: 85, trips: 8 },
        { day: 'Tue', safety: 92, trips: 6 },
        { day: 'Wed', safety: 78, trips: 7 },
        { day: 'Thu', safety: 95, trips: 9 },
        { day: 'Fri', safety: 83, trips: 12 },
        { day: 'Sat', safety: 88, trips: 5 },
        { day: 'Sun', safety: 91, trips: 0 }
      ];

      // Safety insights
      const safetyInsights = [
        {
          id: 1,
          title: 'Peak Safety Hours',
          description: 'Your safest travel times are between 10 AM - 4 PM with 95% safety score. Avoid traveling after 9 PM when possible.',
          icon: ClockIcon
        },
        {
          id: 2,
          title: 'Preferred Safe Routes',
          description: 'You consistently choose routes through well-lit main roads. This has helped you avoid 8 potential incidents this month.',
          icon: MapPinIcon
        },
        {
          id: 3,
          title: 'Alert Response Rate',
          description: 'You respond to 89% of safety alerts within 2 minutes, which is excellent. Quick response helps ensure your safety.',
          icon: ExclamationTriangleIcon
        },
        {
          id: 4,
          title: 'Location Patterns',
          description: 'Your most frequent destinations are considered safe zones. Dashashwamedh Ghat visits show consistent high safety scores.',
          icon: ShieldCheckIcon
        },
        {
          id: 5,
          title: 'Emergency Preparedness',
          description: 'Your emergency contacts are up to date and SOS features are properly configured. Preparedness score: 95%.',
          icon: UserIcon
        }
      ];

      setMetrics(safetyMetrics);
      setChartData(weeklyData);
      setInsights(safetyInsights);
    };

    generateAnalytics();
  }, []);

  const handleMetricClick = (metric, value) => {
    toast(`📊 ${metric}: ${value}\nTap cards for detailed insights!`, {
      duration: 3000,
      style: {
        maxWidth: '300px'
      }
    });
  };

  return (
    <AnalyticsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Header>
        <BackButton
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeftIcon />
          Back to Dashboard
        </BackButton>
        <Title>📊 Safety Analytics & Insights</Title>
      </Header>

      <MetricsGrid>
        <MetricCard
          onClick={() => handleMetricClick('Total Trips', metrics.totalTrips)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <MetricIcon variant="primary">
            <MapPinIcon />
          </MetricIcon>
          <MetricValue>{metrics.totalTrips}</MetricValue>
          <MetricLabel>Total Trips</MetricLabel>
          <MetricChange positive={true}>
            <ArrowTrendingUpIcon />
            +12% this week
          </MetricChange>
        </MetricCard>

        <MetricCard
          onClick={() => handleMetricClick('Safety Score', `${metrics.avgSafetyScore}%`)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <MetricIcon variant="success">
            <ShieldCheckIcon />
          </MetricIcon>
          <MetricValue>{metrics.avgSafetyScore}%</MetricValue>
          <MetricLabel>Avg Safety Score</MetricLabel>
          <MetricChange positive={true}>
            <ArrowTrendingUpIcon />
            +5% improvement
          </MetricChange>
        </MetricCard>

        <MetricCard
          onClick={() => handleMetricClick('Alerts Received', metrics.alertsReceived)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <MetricIcon variant="warning">
            <ExclamationTriangleIcon />
          </MetricIcon>
          <MetricValue>{metrics.alertsReceived}</MetricValue>
          <MetricLabel>Alerts Received</MetricLabel>
          <MetricChange positive={false}>
            <ArrowTrendingDownIcon />
            -8% this week
          </MetricChange>
        </MetricCard>

        <MetricCard
          onClick={() => handleMetricClick('Distance Traveled', `${metrics.distanceTraveled} km`)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <MetricIcon variant="primary">
            <ChartBarIcon />
          </MetricIcon>
          <MetricValue>{metrics.distanceTraveled}</MetricValue>
          <MetricLabel>Distance (km)</MetricLabel>
          <MetricChange positive={true}>
            <ArrowTrendingUpIcon />
            +3.2 km this week
          </MetricChange>
        </MetricCard>
      </MetricsGrid>

      <ChartSection
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <SectionTitle>
          <ChartBarIcon />
          Weekly Safety Trends
        </SectionTitle>
        <SimpleChart>
          {chartData.map((item, index) => (
            <ChartBar
              key={item.day}
              style={{ height: `${(item.safety / 100) * 200}px` }}
              initial={{ height: 0 }}
              animate={{ height: `${(item.safety / 100) * 200}px` }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            >
              <div className="bar-value">{item.safety}%</div>
              <div className="bar-label">{item.day}</div>
            </ChartBar>
          ))}
        </SimpleChart>
      </ChartSection>

      <InsightsSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <SectionTitle>
          <EyeIcon />
          AI Safety Insights
        </SectionTitle>
        {insights.map((insight, index) => (
          <InsightCard
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
            whileHover={{ scale: 1.01 }}
          >
            <InsightTitle>
              <insight.icon />
              {insight.title}
            </InsightTitle>
            <InsightDescription>{insight.description}</InsightDescription>
          </InsightCard>
        ))}
      </InsightsSection>
    </AnalyticsContainer>
  );
};

export default Analytics; 