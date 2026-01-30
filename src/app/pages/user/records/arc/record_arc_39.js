// // Importaciones
// import React, { Component } from 'react';
// import { Tabs, Tab, Modal, Button, Form, Table } from 'react-bootstrap';
// import Swal from 'sweetalert2';
// import withReactContent from 'sweetalert2-react-content';
// import RECORD_ARCSERVICE from '../../../../services/record_arc.service';
// import { MDBIcon } from 'mdbreact';

// const MySwal = withReactContent(Swal);

// class RECORD_ARC_39 extends Component {
//   state = {
//     // Datos principales
//     predios: [],
//     points: [],
//     boundariesMap: {},
//     editPredioId: null,
    
//     // Estados de modales
//     modals: {
//       createPredio: false,
//       editPredio: false,
//       editBoundary: false,
//       createPoint: false,
//       viewPoints: false,
//     },
    
//     // Datos para formularios
//     newPredio: { 
//       name: '', 
//       area: '', 
//       is_main: 0 
//     },
//     editingPredio: null,
//     editingBoundary: null,
//     selectedBoundaryIndex: null,
//     newPoint: {
//       label: '',
//       coord_x: '',
//       coord_y: ''
//     },
    
//     // Estados para formularios inline
//     showBoundaryForm: {},
//     inlineBoundaryValues: {},
//   };

//   componentDidMount() {
//     this.loadRA39Data();
    
//     const style = document.createElement("style");
//     style.innerHTML = `
//       .equal-width-table th,
//       .equal-width-table td {
//         width: 12.5%;
//         text-align: center;
//         vertical-align: middle;
//       }
//     `;
//     document.head.appendChild(style);
//   }

//   loadRA39Data = () => {
//     const { currentRecord } = this.props;
//     const ra39 = currentRecord.record_arc_39 || [];
//     const points = currentRecord.boundary_points || [];
//     const boundariesMap = {};
//     console.log("Cargando RA39 data:", ra39);
//     console.log("Cargando RA39 data:", ra39);
//     console.log("Cargando RA39 data:", ra39);
//     console.log("Cargando RA39 data:", ra39);
//     console.log("Cargando RA39 data:", ra39);
//     console.log("Cargando RA39 data:", ra39);
//     console.log("Cargando RA39 data:", ra39);
//     console.log("Cargando RA39 data:", ra39);
//     console.log("Todos los records: ",currentRecord);
    
    
//     ra39.forEach(predio => {
//       boundariesMap[predio.id] = predio.boundaries || [];
//     });
    
//     this.setState({
//       predios: ra39,
//       points: points,
//       boundariesMap,
//       editPredioId: ra39.length > 0 ? ra39[0].id : null,
//       showBoundaryForm: {},
//       inlineBoundaryValues: {},
//     });
//   };

//   // ==========================================
//   // GESTIÓN DE MODALES - BUENAS PRÁCTICAS
//   // ==========================================

//   // Función genérica para abrir/cerrar modales
//   toggleModal = (modalName, isOpen = null) => {
//     this.setState(prev => ({
//       modals: {
//         ...prev.modals,
//         [modalName]: isOpen !== null ? isOpen : !prev.modals[modalName]
//       }
//     }));
//   };

//   // Función para resetear datos al cerrar modales
//   resetModalData = (modalType) => {
//     const resetData = {};
    
//     switch (modalType) {
//       case 'createPredio':
//         resetData.newPredio = { name: '', area: '', is_main: 0 };
//         break;
//       case 'editPredio':
//         resetData.editingPredio = null;
//         break;
//       case 'editBoundary':
//         resetData.editingBoundary = null;
//         resetData.selectedBoundaryIndex = null;
//         break;
//       case 'createPoint':
//         resetData.newPoint = { label: '', coord_x: '', coord_y: '' };
//         break;
//     }
    
//     this.setState(resetData);
//   };

//   // ==========================================
//   // MODAL CREAR PREDIO
//   // ==========================================

//   openCreatePredioModal = () => {
//     this.resetModalData('createPredio');
//     this.toggleModal('createPredio', true);
//   };

//   closeCreatePredioModal = () => {
//     this.toggleModal('createPredio', false);
//     this.resetModalData('createPredio');
//   };

//   handleNewPredioChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     const fieldValue = type === 'checkbox' ? (checked ? 1 : 0) : value;
    
