import React from 'react';
import styled from 'styled-components';
import { Building2, ChevronRight, Package, TrendingUp } from 'lucide-react';

const SidebarContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 100px;

  @media (max-width: 768px) {
    position: static;
    margin-bottom: 1rem;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    margin: 0;
    color: #2d3748;
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

const DepartmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DepartmentItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: 6px;
  transition: all 0.2s;
  color: ${props => props.active ? '#667eea' : '#4a5568'};
  font-weight: ${props => props.active ? '600' : '500'};

  &:hover {
    background: #f7fafc;
    padding-left: 8px;
    color: #667eea;
  }

  .content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .info {
    flex: 1;
  }

  .name {
    font-size: 0.95rem;
    margin-bottom: 2px;
  }

  .count {
    font-size: 0.8rem;
    opacity: 0.7;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .arrow {
    opacity: ${props => props.active ? '1' : '0'};
    transition: opacity 0.2s;
  }

  &:hover .arrow {
    opacity: 1;
  }
`;

const AllDepartmentsItem = styled(DepartmentItem)`
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 0.5rem;
  padding-bottom: 1rem;
  font-weight: ${props => props.active ? '600' : '600'};
  color: ${props => props.active ? '#38a169' : '#2d3748'};

  &:hover {
    color: #38a169;
  }
`;

const StatsSection = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 0.9rem;
  color: #666;

  .label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .value {
    font-weight: 600;
    color: #2d3748;
  }
`;

const LoadingContainer = styled.div`
  .loading-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 12px 0;
    animation: pulse 1.5s ease-in-out infinite alternate;

    @keyframes pulse {
      0% { opacity: 0.6; }
      100% { opacity: 1; }
    }

    .loading-content {
      flex: 1;
    }

    .loading-name {
      height: 16px;
      background: #e2e8f0;
      border-radius: 4px;
      margin-bottom: 4px;
    }

    .loading-count {
      height: 12px;
      background: #e2e8f0;
      border-radius: 4px;
      width: 60%;
    }
  }
`;

const DepartmentSidebar = ({ 
  departments = [], 
  selectedDepartment, 
  onDepartmentChange,
  isLoading = false,
  stats = null
}) => {
  
  const handleDepartmentClick = (departmentId) => {
    onDepartmentChange(departmentId === selectedDepartment ? null : departmentId);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  if (isLoading) {
    return (
      <SidebarContainer>
        <SidebarHeader>
          <Building2 size={20} />
          <h3>Departments</h3>
        </SidebarHeader>
        <LoadingContainer>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="loading-item">
              <div className="loading-content">
                <div className="loading-name" />
                <div className="loading-count" />
              </div>
            </div>
          ))}
        </LoadingContainer>
      </SidebarContainer>
    );
  }

  return (
    <SidebarContainer>
      <SidebarHeader>
        <Building2 size={20} />
        <h3>Departments</h3>
      </SidebarHeader>
      
      <DepartmentList>
        <AllDepartmentsItem
          active={!selectedDepartment}
          onClick={() => handleDepartmentClick(null)}
        >
          <div className="content">
            <div className="info">
              <div className="name">All Departments</div>
              <div className="count">
                <Package size={10} />
                Browse all products
              </div>
            </div>
          </div>
          <div className="arrow">
            <ChevronRight size={16} />
          </div>
        </AllDepartmentsItem>

        {departments.map((department) => (
          <DepartmentItem
            key={department.id}
            active={selectedDepartment === department.id}
            onClick={() => handleDepartmentClick(department.id)}
          >
            <div className="content">
              <div className="info">
                <div className="name">{department.name}</div>
                <div className="count">
                  <Package size={10} />
                  {formatNumber(department.product_count || 0)} items
                </div>
              </div>
            </div>
            <div className="arrow">
              <ChevronRight size={16} />
            </div>
          </DepartmentItem>
        ))}
      </DepartmentList>

      {stats && (
        <StatsSection>
          <StatItem>
            <div className="label">
              <Building2 size={14} />
              Total Departments
            </div>
            <div className="value">{stats.total_departments || 0}</div>
          </StatItem>
          <StatItem>
            <div className="label">
              <TrendingUp size={14} />
              Avg Products/Dept
            </div>
            <div className="value">{stats.average_products_per_department || 0}</div>
          </StatItem>
        </StatsSection>
      )}
    </SidebarContainer>
  );
};

export default DepartmentSidebar;
