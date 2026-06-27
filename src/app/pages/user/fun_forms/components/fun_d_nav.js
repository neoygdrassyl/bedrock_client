

function FUND_NAV({ translation, swaMsg, globals, currentItem, currentVersion }) {
        const navItems = [
            { href: '#fund_1', label: '1. Gestión documental', variant: 'primary' },
            { href: '#fund_11', label: '1.1 Expediente documental unificado', variant: 'muted' },
            { href: '#fund_2', label: '2. Anexar documentos', variant: 'primary' },
            ...(currentItem.state >= 5 ? [
                { href: '#fund_3', label: '3. Lista de chequeo', variant: 'primary' },
                { href: '#fund_4', label: '4. Generar documentos automáticos', variant: 'primary' },
            ] : []),
            { href: '#fund_pdf', label: 'PDF Formulario Único Nacional', variant: 'destructive' },
            { href: '#fund_pdf2', label: 'PDF Formulario Lista Checkeo', variant: 'destructive' },
            ...(currentItem.state >= 5 ? [
                { href: '#fund_21', label: 'Documento de confirmación', variant: 'success' },
                { href: '#fund_sign', label: 'Valla', variant: 'success' },
            ] : []),
            { href: '#fund_seal', label: 'Sello', variant: 'success' },
            { href: '#fund_22', label: 'Documentos de citación', variant: 'success' },
            ...(currentItem.state >= 5 ? [
                { href: '#fund_doc_control', label: 'Control documental', variant: 'success' },
            ] : []),
            { href: '#fund_5', label: '5. Control de documentación especial', variant: 'primary' },
            { href: '#fund_23', label: 'Control de reporte de planeación', variant: 'success' },
        ];

        const variantClasses = {
            primary: 'bg-primary/10 text-primary border-primary/20',
            muted: 'bg-muted text-muted-foreground border-border',
            destructive: 'bg-destructive/10 text-destructive border-destructive/20',
            success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        };

        return (
            <div className="btn-navpqrs">
                <div className="fung_nav">
                    <div className="rounded-lg border bg-card p-4 container-primary">
                        <div className="space-y-1.5">
                            <div className="px-3 py-2 bg-muted rounded-md text-center mb-3">
                                <h6 className="text-sm font-semibold">Menú de navegación</h6>
                            </div>
                            {navItems.map((item) => (
                                <a key={item.href} href={item.href} className="block no-underline">
                                    <div className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors hover:opacity-80 ${variantClasses[item.variant]}`}>
                                        {item.label}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
}

export default FUND_NAV;