//     this.setState(prev => ({
//       newPredio: { 
//         ...prev.newPredio, 
//         [name]: fieldValue 
//       }
//     }));
//   };

//   handleCreatePredio = () => {
//     const { currentRecord, currentVersionR, swaMsg } = this.props;
//     const { newPredio } = this.state;

//     // Validación básica
//     if (!newPredio.name.trim() || !newPredio.area.trim()) {
//       MySwal.fire({ 
//         title: 'Error', 
//         text: 'Por favor complete todos los campos obligatorios',
//         icon: 'warning' 
//       });
//       return;
//     }

//     const formData = new FormData();
//     formData.append('name', newPredio.name.trim());
//     formData.append('area', newPredio.area);
//     formData.append('is_main', newPredio.is_main === 1);
//     formData.append('version', currentVersionR);
//     formData.append('check', 0);
//     formData.append('recordArcId', currentRecord.id);

//     RECORD_ARCSERVICE.create_arc_39(formData)
//       .then(response => {
//         if (response.data === 'OK') {
//           MySwal.fire({ 
//             title: swaMsg.publish_success_title, 
//             icon: 'success' 
//           });
//           this.props.requestUpdateRecord(this.props.currentItem.id);
//           this.closeCreatePredioModal();
//           this.loadRA39Data();
//         } else {
//           throw new Error('Error en la respuesta del servidor');
//         }
//       })
//       .catch(() => {
//         MySwal.fire({ 
//           title: swaMsg.generic_eror_title, 
//           icon: 'error' 
//         });
//       });
//   };

//   // ==========================================
//   // MODAL CREAR PUNTO
//   // ==========================================

//   openCreatePointModal = () => {
//     this.resetModalData('createPoint');
//     this.toggleModal('createPoint', true);
//   };

//   closeCreatePointModal = () => {
//     this.toggleModal('createPoint', false);
//     this.resetModalData('createPoint');
//   };

//   handleNewPointChange = (e) => {
//     const { name, value } = e.target;
    
//     this.setState(prev => ({
//       newPoint: { 
//         ...prev.newPoint, 
//         [name]: value 
//       }
//     }));
//   };

//   handleCreatePoint = () => {
//     const { currentRecord, currentVersionR, swaMsg } = this.props;
//     const { newPoint } = this.state;

//     // Validación básica
//     if (!newPoint.label.trim() || !newPoint.coord_x || !newPoint.coord_y) {
//       MySwal.fire({ 
//         title: 'Error', 
//         text: 'Por favor complete todos los campos obligatorios',
//         icon: 'warning' 
//       });
//       return;
//     }

//     const formData = new FormData();
//     formData.append('label', newPoint.label.trim());
//     formData.append('coord_x', parseFloat(newPoint.coord_x));
//     formData.append('coord_y', parseFloat(newPoint.coord_y));
//     formData.append('recordArcId', currentRecord.id);

//     RECORD_ARCSERVICE.create_arc_39_point(formData)
//       .then(response => {
//         if (response.data === 'OK') {
//           MySwal.fire({ 
//             title: swaMsg.publish_success_title, 
//             icon: 'success' 
//           });
//           this.props.requestUpdateRecord(this.props.currentItem.id);
//           this.closeCreatePointModal();
//           this.loadRA39Data();
//         } else {
//           alert(response.data);
//           throw new Error('Error en la respuesta del servidor');
//         }
//       })
//       .catch(() => {
//         MySwal.fire({ 
//           title: swaMsg.generic_eror_title, 
//           icon: 'error' 
//         });
//       });
//   };

//   // Función para abrir el modal de puntos
//   openViewPointsModal = () => {
//     this.toggleModal('viewPoints', true);
//   };

//   // Función para cerrar el modal de puntos
//   closeViewPointsModal = () => {
//     this.toggleModal('viewPoints', false);
//   };


//   openEditPredioModal = (predio) => {
//     this.setState({ 
//       editingPredio: { ...predio } 
//     });
//     this.toggleModal('editPredio', true);
//   };

//   closeEditPredioModal = () => {
//     this.toggleModal('editPredio', false);
//     this.resetModalData('editPredio');
//   };

//   handleEditPredioChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     const fieldValue = type === 'checkbox' ? checked : value;
    
