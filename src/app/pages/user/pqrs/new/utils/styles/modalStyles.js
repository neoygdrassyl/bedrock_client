export const pqrsFormStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        zIndex: 2
    },
    content: {
        position: 'absolute',
        bottom: '40px',
        border: '1px solid #ccc',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',
        marginRight: 'auto',
    }
}
export const pqrsRequestStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Un fondo más oscuro para mejor contraste
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
    },
    content: {
        position: 'relative',
        width: '40vw',
        maxWidth: '90vw',
        height: 'fit-content',
        maxHeight: '90vh',
        border: '1px solid #ccc',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '8px',
        outline: 'none',
        padding: '20px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    }
};
