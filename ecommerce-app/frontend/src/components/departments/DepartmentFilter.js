import React from 'react';
import styled from 'styled-components';
import { Building2, Package, TrendingUp } from 'lucide-react';

const FilterContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;

  h3 {
    margin: 0;
    color: #2d3748;
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

const DepartmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
`;

const DepartmentCard = styled.button`
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border: 2px solid ${props => props.active ? '#667eea' : '#e2e8f0'};
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  
  &:hover {
    border-color: #667eea;
    background: ${props => props.active ? '#5a6fd8' : '#f7fafc'};
    transform: translateY(-2px);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .name {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .count {
    font-size: 0.8rem;
    opacity: 0.8;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

const AllDepartmentsCard = styled(DepartmentCard)`
  border-color: ${props => props.active ? '#38a169' : '#e2e8f0'};
  background: ${props => props.active ? '#38a169' : 'white'};
  
  &:hover {
    border-color: #38a169;
    background: ${props => props.active ? '#2f855a' : '#f0fff4'};
  }
`;

const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const LoadingCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  animation: pulse 1.5s ease-in-out infinite alternate;

  @keyframes pulse {
    0% { opacity: 0.6; }
    100% { opacity: 1; }
  }

  .loading-header {
    height: 20px;
    background: #e2e8f0;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }

  .loading-count {
    height: 14px;
    background: #e2e8f0;
    border-radius: 4px;
    width: 60%;
  }
`;

const DepartmentFilter = ({ 
  departments = [], 
  selectedDepartment, 
  onDepartmentChange,
  isLoading = false 
}) => {
  
  const handleDepartmentClick = (departmentId) => {
    onDepartmentChange(departmentId === selectedDepartment ? null : departmentId);
  };

  if (isLoading) {
    return (
      <FilterContainer>
        <FilterHeader>
          <Building2 size={20} />
          <h3>Shop by Department</h3>
        </FilterHeader>
        <LoadingGrid>
          {Array.from({ length: 6 }, (_, index) => (
            <LoadingCard key={index}>
              <div className="loading-header" />
              <div className="loading-count" />
            </LoadingCard>
          ))}
        </LoadingGrid>
      </FilterContainer>
    );
  }

  if (!departments || departments.length === 0) {
    return null;
  }

  return (
    <FilterContainer>
      <FilterHeader>
        <Building2 size={20} />
        <h3>Shop by Department</h3>
      </FilterHeader>
      
      <DepartmentGrid>
        <AllDepartmentsCard
          active={!selectedDepartment}
          onClick={() => handleDepartmentClick(null)}
        >
          <div className="header">
            <div className="name">All Departments</div>
          </div>
          <div className="count">
            <Package size={12} />
            View all products
          </div>
        </AllDepartmentsCard>

        {departments.map((department) => (
          <DepartmentCard
            key={department.id}
            active={selectedDepartment === department.id}
            onClick={() => handleDepartmentClick(department.id)}
          >
            <div className="header">
              <div className="name">{department.name}</div>
            </div>
            <div className="count">
              <Package size={12} />
              {department.product_count || 0} products
            </div>
          </DepartmentCard>
        ))}
      </DepartmentGrid>
    </FilterContainer>
  );
};

export default DepartmentFilter;
