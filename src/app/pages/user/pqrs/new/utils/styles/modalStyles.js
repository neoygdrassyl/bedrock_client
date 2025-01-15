export const modalStyles = () => {
    const customStyles = {
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
            top: '40px',
            left: '15%',
            right: '5%',
            bottom: '40px',
            border: '1px solid #ccc',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '4px',
            outline: 'none',
            padding: '20px',
            marginRight: 'auto',
        }
    };
    return customStyles
}