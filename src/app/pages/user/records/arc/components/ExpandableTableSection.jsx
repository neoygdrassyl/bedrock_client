import { useEffect, useRef, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

function ExpandableTableSection({ id, title, itemCount, children }) {
    const count = Number(itemCount) || 0;
    const [isOpen, setIsOpen] = useState(count > 0);
    const previousCount = useRef(count);

    useEffect(() => {
        if (count === 0) setIsOpen(false);
        if (previousCount.current === 0 && count > 0) setIsOpen(true);
        previousCount.current = count;
    }, [count]);

    return <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-3 bg-background">
        <CollapsibleTrigger className="btn btn-light border-0 w-100 d-flex align-items-center justify-content-between gap-3 px-3 py-2 text-start" aria-controls={id}>
            <span className="fw-semibold">{title}</span>
            <span className="d-flex align-items-center gap-2">
                <span className="badge text-bg-secondary rounded-pill">{count}</span>
                <span className="small text-muted">{isOpen ? 'Ocultar tabla' : 'Mostrar tabla'}</span>
            </span>
        </CollapsibleTrigger>
        <CollapsibleContent id={id} className="border-top p-2">
            {children}
        </CollapsibleContent>
    </Collapsible>;
}

export default ExpandableTableSection;
