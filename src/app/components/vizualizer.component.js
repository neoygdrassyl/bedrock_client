import { useState } from 'react';
import { MDBTooltip } from './ui';
import { LegacyModal as Modal } from '@/components/legacy-modal';
import PDF_VIEWER from './pdfViewer.component';
import FUNService from '../services/fun.service'
import { Icon } from '@/components/icon';

function _isValidFileUrl(str) {
    if (!str || typeof str !== 'string') return false;
    const parts = str.split('/');
    const last = parts[parts.length - 1];
    if (!last || last === 'undefined' || last === 'null') return false;
    if (str.includes('/undefined') || str.includes('/null')) return false;
    return true;
}

function addInlinePreview(url) {
    if (!url) return '';
    const separator = url.includes('?') ? '&' : '?';
    return url.includes('inline=1') ? url : `${url}${separator}inline=1`;
}

function getApiBaseUrl() {
    return String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
}

function normalizeApiFileUrl(value) {
    if (!value || typeof value !== 'string') return '';

    const apiBaseUrl = getApiBaseUrl();
    if (apiBaseUrl && value.startsWith(apiBaseUrl)) {
        return value.slice(apiBaseUrl.length) || '/';
    }

    if (value.startsWith('/api/')) {
        return value.replace(/^\/api/, '');
    }

    return value;
}

function buildViewerRequest(value, fallbackApipath, fallbackUrl) {
    const normalizedValue = normalizeApiFileUrl(value);

    if (normalizedValue.startsWith('/files/')) {
        return {
            apipath: '/files/',
            url: normalizedValue.replace(/^\/files\//, ''),
        };
    }

    return {
        apipath: fallbackApipath || '',
        url: fallbackUrl || '',
    };
}

function buildBrowserUrl(value, fallbackApipath, fallbackUrl) {
    const normalizedValue = normalizeApiFileUrl(value);
    const apiBaseUrl = getApiBaseUrl();

    if (normalizedValue.startsWith('/')) {
        return `${apiBaseUrl}${normalizedValue}`;
    }

    if (normalizedValue) {
        return normalizedValue;
    }

    return `${apiBaseUrl}${fallbackApipath || ''}${fallbackUrl || ''}`;
}

function VIZUALIZER({ url, id, apipath, previewUrl, downloadUrl, icon, color, iconWrapper, iconStyle }) {
    const [modal, setModal] = useState(false);
    const [localURL, setLocalURL] = useState('');
    const [loadError, setLoadError] = useState(null);

    const toggle = () => {
        setModal(prev => !prev);
    };

    const customStyles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            zIndex: 1051
        },
        content: {
            position: 'absolute',
            top: '0px',
            left: '15%',
            right: 'auto',
            bottom: '0px',
            border: '1px solid #ccc',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '4px',
            outline: 'none',
            padding: '20px',
            marginRight: '12%',
        }
    };

    let _OPEN_WINDOW = (URL) => {
        if (!_isValidFileUrl(URL)) {
            setLoadError({
                message: 'No se recibió una ruta de archivo válida. El documento puede no tener un archivo digital asociado.',
                status: null,
                reason: 'invalid_url',
            });
            setModal(true);
            return;
        }
        const re = /(?:\.([^.]+))?$/;
        const ext = re.exec(URL.split('?')[0])[1];
        if (ext === "pdf" || ext === "PDF" ) {
            setLoadError(null);
            setModal(true);
        } else if (ext === "png" || ext === "jpg" || ext === "jpeg") {
            const img = '<img src="' + URL + '">';
            const popup = window.open();
            popup.document.write(img);
        }
        else{
            _DOWNLOAD();
        }
    }

    let _DOWNLOAD = () => {
        window.open(buildBrowserUrl(downloadUrl, apipath, url), '_blank');
    }
    let _LOAD_BY_ID = () => {
        setLoadError(null);
        FUNService.getFun6(id)
        .then(response => {
            const fileUrl = response.data.path + '/' + response.data.filename;
            setLocalURL(fileUrl);
            _OPEN_WINDOW(addInlinePreview(import.meta.env.VITE_API_URL + apipath + fileUrl))
        })
        .catch(e => {
            let message = 'No se pudo cargar la información del documento.';
            const status = e?.response?.status;
            if (status === 404) {
                message = 'El documento no fue encontrado en el servidor.';
            } else if (status === 403) {
                message = 'No tiene permisos para acceder a este documento.';
            } else if (status >= 500) {
                message = 'Error interno del servidor al intentar cargar el documento.';
            } else if (e?.code === 'ERR_NETWORK' || !status) {
                message = 'Error de conexión. Verifique que el servidor esté disponible.';
            }
            setLoadError({
                message,
                status,
                reason: 'fetch_error',
            });
            setModal(true);
        });
    }

    const rawPreviewUrl = previewUrl || `${apipath || ''}${url || ''}`;
    const previewFullUrl = addInlinePreview(buildBrowserUrl(rawPreviewUrl, apipath, url));
    const idPreviewUrl = `${apipath || ''}${localURL || ''}`;
    const viewerRequest = id
        ? buildViewerRequest(addInlinePreview(idPreviewUrl), apipath, localURL)
        : buildViewerRequest(addInlinePreview(rawPreviewUrl), apipath, url);
    const isValidUrl = _isValidFileUrl(previewFullUrl);

    let aWrapper = iconWrapper ?? "btn btn-sm btn-light m-0 p-2 shadow-none"

    if (!isValidUrl && !id) {
        return (
            <span
                title="Documento sin archivo digital asociado"
                className="inline-flex items-center justify-center rounded-md bg-muted/50 h-8 w-8 text-muted-foreground cursor-help"
            >—</span>
        );
    }

    return (<>

        {icon
            ? <button type="button"  className={aWrapper} onClick={() => id ? _LOAD_BY_ID() :_OPEN_WINDOW(previewFullUrl)}><Icon name={icon} size={20} style={{...iconStyle, color: color }} /></button>
            : <MDBTooltip tag="span" title='Visualizar' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                <button type="button" className="btn btn-sm btn-info m-0 p-2 shadow-none" onClick={() => id ? _LOAD_BY_ID() : _OPEN_WINDOW(previewFullUrl)}>
                    <Icon name="search" size={16} /></button> </MDBTooltip>
        }


        <Modal contentLabel="PDF_VIEWER"
            isOpen={modal}
            style={customStyles}
            ariaHideApp={false}
        >
            <div className="my-4 d-flex justify-content-end">
                <button type="button" className='btn-close' aria-label="Cerrar" onClick={() => toggle()}></button>
            </div>
            <hr />
            {loadError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground">
                    <p className="mb-2 font-semibold text-destructive">No se pudo abrir el documento</p>
                    <p className="mb-0">{loadError.message}</p>
                    {loadError.status ? <p className="mt-2 mb-0 text-xs text-muted-foreground">HTTP {loadError.status}</p> : null}
                </div>
            ) : (
                <PDF_VIEWER
                    url={viewerRequest.url || url || localURL} apipath={viewerRequest.apipath || apipath || ''}
                />
            )}
            <hr />
            <div className="text-end py-4 mt-3">
                <button type="button" className="btn btn-lg btn-danger me-2" onClick={() => _DOWNLOAD()}><Icon name="Download" size={16} /> DESCARGAR </button>
                <button type="button" className="btn btn-lg btn-info" onClick={() => toggle()}><Icon name="XCircle" size={16} /> CERRAR </button>
            </div>
        </Modal>
    </>
    );
}

export default VIZUALIZER;
