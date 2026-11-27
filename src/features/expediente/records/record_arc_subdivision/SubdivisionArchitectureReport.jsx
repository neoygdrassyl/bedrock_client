import RECORD_ARC from '../record_arc';
import SubdivisionArchitectureCriteria from './SubdivisionArchitectureCriteria.jsx';

export default function SubdivisionArchitectureReport(props) {
  const { expediente, currentVersion } = props;

  return (
    <div className="space-y-4" data-testid="subdivision-architecture-report">
      <SubdivisionArchitectureCriteria
        currentId={props.currentId}
        currentVersion={currentVersion}
        expediente={expediente}
        canManage={props.canManage !== false}
      />

      <RECORD_ARC {...props} hideStructuralBinnacle />
    </div>
  );
}