//     this.setState(prev => ({
//       editingPredio: { 
//         ...prev.editingPredio, 
//         [name]: fieldValue 
//       }
//     }));
//   };

//   handleUpdatePredio = () => {
//     const { currentVersionR, swaMsg } = this.props;
//     const { editingPredio } = this.state;

//     // Validación básica
//     if (!editingPredio.name.trim() || !editingPredio.area.toString().trim()) {
//       MySwal.fire({ 
//         title: 'Error', 
//         text: 'Por favor complete todos los campos obligatorios',
//         icon: 'warning' 
//       });
//       return;
//     }

//     const formData = new FormData();
//     formData.append('id', editingPredio.id);
//     formData.append('name', editingPredio.name.trim());
//     formData.append('area', editingPredio.area);
//     formData.append('is_main', editingPredio.is_main);
//     formData.append('version', currentVersionR);

//     RECORD_ARCSERVICE.update_arc_39(formData)
//       .then(response => {
//         if (response.data === 'OK') {
//           MySwal.fire({ 
//             title: swaMsg.publish_success_title, 
//             icon: 'success' 
//           });
//           this.props.requestUpdateRecord(this.props.currentItem.id);
//           this.closeEditPredioModal();
//           this.loadRA39Data();
//         } else {
//           throw new Error('Error en la respuesta del servidor');
//         }
//       })
//       .catch(() => {
//         MySwal.fire({ 
//           title: swaMsg.generic_eror_title, 
//           icon: 'error' 
//         });
//       });
//   };

//   // ==========================================
//   // MODAL EDITAR LINDERO
//   // ==========================================

//   openEditBoundaryModal = (boundary, index) => {
//     this.setState({
//       editingBoundary: { ...boundary },
//       selectedBoundaryIndex: index
//     });
//     this.toggleModal('editBoundary', true);
//   };

//   closeEditBoundaryModal = () => {
//     this.toggleModal('editBoundary', false);
//     this.resetModalData('editBoundary');
//   };

//   handleEditBoundaryChange = (e) => {
//     const { name, value } = e.target;
    
//     this.setState(prev => ({
//       editingBoundary: { 
//         ...prev.editingBoundary, 
//         [name]: value 
//       }
//     }));
//   };

//   handleUpdateBoundary = () => {
//     const { currentVersionR, swaMsg } = this.props;
//     const { editingBoundary } = this.state;

//     // Validación básica
//     if (!editingBoundary.lindero_number || !editingBoundary.distance || !editingBoundary.direction) {
//       MySwal.fire({ 
//         title: 'Error', 
//         text: 'Por favor complete todos los campos obligatorios',
//         icon: 'warning' 
//       });
//       return;
//     }

//     const formData = new FormData();
//     Object.keys(editingBoundary).forEach(key => {
//       formData.append(key, editingBoundary[key]);
//     });
//     formData.append('version', currentVersionR);

//     RECORD_ARCSERVICE.update_arc_39_boundary(formData)
//       .then(response => {
//         if (response.data === 'OK') {
//           MySwal.fire({ 
//             title: swaMsg.publish_success_title, 
//             icon: 'success' 
//           });
//           this.props.requestUpdateRecord(this.props.currentItem.id);
//           this.closeEditBoundaryModal();
//           this.loadRA39Data();
//         } else {
//           throw new Error('Error en la respuesta del servidor');
//         }
//       })
//       .catch(() => {
//         MySwal.fire({ 
//           title: swaMsg.generic_eror_title, 
//           icon: 'error' 
//         });
//       });
//   };

//   // ==========================================
//   // CREAR LINDERO
//   // ==========================================

//   handleCreateBoundary = (e, predioId) => {
//     e.preventDefault();
//     const form = e.target;
//     const { currentVersionR, swaMsg } = this.props;

//     const formData = new FormData(form);
//     formData.append('record_arc_39_subdivision_id', predioId);
//     formData.append('version', currentVersionR);
//     formData.append('check', 0);

//     RECORD_ARCSERVICE.create_arc_39_boundary(formData)
//       .then(response => {
//         if (response.data === 'OK') {
//           MySwal.fire({ 
//             title: swaMsg.publish_success_title, 
//             icon: 'success' 
//           });
//           this.props.requestUpdateRecord(this.props.currentItem.id);
//           this.loadRA39Data();
//           form.reset(); // Limpiar formulario
//         } else {
//           throw new Error('Error en la respuesta del servidor');
//         }
//       })
//       .catch(() => {
//         MySwal.fire({ 
//           title: swaMsg.generic_eror_title, 
//           icon: 'error' 
//         });
//       });
//   };

