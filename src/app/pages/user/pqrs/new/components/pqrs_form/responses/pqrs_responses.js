import JoditEditor from "jodit-pro-react";
import { useRef } from "react";
import Collapsible from "react-collapsible";

const PqrsResponses = ({ config, editorContent, handleJoditChange }) => {
  // editor refs
  const editor2 = useRef(null);
  const editor3 = useRef(null);
  const editor4 = useRef(null);
  const editor5 = useRef(null);
  return (
    <Collapsible
      className="bg-primary border border-info text-center"
      openedClassName="bg-info text-center"
      trigger={
        <>
          <label className="fw-normal text-light text-center">Respuestas</label>
        </>
      }
    >
      <div className="p-3">
        <h5 className="my-4 bg-info p-1">Respuesta Legal</h5>
        <JoditEditor
          config={config}
          ref={editor2}
          value={editorContent.response_legal}
          onBlur={(value) => handleJoditChange("response_legal", value)}
        />

        <h5 className="my-4 bg-info p-1">Respuesta Arquitectura</h5>
        <JoditEditor
          config={config}
          ref={editor3}
          value={editorContent.response_arquitecture}
          onBlur={(value) => handleJoditChange("response_arquitecture", value)}
        />

        <h5 className="my-4 bg-info p-1">Respuesta Estructura</h5>
        <JoditEditor
          config={config}
          ref={editor4}
          value={editorContent.response_structure}
          onBlur={(value) => handleJoditChange("response_structure", value)}
        />

        <h5 className="my-4 bg-info p-1">Respuesta Archivo</h5>
        <JoditEditor
          config={config}
          ref={editor5}
          value={editorContent.response_archive}
          onBlur={(value) => handleJoditChange("response_archive", value)}
        />
      </div>
    </Collapsible>
  );
};
export default PqrsResponses;
