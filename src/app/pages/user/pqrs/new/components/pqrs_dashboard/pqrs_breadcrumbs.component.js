import { MDBBreadcrumb, MDBBreadcrumbItem } from 'mdb-react-ui-kit';
import { Link } from "react-router-dom";

const PqrsBreadcrumb = ({ breadCrums }) => {
    return (
        <MDBBreadcrumb className="mx-5">
            <MDBBreadcrumbItem>
                <Link to={'/home'}><i className="fas fa-home"></i> {breadCrums.bc_01}</Link>
            </MDBBreadcrumbItem>
            <MDBBreadcrumbItem>
                <Link to={'/dashboard'}><i className="far fa-bookmark"></i> {breadCrums.bc_u1}</Link>
            </MDBBreadcrumbItem>
            <MDBBreadcrumbItem active>
                <i className="fas fa-file-alt"></i> {breadCrums.bc_u7}
            </MDBBreadcrumbItem>
        </MDBBreadcrumb>
    );
};

export default PqrsBreadcrumb;