//   // ==========================================
//   // FORMULARIO INLINE LINDEROS
//   // ==========================================

//   toggleBoundaryForm = (predioId, index) => {
//     const key = `${predioId}-${index}`;
//     this.setState(prev => {
//       const current = prev.showBoundaryForm[key];
//       const newShow = !current;

//       const prevBoundary = prev.boundariesMap[predioId]?.[index];
//       const newInlineValues = { ...prev.inlineBoundaryValues };

//       if (newShow && prevBoundary) {
//         newInlineValues[key] = {
//           start_point_label: prevBoundary.end_point_label || '',
//           start_point_x: prevBoundary.end_point_x || '',
//           start_point_y: prevBoundary.end_point_y || ''
//         };
//       } else {
//         delete newInlineValues[key];
//       }

//       return {
//         showBoundaryForm: { ...prev.showBoundaryForm, [key]: newShow },
//         inlineBoundaryValues: newInlineValues
//       };
//     });
//   };

//   renderPointsOptions() {
//     const { points } = this.state;

//     return points.map((point) => (
//       <option key={point.id} value={point.label}>
//         {point.label} ({point.coord_x}, {point.coord_y})
//       </option>
//     ));
//   }

//   // ==========================================
//   // RENDER
//   // ==========================================

//   render() {
//     const {
//       predios, 
//       boundariesMap, 
//       showBoundaryForm,
//       inlineBoundaryValues, 
//       modals,
//       newPredio,
//       editingPredio,
//       editingBoundary,
//       newPoint
//     } = this.state;

//     return (
//       <>
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h4>Gestión de Predios</h4>
//           <div>
//             <Button 
//               variant="success"
//               size="sm" 
//               className="me-2" 
//               onClick={this.openCreatePredioModal}
//             >
//               <MDBIcon icon="plus-square" className="me-1" />Crear Predio
//             </Button>
//             <Button 
//               size="sm" 
//               variant="outline-info"
//               className="me-2" 
//               onClick={this.openCreatePointModal}
//             >
//               <MDBIcon icon="plus-square" className="me-1" /> Crear Punto
//             </Button>
//             <Button
//               size="sm"
//               variant="outline-info"
//               onClick={this.openViewPointsModal}
//             >
//               <MDBIcon icon="list" className="me-1" /> Ver Puntos
//             </Button>
//           </div>
//         </div>

//         <Tabs defaultActiveKey={predios[0]?.id} id="predios-tabs" className="mb-3">
//           {predios.map((predio) => (
//             <Tab eventKey={predio.id} title={predio.name} key={predio.id}>
//               <div className="d-flex justify-content-between align-items-center mb-2">
//                 <h5>
//                   Predio {predio.name} ({predio.area} m²) 
//                   {predio.is_main ? " (Principal)" : ""}
//                 </h5>
//                 <div>
//                   <Button 
//                     size="sm" 
//                     variant="outline-secondary" 
//                     onClick={() => this.openEditPredioModal(predio)}
//                   >
//                     <MDBIcon far icon="edit" /> Editar Predio
//                   </Button>
//                 </div>
//               </div>

