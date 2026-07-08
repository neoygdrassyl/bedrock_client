import RECORD_ARCSERVICE from '../../../services/record_arc.service';
import RECORD_ENG_SERVICE from '../../../services/record_eng.service';
import RECORD_LAW_SERVICE from '../../../services/record_law.service';
import RECORDS_BINNACLE from './records_binnacles.component';

const BINNACLE_ITEMS = [
  {
    aim: 'Jurídico',
    section: 'juridico',
    service: RECORD_LAW_SERVICE,
  },
  {
    aim: 'Arquitectura',
    section: 'arquitectonico',
    service: RECORD_ARCSERVICE,
    path: 'record_arc',
  },
  {
    aim: 'Estructural',
    section: 'estructural',
    service: RECORD_ENG_SERVICE,
  },
];

export default function RecordsBinnacleStack({
  translation,
  swaMsg,
  globals,
  currentItem,
  currentVersion,
  activeSection,
  requestUpdateRecord,
  compact = false,
}) {
  const idSuffix = compact ? 'side' : '';

  return (
    <div className={compact ? 'space-y-2' : ''}>
      {BINNACLE_ITEMS.map((item) => (
        <RECORDS_BINNACLE
          key={item.aim}
          translation={translation}
          swaMsg={swaMsg}
          globals={globals}
          currentItem={currentItem}
          currentVersion={currentVersion}
          currentRecord={null}
          currentVersionR={currentVersion}
          SERVICE={item.service}
          requestUpdateRecord={requestUpdateRecord}
          AIM={item.aim}
          PATH={item.path}
          readOnly={activeSection !== item.section}
          compact={compact}
          idSuffix={idSuffix}
        />
      ))}
    </div>
  );
}
