import { useEffect, useState } from "react";
import { getRole } from "../../../utils/constant/response_roles";
import {
  MDBTooltip,
  MDBBtn,
  MDBTypography,
  MDBCollapse,
} from 'mdb-react-ui-kit';
import PqrsResponseModal from "./pqrs_response_modal.component";
const PqrsResponseBox = ({ pqrs, reload, swaMsg }) => {
  const [filteredPqrs, setFilteredPqrs] = useState([]);
  const [isBoxOpen, setOpenBox] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPqrs, setSelectedPqrs] = useState(null);

  useEffect(() => {
    const role = getRole(window.user?.roleId);

    if (!role || !role.field) {
      console.error("Role or field is undefined:", role);
      return;
    }

    const filteredPqrs = pqrs?.filter(pqr => pqr.status === "ABIERTA")
      ?.filter(pqr => pqr.new_pqrs_response?.[role.field] === "");
    setFilteredPqrs(filteredPqrs);

  }, [pqrs]);

  const handleResponseClick = (pqr) => {
    setSelectedPqrs(pqr);
    setModalOpen(true);
  };

  return (
    <>
      {
        filteredPqrs.length > 0 &&
        <div>
          <MDBTypography note noteColor="warning">
            <div className="row">
              <div className="col-10">
                <label className="fw-bold">PQRS PENDIENTES POR RESPONDER : </label>
              </div>
              <div className="col text-end">
                <MDBTooltip title='Ver Listado' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                  <MDBBtn
                    color="info"
                    size="sm"
                    onClick={() => {
                      setOpenBox((open) => !open)
                      console.log("isBoxOpen:", !isBoxOpen);
                    }

                    }
                    className="px-2"
                  > <i class="fas fa-info-circle fa-2x"></i>
                  </MDBBtn>
                </MDBTooltip>
              </div>
            </div>
            <MDBCollapse show={isBoxOpen}>
              <div className="row">
                <div className="col-10">
                  <ul className="space-y-2">
                    {filteredPqrs.map((pqr) => (
                      <li key={pqr.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-[#2c3e50]">{pqr.id_public}</span>
                        <MDBBtn className="ms-2" size="sm" outline color="primary" onClick={() => handleResponseClick(pqr)}>
                          <i class="fas fa-solid fa-reply"></i>
                        </MDBBtn>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </MDBCollapse>
          </MDBTypography >
          {
            selectedPqrs &&
            <PqrsResponseModal
              responseType={getRole(window.user.roleId).field}
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              selectedPqrs={selectedPqrs}
              reload={reload}
              swaMsg={swaMsg} />
          }

        </div >

      }
    </>
  )
};

export default PqrsResponseBox;