//               <Table bordered className="equal-width-table">
//                 <thead>
//                   <tr>
//                     <th>Lindero</th>
//                     <th>Punto Inicial</th>
//                     <th>Punto Final</th>
//                     <th>Distancia</th>
//                     <th>Rumbo</th>
//                     <th>Colindante</th>
//                     <th>Observación</th>
//                     <th>Acciones</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {boundariesMap[predio.id]?.length === 0 && (
//                     <tr>
//                       <td colSpan={8} className="p-0">
//                         <Form onSubmit={(e) => this.handleCreateBoundary(e, predio.id)}>
//                           <Table className="mb-0" borderless>
//                             <tbody>
//                               <tr>
//                                 <td className="align-top p-1">
//                                   <Form.Control 
//                                     name="lindero_number" 
//                                     placeholder="#" 
//                                     size="sm"
//                                     required 
//                                   />
//                                 </td>
//                                 <td className="align-top p-1">
//                                   <Form.Control
//                                     as="select"
//                                     name="start_point_label"
//                                     size="sm"
//                                     required
//                                     // defaultValue={inlineVals.start_point_label || ''}
//                                   >
//                                     <option value="">Seleccionar punto</option>
//                                     {this.renderPointsOptions()}
//                                   </Form.Control>
//                                 </td>
//                                 <td className="align-top p-1">
//                                   <Form.Control
//                                     as="select"
//                                     name="end_point_label"
//                                     size="sm"
//                                     required
//                                     // defaultValue={inlineVals.end_point_label || ''}
//                                   >
//                                     <option value="">Seleccionar punto</option>
//                                     {this.renderPointsOptions()}
//                                   </Form.Control>
//                                 </td>
//                                 <td className="align-top p-1">
//                                   <Form.Control 
//                                     name="distance" 
//                                     placeholder="Distancia" 
//                                     size="sm"
//                                     required 
//                                   />
//                                 </td>
//                                 <td className="align-top p-1">
//                                   <Form.Control 
//                                     name="direction" 
//                                     placeholder="Dirección" 
//                                     size="sm"
//                                     required 
//                                   />
//                                 </td>
//                                 <td className="align-top p-1">
//                                   <Form.Control 
//                                     name="colindant" 
//                                     placeholder="Colindante" 
//                                     size="sm"
//                                     required 
//                                   />
//                                 </td>
//                                 <td className="align-top p-1">
//                                   <Form.Control 
//                                     name="observation" 
//                                     placeholder="Observación" 
//                                     size="sm"
//                                   />
//                                 </td>
//                                 <td className="align-top p-1">
//                                   <Button type="submit" variant="primary" size="sm" className="w-100">
//                                     Agregar
//                                   </Button>
//                                 </td>
//                               </tr>
//                             </tbody>
//                           </Table>
//                         </Form>
//                       </td>
//                     </tr>
//                   )}

//                   {boundariesMap[predio.id]?.map((boundary, index) => {
//                     const key = `${predio.id}-${index}`;
//                     const inlineVals = inlineBoundaryValues[key] || {};
                    
//                     return (
//                       <React.Fragment key={index}>
//                         <tr>
//                           <td>{boundary.lindero_number}</td>
//                           <td>
//                             {boundary.start_point_label} 
//                             ({boundary.start_point_x}, {boundary.start_point_y})
//                           </td>
//                           <td>
//                             {boundary.end_point_label} 
//                             ({boundary.end_point_x}, {boundary.end_point_y})
//                           </td>
//                           <td>{boundary.distance}</td>
//                           <td>{boundary.direction}</td>
//                           <td>{boundary.colindant}</td>
//                           <td>{boundary.observation}</td>
//                           <td>
//                             <Button 
//                               size="sm" 
//                               variant="outline-primary"
//                               onClick={() => this.toggleBoundaryForm(predio.id, index)}
//                               className="me-1"
//                             >
//                               <MDBIcon fas icon="plus" />
//                             </Button>
//                             <Button 
//                               size="sm" 
//                               variant="outline-secondary" 
//                               onClick={() => this.openEditBoundaryModal(boundary, index)}
//                             >
//                               <MDBIcon far icon="edit" />
//                             </Button>
//                           </td>
//                         </tr>
                        
