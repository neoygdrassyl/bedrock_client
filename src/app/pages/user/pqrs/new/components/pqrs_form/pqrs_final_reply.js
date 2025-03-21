import usePqrsFinalReply from "../../hooks/usePqrsFinalReply";
import Collapsible from "react-collapsible";
import JoditEditor from "jodit-pro-react";
const PqrsFinalReply = ({ config, currentItem }) => {
  const { editor, replyData, setReplyData } = usePqrsFinalReply(currentItem);

  return (
    <Collapsible
      className="bg-primary border border-info text-center"
      openedClassName="bg-info text-center"
      trigger={
        <>
          <label className="fw-normal text-light text-center">
            Resolución de la respuesta
          </label>
        </>
      }
    >
      <div className="p-3 text-start">
        <JoditEditor
          config={config}
          ref={editor}
          value={replyData}
          onBlur={(value) => {
            setReplyData(value);
            console.log(value);
          }}
          tabIndex={1} // tabIndex of textarea
          class="form-control mb-3"
          disabled={true}
          rows="5"
          maxlength="4096"
          id="pqrs_info_reply"
        />
      </div>
    </Collapsible>
  );
};
export default PqrsFinalReply;
