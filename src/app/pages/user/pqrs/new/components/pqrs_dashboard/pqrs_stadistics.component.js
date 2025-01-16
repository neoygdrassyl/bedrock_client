import React from 'react';
import { MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle, MDBTypography } from 'mdb-react-ui-kit';

const PqrsStats = ({ pqrs }) => {
    return (
        <MDBRow className="mb-4">
            <MDBCol md="4">
                <MDBCard>
                    <MDBCardBody>
                        <MDBCardTitle>Total PQRS</MDBCardTitle>
                        <MDBTypography tag="h2">{pqrs.length}</MDBTypography>
                    </MDBCardBody>
                </MDBCard>
            </MDBCol>
            <MDBCol md="4">
                <MDBCard>
                    <MDBCardBody>
                        <MDBCardTitle>PQRS Abiertos</MDBCardTitle>
                        <MDBTypography tag="h2">
                            {pqrs.filter(p => p.status === 'ABIERTA').length}
                        </MDBTypography>
                    </MDBCardBody>
                </MDBCard>
            </MDBCol>
            <MDBCol md="4">
                <MDBCard>
                    <MDBCardBody>
                        <MDBCardTitle>Eficiencia Promedio</MDBCardTitle>
                        <MDBTypography tag="h2">0.85</MDBTypography>
                    </MDBCardBody>
                </MDBCard>
            </MDBCol>
        </MDBRow>
    );
};

export default PqrsStats;
