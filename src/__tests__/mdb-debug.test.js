import React from 'react';
import { render } from '@testing-library/react';
import { MDBBtn, MDBCard, MDBCardBody, MDBCardTitle, MDBBreadcrumb, MDBBreadcrumbItem, MDBTooltip, MDBCol, MDBRow, MDBContainer } from '../app/components/ui';

// Check defaultProps on forwardRef
describe('defaultProps diagnosis', () => {
  it('prints defaultProps', () => {
    console.log('React version:', React.version);
    console.log('MDBBtn.defaultProps:', MDBBtn?.defaultProps);
    console.log('MDBCard.defaultProps:', MDBCard?.defaultProps);
    console.log('MDBBreadcrumb.defaultProps:', MDBBreadcrumb?.defaultProps);
    
    // Check createElement behavior
    const el = React.createElement(MDBCard, null);
    console.log('MDBCard createElement props:', el.props);
    
    const el2 = React.createElement(MDBBtn, null, 'test');
    console.log('MDBBtn createElement props:', el2.props);
    
    expect(true).toBe(true);
  });
  
  it('MDBBtn no props', () => render(<MDBBtn>T</MDBBtn>));
  it('MDBBtn explicit tag', () => render(<MDBBtn tag="button">T</MDBBtn>));
  it('MDBCard no props', () => render(<MDBCard>T</MDBCard>));
  it('MDBCard explicit tag', () => render(<MDBCard tag="div">T</MDBCard>));
  it('MDBCardBody no props', () => render(<MDBCardBody>T</MDBCardBody>));
  it('MDBCardBody explicit tag', () => render(<MDBCardBody tag="div">T</MDBCardBody>));
  it('MDBBreadcrumb no props', () => render(<MDBBreadcrumb>T</MDBBreadcrumb>));
  it('MDBBreadcrumb tag=ol', () => render(<MDBBreadcrumb tag="ol">T</MDBBreadcrumb>));
  it('MDBRow no props', () => render(<MDBRow>T</MDBRow>));
  it('MDBRow tag=div', () => render(<MDBRow tag="div">T</MDBRow>));
  it('MDBCol no props', () => render(<MDBCol>T</MDBCol>));
  it('MDBCol tag=div', () => render(<MDBCol tag="div">T</MDBCol>));
});
