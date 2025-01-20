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
                        <MDBCardTitle>Proximo PQRS a vencer</MDBCardTitle>
                        <MDBTypography tag="h2">
                            {pqrs.length > 0 ? new Date(
                                pqrs.reduce((a, b) => (new Date(a.createdAt) < new Date(b.createdAt) ? a : b)).createdAt
                            ).toLocaleDateString() : "No hay datos"}
                        </MDBTypography>
                    </MDBCardBody>
                </MDBCard>
            </MDBCol>
        </MDBRow>
    );
};

export default PqrsStats;
