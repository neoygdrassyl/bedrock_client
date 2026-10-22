export const DOCUMENT_ORIGIN_STATE = {
    PHYSICAL: 'FISICO',
    SCANNED: 'DIGITALIZADO',
    DIGITAL: 'MEDIO_DIGITAL',
};

export const DOCUMENT_ORIGIN_LABEL = {
    [DOCUMENT_ORIGIN_STATE.PHYSICAL]: 'Físico',
    [DOCUMENT_ORIGIN_STATE.SCANNED]: 'Escaneado',
    [DOCUMENT_ORIGIN_STATE.DIGITAL]: 'Medio digital',
};

export const DOCUMENT_ORIGIN_ORDER = [
    DOCUMENT_ORIGIN_STATE.PHYSICAL,
    DOCUMENT_ORIGIN_STATE.SCANNED,
    DOCUMENT_ORIGIN_STATE.DIGITAL,
];

export const DOCUMENT_ORIGIN_META = {
    [DOCUMENT_ORIGIN_STATE.PHYSICAL]: {
        label: DOCUMENT_ORIGIN_LABEL[DOCUMENT_ORIGIN_STATE.PHYSICAL],
        icon: 'folder-open',
        activeClassName: 'border-warning/30 bg-warning/15 text-warning',
        inactiveClassName: 'border-border bg-muted/20 text-muted-foreground opacity-45',
        tooltip: 'Documento recibido físicamente en ventanilla y conservado en expediente físico.',
    },
    [DOCUMENT_ORIGIN_STATE.SCANNED]: {
        label: DOCUMENT_ORIGIN_LABEL[DOCUMENT_ORIGIN_STATE.SCANNED],
        icon: 'file-alt',
        activeClassName: 'border-accent/30 bg-accent/15 text-accent',
        inactiveClassName: 'border-border bg-muted/20 text-muted-foreground opacity-45',
        tooltip: 'Soporte físico que fue escaneado o digitalizado y tiene archivo consultable.',
    },
    [DOCUMENT_ORIGIN_STATE.DIGITAL]: {
        label: DOCUMENT_ORIGIN_LABEL[DOCUMENT_ORIGIN_STATE.DIGITAL],
        icon: 'desktop',
        activeClassName: 'border-primary/30 bg-primary/15 text-primary',
        inactiveClassName: 'border-border bg-muted/20 text-muted-foreground opacity-45',
        tooltip: 'Documento recibido por medio digital sin correspondencia física por VR.',
    },
};

export const DOCUMENT_RECEPTION_MEDIUM = {
    WHATSAPP: 'WHATSAPP',
    EMAIL: 'CORREO_ELECTRONICO',
    OTHER: 'OTRO',
};

export const DOCUMENT_RECEPTION_MEDIUM_LABEL = {
    [DOCUMENT_RECEPTION_MEDIUM.WHATSAPP]: 'Whatsapp',
    [DOCUMENT_RECEPTION_MEDIUM.EMAIL]: 'Correo electrónico',
    [DOCUMENT_RECEPTION_MEDIUM.OTHER]: 'Otro',
};

export const DOCUMENT_RECEPTION_MEDIUM_OPTIONS = [
    { value: DOCUMENT_RECEPTION_MEDIUM.WHATSAPP, label: DOCUMENT_RECEPTION_MEDIUM_LABEL[DOCUMENT_RECEPTION_MEDIUM.WHATSAPP] },
    { value: DOCUMENT_RECEPTION_MEDIUM.EMAIL, label: DOCUMENT_RECEPTION_MEDIUM_LABEL[DOCUMENT_RECEPTION_MEDIUM.EMAIL] },
    { value: DOCUMENT_RECEPTION_MEDIUM.OTHER, label: DOCUMENT_RECEPTION_MEDIUM_LABEL[DOCUMENT_RECEPTION_MEDIUM.OTHER] },
];
