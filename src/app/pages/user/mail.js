import { useState, useEffect, useCallback } from 'react';
import MailboxService from '../../services/mailbox.service'
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/icon';
import DataTable from 'react-data-table-component';
import dayjs from 'dayjs';

function Mail({ translation, globals, breadCrums }) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [modal, setModal] = useState(false);
    const [items, setItems] = useState([]);

    const retrievePublish = useCallback(() => {
        MailboxService.getAll()
            .then(response => {
                setItems(response.data);
                setIsLoaded(true);
            })
            .catch(e => {
                console.log(e);
            });
    }, []);

    useEffect(() => {
        retrievePublish();
    }, [retrievePublish]);

    const refreshList = () => {
        retrievePublish();
        setCurrentItem(null);
        setCurrentIndex(-1);
    };

    const toggle = () => {
        setModal(prev => !prev);
    };

    const getToggle = () => {
        return modal;
    };

    const setItem = (item) => {
        setCurrentItem(item);
        setModal(prev => !prev);
    };
        const columns = [
            {
                name: <h3># CONSECUTIVO</h3>,
                selector: row => row.id,
                sortable: true,
                filterable: true,
                cell: row => <p className="pt-3">{row.id}</p>
            },
            {
                name: <h3>NOMBRE</h3>,
                selector: row => row.name,
                sortable: true,
                filterable: true,
                cell: row => <p className="pt-3">{row.name}</p>
            },
            {
                name: <h3>FECHA</h3>,
                selector: row => row.createdAt,
                sortable: true,
                filterable: true,
                cell: row => <p className="pt-3">{dayjs(row.createdAt).format("DD-MM-YYYY")}</p>
            },
            {
                name: <h3>ASUNTO</h3>,
                selector: row => row.subject,
                cell: row => <p className="pt-3 text-center">{row.subject}</p>
            },
            {
                name: <h3>ACCIÓN</h3>,
                button: true,
                cell: row =>
                    <button className="btn btn-danger btn-sm" onClick={() => setItem(row)}><i className="fas fa-file-alt"></i> Ver</button>
                ,
            },
        ]

        return (

            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Buzón de Mensajes</h1>
                    <p className="text-sm text-muted-foreground mt-1">Mensajes recibidos del formulario de contacto</p>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {isLoaded ? (
                            <DataTable
                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                noDataComponent="No hay mensajes"
                                striped="true"
                                columns={columns}
                                data={items}
                                highlightOnHover
                                pagination
                                paginationPerPage={20}
                                paginationRowsPerPageOptions={[20, 50, 100]}
                                className="data-table-component"
                                noHeader
                            />
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                <span className="text-sm">Cargando...</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Detail Modal */}
                {getToggle() && (
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={toggle}>
                        <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <h2 className="text-lg font-semibold"><Icon name="FileText" size={18} className="inline mr-2" />Detalles del Mensaje {currentItem ? currentItem.id : ''}</h2>
                                <button type="button" className="btn-close" onClick={toggle} />
                            </div>
                            <CardContent className="p-4">
                                {currentItem ? (
                                    <table className="table table-bordered table-sm table-hover text-start table-light">
                                        <tbody>
                                            <tr className="Collapsible text-center">
                                                <th colSpan="2"><label>Información del mensaje</label></th>
                                            </tr>
                                            <tr>
                                                <td><label># Consecutivo</label></td>
                                                <td><label className="fw-bold">{currentItem.id}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Nombre</label></td>
                                                <td><label className="fw-bold">{currentItem.name}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Fecha de Expedicion</label></td>
                                                <td><label className="fw-bold">{dayjs(currentItem.createdAt).format("DD-MM-YYYY HH:mm")}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Email de Contacto</label></td>
                                                <td><label className="fw-bold">{currentItem.email}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Numero de Contacto</label></td>
                                                <td><label className="fw-bold">{currentItem.number}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Asunto</label></td>
                                                <td><label className="fw-bold">{currentItem.subject}</label></td>
                                            </tr>
                                            <tr>
                                                <td colSpan="2"><label>Mensaje</label></td>
                                            </tr>
                                            <tr>
                                                <td colSpan="2"><label className="fw-bold">{currentItem.message}</label></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                ) : ""}
                            </CardContent>
                            <div className="flex justify-end p-4 border-t border-border">
                                <Button variant="secondary" onClick={toggle}><Icon name="XCircle" size={16} /> Cerrar</Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        );
}

export default Mail;