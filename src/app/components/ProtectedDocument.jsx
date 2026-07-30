import { useEffect, useState } from 'react';

import { requestProtectedBlob, toProtectedApiPath } from '@/app/utils/pdfDownload';

export function ProtectedDocumentPreview({
  source,
  kind = 'iframe',
  title = 'Vista previa del documento',
  alt = 'Vista previa del documento',
  ...props
}) {
  const protectedPath = toProtectedApiPath(source);
  const [objectUrl, setObjectUrl] = useState(protectedPath ? '' : source || '');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!protectedPath) {
      setObjectUrl(source || '');
      setError(null);
      return undefined;
    }

    let active = true;
    let nextObjectUrl = '';
    setObjectUrl('');
    setError(null);

    requestProtectedBlob(protectedPath)
      .then((response) => {
        if (!active) return;
        const contentType = response.headers?.['content-type'] || response.data?.type || '';
        if (!/^(?:application\/pdf|image\/(?:png|jpe?g|gif|webp))(?:;|$)/i.test(contentType)) {
          throw new Error(`Este tipo de archivo (${contentType || 'desconocido'}) no se puede previsualizar.`);
        }
        nextObjectUrl = URL.createObjectURL(response.data);
        setObjectUrl(nextObjectUrl);
      })
      .catch((requestError) => {
        if (active) setError(requestError);
      });

    return () => {
      active = false;
      if (nextObjectUrl) URL.revokeObjectURL(nextObjectUrl);
    };
  }, [protectedPath, source]);

  if (error) {
    return <div role="alert">{error.message || 'No se pudo cargar el documento.'}</div>;
  }

  if (kind === 'img') {
    return <img src={objectUrl || undefined} alt={alt} {...props} />;
  }

  return <iframe src={objectUrl || 'about:blank'} title={title} {...props} />;
}