//                         {showBoundaryForm[key] && (
//                           <tr>
//                           <td colSpan={8} className="p-0">
//                             <Form onSubmit={(e) => this.handleCreateBoundary(e, predio.id)}>
//                               <Table borderless className="mb-0">
//                                 <tbody>
//                                   <tr>
//                                     <td className="align-top p-1">
//                                       <Form.Control
//                                         name="lindero_number"
//                                         placeholder="#"
//                                         size="sm"
//                                         required
//                                         defaultValue={inlineVals.lindero_number || ''}
//                                       />
//                                     </td>
//                                     <td className="align-top p-1">
//                                       <Form.Control
//                                         as="select"
//                                         name="start_point_label"
//                                         size="sm"
//                                         required
//                                         defaultValue={inlineVals.start_point_label || ''}
//                                       >
//                                         <option value="">Seleccionar punto</option>
//                                         {this.renderPointsOptions()}
//                                       </Form.Control>
//                                     </td>
//                                     <td className="align-top p-1">
//                                       <Form.Control
//                                         as="select"
//                                         name="end_point_label"
//                                         size="sm"
//                                         required
//                                         defaultValue={inlineVals.end_point_label || ''}
//                                       >
//                                         <option value="">Seleccionar punto</option>
//                                         {this.renderPointsOptions()}
//                                       </Form.Control>
//                                     </td>
//                                     <td className="align-top p-1">
//                                       <Form.Control
//                                         name="distance"
//                                         placeholder="Distancia"
//                                         size="sm"
//                                         required
//                                         defaultValue={inlineVals.distance || ''}
//                                       />
//                                     </td>
//                                     <td className="align-top p-1">
//                                       <Form.Control
//                                         name="direction"
//                                         placeholder="Dirección"
//                                         size="sm"
//                                         required
//                                         defaultValue={inlineVals.direction || ''}
//                                       />
//                                     </td>
//                                     <td className="align-top p-1">
//                                       <Form.Control
//                                         name="colindant"
//                                         placeholder="Colindante"
//                                         size="sm"
//                                         required
//                                         defaultValue={inlineVals.colindant || ''}
//                                       />
//                                     </td>
//                                     <td className="align-top p-1">
//                                       <Form.Control
//                                         name="observation"
//                                         placeholder="Observación"
//                                         size="sm"
//                                         defaultValue={inlineVals.observation || ''}
//                                       />
//                                     </td>
//                                     <td className="align-top p-1">
//                                       <div className="d-flex flex-column gap-1">
//                                         <Button type="submit" variant="primary" size="sm" className="w-100">
//                                           Guardar
//                                         </Button>
//                                         <Button
//                                           type="button"
//                                           variant="secondary"
//                                           size="sm"
//                                           className="w-100"
//                                           onClick={() => this.toggleBoundaryForm(predio.id, index)}
//                                         >
//                                           Cancelar
//                                         </Button>
//                                       </div>
//                                     </td>
//                                   </tr>
//                                 </tbody>
//                               </Table>
//                             </Form>
//                           </td>
//                         </tr>
//                         )}
//                       </React.Fragment>
//                     );
//                   })}
//                 </tbody>
//               </Table>
//             </Tab>
//           ))}
//         </Tabs>

//         {/* ==========================================
//             MODAL CREAR PREDIO
//             ========================================== */}
//         <Modal 
//           show={modals.createPredio} 
//           onHide={this.closeCreatePredioModal}
//           backdrop="static"
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Crear Predio</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form>
//               <Form.Group className="mb-3">
//                 <Form.Label>Nombre *</Form.Label>
//                 <Form.Control 
//                   name="name" 
//                   value={newPredio.name} 
//                   onChange={this.handleNewPredioChange}
//                   placeholder="Ingrese el nombre del predio"
//                   required 
//                 />
//               </Form.Group>
              
//               <Form.Group className="mb-3">
//                 <Form.Label>Área (m²) *</Form.Label>
//                 <Form.Control 
//                   name="area" 
//                   type="number"
//                   step="0.01"
//                   value={newPredio.area} 
//                   onChange={this.handleNewPredioChange}
//                   placeholder="Ingrese el área en metros cuadrados"
//                   required 
//                 />
//               </Form.Group>
              
//               <Form.Group className="mb-3">
//                 <Form.Check 
//                   type="checkbox"
//                   label="¿Es el predio de mayor extension?" 
//                   name="is_main" 
//                   checked={newPredio.is_main === 1} 
//                   onChange={this.handleNewPredioChange}
//                 />
//               </Form.Group>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button 
//               variant="secondary" 
//               onClick={this.closeCreatePredioModal}
//             >
//               Cancelar
//             </Button>
//             <Button 
//               variant="primary" 
//               onClick={this.handleCreatePredio}
//             >
//               Crear Predio
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         {/* ==========================================
//             MODAL EDITAR PREDIO
//             ========================================== */}
//         <Modal 
//           show={modals.editPredio} 
//           onHide={this.closeEditPredioModal}
//           backdrop="static"
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Editar Predio</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             {editingPredio && (
//               <Form>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Nombre *</Form.Label>
//                   <Form.Control
//                     name="name"
//                     value={editingPredio.name || ""}
//                     onChange={this.handleEditPredioChange}
//                     placeholder="Ingrese el nombre del predio"
//                     required
//                   />
//                 </Form.Group>
                
//                 <Form.Group className="mb-3">
//                   <Form.Label>Área (m²) *</Form.Label>
//                   <Form.Control
//                     name="area"
//                     type="number"
//                     step="0.01"
//                     value={editingPredio.area || ""}
//                     onChange={this.handleEditPredioChange}
//                     placeholder="Ingrese el área en metros cuadrados"
//                     required
//                   />
//                 </Form.Group>
                
//                 <Form.Group className="mb-3">
//                   <Form.Check
//                     type="checkbox"
//                     label="¿Es el predio de mayor extension?"
//                     name="is_main"
//                     checked={editingPredio.is_main || false}
//                     onChange={this.handleEditPredioChange}
//                   />
//                 </Form.Group>
//               </Form>
//             )}
//           </Modal.Body>
//           <Modal.Footer>
//             <Button 
//               variant="secondary" 
//               onClick={this.closeEditPredioModal}
//             >
//               Cancelar
//             </Button>
//             <Button 
//               variant="primary" 
//               onClick={this.handleUpdatePredio}
//             >
//               Guardar Cambios
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         {/* ==========================================
//             MODAL EDITAR LINDERO
//             ========================================== */}
//         <Modal 
//           show={modals.editBoundary} 
//           onHide={this.closeEditBoundaryModal}
//           backdrop="static"
//           size="lg"
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Editar Lindero</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             {editingBoundary && (
//               <Form>
//                 <div className="row">
//                   <div className="col-md-6">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Número de Lindero *</Form.Label>
//                       <Form.Control
//                         name="lindero_number"
//                         value={editingBoundary.lindero_number || ""}
//                         onChange={this.handleEditBoundaryChange}
//                         required
//                       />
//                     </Form.Group>
//                   </div>
//                   <div className="col-md-6">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Distancia *</Form.Label>
//                       <Form.Control
//                         name="distance"
//                         value={editingBoundary.distance || ""}
//                         onChange={this.handleEditBoundaryChange}
//                         required
//                       />
//                     </Form.Group>
//                   </div>
//                 </div>

//                 <div className="row">
//                   <div className="col-md-6">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Dirección *</Form.Label>
//                       <Form.Control
//                         name="direction"
//                         value={editingBoundary.direction || ""}
//                         onChange={this.handleEditBoundaryChange}
//                         required
//                       />
//                     </Form.Group>
//                   </div>
//                   <div className="col-md-6">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Colindante *</Form.Label>
//                       <Form.Control
//                         name="colindant"
//                         value={editingBoundary.colindant || ""}
//                         onChange={this.handleEditBoundaryChange}
//                         required
//                       />
//                     </Form.Group>
//                   </div>
//                 </div>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Observación</Form.Label>
//                   <Form.Control
//                     as="textarea"
//                     rows={2}
//                     name="observation"
//                     value={editingBoundary.observation || ""}
//                     onChange={this.handleEditBoundaryChange}
//                   />
//                 </Form.Group>

//                 <hr />
//                 <h6>Punto Inicial</h6>
//                 <div className="row">
//                   <div className="col-md-4">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Etiqueta</Form.Label>
//                       <Form.Control
//                         name="start_point_label"
//                         value={editingBoundary.start_point_label || ""}
//                         onChange={this.handleEditBoundaryChange}
//                       />
//                     </Form.Group>
//                   </div>
//                   <div className="col-md-4">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Coordenada X</Form.Label>
//                       <Form.Control
//                         name="start_point_x"
//                         type="number"
//                         step="0.000001"
//                         value={editingBoundary.start_point_x || ""}
//                         onChange={this.handleEditBoundaryChange}
//                       />
//                     </Form.Group>
//                   </div>
//                   <div className="col-md-4">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Coordenada Y</Form.Label>
//                       <Form.Control
//                         name="start_point_y"
//                         type="number"
//                         step="0.000001"
//                         value={editingBoundary.start_point_y || ""}
//                         onChange={this.handleEditBoundaryChange}
//                       />
//                     </Form.Group>
//                   </div>
//                 </div>

//                 <h6>Punto Final</h6>
//                 <div className="row">
//                   <div className="col-md-4">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Etiqueta</Form.Label>
//                       <Form.Control
//                         name="end_point_label"
//                         value={editingBoundary.end_point_label || ""}
//                         onChange={this.handleEditBoundaryChange}
//                       />
//                     </Form.Group>
//                   </div>
//                   <div className="col-md-4">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Coordenada X</Form.Label>
//                       <Form.Control
//                         name="end_point_x"
//                         type="number"
//                         step="0.000001"
//                         value={editingBoundary.end_point_x || ""}
//                         onChange={this.handleEditBoundaryChange}
//                       />
//                     </Form.Group>
//                   </div>
//                   <div className="col-md-4">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Coordenada Y</Form.Label>
//                       <Form.Control
//                         name="end_point_y"
//                         type="number"
//                         step="0.000001"
//                         value={editingBoundary.end_point_y || ""}
//                         onChange={this.handleEditBoundaryChange}
//                       />
//                     </Form.Group>
//                   </div>
//                 </div>
//               </Form>
//             )}
//           </Modal.Body>
//           <Modal.Footer>
//             <Button 
//               variant="secondary" 
//               onClick={this.closeEditBoundaryModal}
//             >
//               Cancelar
//             </Button>
//             <Button 
//               variant="primary" 
//               onClick={this.handleUpdateBoundary}
//             >
//               Guardar Cambios
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         {/* ==========================================
//             MODAL CREAR PUNTO
//             ========================================== */}
//         <Modal 
//           show={modals.createPoint} 
//           onHide={this.closeCreatePointModal}
//           backdrop="static"
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Crear Punto</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form>
//               <Form.Group className="mb-3">
//                 <Form.Label>Etiqueta del Punto *</Form.Label>
//                 <Form.Control 
//                   name="label" 
//                   value={newPoint.label} 
//                   onChange={this.handleNewPointChange}
//                   placeholder="Ej: A, B, C, P1, etc."
//                   required 
//                 />
//                 <Form.Text className="text-muted">
//                   Ingrese una etiqueta única para identificar el punto
//                 </Form.Text>
//               </Form.Group>
              
//               <div className="row">
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Coordenada X *</Form.Label>
//                     <Form.Control 
//                       name="coord_x" 
//                       type="number"
//                       step="0.000001"
//                       value={newPoint.coord_x} 
//                       onChange={this.handleNewPointChange}
//                       placeholder="Ej: 1234567.123456"
//                       required 
//                     />
//                   </Form.Group>
//                 </div>
                
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Coordenada Y *</Form.Label>
//                     <Form.Control 
//                       name="coord_y" 
//                       type="number"
//                       step="0.000001"
//                       value={newPoint.coord_y} 
//                       onChange={this.handleNewPointChange}
//                       placeholder="Ej: 1234567.123456"
//                       required 
//                     />
//                   </Form.Group>
//                 </div>
//               </div>
              
//               <div className="alert alert-info">
//                 <small>
//                   <i className="bi bi-info-circle me-1"></i>
//                   Los puntos creados estarán disponibles para ser utilizados como puntos inicial y final en los linderos.
//                 </small>
//               </div>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button 
//               variant="secondary" 
//               onClick={this.closeCreatePointModal}
//             >
//               Cancelar
//             </Button>
//             <Button 
//               variant="primary" 
//               onClick={this.handleCreatePoint}
//             >
//               Crear Punto
//             </Button>
//           </Modal.Footer>
//         </Modal>
        
//         {/* ==========================================
//             MODAL VER PUNTOS
//             ========================================== */}
//         <Modal
//           show={modals.viewPoints}
//           onHide={this.closeViewPointsModal}
//           backdrop="static"
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Lista de Puntos</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Table striped bordered hover>
//               <thead>
//                 <tr>
//                   <th>Etiqueta</th>
//                   <th>Coordenada X</th>
//                   <th>Coordenada Y</th>
//                   <th>Acciones</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {this.state.points.map((point) => (
//                   <tr key={point.id}>
//                     <td>{point.label}</td>
//                     <td>{point.coord_x}</td>
//                     <td>{point.coord_y}</td>
//                     <td>
//                       <Button variant="outline-secondary" size="sm">
//                         <MDBIcon far icon="edit" /> Editar
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={this.closeViewPointsModal}>
//               Cerrar
//             </Button>
//           </Modal.Footer>
//         </Modal>

//       </>
//     );
//   }
// }

// export default RECORD_ARC_39;